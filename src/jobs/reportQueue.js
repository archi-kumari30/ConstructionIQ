let reportQueue;

if (process.env.NODE_ENV === 'test') {
  reportQueue = {
    add: async () => ({ id: 'mockJobId' }),
    close: async () => {}
  };
} else {
  const { Queue } = require('bullmq');
  const redisConfig = require('../config/redis');
  const logger = require('../config/logger');

  reportQueue = new Queue('reportQueue', {
    connection: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password
    }
  });

  logger.info('[BullMQ] Daily Site Report Compilation Queue Initialized');
}

module.exports = reportQueue;
