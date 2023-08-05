import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import {
  NgxGridTableModule,
  ReportComponent,
  ThemeService,
  UISharedModule,
} from '@easy-wt/ui-shared';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { CommonModule, DOCUMENT, registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslateLoader,
  TranslateModule,
  TranslateModuleConfig,
  TranslateService,
} from '@ngx-translate/core';
import {
  HttpBackend,
  HttpClientModule,
  HttpEvent,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { filter, from, map, Observable, of, switchMap } from 'rxjs';

registerLocaleData(zh);

class TranslateHttpLoader implements TranslateLoader {
  constructor(private _doc: Document, private httpHandler: HttpBackend) {}

  /**
   * 当通过playwright载入报告页面时,控制请求url带上lang参数指定语言,此时我们可以控制浏览器关闭本地文件同源策略
   * 所以可以通过http请求载入国际化文件
   * 如果url没有带上lang参数,说明是用户本地打开的情况,这种情况预先放入语言的js文件,通过全局变量获取
   */
  getTranslation(): Observable<unknown> {
    const href = this._doc.location.href;

    if (/lang=(\w+)/.test(href)) {
      const lang = href.replace(/.*lang=(\w+).*/, '$1');
      const httpRequest = new HttpRequest('GET', `./assets/i18n/${lang}.json`);
      return this.httpHandler.handle(httpRequest).pipe(
        filter(
          (httpEvent: HttpEvent<any>) => httpEvent instanceof HttpResponse
        ),
        map((httpResponse: HttpResponse<any>) => httpResponse.body)
      );
    } else {
      return of(this._doc.defaultView['lang'] || {});
    }
  }
}

function translateLoaderFactory(
  _doc: Document,
  httpHandler: HttpBackend
): TranslateLoader {
  return new TranslateHttpLoader(_doc, httpHandler);
}

export const TRANSLATE_MODULE_CONFIG: TranslateModuleConfig = {
  defaultLanguage: 'zh',
  loader: {
    provide: TranslateLoader,
    useFactory: translateLoaderFactory,
    deps: [DOCUMENT, HttpBackend],
  },
};

/**
 * 等待国际化文件就绪后再渲染页面
 * @param translateService
 */
function initializeAppFactory(
  translateService: TranslateService,
  theme: ThemeService
): () => Observable<any> {
  return () => {
    return from(theme.loadTheme(true)).pipe(
      switchMap(() => translateService.get('report.name_file'))
    );
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    UISharedModule,
    HttpClientModule,
    TranslateModule.forRoot(TRANSLATE_MODULE_CONFIG),
    ReportComponent,
    NgxGridTableModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzImageModule,
    NzTagModule,
    NzStatisticModule,
    NzIconModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      multi: true,
      deps: [TranslateService, ThemeService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
