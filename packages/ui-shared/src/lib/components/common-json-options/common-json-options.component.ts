import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AbstractOptions } from '../abstract-options';

@Component({
  selector: 'easy-wt-common-json-options',
  templateUrl: './common-json-options.component.html',
  styleUrls: ['./common-json-options.component.css'],
})
export class CommonJsonOptionsComponent
  extends AbstractOptions<Record<string, unknown>>
  implements OnInit, ICellEditorAngularComp, ICellRendererAngularComp
{
  isNullOptions = false;

  @ViewChild('editor', { static: true })
  private editor: TemplateRef<unknown>;

  constructor(
    private nzModal: NzModalService,
    private message: NzMessageService
  ) {
    super(null);
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    this.options = params.value || {};
    if (typeof this.options !== 'object' || !Object.keys(this.options).length) {
      this.isNullOptions = true;
    }
    this.renderer = !!params['renderer'];
    this.api = params.api;
    return true;
  }

  agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.refresh(params);
  }

  override getValue(): Record<string, unknown> {
    return this.options;
  }

  override isPopup(): boolean {
    return false;
  }

  override getPopupPosition(): 'over' | 'under' | undefined {
    return 'under';
  }

  override closeModal($event: unknown) {
    if ($event !== false && $event !== undefined) {
      this.options = $event as Record<string, unknown>;
    }
    this.api && this.api.stopEditing();
  }
}
