import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractOptions } from '../abstract-options';
import {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import { Mouse, MOUSE_BUTTON, MOUSE_EVENT, mouseEvent } from '@easy-wt/common';
import { ICellEditorParams } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer';
import {
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

type Options = Mouse['options'];

@Component({
  selector: 'easy-wt-mouse-options',
  templateUrl: './mouse-options.component.html',
  styleUrls: ['./mouse-options.component.less'],
})
export class MouseOptionsComponent
  extends AbstractOptions<Options>
  implements OnInit, ICellEditorAngularComp, ICellRendererAngularComp
{
  optionX = new FormControl();
  optionType = new FormControl(null, [Validators.required]);

  formGroup: FormGroup = this.fb.group({
    type: [null, [Validators.required]],
    x: [null, [Validators.required]],
    y: [null, [Validators.required]],
    mouseButton: [null, [Validators.required]],
  });

  mouseType = MOUSE_EVENT;

  mouseButtons = MOUSE_BUTTON;

  constructor(
    private translate: TranslateService,
    private fb: UntypedFormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    super(null);
  }

  agInit(params: ICellEditorParams | ICellRendererParams): void {
    this.formGroup
      .get('type')
      .valueChanges.subscribe(this.typeChange.bind(this));
    this.refresh(params);
  }

  refresh(params: ICellRendererParams | ICellEditorParams): boolean {
    this.options = params.value || {};
    this.formGroup.patchValue(this.options);
    this.renderer = !!params['renderer'];
    this.api = params.api;
    this.items = [
      {
        value: this.translate.instant(
          'step_options.mouse.event_' + this.options.type
        ),
      },
    ];
    if (this.options.mouseButton) {
      this.items.push({
        value: this.translate.instant(
          'step_options.mouse.button_' + this.options.mouseButton
        ),
      });
    }
    if (typeof this.options.x === 'number') {
      this.items.push({ value: `X:${this.options.x}` });
    }
    if (typeof this.options.y === 'number') {
      this.items.push({ value: `Y:${this.options.y}` });
    }
    return true;
  }

  /**
   * 操作类型变更
   * @param $event
   */
  typeChange($event: mouseEvent) {
    if ($event === 'move' || $event === 'wheel') {
      this.formGroup.get('mouseButton').clearValidators();
      this.formGroup.get('mouseButton').reset();
      this.formGroup.get('mouseButton').markAsPristine();
      this.formGroup.get('x').setValidators(Validators.required);
      this.formGroup.get('x').markAsDirty();
      this.formGroup.get('y').setValidators(Validators.required);
      this.formGroup.get('y').markAsDirty();
    }
    if ($event === 'up' || $event === 'down') {
      this.formGroup.get('mouseButton').setValidators(Validators.required);
      this.formGroup.patchValue({ mouseButton: this.mouseButtons[0] });
      this.formGroup.get('mouseButton').markAsDirty();
      this.formGroup.get('x').clearValidators();
      this.formGroup.get('x').markAsPristine();
      this.formGroup.get('x').reset();
      this.formGroup.get('y').clearValidators();
      this.formGroup.get('y').markAsPristine();
      this.formGroup.get('y').reset();
    }
    if ($event === 'click' || $event === 'dblclick') {
      this.formGroup.get('mouseButton').setValidators(Validators.required);
      this.formGroup.patchValue({ mouseButton: this.mouseButtons[0] });
      this.formGroup.get('mouseButton').markAsDirty();
      this.formGroup.get('x').setValidators(Validators.required);
      this.formGroup.get('x').markAsDirty();
      this.formGroup.get('y').setValidators(Validators.required);
      this.formGroup.get('y').markAsDirty();
    }
    this.formGroup.updateValueAndValidity();
    this.cdr.detectChanges();
  }
}
