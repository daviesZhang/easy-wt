import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { OpenPage } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { DOCUMENT } from '@angular/common';
import { FormBuilder } from '@angular/forms';
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
  formGroup = this.fb.group({});

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
    this.renderer = !!params['renderer'];
    this.items = [
      // {label: '检查存在', value: this.options.exist},
    ];
    return true;
  }
}
