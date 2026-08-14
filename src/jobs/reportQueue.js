import { Queue } from 'bullmq';
import redisConfig from '../config/redis.js';
import logger from '../config/logger.js';

let reportQueue;

if (process.env.NODE_ENV === 'test') {
  reportQueue = {
    add: async () => ({ id: 'mockJobId' }),
    close: async () => {}
  };
} else {
  reportQueue = new Queue('reportQueue', {
    connection: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password
    }
  });

  logger.info('[BullMQ] Daily Site Report Compilation Queue Initialized');
}

export default reportQueue;
