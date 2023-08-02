import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CaseBeginEvent,
  CaseEvent,
  IScriptCase,
  Report,
  SupportBrowserType,
  supportBrowserType,
} from '@easy-wt/common';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { NzModalService } from 'ng-zorro-antd/modal';
import { map, merge, Subject, takeUntil } from 'rxjs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
  NzDropDownModule,
} from 'ng-zorro-antd/dropdown';
import { CoreService } from '../../core/core.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UISharedModule } from '@easy-wt/ui-shared';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { DynamicDatasource, FlatNode } from './dynamic-datasource';
import { CaseEditorComponent } from '../case-editor/case-editor.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

const CASE_FILE_SUFFIX = '.et';

@Component({
  selector: 'easy-wt-menu-tree',
  standalone: true,
  imports: [
    UISharedModule,
    NzDropDownModule,
    NzEmptyModule,
    NzMenuModule,
    NzSelectModule,
    NzTreeViewModule,
    CaseEditorComponent,
    NzDrawerModule,
  ],
  templateUrl: './menu-tree.component.html',
  styleUrls: ['./menu-tree.component.less'],
})
export class MenuTreeComponent implements OnInit, OnDestroy {
  @ViewChild('newNode')
  newNode: TemplateRef<NzSafeAny>;

  @ViewChild('caseEditor')
  caseEditor: TemplateRef<NzSafeAny>;

  supportBrowserType = supportBrowserType;

  selectListSelection = new SelectionModel<FlatNode>(false);

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  contextNode?: FlatNode = null;

  loading = true;

  dataSource: DynamicDatasource<IScriptCase>;

  /**
   * 是否浏览器环境
   */
  isBrowser = true;

  destroy$ = new Subject<void>();

  @Output()
  selectCase = new EventEmitter<number>();
  @Output()
  deleteCase = new EventEmitter<Array<number>>();

  @Output()
  scheduleCase = new EventEmitter<Partial<number>>();

  running = {};
  runConfigForm = this.fb.group({
    browserType: new FormControl<Array<SupportBrowserType>>(null, {
      validators: [Validators.required, Validators.minLength(1)],
    }),
    params: new FormArray([
      new FormGroup({
        name: new FormControl(''),
        value: new FormControl(''),
      }),
    ]),
  });

  modalBodyMaxHeight: string;

  modalTopHeight = 65;

  constructor(
    private fb: FormBuilder,
    private coreService: CoreService,
    private cdr: ChangeDetectorRef,
    private nzContextMenuService: NzContextMenuService,
    private message: NzMessageService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private _doc: Document,
    private modal: NzModalService
  ) {
    this.isBrowser = this.coreService.remoteServer();
    const height = this._doc.defaultView.innerHeight;
    /**
     * 145=modalHeader+modalFooter+ space
     */
    this.modalBodyMaxHeight = `${height - this.modalTopHeight - 145}px`;
  }

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  ngOnInit(): void {
    this.refreshTree().then();
    this.coreService
      .eventObservable<CaseBeginEvent>(CaseEvent.CASE_BEGIN)
      .pipe(
        takeUntil(this.destroy$),
        map(({ scriptCase }) => scriptCase.id)
      )
      .subscribe((caseId) => {
        this.running[caseId] = true;
        this.cdr.detectChanges();
      });

    const caseEnd = this.coreService
      .eventObservable<Report>(CaseEvent.CASE_END)
      .pipe(
        takeUntil(this.destroy$),
        map((report) => report.caseId)
      );
    const caseErr = this.coreService
      .eventObservable<{ uuid: string }>(CaseEvent.CASE_ERROR)
      .pipe(
        takeUntil(this.destroy$),
        map(({ uuid }) => uuid)
      );

    merge(caseEnd, caseErr).subscribe((caseId) => {
      delete this.running[caseId];
    });
  }

