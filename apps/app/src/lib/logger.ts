import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import winston from 'winston';

type LogLevel = 'info' | 'warn' | 'error';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEV_RUNTIME_DIR = path.join(
  process.env.SHIPSHIT_RUNTIME_DIR ?? os.tmpdir(),
  'shipshitshow-live',
);
const LOG_DIR = IS_PRODUCTION
  ? path.join(process.cwd(), 'logs')
  : path.join(DEV_RUNTIME_DIR, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'events.log');

declare global {
  // eslint-disable-next-line no-var
  var __shipShitLogger__: winston.Logger | undefined;
}

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function createConsoleLogger() {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    level: 'info',
    transports: [new winston.transports.Console()],
  });
}

function createAppLogger() {
  if (IS_PRODUCTION) {
    return createConsoleLogger();
  }

  try {
    ensureLogDir();

    return winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      level: 'info',
      transports: [
        new winston.transports.File({
          filename: LOG_FILE,
        }),
      ],
    });
  } catch {
    return createConsoleLogger();
  }
}

const logger = global.__shipShitLogger__ ?? createAppLogger();

if (!global.__shipShitLogger__) {
  global.__shipShitLogger__ = logger;
}

export function logEvent(
  event: string,
  payload: Record<string, unknown> = {},
  level: LogLevel = 'info',
) {
  logger.log(level, event, payload);
}

export function logError(
  event: string,
  error: unknown,
  payload: Record<string, unknown> = {},
) {
  const err =
    error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : { message: String(error) };

  logger.error(event, {
    ...payload,
    error: err,
  });
}
