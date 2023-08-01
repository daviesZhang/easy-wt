import { Component, Inject } from '@angular/core';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { DEVICES, OpenBrowser } from '@easy-wt/common';
import { AbstractOptions } from '../abstract-options';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';

type Options = OpenBrowser['options'];

@Component({
  selector: 'easy-wt-open-browser-options',
  templateUrl: './open-browser-options.component.html',
  styleUrls: ['./open-browser-options.component.less'],
})
export class OpenBrowserOptionsComponent
  extends AbstractOptions<Options>
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  deviceDescriptors: Array<string> = DEVICES;

  formGroup = this.fb.group(
    {
      headless: [false],
      recordVideo: [false],
      devicesName: [''],
      userAgent: [''],
      defaultTimeout: new FormControl<number>(null, {
        validators: [Validators.required],
      }),
      width: new FormControl<number>(null, { validators: [] }),
      height: new FormControl<number>(null),
      deviceScaleFactor: new FormControl<number>(null),
    },
    { validators: this.viewportSizeValidation }
  );

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private _doc: Document,
    private fb: FormBuilder
  ) {
    super(null);
  }

  getWindow(): Window | null {
    return this._doc.defaultView;
  }

  viewportSizeValidation(form: FormGroup): ValidationErrors | null {
    const { width, height } = form.value;

    const message = () =>
      this.translate.instant('step_options.open_browser.viewport_size_error');

    if (typeof width !== 'number' && typeof height === 'number') {
      return { width: message() };
    }
    if (typeof height !== 'number' && typeof width === 'number') {
      return { height: message() };
    }
    return null;
  }

  agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.refresh(params);
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    this.options = params.value || {};
    this.renderer = !!params['renderer'];
    this.api = params.api;
    this.items = [
      ...(this.options.headless
        ? [
            {
              value: this.translate.instant(
                'step_options.open_browser.headless'
              ),
            },
          ]
        : []),
      ...(this.options.recordVideo
        ? [
            {
              value: this.translate.instant(
                'step_options.open_browser.record_video'
              ),
            },
          ]
        : []),
      { value: this.options.devicesName },
      { value: this.options.userAgent },
    ];
    if (this.options.defaultTimeout) {
      this.items.push({
        label: this.translate.instant(
          'step_options.open_browser.default_timeout_label'
        ),
        value: this.translate.instant(
          'step_options.open_browser.default_timeout_value',
          { timeout: this.options.defaultTimeout }
        ),
      });
    }
    if (this.options.width && this.options.height) {
      this.items.push({
        value: this.translate.instant('step_options.open_browser.viewport', {
          width: this.options.width,
          height: this.options.height,
        }),
      });
    }
    this.options.executablePath &&
      this.translate.instant('step_options.open_browser.executablePath', {
        executablePath: this.options.executablePath,
      });
    return true;
  }
}
