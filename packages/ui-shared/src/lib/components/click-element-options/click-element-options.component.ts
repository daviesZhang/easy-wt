import { Component, Inject } from '@angular/core';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ClickElement } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = ClickElement['options'];

@Component({
  selector: 'easy-wt-click-element-options',
  templateUrl: './click-element-options.component.html',
  styleUrls: ['./click-element-options.component.less'],
})
export class ClickElementOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    delay: new FormControl<number>(null),
    clickCount: new FormControl<number>(null, {
      validators: [Validators.required],
    }),
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
    if (this.options.clickCount) {
      this.items.push({
        value: this.translate.instant(
          'step_options.click_element.click_count',
          { count: this.options.clickCount }
        ),
      });
    }
    if (this.options.delay) {
      this.items.push({
        value: this.translate.instant('step_options.click_element.delay', {
          delay: this.options.delay,
        }),
      });
    }
    return true;
  }
}
