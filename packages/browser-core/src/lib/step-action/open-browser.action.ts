import { Injectable } from '@nestjs/common';
import {
  OpenBrowser,
  resultSuccess,
  RunContext,
  StepAction,
  StepResult,
  StepType,
} from '@easy-wt/common';
import { BrowserContext, chromium, devices, firefox, webkit } from 'playwright';
import { BrowserContextOptions, LaunchOptions } from 'playwright-core';
import { convertNumber, ensurePath } from '../utils';

@Injectable()
export class OpenBrowserAction implements StepAction<OpenBrowser> {
  async run(
    step: OpenBrowser,
    context: RunContext
  ): Promise<StepResult<OpenBrowser>> {
    const options = step.options!;
    let browser$: Promise<BrowserContext>;
    const { recordVideo, defaultTimeout, ...other } = options;
    let _options: Partial<LaunchOptions & BrowserContextOptions> = other;

    if (recordVideo) {
      const videos = await ensurePath(context, [
        'videos',
        context.runConfig.uuid!,
      ]);
      _options = Object.assign(other, { recordVideo: { dir: videos } });
    }
    switch (context.browserType) {
      case 'webkit':
        if (context.environmentConfig.webkit) {
          _options.executablePath = context.environmentConfig.webkit;
        }
        if (context.environmentConfig.webkitUserData) {
          browser$ = webkit.launchPersistentContext(
            context.environmentConfig.webkitUserData,
            _options
          );
        } else {
          browser$ = webkit
            .launch(_options)
            .then((b) => b.newContext(_options));
        }
        break;
      case 'firefox':
        if (context.environmentConfig.firefox) {
          _options.executablePath = context.environmentConfig.firefox;
        }
        if (context.environmentConfig.firefoxUserData) {
          browser$ = firefox.launchPersistentContext(
            context.environmentConfig.firefoxUserData,
            _options
          );
        } else {
          browser$ = firefox
            .launch(_options)
            .then((b) => b.newContext(_options));
        }
        break;
      case 'chromium':
      default:
        if (options.devicesName) {
          Object.assign(_options, devices[options.devicesName]);
        }
        if (options.height && options.width) {
          Object.assign(_options, {
            viewport: { width: options.width, height: options.height },
          });
        }
        if (context.environmentConfig.chromium) {
          _options.executablePath = context.environmentConfig.chromium;
        }
        if (context.environmentConfig.chromiumUserData) {
          browser$ = chromium.launchPersistentContext(
            context.environmentConfig.chromiumUserData,
            _options
          );
        } else {
          browser$ = chromium
            .launch(_options)
            .then((b) => b.newContext(_options));
        }
        break;
    }
    const browserContext = await browser$;
    const _defaultTimeout = convertNumber(defaultTimeout);
    if (_defaultTimeout) {
      browserContext.setDefaultTimeout(_defaultTimeout);
    }
    context.browser = browserContext;
    return resultSuccess(true, step);
  }

  support(step: OpenBrowser): boolean {
    return step.type === StepType.OPEN_BROWSER;
  }
}
