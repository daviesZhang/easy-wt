import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import {
  FormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { EnvironmentConfig, supportDBType } from '@easy-wt/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { distinctUntilChanged, from } from 'rxjs';

import { CommonModule, DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from '../../core/core.service';
import { CommonModalComponent, UISharedModule } from '@easy-wt/ui-shared';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'easy-wt-init-config',
  standalone: true,
  imports: [
    CommonModule,
    UISharedModule,
    NzListModule,
    NzDividerModule,
    NzTagModule,
    NzInputNumberModule,
    NzSelectModule,
  ],
  templateUrl: './init-config.component.html',
  styleUrls: ['./init-config.component.less'],
})
export class InitConfigComponent implements OnInit {
  @ViewChild('configTemplate', { static: true })
  configTemplate: TemplateRef<NzSafeAny>;

  formGroup: UntypedFormGroup;

  dbTypes = supportDBType;

  dbConfigForm: UntypedFormGroup;
  dbDataForm: UntypedFormGroup;

  stringDataControl: FormControl;

  @Input()
  allowClose = false;

  @Input()
  defaultValue: Record<string, any>;

  @Input()
  modalClassName: string;
  @Input()
  okText = this.translate.instant('common.confirm');

  @Output()
  closeModal = new EventEmitter<any>();

  localDB = true;

  passwordChange = false;

  constructor(
    private translate: TranslateService,
    private nzModal: NzModalService,
    private fb: FormBuilder,
    private coreService: CoreService,
    @Inject(DOCUMENT) private _doc: Document
  ) {
    this.dbDataForm = this.fb.group({
      host: [null, Validators.required],
      port: [null, [Validators.required, Validators.pattern('^\\d{2,}$')]],
      username: [null, Validators.required],
      password: [null],
      database: [null, Validators.required],
    });
    this.stringDataControl = new FormControl(null, [Validators.required]);
    this.dbConfigForm = this.fb.group({
      type: ['sqlite', Validators.required],
      data: this.stringDataControl,
    });
    this.formGroup = this.fb.group({
      concurrent: [3],
      chromium: [null],
      chromiumUserData: [null],
      webkit: [null],
      webkitUserData: [null],
      firefox: [null],
      firefoxUserData: [null],
      output: [null, Validators.required],
      dbconfig: this.dbConfigForm,
    });
  }

  getWindow(): Window | null {
    return this._doc.defaultView;
  }

  getElectron() {
    return this.getWindow()['electron'];
  }

  ngOnInit(): void {
    this.dbDataForm.get('password').valueChanges.subscribe(() => {
      if (this.dbDataForm.get('password').dirty) {
        this.passwordChange = true;
      }
    });

    this.dbConfigForm
      .get('type')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (value === 'sqlite') {
          this.localDB = true;
          this.dbConfigForm.setControl('data', this.stringDataControl);
        } else {
          this.localDB = false;
          this.dbConfigForm.setControl('data', this.dbDataForm);
        }
      });

    from(this.getElectron().getEnvironmentConfig()).subscribe({
      next: (config: EnvironmentConfig) => {
        if (config) {
          this.formGroup.patchValue(config);
        } else if (this.defaultValue) {
          this.formGroup.patchValue(this.defaultValue);
        }
      },
      error: (err) => {
        console.warn('读取配置文件发生错误~', err);
      },
    });

    const modal = this.coreService.createModal(() =>
      this.nzModal.create({
        nzTitle: this.translate.instant('env_config.title'),
        nzContent: CommonModalComponent,
        nzFooter: null,
        nzClassName: `${this.modalClassName || ''} init-config-modal`,
        nzMaskClosable: this.allowClose,
        nzClosable: this.allowClose,
        nzCentered: true,
        nzKeyboard: this.allowClose,
        nzWidth: 800,
        nzOkText: this.okText,
        nzData: {
          content: this.configTemplate,
          allowClose: this.allowClose,
          request: async () => {
            if (!this.formGroup.valid) {
              Object.values(this.formGroup.controls).forEach((control) => {
                if (control.invalid) {
                  control.markAsDirty();
                  control.updateValueAndValidity({ onlySelf: true });
                }
              });
              Object.values(this.dbConfigForm.controls).forEach((control) => {
                if (control.invalid) {
                  control.markAsDirty();
                  control.updateValueAndValidity({ onlySelf: true });
                }
              });
              Object.values(this.dbDataForm.controls).forEach((control) => {
                if (control.invalid) {
                  control.markAsDirty();
                  control.updateValueAndValidity({ onlySelf: true });
                }
              });
              return false;
            }
            const value = this.formGroup.value as EnvironmentConfig;
            if (
              typeof value.dbconfig.data !== 'string' &&
              value.dbconfig.data.password &&
              this.passwordChange
            ) {
              value.dbconfig.data.password =
                await this.getElectron().encryptedData(
                  value.dbconfig.data.password
                );
            }

            return this.getElectron().saveEnvironmentConfig(value);
          },
        },
      })
    );
    modal.afterClose.subscribe((result) => {
      this.closeModal.next(result);
    });
  }

  async selectPath(name: string) {
    const filePath = await this.getElectron().showOpenDialog({
      title: this.translate.instant('common.open_directory'),
      properties: ['openDirectory', 'createDirectory'],
    });
    if (filePath && filePath.length) {
      this.formGroup.patchValue({ [name]: filePath[0] });
    }
  }

  async selectFile(name: string) {
    const filePath = await this.getElectron().showOpenDialog({
      title: this.translate.instant('common.open_file'),
      properties: ['openFile', 'treatPackageAsDirectory'],
    });
    if (filePath && filePath.length) {
      this.formGroup.patchValue({ [name]: filePath[0] });
    }
  }
}
