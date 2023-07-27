import {
  CollectionViewer,
  DataSource,
  SelectionChange,
} from '@angular/cdk/collections';
import { TreeControl } from '@angular/cdk/tree';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface FlatNode {
  expandable: boolean;

  label: string;

  level: number;

  id: number;

  parentId?: number;

  loading?: boolean;
}

export class DynamicDatasource<T> implements DataSource<FlatNode> {
  private flattenedData: BehaviorSubject<FlatNode[]>;
  private childrenLoadedSet = new Set<FlatNode>();

  private nestedNodeMap = new Map<number, FlatNode>();

  private readonly transformer: (nodes: T[], level: number) => FlatNode[];

  constructor(
    private treeControl: TreeControl<FlatNode>,
    private getChildren: (node: FlatNode) => Promise<T[]>,
    transformer: (node: T, level: number) => FlatNode,
    initData: T[]
  ) {
    this.transformer = this.transformerCurry(transformer);
    const nodes = this.transformer(initData, 0);
    this.flattenedData = new BehaviorSubject<FlatNode[]>(nodes);
    treeControl.dataNodes = nodes;
  }

  connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    const changes = [
      collectionViewer.viewChange,
      this.treeControl.expansionModel.changed.pipe(
        tap((change) => this.handleExpansionChange(change))
      ),
      this.flattenedData.asObservable(),
    ];
    return merge(...changes).pipe(
      map(() => this.expandFlattenedNodes(this.flattenedData.getValue()))
    );
  }

  expandFlattenedNodes(nodes: FlatNode[]): FlatNode[] {
    const treeControl = this.treeControl;
    const results: FlatNode[] = [];
    const currentExpand: boolean[] = [];
    currentExpand[0] = true;
    nodes.forEach((node) => {
      let expand = true;
      for (let i = 0; i <= treeControl.getLevel(node); i++) {
        expand = expand && currentExpand[i];
      }
      if (expand) {
        results.push(node);
      }
      if (treeControl.isExpandable(node)) {
        currentExpand[treeControl.getLevel(node) + 1] =
          treeControl.isExpanded(node);
      }
    });
    return results;
  }

  handleExpansionChange(change: SelectionChange<FlatNode>): void {
    if (change.added) {
      change.added.forEach((node) => this.loadChildren(node));
    }
  }

  async loadChildren(node: FlatNode): Promise<FlatNode[]> {
    if (this.childrenLoadedSet.has(node)) {
      return [];
    }
    node.loading = true;
    const result = await this.getChildren(node);
    const children = this.transformer(result, node.level + 1);
    node.loading = false;
    const flattenedData = this.flattenedData.getValue();
    const index = flattenedData.indexOf(node);
    if (index !== -1) {
      flattenedData.splice(index + 1, 0, ...children);
      this.childrenLoadedSet.add(node);
    }
    this.flattenedData.next(flattenedData);
    return children;
  }

  /**
   * 添加节点 考虑了子节点是否已经被加载的情况
   * @param newNode 待添加的节点数据
   * @param parentNode 父级节点
   *
   */
  async addNode(newNode: T, parentNode?: FlatNode) {
    const flattenedData = this.getData();
    if (parentNode) {
      const flatNode = this.transformer([newNode], parentNode.level + 1);
      const result = await this.loadChildren(parentNode);
      if (!this.treeControl.isExpanded(parentNode) && result.length) {
        return;
      }
      const index = flattenedData.indexOf(parentNode);
      if (index !== -1) {
        let childrenCount = 0;
        if (result.length) {
          childrenCount = result.length;
        } else {
          childrenCount = (await this.getChildren(parentNode)).length;
        }
        if (childrenCount) {
          childrenCount = childrenCount - 1;
        }
        flattenedData.splice(index + 1 + childrenCount, 0, ...flatNode);
      }
    } else {
      const flatNode = this.transformer([newNode], 0);
      flattenedData.push(...flatNode);
    }
    this.setData(flattenedData);
  }

  /**
   * 添加完整节点树,比如一次添加全部子节点
   * @param newNode 待添加的节点数据
   * @param parentNode 父级节点
   *
   */
  addFullNode(newNode: T[], parentNode?: FlatNode) {
    const flattenedData = this.getData();
    if (parentNode) {
      const flatNode = this.transformer(newNode, parentNode.level + 1);
      const index = flattenedData.indexOf(parentNode);
      if (index !== -1) {
        flattenedData.splice(index + 1, 0, ...flatNode);
      }
      this.childrenLoadedSet.add(parentNode);
    } else {
      const flatNode = this.transformer(newNode, 0);
      flattenedData.push(...flatNode);
    }
    this.setData(flattenedData);
  }

  updateNode(node: FlatNode, changeNode: T) {
    const newNodes = this.transformer([changeNode], node.level);
    newNodes.forEach((newNode) => {
      Object.assign(node, newNode);
      this.nestedNodeMap.set(node.id, node);
    });
  }

  removeNode(ids: number[]) {
    const data = this.getData().filter((item) => ids.indexOf(item.id) < 0);
    this.setData(data);
    ids.forEach((id) => {
      this.nestedNodeMap.delete(id);
    });
  }

  /**
   * 根据ID获取节点
   * @param id
   */
  getNode(id: number): FlatNode {
    return this.nestedNodeMap.get(id);
  }

  setData(nodes: FlatNode[]): void {
    this.flattenedData.next(nodes);
  }

  getData(): FlatNode[] {
    return this.flattenedData.getValue();
  }

  disconnect(): void {
    this.flattenedData.complete();
  }

  private transformerCurry(
    transformer: (node: T, level: number) => FlatNode
  ): (nodes: T[], level: number) => FlatNode[] {
    return (nodes: T[], level: number) =>
      nodes.map((node) => {
        const flatNode = transformer(node, level);
        this.nestedNodeMap.set(flatNode.id, flatNode);
        return flatNode;
      });
  }
}
