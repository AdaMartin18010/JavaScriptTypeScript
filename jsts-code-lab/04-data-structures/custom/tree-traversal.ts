/**
 * @file 树与遍历
 * @category Data Structures → Custom
 * @difficulty medium
 * @tags tree, binary-tree, traversal, dfs, bfs
 */

// ============================================================================
// 1. 二叉树节点
// ============================================================================

export class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// ============================================================================
// 2. 深度优先遍历 (DFS)
// ============================================================================

// 前序遍历: 根 -> 左 -> 右
export function preOrder<T>(root: TreeNode<T> | null): T[] {
  const result: T[] = [];
  
  function traverse(node: TreeNode<T> | null) {
    if (!node) return;
    result.push(node.value);
    traverse(node.left);
    traverse(node.right);
  }
  
  traverse(root);
  return result;
}

// 中序遍历: 左 -> 根 -> 右
export function inOrder<T>(root: TreeNode<T> | null): T[] {
  const result: T[] = [];
  
  function traverse(node: TreeNode<T> | null) {
    if (!node) return;
    traverse(node.left);
    result.push(node.value);
    traverse(node.right);
  }
  
  traverse(root);
  return result;
}

// 后序遍历: 左 -> 右 -> 根
export function postOrder<T>(root: TreeNode<T> | null): T[] {
  const result: T[] = [];
  
  function traverse(node: TreeNode<T> | null) {
    if (!node) return;
    traverse(node.left);
    traverse(node.right);
    result.push(node.value);
  }
  
  traverse(root);
  return result;
}

// ============================================================================
// 3. 广度优先遍历 (BFS) - 层序遍历
// ============================================================================

export function levelOrder<T>(root: TreeNode<T> | null): T[][] {
  if (!root) return [];
  
  const result: T[][] = [];
  const queue: TreeNode<T>[] = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: T[] = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.value);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}

// ============================================================================
// 4. 二叉搜索树 (BST)
// ============================================================================

export class BinarySearchTree<T> {
  private root: TreeNode<T> | null = null;
  private compare: (a: T, b: T) => number;

  constructor(compare?: (a: T, b: T) => number) {
    this.compare = compare || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (!node) return new TreeNode(value);
    
    const cmp = this.compare(value, node.value);
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value);
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value);
    }
    
    return node;
  }

  search(value: T): boolean {
    return this.searchNode(this.root, value);
  }

  private searchNode(node: TreeNode<T> | null, value: T): boolean {
    if (!node) return false;
    
    const cmp = this.compare(value, node.value);
    if (cmp === 0) return true;
    if (cmp < 0) return this.searchNode(node.left, value);
    return this.searchNode(node.right, value);
  }

  getRoot(): TreeNode<T> | null {
    return this.root;
  }
}

// ============================================================================
// 5. 树的最大深度
// ============================================================================

export function maxDepth<T>(root: TreeNode<T> | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// ============================================================================
// 6. 判断平衡二叉树
// ============================================================================

export function isBalanced<T>(root: TreeNode<T> | null): boolean {
  function checkHeight(node: TreeNode<T> | null): number {
    if (!node) return 0;
    
    const leftHeight = checkHeight(node.left);
    if (leftHeight === -1) return -1;
    
    const rightHeight = checkHeight(node.right);
    if (rightHeight === -1) return -1;
    
    if (Math.abs(leftHeight - rightHeight) > 1) return -1;
    
    return 1 + Math.max(leftHeight, rightHeight);
  }
  
  return checkHeight(root) !== -1;
}

// ============================================================================
// 导出
// ============================================================================

export { TreeNode as default };
