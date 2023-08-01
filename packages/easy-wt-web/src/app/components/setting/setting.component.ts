import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { UISharedModule } from '@easy-wt/ui-shared';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CoreService } from '../../core/core.service';
import { AboutComponent } from '../about/about.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'easy-wt-setting',
  standalone: true,
  imports: [CommonModule, UISharedModule, NzDropDownModule],
  templateUrl: './setting.component.html',

  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {
  @Input()
  windowName: string = null;

  openInitConfig = false;
  constructor(
    @Inject(DOCUMENT) private _doc: Document,
    private coreService: CoreService,
    private modalService: NzModalService,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    if (this.coreService.electron()) {
      window.electron.onEvent('open-about', () => {
        this.openAbout();
      });
    }
  }

  openAbout() {
    const messageId = this.messageService.success('').messageId;
    this.messageService.remove(messageId);
    this.modalService.create({
      nzContent: AboutComponent,
      nzTitle: null,
      nzClassName: 'about-modal',
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false,
    });
  }

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

  about() {
    this.openAbout();
  }
}
