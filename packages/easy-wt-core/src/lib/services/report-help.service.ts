import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReportService } from '@easy-wt/database-core';
import { ENVIRONMENT_CONFIG_TOKEN, EnvironmentConfig } from '@easy-wt/common';
import * as path from 'path';
import * as fs from 'fs-extra';

@Injectable()
export class ReportHelpService {
  logger = new Logger();

  constructor(
    @Inject(ENVIRONMENT_CONFIG_TOKEN) private envConfig: EnvironmentConfig,
    private reportService: ReportService
  ) {}

  async deleteReport(ids: number[]) {
    for (const id of ids) {
      const report = await this.reportService.findById(id);
      if (!report) {
        continue;
      }
      await this.reportService.delete([id]);
      const dir = report.outputPath;
      if (!dir) {
        continue;
      }
      const reportPath = path.join(this.envConfig.output, dir);
      if (await fs.pathExists(reportPath)) {
        try {
          await fs.remove(reportPath);
        } catch (e) {
          this.logger.error(`尝试删除报告文件出现错误~,${e.message}`);
        }
      }
    }
  }
}
