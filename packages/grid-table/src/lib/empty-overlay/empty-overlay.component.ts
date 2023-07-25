import {Component, OnInit} from '@angular/core';

import {IAfterGuiAttachedParams, INoRowsOverlayParams} from "ag-grid-community";

@Component({
  selector: 'easy-wt-empty-overlay',
  templateUrl: './empty-overlay.component.html',
  styles: []
})
export class EmptyOverlayComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
  }

  agInit(params: INoRowsOverlayParams): void {
  }

}
