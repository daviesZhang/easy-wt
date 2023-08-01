import { NestFactory } from '@nestjs/core';
import { BrowserCoreModule } from './lib/browser-core.module';
import { EnvironmentConfig } from '@easy-wt/common';

export * from './lib/browser-core.module';
export * from './lib/case-run.service';
export * from './lib/report-export.service';
export * from './lib/utils';

export const browserCoreModule = async function (config: EnvironmentConfig) {
  return await NestFactory.createApplicationContext(
    BrowserCoreModule.register(config)
  );
};
