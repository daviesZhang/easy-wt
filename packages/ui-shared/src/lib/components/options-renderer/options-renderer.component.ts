import { Component, Input } from '@angular/core';
import { OptionsTag } from '../../type';

@Component({
  selector: 'easy-wt-options-renderer',
  templateUrl: './options-renderer.component.html',
  styleUrls: ['./options-renderer.component.less'],
})
export class OptionsRendererComponent {
  @Input()
  items: Array<OptionsTag>;
}
