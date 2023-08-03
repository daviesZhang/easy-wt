import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CoreService } from '../../core/core.service';
import { FormGroup } from '@angular/forms';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ELECTRON_IPC_EVENT, MAIN_WINDOW_NAME } from '@easy-wt/common';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'easy-wt-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DefaultComponent implements OnInit {
  formGroup: FormGroup;
  bottom = '0px';

  @ViewChild('formTemplate')
  formTemplate: TemplateRef<NzSafeAny>;

  isElectron = true;
  remoteServer = false;

  constructor(
    private core: CoreService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private _doc: Document
  ) {
    this.isElectron = this.core.electron();
    this.remoteServer = this.core.remoteServer();
  }

  ngOnInit(): void {
    if (this.isElectron) {
      window.electron
        .invokeEvent(
          ELECTRON_IPC_EVENT.GET_WINDOW_VIEW_BOUNDS,
          MAIN_WINDOW_NAME,
          0
        )
        .then((next) => {
          if (next) {
            const { height } = next;
            //this.bottom = `${height}px`;
            this._doc.body.style.setProperty('--view-bottom', `${height}px`);
          }
        });
      window.electron.onMainEvent(
        ELECTRON_IPC_EVENT.REMOVE_WINDOW_VIEW_BOUNDS,
        () => {
          this._doc.body.style.setProperty('--view-bottom', `0`);
          this.cdr.detectChanges();
        }
      );
      window.electron.onMainEvent(
        ELECTRON_IPC_EVENT.ADD_WINDOW_VIEW_BOUNDS,
        (event, next) => {
          if (next) {
            const { height } = next;
            this._doc.body.style.setProperty('--view-bottom', `${height}px`);
          }
        }
      );
    }
  }

  async onOpenConsole() {
    await this.core.openLogConsole();
  }
}
