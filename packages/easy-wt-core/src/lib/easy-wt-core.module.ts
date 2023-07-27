import { DynamicModule, Module } from '@nestjs/common';
import { BrowserCoreModule } from '@easy-wt/browser-core';
import { CasePoolService } from './services/case-pool.service';
import { ENVIRONMENT_CONFIG_TOKEN, EnvironmentConfig } from '@easy-wt/common';
import { DatabaseCoreModule } from '@easy-wt/database-core';
import { ScheduleTaskService } from './services/schedule-task.service';
import { ReportHelpService } from './services/report-help.service';

@Module({})
export class EasyWtCoreModule {
  static register(
    config: EnvironmentConfig,
    production: boolean
  ): DynamicModule {
    return {
      module: EasyWtCoreModule,
      imports: [
        BrowserCoreModule.register(config),
        DatabaseCoreModule.register(config.dbconfig, production),
      ],
      providers: [
        { provide: ENVIRONMENT_CONFIG_TOKEN, useValue: config },
        CasePoolService,
        {
          provide: 'CasePoolService',
          useExisting: CasePoolService,
        },
        ScheduleTaskService,
        ReportHelpService,
      ],
      exports: [
        DatabaseCoreModule,
        BrowserCoreModule,
        ReportHelpService,
        ScheduleTaskService,
        CasePoolService,
      ],
    };
  }
}
