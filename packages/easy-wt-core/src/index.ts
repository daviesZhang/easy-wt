import { EnvironmentConfig } from '@easy-wt/common';
import { NestFactory } from '@nestjs/core';
import { EasyWtCoreModule } from './lib/easy-wt-core.module';
import { LoggerService } from '@nestjs/common';

export * from './lib/services/case-pool.service';
export * from './lib/services/schedule-task.service';
export * from './lib/services/report-help.service';
export * from './lib/easy-wt-core.module';

export const easyWTCore = async function (
  environmentConfig: EnvironmentConfig,
  production = true,
  loggerService?: LoggerService
) {
  return await NestFactory.createApplicationContext(
    EasyWtCoreModule.register(environmentConfig, production),
    {
      abortOnError: false,
      logger: loggerService,
    }
  );
};
