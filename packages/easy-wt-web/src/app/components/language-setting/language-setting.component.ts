import { Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { UISharedModule } from '@easy-wt/ui-shared';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'easy-wt-language-setting',
  standalone: true,
  imports: [CommonModule, UISharedModule],
  templateUrl: './language-setting.component.html',
  styleUrls: ['./language-setting.component.scss'],
})
export class LanguageSettingComponent {
  currentLang: string;

  @ViewChild('successTipTemplate')
  successTipTemplate: TemplateRef<NzSafeAny>;

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private _doc: Document,
    private message: NzMessageService
  ) {
    this.currentLang = this.translate.currentLang;
  }

  changeLang() {
    localStorage.setItem('lang', this.currentLang === 'en' ? 'zh' : 'en');
    this.message.success(this.successTipTemplate, {
      nzDuration: 50000,
      nzPauseOnHover: true,
    });
  }

  reload() {
    this._doc.location.reload();
  }
}
