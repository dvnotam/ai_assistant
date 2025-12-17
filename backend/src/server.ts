/**
 * Main Express Server for AI Assistant Backend
 */

import express from 'express';
import cors from 'cors';
import { env } from './utils/env.js';
import { logger } from './utils/logger.js';
import reminderRoutes from './routes/reminders.js';

const app = express();

// Middleware
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  logger.debug({
    method: req.method,
    path: req.path,
    query: req.query,
  }, 'Incoming request');
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ai-assistant-backend',
    version: '1.0.0',
  });
});

// Mount API routes
app.use('/api/reminders', reminderRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: _req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ error: err, path: req.path }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal Server Error',
    message: env.isDevelopment ? err.message : 'An error occurred',
  });
});

// Start server
const server = app.listen(env.PORT, () => {
  logger.info({
    port: env.PORT,
    environment: env.NODE_ENV,
    corsOrigin: env.CORS_ORIGIN,
  }, 'Server started successfully');
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutdown signal received');

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
