import { Component, Inject } from '@angular/core';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { Wait } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

type Options = Wait['options'];

@Component({
  selector: 'easy-wt-wait-options',
  templateUrl: './wait-options.component.html',
  styleUrls: ['./wait-options.component.less'],
})
export class WaitOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
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
    return true;
  }
}
