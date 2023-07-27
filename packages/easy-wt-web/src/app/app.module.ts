import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
  HTTP_INTERCEPTORS,
  HttpBackend,
  HttpClientModule,
  HttpEvent,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { RoutesModule } from './routes/routes.module';
import { LayoutModule } from './layout/layout.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreService } from './core/core.service';
import { ElectronCoreService } from './core/electron-core.service';
import { RemoteCoreService } from './core/remote-core.service';
import { RouteReuseStrategy } from '@angular/router';
import { MaltsevRouteReuseStrategy } from './core/maltsev-route-reuse-strategy';
import zh from '@angular/common/locales/zh';
import { registerLocaleData } from '@angular/common';
import { DefaultInterceptor } from './core/default.interceptor';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { StartupService } from './core/startup.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateModuleConfig,
} from '@ngx-translate/core';
import { filter, map, Observable } from 'rxjs';

registerLocaleData(zh);

export function StartupServiceFactory(startupService: StartupService) {
  return () => startupService.load();
}

class TranslateHttpLoader implements TranslateLoader {
  constructor(
    private httpHandler: HttpBackend,
    public prefix: string,
    public suffix: string
  ) {}

  getTranslation(lang: string): Observable<unknown> {
    const httpRequest = new HttpRequest(
      'GET',
      `${this.prefix}${lang}${this.suffix}`
    );
    return this.httpHandler.handle(httpRequest).pipe(
      filter((httpEvent: HttpEvent<any>) => httpEvent instanceof HttpResponse),
      map((httpResponse: HttpResponse<any>) => httpResponse.body)
    );
  }
}

function translateLoaderFactory(httpHandler: HttpBackend): TranslateLoader {
  return new TranslateHttpLoader(
    httpHandler,
    location.protocol.startsWith('file') ? './assets/i18n/' : '/assets/i18n/',
    '.json'
  );
}

export const TRANSLATE_MODULE_CONFIG: TranslateModuleConfig = {
  defaultLanguage: 'zh',
  loader: {
    provide: TranslateLoader,
    useFactory: translateLoaderFactory,
    deps: [HttpBackend],
  },
  //...
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot(TRANSLATE_MODULE_CONFIG),
    NzButtonModule,
    NzMessageModule,
    LayoutModule,
    RoutesModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: StartupServiceFactory,
      multi: true,
      deps: [StartupService],
    },
    { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: MaltsevRouteReuseStrategy },
    ElectronCoreService,
    RemoteCoreService,
    {
      provide: CoreService,
      useFactory: (
        electron: ElectronCoreService,
        remote: RemoteCoreService
      ) => {
        return window.electron ? electron : remote;
      },
      deps: [ElectronCoreService, RemoteCoreService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
