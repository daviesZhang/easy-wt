import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { CheckElementExist } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type Options = CheckElementExist['options'];

@Component({
  selector: 'easy-wt-check-element-exist-options',
  templateUrl: './check-element-exist-options.component.html',
  styleUrls: ['./check-element-exist-options.component.less'],
})
export class CheckElementExistOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  screenshotOption: number;

  formGroup = this.fb.group({
    fullPage: [false],
    element: [true],
    timeout: new FormControl<number>(null),
    exist: [true, [Validators.required]],
    alwaysScreenshot: [true, [Validators.required]],
    screenshotOption: new FormControl<number>(null),
  });

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private _doc: Document,
    private fb: FormBuilder
  ) {
    super(null);
  }

  agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    this.options = params.value || {};

    if (this.options.element) {
      this.screenshotOption = 2;
    } else {
      this.screenshotOption = this.options.fullPage ? 0 : 1;
    }
    this.formGroup.patchValue({ screenshotOption: this.screenshotOption });

    this.formGroup.controls.screenshotOption.valueChanges.subscribe(
      this.screenshotOptionsChange.bind(this)
    );

    this.api = params.api;
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
        value: this.translate.instant(
          'step_options.check_element_exist.exist_' + this.options.exist
        ),
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
        this.formGroup.patchValue({ fullPage: true, element: false });
        break;
      case 1:
        this.formGroup.patchValue({ fullPage: false, element: false });
        break;
      case 2:
        this.formGroup.patchValue({ fullPage: false, element: true });
        break;
    }
  }
}
