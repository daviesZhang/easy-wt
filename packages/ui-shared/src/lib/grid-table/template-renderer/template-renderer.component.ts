import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import {
  IAfterGuiAttachedParams,
  ICellRendererParams,
} from 'ag-grid-community';

@Component({
  selector: 'easy-wt-template-renderer',
  templateUrl: './template-renderer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        height: 100%;
      }

      :host-context(.grid-footer) {
        display: none;
      }
    `,
  ],
})
export class TemplateRendererComponent implements ICellRendererAngularComp {
  template!: TemplateRef<any>;

  templateContext!: { $implicit: any; params: any };

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {}

  agInit(params: ICellRendererParams & { ngTemplate: TemplateRef<any> }): void {
    this.template = params['ngTemplate'];
    this.refresh(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.templateContext = {
      $implicit: params.node,
      params,
    };
    return true;
  }
}
