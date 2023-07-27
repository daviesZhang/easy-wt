import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { take } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-json-editor-modal',
  templateUrl: './json-editor-modal.component.html',
  styleUrls: ['./json-editor-modal.component.less'],
})
export class JsonEditorModalComponent implements OnInit {
  @ViewChild('editor', { static: true })
  private editor: TemplateRef<unknown>;

  @Input()
  title = this.translate.instant('json_editor.default_title');

  @Input()
  code: unknown = null;

  optionsString = '';

  @Output()
  closeModal = new EventEmitter<unknown>();

  constructor(
    private translate: TranslateService,
    private nzModal: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.code) {
      this.optionsString = JSON.stringify(this.code, null, 2);
    }

    this.nzModal
      .create({
        nzContent: this.editor,
        nzWidth: 540,
        nzTitle: this.title,
        nzOkText: this.translate.instant('common.save'),
        nzOnOk: () => {
          try {
            const options = JSON.parse(this.optionsString);
            return Promise.resolve(options);
          } catch (err) {
            this.message.warning(
              this.translate.instant('json_editor.format_error')
            );
            return Promise.resolve(false);
          }
        },
      })
      .afterClose.pipe(take(1))
      .subscribe((next) => {
        this.closeModal.next(next);
      });
  }

  valueChange($event: string) {
    this.optionsString = $event;
  }
}
