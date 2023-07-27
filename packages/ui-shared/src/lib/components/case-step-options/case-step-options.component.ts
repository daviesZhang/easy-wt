import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OptionsTag } from '../../type';
import { IStep } from '@easy-wt/common';
import { GridApi } from 'ag-grid-community';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'easy-wt-case-step-options',
  templateUrl: './case-step-options.component.html',
  styleUrls: ['./case-step-options.component.less'],
})
export class CaseStepOptionsComponent implements OnInit {
  @Input({ required: true })
  options: IStep['options'] | null;

  @Input()
  renderer = true;

  @Input({ required: true })
  api: GridApi;

  @Input({ required: true })
  formGroup: FormGroup;

  jsonMode: boolean;

  @Input({ required: true })
  items: Array<OptionsTag>;
  @Input()
  allowClear = false;

  @Output()
  save = new EventEmitter<CaseStepOptionsComponent['options']>();

  ngOnInit() {
    this.formGroup.patchValue(this.options);
  }

  changeMode() {
    this.jsonMode = !this.jsonMode;
  }

  saveOptions() {
    if (!this.formGroup.valid) {
      Object.values(this.formGroup.controls).forEach((control) => {
        if (control.invalid) {
          console.log(control.errors);
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      return;
    }
    this.options = this.formGroup.value;
    this.save.next(this.options);
    this.api.stopEditing();
  }

  clearOptions() {
    this.options = null;
    this.save.next(this.options);
    this.api.stopEditing();
  }

  closeModal($event: unknown) {
    if ($event !== false && $event !== undefined) {
      this.options = $event;
      this.formGroup.patchValue(this.options);
      this.formGroup.updateValueAndValidity();
    }
    this.changeMode();
  }

  cancel() {
    this.api.stopEditing();
  }
}
