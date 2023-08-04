import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';
import { IconsProviderModule } from './icons-provider.module';
import { OpenBrowserOptionsComponent } from './components/open-browser-options/open-browser-options.component';
import { CloseBrowserOptionsComponent } from './components/close-browser-options/close-browser-options.component';
import { OpenPageOptionsComponent } from './components/open-page-options/open-page-options.component';
import { CommonJsonOptionsComponent } from './components/common-json-options/common-json-options.component';

import { NzListModule } from 'ng-zorro-antd/list';
import { StepSelectComponent } from './components/step-select/step-select.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { CommonModalComponent } from './components/common-modal/common-modal.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { WaitOptionsComponent } from './components/wait-options/wait-options.component';
import { ScreenshotOptionsComponent } from './components/screenshot-options/screenshot-options.component';
import { PutParamsOptionsComponent } from './components/put-params-options/put-params-options.component';
import { InputTextOptionsComponent } from './components/input-text-options/input-text-options.component';
import { ClickElementOptionsComponent } from './components/click-element-options/click-element-options.component';
import { ClickLinkOptionsComponent } from './components/click-link-options/click-link-options.component';
import { CheckElementExistOptionsComponent } from './components/check-element-exist-options/check-element-exist-options.component';
import { CheckElementTextOptionsComponent } from './components/check-element-text-options/check-element-text-options.component';
import { NzResizableModule } from 'ng-zorro-antd/resizable';

import { OptionsRendererComponent } from './components/options-renderer/options-renderer.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { MenuBarControlComponent } from './components/menu-bar-control/menu-bar-control.component';
import { KeyboardOptionsComponent } from './components/keyboard-options/keyboard-options.component';
import { ServerConfigComponent } from './components/server-config/server-config.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { JsonEditorModalComponent } from './components/json-editor-modal/json-editor-modal.component';
import { CommonInputExpressionComponent } from './components/common-input-expression/common-input-expression.component';
import { JsEditorExpressionComponent } from './components/js-editor-expression/js-editor-expression.component';
import { MouseOptionsComponent } from './components/mouse-options/mouse-options.component';

import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { SelectorLocatorComponent } from './components/selector-locator/selector-locator.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { CaseStepOptionsComponent } from './components/case-step-options/case-step-options.component';
import { InvalidDirective } from './invalid.directive';

import { TranslateModule } from '@ngx-translate/core';
import { TextSaveOptionsComponent } from './components/text-save-options/text-save-options.component';
import { GridSimpleRendererComponent } from './components/grid-simple-renderer/grid-simple-renderer.component';

@NgModule({
  declarations: [
    OpenBrowserOptionsComponent,
    CloseBrowserOptionsComponent,
    OpenPageOptionsComponent,
    StepSelectComponent,
    CommonJsonOptionsComponent,
    CommonModalComponent,
    SelectorLocatorComponent,
    WaitOptionsComponent,
    ScreenshotOptionsComponent,
    PutParamsOptionsComponent,
    InputTextOptionsComponent,
    ClickElementOptionsComponent,
    ClickLinkOptionsComponent,
    CheckElementExistOptionsComponent,
    CheckElementTextOptionsComponent,
    OptionsRendererComponent,
    KeyboardOptionsComponent,
    MenuBarControlComponent,
    ServerConfigComponent,
    JsonEditorModalComponent,
    TextSaveOptionsComponent,
    CommonInputExpressionComponent,
    CaseStepOptionsComponent,
    JsEditorExpressionComponent,
    MouseOptionsComponent,
    GridSimpleRendererComponent,
    InvalidDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    ...SHARED_ZORRO_MODULES,
    IconsProviderModule,
    NzListModule,
    NzSelectModule,
    NzSwitchModule,
    NzTagModule,
    NzTreeModule,
    NzTreeViewModule,
    NzToolTipModule,
    NzEmptyModule,
    NzDropDownModule,
    NzCodeEditorModule,
    NzResizableModule,
    NzInputNumberModule,

    NzCollapseModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzStatisticModule,
    NzPopoverModule,
    NzRadioModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    ...SHARED_ZORRO_MODULES,
    IconsProviderModule,
    CommonModalComponent,
    SelectorLocatorComponent,
    CaseStepOptionsComponent,
    OpenBrowserOptionsComponent,
    CloseBrowserOptionsComponent,
    OpenPageOptionsComponent,
    StepSelectComponent,
    CommonJsonOptionsComponent,
    WaitOptionsComponent,
    ScreenshotOptionsComponent,
    TextSaveOptionsComponent,
    PutParamsOptionsComponent,
    InputTextOptionsComponent,
    ClickElementOptionsComponent,
    KeyboardOptionsComponent,
    GridSimpleRendererComponent,
    ClickLinkOptionsComponent,
    CheckElementExistOptionsComponent,
    CheckElementTextOptionsComponent,
    MenuBarControlComponent,
    ServerConfigComponent,
    JsEditorExpressionComponent,
  ],
})
export class UISharedModule {}
