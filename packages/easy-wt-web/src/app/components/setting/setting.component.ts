import { Component, Inject, Input } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { UISharedModule } from '@easy-wt/ui-shared';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'easy-wt-setting',
  standalone: true,
  imports: [CommonModule, UISharedModule, NzDropDownModule],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent {
  @Input()
  windowName: string = null;

  openInitConfig = false;

  constructor(
    @Inject(DOCUMENT) private _doc: Document,
    private message: NzMessageService
  ) {}

  getWindow(): Window | null {
    return this._doc.defaultView;
  }

  getElectron() {
    return this.getWindow()['electron'];
  }

  closeApp() {
    if (this.windowName) {
      this.getElectron().closeWindow(this.windowName);
    } else {
      this.getElectron().closeApp();
    }
  }

  minus() {
    this.getElectron().minimizeWindow(this.windowName);
  }

  toggleDevTools() {
    this.getElectron().toggleDevTools(this.windowName);
  }

  toggleInitConfig() {
    this.openInitConfig = !this.openInitConfig;
  }

  initConfigClose(result) {
    if (result) {
      this._doc.location.reload();
    } else {
      this.openInitConfig = false;
    }
  }

  refresh() {
    this._doc.location.reload();
  }
}
