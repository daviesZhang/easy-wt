import { DynamicModule, Module } from '@nestjs/common';

import {
  ACTIONS_TOKEN,
  ENVIRONMENT_CONFIG_TOKEN,
  EnvironmentConfig,
  IStep,
  StepAction,
} from '@easy-wt/common';
import {
  ClickElementAction,
  ClickLinkAction,
  CloseBrowserAction,
  InputTextAction,
  KeyboardAction,
  MouseAction,
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
} from './step-action/step.action';
import { ReportExportService } from './report-export.service';
import { CaseRunService } from './case-run.service';
import {
  LoggerStepBeginInterceptor,
  LoggerStepEndInterceptor,
} from './interceptor/logger.interceptor';
import {
  TextSaveAction,
  TextSaveCloseAction,
} from './step-action/text-save.action';
import { OpenBrowserAction } from './step-action/open-browser.action';
import { CheckElementTextAction } from './step-action/check-element-text.action';
import { CheckElementExistAction } from './step-action/check-element-exist.action';
import { DragAndDropAction } from './step-action/drag-and-drop.action';
import { BeforeInterceptor } from './interceptor/before.interceptor';
import { ScrollIntoViewAction } from './step-action/scroll-into-view.action';
import { HoverAction } from './step-action/hover.action';

@Module({})
export class BrowserCoreModule {
  static register(config: EnvironmentConfig): DynamicModule {
    return {
      module: BrowserCoreModule,
      providers: [
        ReportExportService,
        LoggerStepEndInterceptor,
        LoggerStepBeginInterceptor,
        BeforeInterceptor,
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
        DragAndDropAction,
        WaitAction,
        ClickLinkAction,
        ClickElementAction,
        SelectPageAction,
        KeyboardAction,
        RunScriptAction,
        MouseAction,
        ScrollIntoViewAction,
        HoverAction,
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
            ScrollIntoViewAction,
            HoverAction,
            CheckElementExistAction,
            CheckElementTextAction,
            DragAndDropAction,
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
