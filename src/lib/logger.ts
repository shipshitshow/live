import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';

type LogLevel = 'info' | 'warn' | 'error';

declare global {
  // eslint-disable-next-line no-var
  var __shipShitLogger__: winston.Logger | undefined;
}

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'events.log');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

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
