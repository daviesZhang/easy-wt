import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CoreService } from '../../core/core.service';
import { FormGroup } from '@angular/forms';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import {
  ELECTRON_IPC_EVENT,
  MAIN_WINDOW_NAME,
  Rectangle,
} from '@easy-wt/common';
import { ThemeService, ThemeType } from '../../core/theme.service';

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

  ghostConsoleButton = false;

  positionStyle = {};

  currentTheme: ThemeType;

  loadingTheme = false;

  light = true;
  constructor(
    private core: CoreService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) {
    this.isElectron = this.core.electron();
    this.remoteServer = this.core.remoteServer();
    this.themeService.currentTheme$.subscribe((next) => {
      this.currentTheme = next;
    });
  }

  ngOnInit(): void {
    if (this.isElectron) {
      window.electron
        .invokeEvent(
          ELECTRON_IPC_EVENT.GET_WINDOW_VIEW_BOUNDS,
          MAIN_WINDOW_NAME,
          0
        )
        .then((next: Array<Rectangle>) => {
          if (next) {
            const position = this.layoutPosition(next);
            this.positionStyle = position;
            // this._doc.body.style.setProperty('--view-bottom', `0px`);
          }
        });
      window.electron.onMainEvent(
        ELECTRON_IPC_EVENT.REMOVE_WINDOW_VIEW_BOUNDS,
        (event, next: Array<Rectangle>) => {
          const position = this.layoutPosition(next);
          this.positionStyle = position;
          this.cdr.detectChanges();
        }
      );
      window.electron.onMainEvent(
        ELECTRON_IPC_EVENT.ADD_WINDOW_VIEW_BOUNDS,
        (event, next: Array<Rectangle>) => {
          if (next) {
            const position = this.layoutPosition(next);

            this.positionStyle = position;
            // this._doc.body.style.setProperty('--view-bottom', `0px`);
          }
        }
      );
    }
  }

  layoutPosition(rectangles: Array<Rectangle>) {
    const main = rectangles[0];
    const position: {
      top: number | string;
      bottom: number | string;
      left: number | string;
      right: number | string;
    } = { top: 0, bottom: 0, left: 0, right: 0 };
    for (let i = 1; i < rectangles.length; i++) {
      const rectangle = rectangles[i];
      if (main.width == rectangle.width) {
        position.left = 0;
      } else if (rectangle.x > main.width / 2) {
        //放在右边
        position.right = `${rectangle.width}px`;
      } else {
        position.left = `${rectangle.width}px`;
      }
      if (rectangle.y > main.height / 2) {
        //放在下面
        position.bottom = `${rectangle.height}px`;
      } else {
        position.top = `${rectangle.height}px`;
      }
    }

    return position;
  }

  async onOpenConsole() {
    await this.core.openLogConsole();
  }

  async toggleTheme() {
    this.loadingTheme = true;
    await this.themeService.toggleTheme();
    setTimeout(() => (this.loadingTheme = false), 500);
  }
}
