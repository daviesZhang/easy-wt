import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CoreService } from '../../core/core.service';

import { Observable } from 'rxjs';
import { RunModal } from '@easy-wt/ui-shared';
import { FormGroup } from '@angular/forms';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'easy-wt-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DefaultComponent {
  modal$: Observable<RunModal>;

  formGroup: FormGroup;

  @ViewChild('formTemplate')
  formTemplate: TemplateRef<NzSafeAny>;

  isElectron = true;
  remoteServer = false;

  constructor(private core: CoreService) {
    this.isElectron = this.core.electron();
    this.remoteServer = this.core.remoteServer();
  }
}
