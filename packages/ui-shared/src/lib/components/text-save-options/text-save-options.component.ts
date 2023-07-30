import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { TextSave } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = TextSave['options'];

@Component({
  selector: 'easy-wt-text-save-options',
  templateUrl: './text-save-options.component.html',
  styleUrls: ['./text-save-options.component.less'],
})
export class TextSaveOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    filePath: new FormControl<string>(null, {
      validators: [Validators.required],
    }),
    attr: [null, []],
    overwrite: [true, [Validators.required]],
    autoClose: [true, [Validators.required]],
  });

  constructor(
    @Inject(DOCUMENT) private _doc: Document,
    private fb: FormBuilder,
    private translate: TranslateService
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
    this.items = [{ value: this.options.filePath }];
    if (this.options.attr) {
      this.items.push({
        label: this.translate.instant('step_options.text_save.attr'),
        value: this.options.attr,
      });
    }
    if (this.options.overwrite === true) {
      this.items.push({
        value: this.translate.instant('step_options.text_save.overwrite'),
      });
    }
    if (this.options.autoClose === true) {
      this.items.push({
        value: this.translate.instant('step_options.text_save.auto_close'),
      });
    }
    return true;
  }
}
