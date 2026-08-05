const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const User = require('../../models/User');
const ROLES = require('../../constants/roles');
const logger = require('../../config/logger');

const usersToSeed = [
  {
    name: 'System Admin',
    email: 'admin@constructioniq.com',
    password: 'password123',
    role: ROLES.ADMIN,
    phone: '+1234567890',
    isEmailVerified: true
  },
  {
    name: 'Project Manager One',
    email: 'pm@constructioniq.com',
    password: 'password123',
    role: ROLES.PROJECT_MANAGER,
    phone: '+1234567891',
    isEmailVerified: true
  },
  {
    name: 'Site Engineer One',
    email: 'engineer@constructioniq.com',
    password: 'password123',
    role: ROLES.SITE_ENGINEER,
    phone: '+1234567892',
    isEmailVerified: true
  },
  {
    name: 'Contractor One',
    email: 'contractor@constructioniq.com',
    password: 'password123',
    role: ROLES.CONTRACTOR,
    phone: '+1234567893',
    isEmailVerified: true
  },
  {
    name: 'Supplier One',
    email: 'supplier@constructioniq.com',
    password: 'password123',
    role: ROLES.SUPPLIER,
    phone: '+1234567894',
    isEmailVerified: true
  }
];

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/constructioniq';
    logger.info('Connecting to database for seeding...');
    await mongoose.connect(mongoUri);
    logger.info('Database connected. Starting user seeding...');

    // Clear existing users
    await User.deleteMany({});
    logger.info('Cleared existing users.');

    const salt = await bcrypt.genSalt(10);

    const seededUsers = [];
    for (const userData of usersToSeed) {
      const passwordHash = await bcrypt.hash(userData.password, salt);
      const user = new User({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        phone: userData.phone,
        isEmailVerified: userData.isEmailVerified
      });
      await user.save();
      seededUsers.push(user);
      logger.info(`Seeded user: ${userData.email} (Role: ${userData.role})`);
    }

    logger.info('User seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Run if direct execution
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
