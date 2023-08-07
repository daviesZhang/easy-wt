import Transport from 'winston-transport';

import App from './app/app';
import { CONSOLE_VIEW_NAME, ELECTRON_IPC_EVENT } from '@easy-wt/common';

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
      view.webContents.send(ELECTRON_IPC_EVENT.CONSOLE_LOG, info);
    }
    // Perform the writing to the remote service
    if (callback) {
      callback();
    }
  }
}
