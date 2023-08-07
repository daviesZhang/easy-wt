import { LoggerService } from '@nestjs/common/services/logger.service';

import * as winston from 'winston';
import { Logger, transports } from 'winston';
import Transport from 'winston-transport';
import path from 'path';
import { environment } from './environments/environment';
import { WsGateway } from './app/ws.gateway';
import { CommonEvent } from '@easy-wt/common';

class WsLogTransport extends Transport {
  constructor(opts, private ws: WsGateway) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    this.ws.emit(CommonEvent.CONSOLE_LOG_EVENT, info);
    if (callback) {
      callback();
    }
  }
}

export class LogService implements LoggerService {
  logger: Logger;

  constructor(ws: WsGateway, logBasePath?: string) {
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
        new WsLogTransport(
          {
            level: ['debug'],
            format: winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-dd HH:mm:ss.sss' }),
              winston.format.json()
            ),
          },
          ws
        ),
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
