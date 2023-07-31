import { Component, Inject } from '@angular/core';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { Screenshot } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = Screenshot['options'];

@Component({
  selector: 'easy-wt-screenshot-options',
  templateUrl: './screenshot-options.component.html',
  styleUrls: ['./screenshot-options.component.less'],
})
export class ScreenshotOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    fullPage: [false],
    path: [''],
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
        value: this.translate.instant(
          'step_options.screenshot_options.full_page_' + this.options.fullPage
        ),
      },
    ];
    if (this.options.path) {
      this.items.push({
        label: this.translate.instant('step_options.screenshot_options.path'),
        value: this.options.path,
      });
    }
    return true;
  }
}
