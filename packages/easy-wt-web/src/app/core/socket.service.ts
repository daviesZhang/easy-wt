import { Injectable } from '@angular/core';
import { map, Observable, retry, skip, take, tap, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { webSocket } from 'rxjs/webSocket';
import { CaseEvent } from '@easy-wt/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TranslateService } from '@ngx-translate/core';

export interface Message {
  event: CaseEvent;
  data: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private ws$: WebSocketSubject<unknown>;

  private readonly url: string;

  private messages$: Observable<Message>;

  constructor(
    private translate: TranslateService,
    private notification: NzNotificationService
  ) {
    let url: string = environment.ws;
    if (!url) {
      url = `${location.protocol.replace('http', 'ws')}://${location.host}`;
    }
    this.url = url;
  }

  initOrGetMessage(url?: string): Observable<Message> {
    if (url && url !== this.url) {
      if (this.ws$) {
        this.ws$.complete();
        this.ws$ = null;
        this.messages$ = null;
      }
    }
    let messageId;
    const retryWebsocketKey = 'retry_websocket';
    if (!this.ws$) {
      this.ws$ = webSocket({
        url: url || this.url,
        openObserver: {
          next: () => {
            if (messageId) {
              this.notification.remove(messageId);
              this.notification.success(
                this.translate.instant('app.ws.retry_success_title'),
                this.translate.instant('app.ws.retry_success_content')
              );
            }
          },
        },
      });
      this.messages$ = this.ws$.pipe(
        retry({
          resetOnSuccess: false,
          delay: (error, retryCount) => {
            const nextTime = retryCount * 3;
            const title = this.translate.instant('app.ws.disconnect_title');
            messageId = this.notification.warning(
              title,
              this.translate.instant('app.ws.retry_wait', { time: nextTime }),
              { nzDuration: 0, nzKey: retryWebsocketKey }
            ).messageId;
            return timer(1, 1000).pipe(
              tap({
                next: (next) => {
                  const content = this.translate.instant('app.ws.retry_wait', {
                    time: nextTime - next,
                  });
                  messageId = this.notification.warning(title, content, {
                    nzDuration: 0,
                    nzKey: retryWebsocketKey,
                  }).messageId;
                },
              }),
              skip(nextTime),
              tap({
                next: () => {
                  messageId = this.notification.info(
                    title,
                    this.translate.instant('app.ws.retry'),
                    { nzDuration: 0, nzKey: retryWebsocketKey }
                  ).messageId;
                },
              }),
              take(1)
            );
          },
        }),
        map((next) => {
          return <Message>next;
        })
      );
    }
    return this.messages$;
  }

  disconnect() {
    if (this.ws$) {
      this.ws$.complete();
    }
  }

  send(message: Message) {
    if (this.ws$) {
      this.ws$.next(message);
    } else {
      console.error('没有初始化web socket...');
    }
  }
}
