import { Component, Inject } from '@angular/core';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { CloseBrowser } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = CloseBrowser['options'];

@Component({
  selector: 'easy-wt-close-browser-options',
  templateUrl: './close-browser-options.component.html',
  styleUrls: ['./close-browser-options.component.less'],
})
export class CloseBrowserOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    userAgent: [''],
  });

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private _doc: Document,
    private fb: FormBuilder
  ) {
    super(null);
  }

  isCancelBeforeStart(): boolean {
    return true;
  }

  agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    this.options = params.value || {};
    this.api = params.api;
    this.renderer = !!params['renderer'];
    this.items = [
      // {label: '检查存在', value: this.options.exist},
    ];
    return true;
  }
}
