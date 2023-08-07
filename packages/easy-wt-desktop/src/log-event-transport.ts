import Transport from 'winston-transport';

import App from './app/app';
import { CommonEvent, CONSOLE_VIEW_NAME } from '@easy-wt/common';

export class LogEventTransport extends Transport {
  constructor(opts) {
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
    const view = App.viewWindowMap.get(CONSOLE_VIEW_NAME);
    if (view) {
      view.webContents.send(CommonEvent.CONSOLE_LOG_EVENT, info);
    }
    // Perform the writing to the remote service
    if (callback) {
      callback();
    }
  }
}
