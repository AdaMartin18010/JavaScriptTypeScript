/**
 * @file 拖拽构建器核心
 * @category Low-code → Drag & Drop Builder
 * @difficulty hard
 * @tags low-code, dnd, drag-drop, canvas, visual-builder
 *
 * @description
 * 可视化拖拽构建器是低代码平台的交互核心。本模块实现了一套完整的
 * 拖拽系统：包括拖拽源、放置目标、画布管理、撤销重做和拖拽代理。
 */

// ============================================================================
// 1. 拖拽数据模型
// ============================================================================

export type DragItemType = 'component' | 'template' | 'asset' | 'layout';

export interface DragItem {
  id: string;
  type: DragItemType;
  componentType?: string;
  data: unknown;
  label: string;
  icon?: string;
}

export interface DropTarget {
  id: string;
  accepts: string[]; // 接受的 drag item type 列表
  parentId: string | null;
  index: number;
  rect?: DOMRect;
}

export interface DragState {
  isDragging: boolean;
  item: DragItem | null;
  sourceId: string | null;
  overTarget: DropTarget | null;
  dropIndicator: {
    x: number;
    y: number;
    width: number;
    height: number;
    position: 'before' | 'after' | 'inside';
  } | null;
}

// ============================================================================
// 2. 画布节点系统
// ============================================================================

export interface CanvasNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  styles: Record<string, string | number>;
  children: CanvasNode[];
  parentId: string | null;
  meta?: {
    label?: string;
    locked?: boolean;
    hidden?: boolean;
  };
}

export class CanvasModel {
  private nodes = new Map<string, CanvasNode>();
  private rootId: string | null = null;
  private listeners: Set<(nodes: CanvasNode[]) => void> = new Set();

  constructor(rootNode?: CanvasNode) {
    if (rootNode) {
      this.rootId = rootNode.id;
      this.addNodeRecursive(rootNode);
    }
  }

  private addNodeRecursive(node: CanvasNode): void {
    this.nodes.set(node.id, node);
    for (const child of node.children) {
      child.parentId = node.id;
      this.addNodeRecursive(child);
    }
  }

  getNode(id: string): CanvasNode | undefined {
    return this.nodes.get(id);
  }

  getRoot(): CanvasNode | undefined {
    return this.rootId ? this.nodes.get(this.rootId) : undefined;
  }

  getAllNodes(): CanvasNode[] {
    return Array.from(this.nodes.values());
  }

  getChildren(parentId: string | null): CanvasNode[] {
    if (parentId === null) {
      return this.rootId ? [this.nodes.get(this.rootId)!] : [];
    }
    const parent = this.nodes.get(parentId);
    return parent ? [...parent.children] : [];
  }

  /** 在指定父节点的指定位置插入节点 */
  insertNode(node: CanvasNode, parentId: string | null, index: number): void {
    node.parentId = parentId;

    if (parentId === null) {
      // 根节点
      if (this.rootId) {
        const oldRoot = this.nodes.get(this.rootId)!;
        oldRoot.parentId = node.id;
        node.children.unshift(oldRoot);
      }
      this.rootId = node.id;
    } else {
      const parent = this.nodes.get(parentId);
      if (!parent) throw new Error(`Parent ${parentId} not found`);
      parent.children.splice(index, 0, node);
    }

    this.nodes.set(node.id, node);
    this.notify();
  }

  /** 移动节点 */
  moveNode(nodeId: string, newParentId: string | null, newIndex: number): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // 从原父节点移除
    if (node.parentId !== null) {
      const oldParent = this.nodes.get(node.parentId);
      if (oldParent) {
        oldParent.children = oldParent.children.filter((c) => c.id !== nodeId);
      }
    } else if (this.rootId === nodeId) {
      // 移动根节点的情况简化处理
      return;
    }

    // 添加到新父节点
    node.parentId = newParentId;
    if (newParentId === null) {
      // 成为新的根
      const oldRoot = this.rootId ? this.nodes.get(this.rootId) : null;
      if (oldRoot) {
        oldRoot.parentId = node.id;
        node.children = [oldRoot, ...node.children];
      }
      this.rootId = node.id;
    } else {
      const newParent = this.nodes.get(newParentId);
      if (newParent) {
        newParent.children.splice(newIndex, 0, node);
      }
    }

