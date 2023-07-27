import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { CHECK_PATTERN, CheckElementText } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = CheckElementText['options'];

@Component({
  selector: 'easy-wt-check-element-text-options',
  templateUrl: './check-element-text-options.component.html',
  styleUrls: ['./check-element-text-options.component.less'],
})
export class CheckElementTextOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  checkPattern = CHECK_PATTERN;

  screenshotOption: number;

  formGroup = this.fb.group({
    fullPage: [false],
    element: [true],
    timeout: new FormControl<number>(null, {
      validators: [Validators.required],
    }),
    screenshotOption: new FormControl<number>(null),
    pattern: new FormControl<string>('', { validators: [Validators.required] }),
    alwaysScreenshot: [true, [Validators.required]],
  });

  constructor(
    @Inject(DOCUMENT) private _doc: Document,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    super(null);
  }

  agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    this.options = params.value || {};
    this.api = params.api;
    if (this.options.element) {
      this.screenshotOption = 2;
    } else {
      this.screenshotOption = this.options.fullPage ? 0 : 1;
    }
    this.formGroup.patchValue({ screenshotOption: this.screenshotOption });
    this.formGroup.controls.screenshotOption.valueChanges.subscribe(
      this.screenshotOptionsChange.bind(this)
    );
    this.renderer = !!params['renderer'];
    this.items = [
      ...(this.options.timeout
        ? [
            {
              label: this.translate.instant('step_options.timeout_label'),
              value: `${this.options.timeout}ms`,
            },
          ]
        : []),
      {
        label: this.translate.instant(
          'step_options.check_element_text.pattern_label'
        ),
        value: this.options.pattern
          ? this.translate.instant(
              `common.check_pattern.${this.options.pattern}`.toLowerCase()
            )
          : null,
      },
      {
        value: this.translate.instant(
          'step_options.alwaysScreenshot_' + this.options.alwaysScreenshot
        ),
      },
    ];
    if (this.options.element === true) {
      this.items.push({
        value: this.translate.instant(
          'step_options.screenshot_options.element_' + this.options.element
        ),
      });
    } else {
      this.items.push({
        value: this.translate.instant(
          'step_options.screenshot_options.full_page_' + this.options.fullPage
        ),
      });
    }
    return true;
  }

  screenshotOptionsChange(value: number) {
    switch (value) {
      case 0:
        Object.assign(this.options, { fullPage: true, element: false });
        break;
      case 1:
        Object.assign(this.options, { fullPage: false, element: false });
        break;
      case 2:
        Object.assign(this.options, { fullPage: false, element: true });
        break;
    }
  }
}
