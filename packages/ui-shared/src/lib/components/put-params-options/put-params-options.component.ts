import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { PutParams } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

type Options = PutParams['options'];

@Component({
  selector: 'easy-wt-put-params-options',
  templateUrl: './put-params-options.component.html',
  styleUrls: ['./put-params-options.component.less'],
})
export class PutParamsOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    key: ['', [Validators.required]],
    simple: [false],
    attr: [''],
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
    this.items = [
      {
        label: this.translate.instant('step_options.put_params.key_label'),
        value: this.options.key,
      },
      {
        value: this.translate.instant(
          'step_options.put_params.simple_' + this.options.simple
        ),
      },
    ];
    if (this.options.attr) {
      this.items.push({
        label: this.translate.instant('step_options.put_params.attr'),
        value: this.options.attr,
      });
    }
    return true;
  }
}