  async refreshTree(): Promise<IScriptCase[]> {
    this.loading = true;
    const nodes = await this.coreService.findRoots();
    this.dataSource = new DynamicDatasource<IScriptCase>(
      this.treeControl,
      this.getChildren.bind(this),
      this.transformer,
      nodes || []
    );
    this.loading = false;
    return nodes;
  }

  transformer(scriptCase: IScriptCase, level = 0): FlatNode {
    return {
      id: scriptCase.id,
      expandable: scriptCase.directory,
      parentId: scriptCase.parentId,
      label: scriptCase.name,
      level: level,
    } as FlatNode;
  }

  /**
   * 根据当前节点获取子节点
   * @param node
   */
  getChildren(node: FlatNode): Promise<IScriptCase[]> {
    return this.coreService.findDescendantsById(node.id);
  }

  nodeClick(node: FlatNode) {
    if (node.expandable) {
      this.treeControl.toggle(node);
    } else {
      this.selectListSelection.select(node);
      this.selectCase.next(node.id);
    }
  }

  async run(node: FlatNode) {
    const messageId = this.message.loading(
      this.translate.instant('case.add_run_pool')
    ).messageId;
    await this.coreService.executeCase([node.id], {});
    this.message.remove(messageId);
    this.message.success(this.translate.instant('case.add_run_pool_success'));
  }

  /**
   * 添加节点
   * @param node 当前选中的节点
   * @param siblings 是否添加作为兄弟节点
   */
  createNode(node?: FlatNode, siblings = true) {
    this.modal.create({
      nzTitle: this.translate.instant('case.button.add_case'),
      nzWidth: '90%',
      nzStyle: { top: `${this.modalTopHeight}px` },
      nzClassName: 'case-editor-modal',
      nzMaskClosable: false,
      nzContent: CaseEditorComponent,
      nzBodyStyle: { maxHeight: this.modalBodyMaxHeight },
      nzData: {
        caseId: node ? node.id : null,
        siblings: siblings,
        create: true,
      },
      nzOnOk: async (caseEditor) => {
        const saved = await caseEditor.save();
        if (typeof saved === 'boolean') {
          return false;
        }
        let parent = null;
        if (node && !siblings) {
          //添加下级节点
          parent = node;
        }
        if (node && siblings && node.parentId != null) {
          //添加平级节点
          parent = this.dataSource.getNode(node.parentId);
        }
        return this.dataSource.addNode(saved, parent).then(() => true);
      },
    });
  }

  async updateNode(contextNode: FlatNode) {
    this.modal.create({
      nzTitle: this.translate.instant('case.button.editor'),
      nzWidth: '90%',
      nzMaskClosable: false,
      nzStyle: { top: `${this.modalTopHeight}px` },
      nzBodyStyle: { maxHeight: this.modalBodyMaxHeight },
      nzClassName: 'case-editor-modal',
      nzContent: CaseEditorComponent,
      nzData: {
        caseId: contextNode.id,
        create: false,
      },
      nzOnOk: async (caseEditor) => {
        const saved = await caseEditor.update();
        if (typeof saved === 'boolean') {
          return false;
        }
        const { children, parentId } = saved;
        this.dataSource.updateNode(contextNode, saved);
        return true;
      },
    });
  }

  contextMenu(
    $event: MouseEvent,
    node: FlatNode,
    menu: NzDropdownMenuComponent
  ): void {
    this.contextNode = node;
    const currentTarget = $event.currentTarget;
    let element: Element;
    const focusClass = 'context-menu';
    if (currentTarget instanceof Element) {
      element = currentTarget as Element;
      element.classList.add(focusClass);
    }
    this.nzContextMenuService.create($event, menu).onDestroy(() => {
      if (element) {
        element.classList.remove(focusClass);
      }
    });
  }

  async deleteNode(node: FlatNode) {
    const idList = await this.coreService.deleteCase(node.id);
    this.dataSource.removeNode(idList);
    this.deleteCase.next(idList);
  }

  deleteConfirm(node: FlatNode) {
    this.modal.confirm({
      nzOkText: this.translate.instant('common.delete'),
      nzOkDanger: true,
      nzAutofocus: 'ok',
      nzTitle: this.translate.instant('common.ask_confirm'),
      nzOnOk: () => this.deleteNode(node),
    });
  }

