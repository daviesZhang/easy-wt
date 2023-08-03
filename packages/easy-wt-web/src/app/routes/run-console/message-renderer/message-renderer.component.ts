import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { LoggerEventData } from '@easy-wt/common';

@Component({
  selector: 'easy-wt-message-renderer',
  templateUrl: './message-renderer.component.html',
  styleUrls: ['./message-renderer.component.scss'],
})
export class MessageRendererComponent implements ICellRendererAngularComp {
  messageData: LoggerEventData;

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams<LoggerEventData>): boolean {
    this.messageData = params.data;

    return true;
  }
}
