import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NzListModule } from 'ng-zorro-antd/list';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UISharedModule } from '@easy-wt/ui-shared';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { GridApi, ICellEditorParams } from 'ag-grid-community';
import { from, map, Observable } from 'rxjs';
import { CoreService } from '../../core/core.service';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'easy-wt-cron-editor',
  standalone: true,
  imports: [
    CommonModule,
    UISharedModule,
    NzListModule,
    NzDividerModule,
    NzTagModule,
  ],
  templateUrl: './cron-editor.component.html',
  styleUrls: ['./cron-editor.component.scss'],
})
export class CronEditorComponent implements ICellEditorAngularComp {
  formGroup: UntypedFormGroup;

  value;

  api?: GridApi;
  datePipe = new DatePipe('zh-CN');

  nextDate = '';

  constructor(private fb: UntypedFormBuilder, private core: CoreService) {}

  validate(control: UntypedFormControl): Observable<ValidationErrors | null> {
    return from(this.core.getCronNextDate(control.value)).pipe(
      map((nextDate) => {
        if (typeof nextDate === 'number') {
          this.nextDate = this.datePipe.transform(
            nextDate,
            'yyyy-MM-dd HH:mm:ss'
          );
          return null;
        }
        this.nextDate = null;
        return { error: true, format: true };
      })
    );
  }

  save() {
    if (!this.formGroup.valid) {
      Object.values(this.formGroup.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      return;
    }
    this.value = this.formGroup.value.cron;
    this.api && this.api.stopEditing();
  }

  agInit(params: ICellEditorParams): void {
    this.formGroup = this.fb.group({
      cron: [null, [Validators.required], [this.validate.bind(this)]],
    });
    this.value = params.value;
    this.api = params.api;
    this.formGroup.patchValue({ cron: this.value });
  }

  getValue(): any {
    return this.value;
  }

  getPopupPosition(): 'over' | 'under' | undefined {
    return 'under';
  }

  isPopup(): boolean {
    return true;
  }
}
