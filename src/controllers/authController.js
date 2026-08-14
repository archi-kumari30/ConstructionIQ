import authService from '../services/authService.js';
import ApiResponse from '../utils/apiResponse.js';
import UserDto from '../dto/userDto.js';
import HTTP_CODES from '../constants/httpCodes.js';
import asyncWrapper from '../utils/asyncWrapper.js';

const register = asyncWrapper(async (req, res) => {
  const user = await authService.register(req.body);
  return ApiResponse.success(
    res,
    'User registered successfully. Please verify your email.',
    UserDto.toResponse(user),
    HTTP_CODES.CREATED
  );
});

const login = asyncWrapper(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body.email,
    req.body.password,
    req.ip
  );
  
  // Optionally set refresh token in HttpOnly Cookie for security
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return ApiResponse.success(
    res,
    'Login successful',
    UserDto.toAuthResponse(user, accessToken, refreshToken),
    HTTP_CODES.OK
  );
});

const refreshToken = asyncWrapper(async (req, res) => {
  // Check body or cookie
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  
  const result = await authService.refreshToken(token);
  return ApiResponse.success(res, 'Token refreshed successfully', result, HTTP_CODES.OK);
});

const verifyEmail = asyncWrapper(async (req, res) => {
  const token = req.query.token;
  await authService.verifyEmail(token);
  return ApiResponse.success(res, 'Email verified successfully', null, HTTP_CODES.OK);
});

const forgotPassword = asyncWrapper(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return ApiResponse.success(
    res,
    'If the email is registered, a password reset link has been sent.',
    null,
    HTTP_CODES.OK
  );
});

const resetPassword = asyncWrapper(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  await authService.resetPassword(token, password);
  return ApiResponse.success(res, 'Password reset successfully', null, HTTP_CODES.OK);
});

export {
  register,
  login,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword
};
export default { register, login, refreshToken, verifyEmail, forgotPassword, resetPassword };
