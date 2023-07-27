import { Component, Inject } from '@angular/core';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { InputText } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = InputText['options'];

@Component({
  selector: 'easy-wt-input-text-options',
  templateUrl: './input-text-options.component.html',
  styleUrls: ['./input-text-options.component.less'],
})
export class InputTextOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    force: [true],
    timeout: new FormControl<number>(null, {
      validators: [Validators.required, Validators.min(1)],
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
    if (this.options.force) {
      this.items.push({
        value: this.translate.instant('step_options.input_text.force'),
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
