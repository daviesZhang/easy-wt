import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { ClickLink } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder, FormControl } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = ClickLink['options'];

@Component({
  selector: 'easy-wt-click-link-options',
  templateUrl: './click-link-options.component.html',
  styleUrls: ['./click-link-options.component.less'],
})
export class ClickLinkOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    switchPage: [true],
    timeout: new FormControl<number>(null),
  });

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private _doc: Document,
    private fb: FormBuilder
  ) {
    super(null);
  }

  agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    this.options = params.value || {};
    this.api = params.api;
    this.renderer = !!params['renderer'];
    this.items = [];
    if (this.options.timeout) {
      this.items.push({
        value: this.translate.instant('step_options.timeout', {
          timeout: this.options.timeout,
        }),
      });
    }
    if (this.options.switchPage) {
      this.items.push({
        value: this.translate.instant('step_options.click_link.switch_page'),
      });
    }
    return true;
  }
}
