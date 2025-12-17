/**
 * Logging utility using pino
 */

import pino from 'pino';
import { env } from './env.js';

// Disable all logging if LOG_LEVEL is 'silent'
const isSilent = env.LOG_LEVEL === 'silent';

export const logger = isSilent
  ? {
      info: () => {},
      debug: () => {},
      error: () => {},
      warn: () => {},
      fatal: () => {},
      trace: () => {},
    } as any
  : pino({
      level: env.LOG_LEVEL,
      transport: env.isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    });