    this.notify();
  }

  /** 删除节点 */
  removeNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // 从父节点移除
    if (node.parentId !== null) {
      const parent = this.nodes.get(node.parentId);
      if (parent) {
        parent.children = parent.children.filter((c) => c.id !== nodeId);
      }
    }

    // 递归删除所有子节点
    const deleteRecursively = (id: string) => {
      const n = this.nodes.get(id);
      if (!n) return;
      for (const child of n.children) {
        deleteRecursively(child.id);
      }
      this.nodes.delete(id);
    };

    deleteRecursively(nodeId);
    this.notify();
    return true;
  }

  /** 更新节点属性 */
  updateNode(nodeId: string, updates: Partial<Omit<CanvasNode, 'id' | 'children'>>): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    Object.assign(node, updates);
    this.notify();
  }

  subscribe(listener: (nodes: CanvasNode[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const tree = this.rootId ? [this.nodes.get(this.rootId)!] : [];
    for (const listener of this.listeners) {
      listener(tree);
    }
  }

  toJSON(): string {
    const root = this.rootId ? this.nodes.get(this.rootId) : null;
    return JSON.stringify(root, null, 2);
  }
}

// ============================================================================
// 3. 拖拽控制器
// ============================================================================

export class DragDropController {
  private state: DragState = {
    isDragging: false,
    item: null,
    sourceId: null,
    overTarget: null,
    dropIndicator: null,
  };

  private dragListeners: Set<(state: DragState) => void> = new Set();

  getState(): DragState {
    return { ...this.state };
  }

  subscribe(listener: (state: DragState) => void): () => void {
    this.dragListeners.add(listener);
    return () => this.dragListeners.delete(listener);
  }

  private setState(updates: Partial<DragState>): void {
    this.state = { ...this.state, ...updates };
    for (const listener of this.dragListeners) {
      listener({ ...this.state });
    }
  }

  /** 开始拖拽 */
  startDrag(item: DragItem, sourceId: string): void {
    this.setState({
      isDragging: true,
      item,
      sourceId,
      overTarget: null,
      dropIndicator: null,
    });
  }

  /** 更新鼠标位置，计算放置目标 */
  updatePosition(x: number, y: number, targets: DropTarget[]): void {
    if (!this.state.isDragging) return;

    // 找到最接近的放置目标
    let closest: DropTarget | null = null;
    let minDistance = Infinity;

    for (const target of targets) {
      if (!target.rect) continue;
      const centerX = target.rect.left + target.rect.width / 2;
      const centerY = target.rect.top + target.rect.height / 2;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (dist < minDistance) {
        minDistance = dist;
        closest = target;
      }
    }

    // 计算放置指示器位置
    let indicator: DragState['dropIndicator'] = null;
    if (closest?.rect) {
      const rect = closest.rect;
      const relativeY = y - rect.top;
      const position: 'before' | 'after' | 'inside' =
        relativeY < rect.height * 0.25 ? 'before' :
        relativeY > rect.height * 0.75 ? 'after' : 'inside';

      indicator = {
        x: rect.left,
        y: position === 'before' ? rect.top :
            position === 'after' ? rect.bottom :
            rect.top + rect.height / 2 - 2,
        width: rect.width,
        height: position === 'inside' ? rect.height : 4,
        position,
      };
    }

    this.setState({
      overTarget: closest,
      dropIndicator: indicator,
    });
  }

  /** 结束拖拽 */
  endDrag(): { item: DragItem | null; target: DropTarget | null; position: 'before' | 'after' | 'inside' | null } {
    const result = {
      item: this.state.item,
      target: this.state.overTarget,
      position: this.state.dropIndicator?.position ?? null,
    };

    this.setState({
      isDragging: false,
      item: null,
      sourceId: null,
      overTarget: null,
      dropIndicator: null,
    });

    return result;
  }
}

// ============================================================================
// 4. 撤销重做系统
// ============================================================================

export interface CanvasSnapshot {
  nodes: CanvasNode[];
  timestamp: number;
}

export class HistoryManager {
  private history: CanvasSnapshot[] = [];
  private index = -1;
  private maxSize = 50;

  push(nodes: CanvasNode[]): void {
    // 截断未来的历史
    this.history = this.history.slice(0, this.index + 1);

    const snapshot: CanvasSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      timestamp: Date.now(),
    };

    this.history.push(snapshot);
    this.index++;

    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.index--;
    }
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.history.length - 1;
  }

  undo(): CanvasSnapshot | null {
    if (!this.canUndo()) return null;
    this.index--;
    return this.history[this.index];
  }

  redo(): CanvasSnapshot | null {
    if (!this.canRedo()) return null;
    this.index++;
    return this.history[this.index];
  }

  getHistory(): CanvasSnapshot[] {
    return this.history;
  }
}

// ============================================================================
// 5. 演示
// ============================================================================

export function demo(): void {
  console.log('=== 拖拽构建器核心 ===\n');

  // 画布模型
  const root: CanvasNode = {
    id: 'root',
    type: 'page',
    props: { title: '首页' },
    styles: {},
    children: [
      {
        id: 'header',
        type: 'header',
        props: { text: '页头' },
        styles: { height: 60 },
        children: [],
        parentId: 'root',
      },
      {
        id: 'content',
        type: 'container',
        props: {},
        styles: { padding: 20 },
        children: [
          {
            id: 'text-1',
            type: 'text',
            props: { content: '欢迎来到低代码平台' },
            styles: {},
            children: [],
            parentId: 'content',
          },
        ],
        parentId: 'root',
      },
    ],
    parentId: null,
  };

  const canvas = new CanvasModel(root);

  console.log('--- 画布结构 ---');
  console.log('总节点数:', canvas.getAllNodes().length);
  console.log('根节点类型:', canvas.getRoot()?.type);

  // 插入新节点
  console.log('\n--- 插入节点 ---');
  canvas.insertNode(
    { id: 'button-1', type: 'button', props: { text: '提交' }, styles: {}, children: [], parentId: null },
    'content',
    1
  );
  console.log('content 子节点:', canvas.getChildren('content').map((n) => n.type));

  // 移动节点
  console.log('\n--- 移动节点 ---');
  canvas.moveNode('text-1', 'header', 0);
  console.log('header 子节点:', canvas.getChildren('header').map((n) => n.type));
  console.log('content 子节点:', canvas.getChildren('content').map((n) => n.type));

  // 拖拽状态
  console.log('\n--- 拖拽状态 ---');
  const controller = new DragDropController();
  controller.startDrag(
    { id: 'comp-btn', type: 'component', componentType: 'button', data: {}, label: '按钮组件' },
    'sidebar'
  );
  console.log('拖拽中:', controller.getState().isDragging);
  console.log('拖拽项:', controller.getState().item?.label);

  // 历史
  console.log('\n--- 撤销重做 ---');
  const history = new HistoryManager();
  history.push(canvas.getAllNodes());
  console.log('历史记录数:', history.getHistory().length);
}
