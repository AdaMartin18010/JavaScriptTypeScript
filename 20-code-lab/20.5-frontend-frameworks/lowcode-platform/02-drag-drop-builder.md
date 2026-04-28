# 拖拽构建器核心

> 文件: `02-drag-drop-builder.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## 拖拽系统架构

```
组件面板 (Component Palette)
│
├── 拖拽源 (Drag Source)
│   └── 每个组件是一个可拖拽项
│
▼
拖拽控制器 (DragDropController)
├── 状态管理 (isDragging / dragItem / dropTarget)
├── 位置计算 (碰撞检测、排序指示器)
└── 事件协调 (dragstart / dragover / drop)
│
▼
画布 (Canvas)
├── 树形节点模型 (CanvasNode)
├── 节点操作 (CRUD + 移动)
└── 历史栈 (Undo/Redo)
```

---

## 关键技术点

### 1. 放置指示器算法

```
┌─────────────────────┐
│                     │
│   ┌─────────────┐   │  ← 鼠标在上方 25% → before 指示器
│   │   目标节点   │   │
│   └─────────────┘   │
│                     │
└─────────────────────┘
         │
         ▼
╔═════════════════════╗  ← before 指示器（顶部蓝线）
║                     ║
║   ┌─────────────┐   ║
║   │   目标节点   │   ║
║   └─────────────┘   ║
║                     ║
╚═════════════════════╝

inside 指示器：目标节点高亮
after 指示器：底部蓝线
```

### 2. HTML5 Drag & Drop vs 自定义实现

| 方案 | 优点 | 缺点 |
|------|------|------|
| HTML5 DnD | 原生支持，无需额外库 | 样式控制弱，移动端不支持 |
| Pointer Events + 自定义 | 全平台统一，完全可控 | 需要自行实现所有逻辑 |
| react-dnd / @dnd-kit | 生态成熟，React 友好 | 框架耦合，包体积 |

### 3. 树形结构拖拽约束

```typescript
// 防止将父节点拖入自己的子节点（形成环）
function canDrop(sourceId: string, targetId: string, tree: CanvasNode[]): boolean {
  const sourcePath = findPath(sourceId, tree);
  const targetPath = findPath(targetId, tree);

  // 如果 target 是 source 的后代，不允许放置
  return !targetPath.includes(sourceId);
}
```

---

## 画布数据结构

### 扁平 vs 嵌套存储

```typescript
// 嵌套存储（适合渲染）
interface CanvasNode {
  id: string;
  children: CanvasNode[];
}

// 扁平存储（适合快速查找）
const nodeMap = new Map<string, CanvasNode>();

// 最佳实践：两者结合
class CanvasModel {
  private nodes = new Map<string, CanvasNode>(); // 扁平索引
  // 根节点通过 children 引用维护树结构
}
```

---

## 参考资源

- [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [@dnd-kit](https://dndkit.com/) — 现代 React 拖拽库
- [react-dnd](https://react-dnd.github.io/react-dnd/) — 经典 React 拖拽方案
- [interact.js](https://interactjs.io/) — 轻量级拖拽/缩放/旋转库
