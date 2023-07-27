import { Component, Inject, Input, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'easy-wt-menu-bar-control',
  templateUrl: './menu-bar-control.component.html',
  styleUrls: ['./menu-bar-control.component.less'],
})
export class MenuBarControlComponent implements OnInit {
  @Input()
  windowName: string = null;
  @Input()
  show: { minus?: boolean; fullscreen?: boolean; close?: boolean } = {
    minus: true,
    fullscreen: true,
    close: true,
  };

  isDevelopmentMode = false;

  openInitConfig = false;

  constructor(@Inject(DOCUMENT) private _doc: Document) {}

  getWindow(): Window | null {
    return this._doc.defaultView;
  }

  getElectron() {
    return this.getWindow()['electron'];
  }

  closeApp() {
    if (this.windowName) {
      console.log(this.windowName);
      this.getElectron().closeWindow(this.windowName);
    } else {
      this.getElectron().closeApp();
    }
  }

  fullscreen() {
    this.getElectron().maximizeWindow(this.windowName);
  }

  minus() {
    this.getElectron().minimizeWindow(this.windowName);
  }

  ngOnInit(): void {
    this.getElectron()
      .isDevelopmentMode()
      .then((next) => {
        this.isDevelopmentMode = next;
      });
  }

  initConfigClose(result) {
    if (result) {
      location.reload();
    } else {
      this.openInitConfig = false;
    }
  }
}
