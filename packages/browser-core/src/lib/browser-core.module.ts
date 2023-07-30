import { DynamicModule, Module } from '@nestjs/common';

import {
  ACTIONS_TOKEN,
  ENVIRONMENT_CONFIG_TOKEN,
  EnvironmentConfig,
  IStep,
  StepAction,
} from '@easy-wt/common';
import {
  CheckElementExistAction,
  CheckElementTextAction,
  ClickElementAction,
  ClickLinkAction,
  CloseBrowserAction,
  InputTextAction,
  KeyboardAction,
  MouseAction,
  OpenBrowserAction,
  OpenPageAction,
  PageLocatorAction,
  PutParamsAction,
  RunScriptAction,
  ScreenshotAction,
  SelectPageAction,
  StructElseAction,
  StructEndIfAction,
  StructEndwhileAction,
  StructIfAction,
  StructWhileAction,
  WaitAction,
} from './step-action/step-action';
import { ReportExportService } from './report-export.service';
import { CaseRunService } from './case-run.service';
import { LoggerStepInterceptor } from './interceptor/logger.interceptor';
import {
  TextSaveAction,
  TextSaveCloseAction,
} from './step-action/text-save-action';

@Module({})
export class BrowserCoreModule {
  static register(config: EnvironmentConfig): DynamicModule {
    return {
      module: BrowserCoreModule,
      providers: [
        ReportExportService,
        LoggerStepInterceptor,
        OpenBrowserAction,
        CloseBrowserAction,
        OpenPageAction,
        InputTextAction,
        ScreenshotAction,
        CheckElementExistAction,
        CheckElementTextAction,
        PutParamsAction,
        StructIfAction,
        StructElseAction,
        StructEndIfAction,
        TextSaveAction,
        TextSaveCloseAction,
        StructWhileAction,
        StructEndwhileAction,
        WaitAction,
        ClickLinkAction,
        ClickElementAction,
        SelectPageAction,
        KeyboardAction,
        RunScriptAction,
        MouseAction,
        PageLocatorAction,
        {
          provide: ACTIONS_TOKEN,
          useFactory: (...actions: StepAction<IStep>[]) => actions,
          inject: [
            OpenBrowserAction,
            CloseBrowserAction,
            OpenPageAction,
            InputTextAction,
            ScreenshotAction,
            CheckElementExistAction,
            CheckElementTextAction,
            PutParamsAction,
            TextSaveAction,
            TextSaveCloseAction,
            StructIfAction,
            StructElseAction,
            StructEndIfAction,
            StructWhileAction,
            StructEndwhileAction,
            WaitAction,
            ClickLinkAction,
            ClickElementAction,
            SelectPageAction,
            KeyboardAction,
            RunScriptAction,
            PageLocatorAction,
            MouseAction,
          ],
        },
        { provide: ENVIRONMENT_CONFIG_TOKEN, useValue: config },
        CaseRunService,
      ],
      exports: [ReportExportService, CaseRunService, ENVIRONMENT_CONFIG_TOKEN],
    };
  }
}
