import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CoreService } from './core.service';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable({ providedIn: 'root' })
export class StartupService {
  constructor(
    private router: Router,
    private message: NzMessageService,
    private i18n: NzI18nService,
    private translate: TranslateService,
    private core: CoreService
  ) {}

  async start() {
    const lang = localStorage.getItem('lang') || 'zh';
    switch (lang) {
      case 'zh':
        this.i18n.setLocale(zh_CN);
        break;
      default:
      case 'en':
        this.i18n.setLocale(en_US);
        break;
    }
    await lastValueFrom(this.translate.use(lang));
    if (this.core.remoteServer() && !this.core.electron()) {
      return Promise.resolve(true);
    }
    let config = await window.electron.getEnvironmentConfig();
    if (!config) {
      config = await window.electron.saveEnvironmentConfig({});
    }
    try {
      return window.electron
        .startService(config)
        .then(() => true)
        .catch((err) => {
          this.router.navigateByUrl('/config').then();
          if (err.message) {
            this.message.error(err.message);
          }
          return Promise.resolve(true);
        });
    } catch (err) {
      console.error(this.translate.instant('start.fail'), err);
    }

    this.router.navigateByUrl('/config').then();
    return Promise.resolve(true);
  }

  async load(): Promise<void> {
    await this.start();
    // delete loading...
    document.querySelector('.start-loading').remove();
    return Promise.resolve();
  }
}
