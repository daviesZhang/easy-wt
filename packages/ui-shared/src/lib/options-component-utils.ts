import { StepType } from '@easy-wt/common';
import { OpenBrowserOptionsComponent } from './components/open-browser-options/open-browser-options.component';
import { CloseBrowserOptionsComponent } from './components/close-browser-options/close-browser-options.component';
import { InputTextOptionsComponent } from './components/input-text-options/input-text-options.component';
import { WaitOptionsComponent } from './components/wait-options/wait-options.component';
import { ClickElementOptionsComponent } from './components/click-element-options/click-element-options.component';
import { ClickLinkOptionsComponent } from './components/click-link-options/click-link-options.component';
import { PutParamsOptionsComponent } from './components/put-params-options/put-params-options.component';
import { ScreenshotOptionsComponent } from './components/screenshot-options/screenshot-options.component';
import { CheckElementExistOptionsComponent } from './components/check-element-exist-options/check-element-exist-options.component';
import { CheckElementTextOptionsComponent } from './components/check-element-text-options/check-element-text-options.component';
import { CommonJsonOptionsComponent } from './components/common-json-options/common-json-options.component';
import { KeyboardOptionsComponent } from './components/keyboard-options/keyboard-options.component';
import { JsEditorExpressionComponent } from './components/js-editor-expression/js-editor-expression.component';
import { CommonInputExpressionComponent } from './components/common-input-expression/common-input-expression.component';
import { MouseOptionsComponent } from './components/mouse-options/mouse-options.component';
import { TextSaveOptionsComponent } from './components/text-save-options/text-save-options.component';

export function optionsComponentSelector(
  type: StepType
): { component: unknown } | undefined {
  switch (type) {
    case StepType.OPEN_BROWSER:
      return { component: OpenBrowserOptionsComponent };
    case StepType.CLOSE_BROWSER:
      return { component: CloseBrowserOptionsComponent };
    case StepType.INPUT_TEXT:
      return { component: InputTextOptionsComponent };
    case StepType.WAIT:
      return { component: WaitOptionsComponent };
    case StepType.MOUSE:
      return { component: MouseOptionsComponent };
    case StepType.CLICK_ELEMENT:
      return { component: ClickElementOptionsComponent };
    case StepType.CLICK_LINK:
      return { component: ClickLinkOptionsComponent };
    case StepType.PUT_PARAMS:
      return { component: PutParamsOptionsComponent };
    case StepType.SCREENSHOT:
      return { component: ScreenshotOptionsComponent };
    case StepType.CHECK_ELEMENT_EXIST:
      return { component: CheckElementExistOptionsComponent };
    case StepType.CHECK_ELEMENT_TEXT:
      return { component: CheckElementTextOptionsComponent };
    case StepType.KEYBOARD:
      return { component: KeyboardOptionsComponent };
    case StepType.TEXT_SAVE:
      return { component: TextSaveOptionsComponent };
    default:
      return { component: CommonJsonOptionsComponent };
  }
}

export function expressionComponentSelector(
  type: StepType
): { component: unknown } | undefined {
  switch (type) {
    case StepType.RUN_SCRIPT:
      return { component: JsEditorExpressionComponent };
    default:
      return { component: CommonInputExpressionComponent };
  }
}