  onScheduleCase(contextNode?: FlatNode) {
    if (!contextNode) {
      contextNode = this.contextNode;
    }
    this.scheduleCase.emit(contextNode.id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async copyNode(contextNode: FlatNode) {
    const messageId = this.message.loading(
      this.translate.instant('common.copying')
    ).messageId;
    const result: IScriptCase = await this.coreService.copyCase(contextNode.id);
    let parent = null;
    if (typeof contextNode.parentId === 'number') {
      parent = this.dataSource.getNode(contextNode.parentId);
    }
    this.updateTreeData([result], parent);
    this.message.remove(messageId);
    this.message.success(this.translate.instant('common.copy_success'));
  }

  updateTreeData(tree: IScriptCase[], parent: FlatNode) {
    this.dataSource.addFullNode(tree, parent);
    for (const scriptCase of tree) {
      if (scriptCase.children && scriptCase.children.length) {
        const parent = this.dataSource.getNode(scriptCase.id);
        this.updateTreeData(scriptCase.children, parent);
      }
    }
  }

  async exportCase(contextNode: FlatNode, parentTree: boolean) {
    let filePath = await window.electron.showSaveDialog({
      title: this.translate.instant('case.export.dialog_title'),
      properties: ['createDirectory'],
      filters: [
        {
          name: 'Easy WT Case',
          extensions: [CASE_FILE_SUFFIX.substring(1)],
        },
      ],
    });
    if (!filePath) {
      return null;
    }
    const messageId = this.message.loading(
      this.translate.instant('case.export.loading')
    ).messageId;
    if (!filePath.endsWith(CASE_FILE_SUFFIX)) {
      filePath = `${filePath}${CASE_FILE_SUFFIX}`;
    }
    await window.scriptCaseService.exportCase(
      contextNode.id,
      filePath,
      parentTree
    );
    this.message.remove(messageId);
    this.message.success(
      this.translate.instant('case.export.success', { fileName: filePath })
    );
  }

  /**
   * 导入用例
   * @param contextNode 当前选中的节点
   * @param siblings 是否导入为兄弟节点
   */
  async onCaseImport(contextNode: FlatNode | null, siblings: boolean) {
    const filePath = await window.electron.showOpenDialog({
      title: this.translate.instant('common.open_file'),
      properties: ['openFile', 'treatPackageAsDirectory'],
      filters: [
        {
          name: 'Easy WT Case',
          extensions: [CASE_FILE_SUFFIX.substring(1)],
        },
      ],
    });
    if (!filePath || !filePath.length) {
      return;
    }
    const messageId = this.message.loading(
      this.translate.instant('case.import.loading')
    ).messageId;
    const caseFile = filePath[0];
    let parentId = null;
    if (contextNode !== null) {
      parentId = siblings ? contextNode.parentId : contextNode.id;
    }
    try {
      const result = await window.scriptCaseService.importCase(
        parentId,
        caseFile
      );
      if (!this.dataSource.getData().length) {
        //还没有任何一条用例时,直接刷新根节点树
        await this.refreshTree();
      } else {
        if (!siblings) {
          //载入作为当前节点的下级时,如果当前节点还没有展开过,无需处理
          // 等待用户手动展开节点时发起请求查询下级节点列表
          // 如果用户已经展开过节点,更新节点树
          if (this.dataSource.childrenLoaded(contextNode)) {
            this.updateTreeData([result], contextNode);
          }
        } else if (typeof contextNode.parentId === 'number') {
          //如果载入作为同级节点,并且非顶级节点,则更新节点树
          const parent = this.dataSource.getNode(contextNode.parentId);
          this.updateTreeData([result], parent);
        }
      }
      this.message.success(this.translate.instant('case.import.success'));
    } catch (e) {
      this.message.error(this.translate.instant(e.message));
    }
    this.message.remove(messageId);
  }
}
