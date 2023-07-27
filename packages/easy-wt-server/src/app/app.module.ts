import { DynamicModule, Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentConfig } from '@easy-wt/common';
import { EasyWtCoreModule } from '@easy-wt/easy-wt-core';
import { environment } from '../environments/environment';
import { CaseController } from './case.controller';
import { StepController } from './step.controller';
import { WsGateway } from './ws.gateway';
import { ReportController } from './report.controller';
import { ScheduleController } from './schedule.controller';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({})
export class AppModule {
  static register(config: EnvironmentConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServeStaticModule.forRoot({
          exclude: ['/api*'],
          rootPath: join(__dirname, 'assets', 'easy-wt-web'),
        }),
        EasyWtCoreModule.register(config, environment.production),
      ],
      controllers: [
        AppController,
        CaseController,
        StepController,
        ReportController,
        ScheduleController,
      ],
      providers: [AppService, WsGateway],
    };
  }
}
