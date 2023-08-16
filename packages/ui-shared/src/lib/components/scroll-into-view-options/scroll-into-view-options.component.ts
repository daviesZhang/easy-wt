import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { ScrollIntoView } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = ScrollIntoView['options'];

@Component({
  selector: 'easy-wt-scroll-into-view-options',
  templateUrl: './scroll-into-view-options.component.html',
  styleUrls: ['./scroll-into-view-options.component.less'],
})
export class ScrollIntoViewOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    timeout: [null],
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
