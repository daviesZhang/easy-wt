import { Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { IStep, STEP_TYPE_CONFIG } from '@easy-wt/common';

@Component({
  selector: 'easy-wt-common-input-expression',
  templateUrl: './common-input-expression.component.html',
  styleUrls: ['./common-input-expression.component.less'],
})
export class CommonInputExpressionComponent
  implements OnInit, ICellEditorAngularComp
{
  value: string | number | null;

  /**
   * 是否数字输入框
   */
  valueType: 'number' | 'string' = 'string';
  tip = '';
  suffixString = '';

  agInit(params: ICellEditorParams): void {
    this.value = params.value;

    if (params['suffixString']) {
      this.suffixString = params['suffixString'];
    }

    const data = params.data as Partial<IStep>;
    if (data.type != null) {
      const config = STEP_TYPE_CONFIG[data.type];
      if (config) {
        this.tip = config[params.colDef.field]?.tip;
        if (config[params.colDef.field].type) {
          this.valueType = config[params.colDef.field].type;
        }
      }
    }
  }

  getValue(): string | number | null {
    return this.value;
  }

  ngOnInit(): void {}
}
