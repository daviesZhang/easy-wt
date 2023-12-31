import { Component } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { IStep, STEP_CONFIG } from '@easy-wt/common';

@Component({
  selector: 'easy-wt-common-input-expression',
  templateUrl: './common-input-expression.component.html',
  styleUrls: ['./common-input-expression.component.less'],
})
export class CommonInputExpressionComponent implements ICellEditorAngularComp {
  value: string | number | null;

  /**
   * 是否数字输入框
   */
  valueType: 'number' | 'string' = 'string';
  tip = '';
  suffixString = '';

  agInit(params: ICellEditorParams<IStep>): void {
    this.value = params.value;
    if (params['suffixString']) {
      this.suffixString = params['suffixString'];
    }
    const data = params.data;
    if (data.type != null) {
      const config = STEP_CONFIG[data.type];
      const field = params.colDef.field;
      if (config) {
        if (config[field]) {
          this.tip = config[field].tip;
        }
        if (config[field].type) {
          this.valueType = config[params.colDef.field].type;
        }
      }
    }
  }

  getValue(): string | number | null {
    return this.value;
  }
}
