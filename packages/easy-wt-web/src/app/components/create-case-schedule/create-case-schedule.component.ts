import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonModalComponent, UISharedModule } from '@easy-wt/ui-shared';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CoreService } from '../../core/core.service';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import {
  FormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { from, map, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'easy-wt-create-case-schedule',
  standalone: true,
  imports: [CommonModule, UISharedModule, NzInputNumberModule, NzSelectModule],
  templateUrl: './create-case-schedule.component.html',
  styleUrls: ['./create-case-schedule.component.scss'],
})
export class CreateCaseScheduleComponent implements OnInit {
  @Input({ required: true })
  caseId: number;

  @ViewChild('content', { static: true })
  contentTemplate: TemplateRef<NzSafeAny>;

  @Output()
  closeModal = new EventEmitter<any>();

  formGroup: UntypedFormGroup;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private modal: NzModalService,
    private core: CoreService
  ) {}

  validate(control: UntypedFormControl): Observable<ValidationErrors | null> {
    return from(this.core.getCronNextDate(control.value)).pipe(
      map((nextDate) =>
        typeof nextDate === 'number' ? null : { error: true, format: true }
      )
    );
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      scriptName: { disabled: true, value: null },
      name: [null, Validators.required],
      cron: [null, [Validators.required], [this.validate.bind(this)]],
    });

    this.core.findCaseById(this.caseId).then((next) => {
      this.formGroup.patchValue({ scriptName: next.name });
    });
    this.modal
      .create({
        nzTitle: this.translate.instant('schedule.button.add_schedule'),
        nzContent: CommonModalComponent,
        nzFooter: null,

        nzWidth: 500,
        nzData: {
          content: this.contentTemplate,
          allowClose: true,
          request: async () => {
            if (!this.formGroup.valid) {
              Object.values(this.formGroup.controls).forEach((control) => {
                if (control.invalid) {
                  control.markAsDirty();
                  control.updateValueAndValidity({ onlySelf: true });
                }
              });
              return false;
            }
            const value = this.formGroup.value;
            const params = Object.assign(
              {
                caseId: this.caseId,
              },
              value
            );
            return await this.core.scheduleExecuteCase(params);
          },
        },
      })
      .afterClose.subscribe((result) => {
        this.closeModal.next(result);
      });
  }
}
