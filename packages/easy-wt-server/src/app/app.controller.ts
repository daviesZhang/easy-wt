import { Controller, Get, Inject } from '@nestjs/common';

import { AppService } from './app.service';
import { ENVIRONMENT_CONFIG_TOKEN, EnvironmentConfig } from '@easy-wt/common';
import { ModuleRef } from '@nestjs/core';
import { ScriptCaseService } from '@easy-wt/database-core';
import { CasePoolService } from '@easy-wt/easy-wt-core';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private moduleRef: ModuleRef,
    private casePoolService: CasePoolService,
    private sc: ScriptCaseService,
    @Inject(ENVIRONMENT_CONFIG_TOKEN) private configuration: EnvironmentConfig
  ) {}

  @Get()
  getHello() {
    return this.appService.getData();
  }
}
