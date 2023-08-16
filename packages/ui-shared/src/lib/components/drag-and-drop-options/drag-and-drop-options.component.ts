import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer';
import { DragAndDrop } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = DragAndDrop['options'];

@Component({
  selector: 'easy-wt-drag-and-drop-options',
  templateUrl: './drag-and-drop-options.component.html',
  styleUrls: ['./drag-and-drop-options.component.less'],
})
export class DragAndDropOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup = this.fb.group({
    sourcePosition: this.fb.group({
      x: [null],
      y: [null],
    }),
    targetPosition: this.fb.group({
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
    return true;
  }
}
