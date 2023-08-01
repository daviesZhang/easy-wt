import { Expose, getMainWindowLoadURL } from './helper';
import { CasePoolService } from '@easy-wt/easy-wt-core';
import {
  CaseEvent,
  EnvironmentConfig,
  Report,
  RunConfig,
} from '@easy-wt/common';
import { ReportExportService } from '@easy-wt/browser-core';
import { ipcRenderer } from 'electron';
import path from 'path';
import { INestApplicationContext } from '@nestjs/common';

export class BrowserExposeService implements Expose {
  private casePoolService: CasePoolService;
  private reportExportService: ReportExportService;

  constructor(
    private applicationContext: INestApplicationContext,
    private environmentConfig: EnvironmentConfig
  ) {
    this.casePoolService = this.applicationContext.get(CasePoolService);
    this.reportExportService = this.applicationContext.get(ReportExportService);
  }

  expose(): { [p: string]: unknown } {
    return {
      executeCase: (
        caseId: number,
        config: Partial<RunConfig>
      ): Promise<void> => this.casePoolService.executeCase(caseId, config),
      onEvent: (
        eventName: CaseEvent,
        listener: (...args: any[]) => void
      ): void => {
        this.casePoolService.eventEmitter.on(eventName, listener);
      },
      offEvent: (
        eventName: CaseEvent,
        listener: (...args: any[]) => void
      ): void => {
        this.casePoolService.eventEmitter.off(eventName, listener);
      },
      exportPDF: async (
        report: Report,
        savePath: string,
        lang = 'zh'
      ): Promise<string> => {
        const mainURL = await getMainWindowLoadURL();
        const webPath: string = await ipcRenderer.invoke('get-loadReport-path');

        return await this.reportExportService.exportPDF(
          `file://${path.join(webPath, 'index.html#pdf')}?lang=${lang}`,
          report,
          this.environmentConfig.chromium,
          savePath
        );
      },
      exportHTML: async (
        report: Report,
        savePath: string,
        lang = 'zh'
      ): Promise<string> => {
        const webPath: string = await ipcRenderer.invoke('get-loadReport-path');

        await this.reportExportService.reportZip(
          webPath,
          savePath,
          report,
          (action, dest) => {
            if (action.data.screenshot) {
              action.data.screenshot = dest;
            }
            if (action.data.video) {
              action.data.video = dest;
            }
          },
          lang
        );
        return savePath;
      },
    };
  }
}
