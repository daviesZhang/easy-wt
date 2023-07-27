import { NestFactory } from '@nestjs/core';

import { DbConfig } from '@easy-wt/common';
import { DatabaseCoreModule } from './lib/database-core.module';

export * from './lib/database-core.module';
export { ScriptCaseService } from './lib/services/script-case.service';

export { StepService } from './lib/services/step.service';
export { RunConfigService } from './lib/services/run-config.service';
export { ReportService } from './lib/services/report.service';
export { ScheduleService } from './lib/services/schedule.service';

export const databaseModule = async function (
  dbConfig: DbConfig,
  production = true
) {
  return await NestFactory.createApplicationContext(
    DatabaseCoreModule.register(dbConfig, production),
    {
      abortOnError: false,
    }
  );
};
