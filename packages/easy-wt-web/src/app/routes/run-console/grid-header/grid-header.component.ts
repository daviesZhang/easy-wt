import { Component, Inject } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { GridApi, IHeaderParams } from 'ag-grid-community';
import { CoreService } from '../../../core/core.service';
import {
  CONSOLE_VIEW_NAME,
  CONSOLE_WINDOW_NAME,
  ELECTRON_IPC_EVENT,
  MAIN_WINDOW_NAME,
  ViewPlacement,
} from '@easy-wt/common';
import { DOCUMENT } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'easy-wt-grid-header',
  templateUrl: './grid-header.component.html',
  styleUrls: ['./grid-header.component.scss'],
})
export class GridHeaderComponent implements IHeaderAngularComp {
  electron = false;

  filterValue = '';

  developmentMode = false;

  api: GridApi;

  filter$ = new Subject<string>();

  constructor(
    private core: CoreService,
    @Inject(DOCUMENT) private _doc: Document
  ) {
    this.electron = this.core.electron();

    this.filter$
      .asObservable()
      .pipe(debounceTime(300))
      .subscribe((next) => {
        if (this.api) {
          this.api.setQuickFilter(next);
        }
      });
  }

  agInit(params: IHeaderParams): void {
    this.refresh(params);
  }

  getWindow(): Window | null {
    return this._doc.defaultView;
  }

  getElectron() {
    return this.getWindow()['electron'];
  }

  soleWindow = false;

  refresh(params: IHeaderParams): boolean {
    if (this.electron) {
      this.getElectron()
        .isDevelopmentMode()
        .then((dev) => (this.developmentMode = dev));
    }
    this.api = params.api;
    return true;
  }

  async closeView() {
    if (this.soleWindow) {
      window.electron.closeWindow(CONSOLE_WINDOW_NAME);
    } else {
      await window.electron.invokeEvent(
        ELECTRON_IPC_EVENT.CLOSE_WINDOW_VIEW,
        MAIN_WINDOW_NAME,
        CONSOLE_VIEW_NAME
      );
    }
  }

  toggleDevTools() {
    this.getElectron().toggleDevTools(CONSOLE_VIEW_NAME);
  }

  filter($event) {
    this.filter$.next($event);
  }

  clearData() {
    if (this.api) {
      const rowData: any[] = [];
      this.api.forEachNode(function (node) {
        rowData.push(node.data);
      });
      this.api.applyTransaction({
        remove: rowData,
      });
    }
  }

  async separate() {
    if (this.soleWindow) {
      //附加到主窗口去
      await window.electron.invokeEvent(
        ELECTRON_IPC_EVENT.SEPARATE_VIEW,
        CONSOLE_WINDOW_NAME,
        CONSOLE_VIEW_NAME,
        MAIN_WINDOW_NAME,
        { height: 300, placement: 'bottom' } as ViewPlacement
      );
      window.electron.closeWindow(CONSOLE_WINDOW_NAME);
    } else {
      await window.electron.invokeEvent(
        ELECTRON_IPC_EVENT.SEPARATE_VIEW,
        MAIN_WINDOW_NAME,
        CONSOLE_VIEW_NAME,
        CONSOLE_WINDOW_NAME,
        null
      );
    }
    this.soleWindow = !this.soleWindow;
  }
}
