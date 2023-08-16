import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { Hover } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = Hover['options'];

@Component({
  selector: 'easy-wt-hover-options',
  templateUrl: './hover-options.component.html',
  styleUrls: ['./hover-options.component.less'],
})
export class HoverOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  modifiers = ['Alt', 'Control', 'Meta', 'Shift'];
  formGroup = this.fb.group({
    timeout: [null],
    modifiers: [null],
    position: this.fb.group({
      x: [null],
      y: [null],
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
    if (this.options.timeout) {
      this.items.push({
        value: this.translate.instant('step_options.timeout', {
          timeout: this.options.timeout,
        }),
      });
    }
    if (this.options.modifiers) {
      this.items.push({
        value: this.options.modifiers.join(' '),
      });
    }
    if (
      this.options.position &&
      (this.options.position.x || this.options.position.y)
    ) {
      this.items.push({
        value: this.translate.instant('step_options.hover.position', {
          x: this.options.position.x || 0,
          y: this.options.position.y || 0,
        }),
      });
    }
    return true;
  }
}
