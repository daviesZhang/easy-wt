import { Component } from '@angular/core';

import { INoRowsOverlayParams } from 'ag-grid-community';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'easy-wt-empty-overlay',
  templateUrl: './empty-overlay.component.html',
  styles: [],
})
export class EmptyOverlayComponent implements ILoadingOverlayAngularComp {
  agInit(params: INoRowsOverlayParams): void {
    //
  }
}
