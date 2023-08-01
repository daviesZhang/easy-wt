import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { OpenPage } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

type Options = OpenPage['options'];

@Component({
  selector: 'easy-wt-open-page-options',
  templateUrl: './open-page-options.component.html',
  styleUrls: ['./open-page-options.component.less'],
})
export class OpenPageOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    timeout: new FormControl<number>(null),
    defaultTimeout: new FormControl<number>(null),
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
    if (this.options.defaultTimeout) {
      this.items.push({
        label: this.translate.instant(
          'step_options.open_page.default_timeout_label'
        ),
        value: this.translate.instant(
          'step_options.open_page.default_timeout_value',
          {
            timeout: this.options.defaultTimeout,
          }
        ),
      });
    }
    if (this.options.timeout) {
      this.items.push({
        value: this.translate.instant('step_options.timeout', {
          timeout: this.options.timeout,
        }),
      });
    }
    return true;
  }
}
