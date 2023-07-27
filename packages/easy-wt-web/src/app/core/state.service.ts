import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RunModal } from '@easy-wt/ui-shared';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public modal$: BehaviorSubject<RunModal>;

  serverKey = 'serverKey';

  constructor() {
    let modal: RunModal = 'browser';
    if (window.electron) {
      modal = 'electron';
    }
    this.modal$ = new BehaviorSubject<RunModal>(modal);
  }

  getServerConfig(): { serverURL: string; enabled: boolean } {
    return JSON.parse(localStorage.getItem(this.serverKey));
  }
}
