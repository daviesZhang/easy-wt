/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { ipcMain } from 'electron';
import { Logger } from '@nestjs/common';

const logger = new Logger('CaseEvents');

export default class CaseEvents {
  static bootstrapCaseEvents(): Electron.IpcMain {
    return ipcMain;
  }
}
