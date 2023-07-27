import { Component, ViewChild } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { GridApi, ICellEditorParams, IRowNode } from 'ag-grid-community';
import { StepType } from '@easy-wt/common';
import { NzSelectComponent } from 'ng-zorro-antd/select';

@Component({
  selector: 'easy-wt-step-select',
  templateUrl: './step-select.component.html',
  styleUrls: ['./step-select.component.less'],
})
export class StepSelectComponent implements ICellEditorAngularComp {
  options = StepType;

  value: string;

  gridApi: GridApi;

  node: IRowNode;

  @ViewChild('selectComponent')
  selectComponent: NzSelectComponent;

  agInit(params: ICellEditorParams): void {
    this.gridApi = params.api;
    this.node = params.node;
    this.value = params.value;
  }

  getValue(): string {
    if (this.value === undefined || this.value === null) {
      return null;
    }
    const value = this.value;
    if (this.node.data.type !== value) {
      // this.gridApi.refreshCells({columns: ['options'], rowNodes: [this.node], force: true});
      setTimeout(() => {
        this.gridApi.refreshCells({
          columns: ['options'],
          rowNodes: [this.node],
          force: true,
        });
      }, 100);
    }
    return value;
  }

  // Gets called once before editing starts, to give editor a chance to
  // cancel the editing before it even starts.
  isCancelBeforeStart() {
    return false;
  }

  // Gets called once when editing is finished (eg if Enter is pressed).
  // If you return true, then the result of the edit will be ignored.
  isCancelAfterEnd() {
    // our editor will reject any value greater than 1000
    return false;
  }

  afterGuiAttached(): void {
    this.selectComponent.focus();
  }

  isPopup(): boolean {
    return false;
  }

  onChangeValue(value) {
    this.value = value;
    this.gridApi.stopEditing();
  }
}
