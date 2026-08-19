import mongoose from 'mongoose';
import dns from 'node:dns';
import logger from './logger.js';

const retryDelayMs = parseInt(process.env.MONGO_RETRY_DELAY_MS || '5000', 10);
const mongoDnsServers = (process.env.MONGO_DNS_SERVERS || '1.1.1.1,8.8.8.8')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/constructioniq';

    // Some local DNS resolvers reject SRV lookups used by MongoDB Atlas URIs.
    if (connString.startsWith('mongodb+srv://') && mongoDnsServers.length > 0) {
      dns.setServers(mongoDnsServers);
    }

    const conn = await mongoose.connect(connString, {
      autoIndex: true,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    logger.warn(`Retrying MongoDB connection in ${retryDelayMs / 1000} seconds...`);
    setTimeout(connectDB, retryDelayMs);
  }
};

export default connectDB;
