import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CoreService } from './core.service';

@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  constructor(private coreService: CoreService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let url = request.url;

    if (!this.coreService.electron() && !url.startsWith('/assets/')) {
      url = environment.api + url;
    }
    return next.handle(request.clone({ url: url }));
  }
}
