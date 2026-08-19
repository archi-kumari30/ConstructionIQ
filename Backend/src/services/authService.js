import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository.js';
import mailService from './mailService.js';
import auditLogService from './auditLogService.js';
import jwtConfig from '../config/jwt.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError
} from '../utils/customErrors.js';
import logger from '../config/logger.js';
import User from '../models/User.js';
import ROLES from '../constants/roles.js';

class AuthService {
  // Helper to generate access token
  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role },
      jwtConfig.accessSecret,
      { expiresIn: jwtConfig.accessExpiry }
    );
  }

  // Helper to generate refresh token
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id || user.id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiry }
    );
  }

  async register(userData) {
    const { name, email, password, role, phone } = userData;

    if (role === ROLES.ADMIN) {
      throw new BadRequestError('Admin registration is not allowed');
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmailLean(email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log("VERIFICATION TOKEN:", verificationToken);

    // Create the user
    const newUser = await userRepository.create({
      name,
      email,
      passwordHash,
      role,
      phone,
      verificationToken,
      isEmailVerified: false
    });

    // Send verification email (async)
    mailService.sendVerificationEmail(email, name, verificationToken).catch((err) => {
      logger.error(`Failed to send verification email: ${err.message}`);
    });

    // Write audit log
    await auditLogService.logAction({
      userId: newUser._id,
      action: 'REGISTER',
      entity: 'User',
      entityId: newUser._id,
      details: { email, role }
    });

    return newUser;
  }

  async login(email, password, ipAddress = null) {
    // Find user including passwordHash
    const user = await userRepository.findByEmail(email, '+passwordHash');
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Log the successful login
    await auditLogService.logAction({
      userId: user._id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      details: { email },
      ipAddress
    });

    return { user, accessToken, refreshToken };
  }

  async refreshToken(token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, jwtConfig.refreshSecret);
      
      const user = await userRepository.findById(decoded.id);
      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async verifyEmail(token) {
    const user = await User.findOne({ verificationToken: token, isDeleted: false });
    
    if (!user) {
      throw new BadRequestError('Invalid or expired email verification token');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined; // remove field
    await user.save();

    await auditLogService.logAction({
      userId: user._id,
      action: 'VERIFY_EMAIL',
      entity: 'User',
      entityId: user._id,
      details: { email: user.email }
    });

    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email, isDeleted: false });
    
    // For security, do not leak user existence (just return true)
    if (!user) {
      logger.warn(`ForgotPassword requested for non-existing email: ${email}`);
      return true;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log("RESET TOKEN:", resetToken);
    
    // Hash token and set expiry
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + jwtConfig.resetExpiryMinutes * 60 * 1000;
    await user.save();

    // Send email
    mailService.sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) => {
      logger.error(`Failed to send password reset email: ${err.message}`);
    });

    await auditLogService.logAction({
      userId: user._id,
      action: 'FORGOT_PASSWORD_REQUEST',
      entity: 'User',
      entityId: user._id
    });

    return true;
  }

  async resetPassword(token, newPassword) {
    
    // Hash incoming token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      isDeleted: false
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Clear reset token details
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined; // Invalidate current session
    await user.save();

    await auditLogService.logAction({
      userId: user._id,
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: user._id
    });

    return true;
  }
}

export default new AuthService();
