import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractOptions } from '../abstract-options';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { Selector, SELECTOR_TYPE, transformParams } from '@easy-wt/common';
import { ICellEditorParams } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import omitBy from 'lodash/omitBy';
import isNull from 'lodash/isNull';

@Component({
  selector: 'easy-wt-selector-locator',
  templateUrl: './selector-locator.component.html',
  styleUrls: ['./selector-locator.component.less'],
})
export class SelectorLocatorComponent
  extends AbstractOptions<Partial<Selector>>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  formGroup: UntypedFormGroup;

  selectorTypes = SELECTOR_TYPE;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    super(null);
  }

  agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.formGroup = this.fb.group({
      type: ['Css', [Validators.required]],
      value: [null, [Validators.required]],
      nth: [null, []],
      name: [null, []],
      exact: [false, []],
      filter: [null, []],
      filterValue: [null, []],
      connect: [null, []],
    });
    this.formGroup.get('filter').valueChanges.subscribe((filter) => {
      if (filter) {
        this.formGroup.get('filterValue').setValidators(Validators.required);
        this.formGroup.get('filterValue').markAsDirty();
      } else {
        this.formGroup.get('filterValue').clearValidators();
        this.formGroup.get('filterValue').reset();
        this.formGroup.get('filterValue').markAsPristine();
      }
    });
    this.refresh(params);
  }

  override getValue(): Partial<Selector> {
    if (this.options && Object.keys(this.options).length) {
      return omitBy(transformParams(this.options), isNull);
    }
    return null;
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    this.options = params.value || {};
    this.formGroup.patchValue(this.options);
    this.renderer = !!params['renderer'];
    this.api = params.api;
    this.items = [];
    if (this.options.type && this.options.value) {
      this.items.push({
        value: `${this.options.type.toLowerCase()}:${this.options.value}`,
      });
    }

    if (typeof this.options.exact === 'boolean') {
      this.items.push({
        value: this.translate.instant(
          'step_selector.exact_' + this.options.exact
        ),
      });
    }
    if (typeof this.options.nth === 'number') {
      this.items.push({
        value: this.translate.instant('step_selector.nth', {
          nth: this.options.nth,
        }),
      });
    }
    if (this.options.filter) {
      this.items.push({
        value: this.translate.instant(
          'step_selector.filter_' + this.options.filter
        ),
      });
    }
    if (this.options.filterValue) {
      this.items.push({ value: this.options.filterValue });
    }
    if (this.options.connect) {
      this.items.push({
        value: this.translate.instant(
          'step_selector.connect_' + this.options.connect
        ),
      });
    }

    return true;
  }

  clearOptions() {
    this.options = null;
    this.api.stopEditing();
  }

  /**
   * 操作类型变更
   * @param $event
   */
  saveOptions() {
    if (!this.formGroup.valid) {
      Object.values(this.formGroup.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      return;
    }
    this.options = this.formGroup.value as Selector;
    this.api.stopEditing();
  }
}
