import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import app from './app.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import socketConfig from './config/socket.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

import socketService from './socket/socketService.js';

// Initialize Socket.io connection
const io = new Server(server, socketConfig);

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
import { scheduleWeeklyAudit } from './jobs/cronJobs.js';
scheduleWeeklyAudit();

// Initialize BullMQ Workers (imports to trigger background listener)
import './jobs/reportWorker.js';
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
const shutdown = async () => {
  logger.info('SIGTERM/SIGINT signal received: closing HTTP server...');
  server.close(async () => {
    logger.info('HTTP server closed. Disconnecting database...');
    try {
      await mongoose.connection.close(false);
      logger.info('Database connection closed. Graceful shutdown complete.');
      process.exit(0);
    } catch (error) {
      logger.error(`Error while closing database connection: ${error.message}`);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
