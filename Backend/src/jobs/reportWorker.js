import { Worker } from 'bullmq';
import redisConfig from '../config/redis.js';
import dailySiteReportRepository from '../repositories/dailySiteReportRepository.js';
import socketService from '../socket/socketService.js';
import logger from '../config/logger.js';

let reportWorker = null;

if (process.env.NODE_ENV !== 'test') {
  try {
    reportWorker = new Worker(
      'reportQueue',
      async (job) => {
        const { reportId, projectId } = job.data;
        logger.info(`[BullMQ Worker] Compiling operational report PDF for ID: ${reportId}`);

        // Simulate PDF compilation delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const pdfUrl = `https://storage.constructioniq.com/reports/report_${reportId}.pdf`;
        await dailySiteReportRepository.updatePdfUrl(reportId, pdfUrl);

        // Emit real-time notification
        socketService.emitToProject(projectId, 'report_compiled', {
          reportId,
          pdfUrl,
          message: `Daily report for project is compiled and available at ${pdfUrl}`
        });

        logger.info(`[BullMQ Worker] Report compilation successfully completed for ID: ${reportId}`);
        return { pdfUrl };
      },
      {
        connection: {
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password
        }
      }
    );

    reportWorker.on('failed', (job, err) => {
      logger.error(`[BullMQ Worker] Compilation job failed: ${err.message}`);
    });

    logger.info('[BullMQ] Daily Site Report Worker Started Successfully');
  } catch (error) {
    logger.warn(`[BullMQ] Worker could not be started: ${error.message}`);
  }
} else {
  reportWorker = {
    close: async () => {}
  };
}

export default reportWorker;
