import * as winston from 'winston';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const logDir = path.join(os.homedir(), '.kiro-conductor', 'logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export class Logger {
  private logger: winston.Logger;

  constructor(context: string) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${context}] ${level}: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `[${timestamp}] [${context}] ${level}: ${message}`;
            })
          ),
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'app.log'),
        }),
      ],
    });
  }

  info(message: string) {
    this.logger.info(message);
  }

  error(message: string, error?: any) {
    if (error) {
      this.logger.error(`${message} - ${error.stack || error.message || error}`);
    } else {
      this.logger.error(message);
    }
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
