import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';

@Directive({
  selector: '[easyWtInvalid]',
})
export class InvalidDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set easyWtInvalid(control: FormControl) {
    console.log(control.invalid, control.touched, control.dirty);
    if (control.invalid && (control.touched || control.dirty)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
