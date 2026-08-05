const http = require('http');
const dotenv = require('dotenv');
const path = require('path');
const socketIo = require('socket.io');

// Load environment variables before importing other local modules
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const socketConfig = require('./config/socket');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

const socketService = require('./socket/socketService');

// Initialize Socket.io connection
const io = socketIo(server, socketConfig);

// Initialize socketService helper with io instance
socketService.init(io);

// Socket.io connection events handler
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join a room for a specific project workspace
  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    logger.info(`Socket ${socket.id} joined project room: ${projectId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Attach socket IO instance to app global variables so services can access it
app.set('io', io);

// Start Cron Jobs
const { scheduleWeeklyAudit } = require('./jobs/cronJobs');
scheduleWeeklyAudit();

// Initialize BullMQ Workers (imports to trigger background listener)
require('./jobs/reportWorker');

// Start listening
server.listen(PORT, () => {
  logger.info(`ConstructionIQ Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Swagger API Documentation available at http://localhost:${PORT}/api/v1/docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle graceful shutdown on system signals
const shutdown = () => {
  logger.info('SIGTERM/SIGINT signal received: closing HTTP server...');
  server.close(() => {
    logger.info('HTTP server closed. Disconnecting database...');
    mongoose.connection.close(false, () => {
      logger.info('Database connection closed. Graceful shutdown complete.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
