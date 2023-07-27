import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { from, map, Observable } from 'rxjs';

import { UntypedFormGroup } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-create-modal',
  templateUrl: './common-modal.component.html',
  styles: [
    `
      .modal-footer {
        display: flex;
        justify-content: flex-end;
      }

      .modal-footer button {
        margin-left: 8px;
      }
    `,
  ],
})
export class CommonModalComponent implements OnInit {
  okText: string;

  @Input()
  data: any;

  @Input()
  allowClose = true;

  @Input()
  request!: (data: any) => Observable<any> | Promise<any>;

  @Input()
  content!: string | TemplateRef<any>;

  @Input()
  templateParams?: Record<string, unknown> = {};

  @Input()
  showFooter = true;

  constructor(
    private modal: NzModalRef,
    private translate: TranslateService,
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private modalData: {
      data?: any;
      allowClose?: boolean;
      request?: (data: any) => Observable<any> | Promise<any>;
      content?: string | TemplateRef<any>;
      templateParams?: Record<string, unknown>;
      showFooter?: boolean;
    }
  ) {
    this.okText =
      this.modal.getConfig().nzOkText ||
      this.translate.instant('common.confirm');
    Object.assign(this, this.modalData);
  }

  @ViewChild('footer', { static: true })
  footerTemplate: TemplateRef<NzSafeAny>;

  contentTemplate: TemplateRef<any> | null = null;

  form = new UntypedFormGroup({});

  @Output()
  modelChange = new EventEmitter<any>();

  loading = false;

  contentString = '';

  ngOnInit(): void {
    if (!this.modal.getConfig().nzFooter) {
      setTimeout(() => {
        if (this.showFooter) {
          this.modal.updateConfig({
            nzFooter: this.footerTemplate,
          });
        }
      }, 0);
    }
    if (typeof this.content === 'string') {
      this.contentString = this.content;
    } else {
      this.contentTemplate = this.content;
    }
  }

  submit() {
    this.loading = true;
    let request$;
    const result = this.request({});
    if (result instanceof Promise) {
      request$ = from(result);
    } else {
      request$ = result;
    }
    request$
      .pipe(
        map((next) => {
          if (next === undefined || next === null) {
            return true;
          }
          return next;
        })
      )
      .subscribe({
        next: (next) => {
          next && this.modal.close(next);
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
        },
        complete: () => (this.loading = false),
      });
  }

  cancel() {
    this.modal.close(false);
  }

  destroyModal(): void {
    this.modal.destroy(false);
  }
}
