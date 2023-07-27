import { LoggerService } from '@nestjs/common/services/logger.service';

import * as winston from 'winston';
import { Logger, transports } from 'winston';
import path from 'path';
import { environment } from './environments/environment';

export class LogService implements LoggerService {
  logger: Logger;

  constructor(logBasePath?: string) {
    if (!logBasePath) {
      logBasePath = __dirname;
    }
    this.logger = winston.createLogger({
      rejectionHandlers: [
        new transports.File({
          filename: path.join(logBasePath, 'logs', 'rejections.log'),
        }),
      ],
      exceptionHandlers: [
        new transports.File({
          filename: path.join(logBasePath, 'logs', 'exceptions.log'),
        }),
      ],
      transports: [
        new winston.transports.File({
          filename: path.join(logBasePath, 'logs', 'logs.log'),
          level: environment.level,
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-dd HH:mm:ss.sss' }),
            winston.format.json()
          ),
        }),
        ...(environment.production
          ? []
          : [
              new winston.transports.Console({
                level: environment.level,
                format: winston.format.combine(
                  winston.format.colorize(),
                  winston.format.timestamp({
                    format: 'YYYY-MM-dd HH:mm:ss.sss',
                  }),
                  winston.format.printf(
                    ({ level, message, timestamp, label }) => {
                      return `${timestamp} ${level} ${
                        label || ''
                      } [${message}]`;
                    }
                  )
                ),
              }),
            ]),
      ],
    });
  }

  debug(message: any, ...optionalParams: any[]): any {
    this.logger.debug(message);
  }

  error(message: any, ...optionalParams: any[]): any {
    this.logger.error(message);
  }

  log(message: any, ...optionalParams: any[]): any {
    this.logger.info(message);
  }

  warn(message: any, ...optionalParams: any[]): any {
    this.logger.warn(message);
  }
}
