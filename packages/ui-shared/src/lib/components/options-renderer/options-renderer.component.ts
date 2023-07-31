import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { OptionsTag } from '../../type';

import { DomSanitizer } from '@angular/platform-browser';
import { paramsHtml } from '../../utils/utils';

@Component({
  selector: 'easy-wt-options-renderer',
  templateUrl: './options-renderer.component.html',
  styleUrls: ['./options-renderer.component.less'],
})
export class OptionsRendererComponent implements OnInit, OnChanges {
  @Input()
  items: Array<OptionsTag> = [];

  constructor(private domSanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const chng = changes[propName];
      const cur: Array<OptionsTag> = chng.currentValue;

      this.items = cur.map((item) => {
        const { label, value } = item;
        if (typeof value === 'string') {
          const newValue = paramsHtml(value);
          const safe = this.domSanitizer.bypassSecurityTrustHtml(newValue);
          return { label, value: safe };
        }
        return item;
      });
    }
  }

  ngOnInit(): void {
    if (this.items) {
      this.items = this.items.map((item) => {
        const { label, value } = item;
        if (typeof value === 'string') {
          const newValue = value.replace(/(\$\{\w+})/g, `--$1--`);
          return { label, value: newValue };
        }
        return item;
      });
    }
  }
}
