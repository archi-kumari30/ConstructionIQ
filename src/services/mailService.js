const logger = require('../config/logger');
const mailConfig = require('../config/mail');

class MailService {
  async sendEmail({ to, subject, text, html }) {
    // In a real production system, you would initialize nodemailer transporter here
    // const transporter = nodemailer.createTransport(mailConfig);
    // await transporter.sendMail({ from: mailConfig.from, to, subject, text, html });

    logger.info(`[Email Service Mock] Sending mail to: ${to}`);
    logger.info(`[Email Service Mock] Subject: ${subject}`);
    logger.info(`[Email Service Mock] Body: ${text || html}`);
    
    // Simulate successful mail dispatch
    return { success: true, messageId: `mock-id-${Date.now()}` };
  }

  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/v1/auth/verify-email?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Verify your ConstructionIQ Account',
      text: `Hello ${name},\n\nPlease verify your account by clicking this link: ${verificationUrl}`,
      html: `<p>Hello ${name},</p><p>Please verify your account by clicking <a href="${verificationUrl}">here</a>.</p>`
    });
  }

  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset your ConstructionIQ Password',
      text: `Hello ${name},\n\nYou requested a password reset. Please click this link to reset it: ${resetUrl}\nThis link expires in 10 minutes.`,
      html: `<p>Hello ${name},</p><p>You requested a password reset. Please click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 10 minutes.</p>`
    });
  }
}

module.exports = new MailService();
