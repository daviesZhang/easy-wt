import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import { app, BrowserWindow } from 'electron';
import App from './app/app';
import CaseEvents from './app/events/case.events';
import * as winston from 'winston';
import { transports } from 'winston';
import * as path from 'path';
import { environment } from './environments/environment';
import { electronAppName } from './app/constants';
import { LogEventTransport } from './log-event-transport';

export default class Main {
  static initialize() {
    if (SquirrelEvents.handleEvents()) {
      // squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
      app.quit();
    }
  }

  static bootstrapApp() {
    app.setName(electronAppName);
    const data = { window: 'main' };
    const getLock = app.requestSingleInstanceLock(data);
    if (!getLock) {
      app.quit();
    }
    const userData = app.getPath('userData');
    const LOG_FORMAT = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-dd HH:mm:ss.sss' }),
      winston.format.printf(({ level, message, timestamp, label }) => {
        return `${level.toUpperCase()} | ${timestamp} | LOG:${message} `;
      })
    );
    App.logger = winston.createLogger({
      rejectionHandlers: [
        new transports.File({
          filename: path.join(userData, 'logs', 'rejections.log'),
        }),
      ],
      exceptionHandlers: [
        new transports.File({
          filename: path.join(userData, 'logs', 'exceptions.log'),
        }),
      ],
      transports: [
        new winston.transports.File({
          filename: path.join(userData, 'logs', 'error.log'),
          level: environment.level,
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-dd HH:mm:ss.sss' }),
            winston.format.json()
          ),
        }),
        new LogEventTransport({
          level: ['debug'],
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
    App.main(app, BrowserWindow);
  }

  static bootstrapAppEvents() {
    ElectronEvents.bootstrapElectronEvents();
    CaseEvents.bootstrapCaseEvents();
    // initialize auto updater service
    if (!App.isDevelopmentMode()) {
      // UpdateEvents.initAutoUpdateService();
    }
    // if (App.isDevelopmentMode()) {
    //   try {
    //     const debug = require('electron-debug');
    //     debug();
    //   } catch (e) {}
    // }
  }
}

// handle setup events as quickly as possible
Main.initialize();

// bootstrap app
Main.bootstrapApp();
Main.bootstrapAppEvents();
