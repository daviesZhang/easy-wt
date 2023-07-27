import { DynamicModule, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ScriptCaseService } from './services/script-case.service';

import { StepService } from './services/step.service';
import {
  ReportEntity,
  RunConfigEntity,
  ScheduleEntity,
  ScriptCaseEntity,
  StepEntity,
} from './entitys';
import { RunConfigService } from './services/run-config.service';
import { ReportService } from './services/report.service';
import * as path from 'path';
import * as fs from 'fs-extra';
import { DataSourceInfo, DbConfig } from '@easy-wt/common';
import { ScheduleService } from './services/schedule.service';
import DatabaseLogger from './database-logger';

@Module({})
export class DatabaseCoreModule {
  static register(options: DbConfig, production = true): DynamicModule {
    return {
      module: DatabaseCoreModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => {
            let config = {};
            if (options.type === 'sqlite') {
              let database = options.data;
              const dirname = path.dirname(database);
              await fs.ensureDir(dirname);
              if (!database.endsWith('.sql')) {
                database = path.join(database, 'db.sql');
              }
              config = {
                type: options.type,
                database: database,
              };
            } else {
              const info: DataSourceInfo = options.data;
              config = {
                type: options.type,
                database: info.database,
                host: info.host,
                username: info.username,
                password: info.password,
                port: info.port,
                retryAttempts: 3,
                extra: {
                  connectionTimeoutMillis: 5000,
                  query_timeout: 10000,
                  statement_timeout: 10000,
                },
              };
            }
            Object.assign(config, {
              logger: new DatabaseLogger(),
              debug: false,
              entities: [
                RunConfigEntity,
                ScheduleEntity,
                ScriptCaseEntity,
                StepEntity,
                ReportEntity,
              ],
              synchronize: true,
            });
            if (!production) {
              Object.assign(config, { logging: ['error'] });
            } else {
              Object.assign(config, {
                logging: ['error'],
                maxQueryExecutionTime: 2000,
              });
            }
            return config;
          },
        }),
        TypeOrmModule.forFeature([
          RunConfigEntity,
          ScheduleEntity,
          ScriptCaseEntity,
          StepEntity,
          ReportEntity,
        ]),
      ],
      providers: [
        ScriptCaseService,
        StepService,
        RunConfigService,
        ReportService,
        ScheduleService,
      ],
      exports: [
        TypeOrmModule,
        ScriptCaseService,
        StepService,
        RunConfigService,
        ScheduleService,
        ReportService,
      ],
    };
  }
}
