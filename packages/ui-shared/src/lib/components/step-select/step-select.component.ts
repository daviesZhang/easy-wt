import { Component, ViewChild } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { GridApi, ICellEditorParams, IRowNode } from 'ag-grid-community';
import { STEP_CONFIG, stepOperateType } from '@easy-wt/common';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { KeyValue } from '@angular/common';

const OPERATE_TYPE_ORDER = {
  check: 2,
  helper: 3,
  operate: 1,
  other: 4,
};
@Component({
  selector: 'easy-wt-step-select',
  templateUrl: './step-select.component.html',
  styleUrls: ['./step-select.component.less'],
})
export class StepSelectComponent implements ICellEditorAngularComp {
  value: string;

  gridApi: GridApi;

  node: IRowNode;
  typeMap = new Map<
    stepOperateType,
    Array<{ key: string; disabled: boolean }>
  >();

  @ViewChild('selectComponent')
  selectComponent: NzSelectComponent;

  operateTypeCompareFn(
    a: KeyValue<stepOperateType, Array<any>>,
    b: KeyValue<stepOperateType, Array<any>>
  ) {
    return OPERATE_TYPE_ORDER[a.key] > OPERATE_TYPE_ORDER[b.key] ? 1 : -1;
  }

  agInit(params: ICellEditorParams): void {
    this.gridApi = params.api;
    this.node = params.node;
    this.value = params.value;

    Object.entries(STEP_CONFIG)
      .sort((a, b) => {
        const [, aValue] = a;
        const [, bValue] = b;
        return aValue.order >= bValue.order ? 1 : -1;
      })
      .forEach(([key, value]) => {
        const operateType = value.operateType;
        this.typeMap.set(
          operateType,
          (this.typeMap.get(operateType) || []).concat({
            key,
            disabled: !!value.disabled,
          })
        );
      });
  }

  getValue(): string {
    if (this.value === undefined || this.value === null) {
      return null;
    }
    const value = this.value;
    if (this.node.data.type !== value) {
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
