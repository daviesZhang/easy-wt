import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { step } from '@easy-wt/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { paramsHtml } from '../../utils/utils';

@Component({
  selector: 'easy-wt-grid-simple-renderer',
  templateUrl: './grid-simple-renderer.component.html',
  styleUrls: ['./grid-simple-renderer.component.less'],
})
export class GridSimpleRendererComponent implements ICellRendererAngularComp {
  value: string | number | SafeHtml;

  constructor(private domSanitizer: DomSanitizer) {}

  agInit(params: ICellRendererParams<step>): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams<step>): boolean {
    const value = params.valueFormatted || params.value;

    this.value = value;
    if (typeof value === 'string') {
      const newValue = paramsHtml(value);
      this.value = this.domSanitizer.bypassSecurityTrustHtml(newValue);
    }
    return true;
  }
}
