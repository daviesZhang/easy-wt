import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { UISharedModule } from '@easy-wt/ui-shared';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { bufferCount, Subject } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'easy-wt-about',
  standalone: true,
  imports: [CommonModule, UISharedModule, NzTagModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnDestroy {
  version: string;

  gitee = 'https://gitee.com/davieszhang';
  github = 'https://github.com/daviesZhang';

  showDevTools$ = new Subject();

  constructor(private modalRef: NzModalRef, private message: NzMessageService) {
    this.getVersion().then();

    this.showDevTools$.pipe(bufferCount(12)).subscribe((next) => {
      window.electron.toggleDevTools();
    });
  }

  async getVersion() {
    this.version = await window.electron.getAppVersion();
  }

  /**
   * 一个奇怪的bug,如果通过electron唤起,模态窗口会出问题,需要激活一下界面
   */
  closeAbout() {
    const messageId = this.message.success('').messageId;
    this.message.remove(messageId);
    this.modalRef.close(true);
  }

  onVersionClick() {
    this.showDevTools$.next(true);
  }

  async openWebsite(gitee: string) {
    await window.electron.invokeEvent('openExternal', gitee);
  }

  ngOnDestroy(): void {
    this.showDevTools$.complete();
  }
}
