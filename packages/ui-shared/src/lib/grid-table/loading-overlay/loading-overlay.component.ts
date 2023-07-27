import { Component } from '@angular/core';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';

import { ILoadingOverlayParams } from 'ag-grid-community';

@Component({
  selector: 'easy-wt-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
})
export class LoadingOverlayComponent implements ILoadingOverlayAngularComp {
  agInit(params: ILoadingOverlayParams): void {
    //
  }
}
