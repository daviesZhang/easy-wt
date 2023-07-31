import { Directive, Injectable, Input, OnInit, Optional } from '@angular/core';
import { OptionsTag } from '../type';
import {
  GridApi,
  ICellEditorParams,
  ICellRendererParams,
} from 'ag-grid-community';
import { transformParams } from '@easy-wt/common';
import omitBy from 'lodash/omitBy';
import isNull from 'lodash/isNull';

@Injectable()
export class OptionParams<T> {
  value: T;
  renderer: boolean;
}

@Directive()
export abstract class AbstractOptions<T> implements OnInit {
  items: Array<OptionsTag>;
  options: T;
  renderer = true;
  api!: GridApi;
  jsonMode = false;
  @Input()
  params: OptionParams<T>;

  constructor(@Optional() private optionParams: OptionParams<T>) {
    if (optionParams) {
      this.params = optionParams;
    }
  }

  ngOnInit(): void {
    if (this.params) {
      this.refresh(this.params);
    }
  }

  abstract refresh(
    params:
      | ICellRendererParams
      | ICellEditorParams
      | { value: T; renderer: boolean }
  ): boolean;

  changeMode() {
    this.jsonMode = !this.jsonMode;
  }

  getPopupPosition(): 'over' | 'under' | undefined {
    return 'under';
  }

  isPopup(): boolean {
    return true;
  }

  getValue(value?: unknown): T {
    if (value !== undefined) {
      this.options = omitBy(transformParams(value), isNull) as T;
    }
    return this.options;
  }

  protected closeModal($event: unknown) {
    if ($event !== false && $event !== undefined) {
      this.options = $event as T;
      this.api && this.api.stopEditing();
    } else {
      this.changeMode();
    }
  }

  protected valueFormatter(): string {
    return this.items
      .map((item) => `${item.label ? item.label + ':' : ''}${item.value}`)
      .join(' ');
  }
}
