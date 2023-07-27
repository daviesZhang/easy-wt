import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-js-editor-expression',
  templateUrl: './js-editor-expression.component.html',
  styleUrls: ['./js-editor-expression.component.less'],
})
export class JsEditorExpressionComponent implements ICellEditorAngularComp {
  value = '';
  @ViewChild('editor', { static: true })
  private editor: TemplateRef<unknown>;

  @Input()
  title: string = this.translate.instant('js_editor.default_title');

  @Input()
  code: unknown = null;

  @Output()
  closeModal = new EventEmitter<unknown>();

  constructor(
    private translate: TranslateService,
    private nzModal: NzModalService,
    private message: NzMessageService
  ) {}

  agInit(params: ICellEditorParams): void {
    this.value = params.value;
    this.nzModal
      .create({
        nzContent: this.editor,
        nzWidth: 700,
        nzTitle: this.title,
        nzOnOk: () => {
          try {
            return this.value;
          } catch (err) {
            this.message.warning(
              this.translate.instant('js_editor.format_error')
            );
            return false;
          }
        },
      })
      .afterClose.pipe(take(1))
      .subscribe((next) => {
        this.closeModal.next(next);
        params.api.stopEditing();
      });
  }

  getValue(): any {
    return this.value;
  }

  valueChange($event: string) {
    this.value = $event;
  }
}
