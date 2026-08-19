import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import logger from './config/logger.js';
import routes from './routes/index.js';
import swaggerDocument from './docs/swagger.js';
import errorHandler from './middlewares/errorHandler.js';
import HTTP_CODES from './constants/httpCodes.js';
import ERROR_CODES from './constants/errorCodes.js';
import ApiResponse from './utils/apiResponse.js';

const app = express();

// Enable security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// Custom HTTP request logger middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Basic Mongo Injection protection placeholder
// In Mongoose, queries are typed, but we can sanitize user inputs in services.
app.use((req, res, next) => {
  // Simple check for MongoDB operators in keys to mitigate query injection
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});

// Rate Limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    data: null,
    errors: [
      {
        field: 'rate-limit',
        message: 'Rate limit exceeded'
      }
    ]
  }
});
app.use('/api/', limiter);

// Mount API routes
app.use('/api', routes);

// Root endpoint for a quick server availability check
app.get('/', (req, res) => {
  return ApiResponse.success(res, 'ConstructionIQ API is running', {
    health: '/api/v1/health',
    documentation: '/api/v1/docs'
  });
});

// Swagger Documentation Route
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Catch-all route for unmatched paths (404)
app.use((req, res, next) => {
  res.status(HTTP_CODES.NOT_FOUND).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    data: null,
    errors: [
      {
        field: 'path',
        message: 'Resource path not found'
      }
    ]
  });
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
