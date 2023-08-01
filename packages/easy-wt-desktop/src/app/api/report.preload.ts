import { Expose } from './helper';
import { QueryParams, Report, StatReport } from '@easy-wt/common';
import { ReportService } from '@easy-wt/database-core';
import { INestApplicationContext } from '@nestjs/common';
import { ReportHelpService } from '@easy-wt/easy-wt-core';

export class ReportExposeService implements Expose {
  private reportService: ReportService;
  private reportHelpService: ReportHelpService;

  constructor(applicationContext: INestApplicationContext) {
    this.reportService = applicationContext.get(ReportService);
    this.reportHelpService = applicationContext.get(ReportHelpService);
  }

  expose(): { [p: string]: unknown } {
    return {
      findPage: (query: QueryParams): Promise<[Report[], StatReport]> =>
        this.reportService.findPage(query),
      findById: (id: number) => this.reportService.findById(id),
      save: (item: Report[]) => this.reportService.save(item),
      delete: (id: Array<number>) => this.reportHelpService.deleteReport(id),
    };
  }
}
