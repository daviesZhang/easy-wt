import {Component, OnInit} from '@angular/core';
import {ILoadingOverlayAngularComp} from 'ag-grid-angular';

import {IAfterGuiAttachedParams, ILoadingOverlayParams} from "ag-grid-community";

@Component({
  selector: 'easy-wt-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
})
export class LoadingOverlayComponent implements ILoadingOverlayAngularComp, OnInit {

  constructor() {
  }

  ngOnInit() {
  }

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
  }

  agInit(params: ILoadingOverlayParams): void {

  }

}
