import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer';
import { Keyboard, KEYBOARD_EVENT } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = Keyboard['options'];

@Component({
  selector: 'easy-wt-keyboard-options',
  templateUrl: './keyboard-options.component.html',
  styleUrls: ['./keyboard-options.component.less'],
})
export class KeyboardOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  keyboardEvent = KEYBOARD_EVENT;

  formGroup = this.fb.group({
    type: [''],
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
          'common.keyboard.' + this.options.type.toLowerCase()
        ),
      },
    ];
    return true;
  }
}
