export default {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'constructioniq_access_secret_key_123!@#',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'constructioniq_refresh_secret_key_987!@#',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  resetExpiryMinutes: parseInt(process.env.JWT_RESET_EXPIRY_MINUTES || '10', 10),
  verificationExpiryHours: parseInt(process.env.JWT_VERIFICATION_EXPIRY_HOURS || '24', 10)
};
