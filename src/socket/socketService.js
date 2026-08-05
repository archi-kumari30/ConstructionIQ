const logger = require('../config/logger');

let io = null;

const init = (ioInstance) => {
  io = ioInstance;
  logger.info('Socket.IO instance initialized in SocketService');
};

const getIo = () => {
  return io;
};

const emitToProject = (projectId, event, data) => {
  if (io) {
    const room = projectId.toString();
    io.to(room).emit(event, data);
    logger.info(`[SocketService] Emitted event '${event}' to project room: ${room}`);
  } else {
    logger.warn(`[SocketService] Socket.io not initialized. Suppressed event '${event}'`);
  }
};

module.exports = {
  init,
  getIo,
  emitToProject
};
