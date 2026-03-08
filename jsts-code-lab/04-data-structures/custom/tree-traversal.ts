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

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Tree Data Structure Demo ===");

  // 构建二叉树
  //       1
  //      / \
  //     2   3
  //    / \   \
  //   4   5   6
  console.log("\n1. Building Binary Tree:");
  const root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.left.left = new TreeNode(4);
  root.left.right = new TreeNode(5);
  root.right.right = new TreeNode(6);

  console.log("   Tree structure:");
  console.log("        1");
  console.log("       / \\");
  console.log("      2   3");
  console.log("     / \   \\");
  console.log("    4   5   6");

  // DFS 遍历
  console.log("\n2. Depth-First Search (DFS):");
  console.log("   Pre-order (Root -> Left -> Right):", preOrder(root));
  console.log("   In-order (Left -> Root -> Right):", inOrder(root));
  console.log("   Post-order (Left -> Right -> Root):", postOrder(root));

  // BFS 遍历
  console.log("\n3. Breadth-First Search (Level Order):");
  const levels = levelOrder(root);
  console.log("   Level by level:");
  levels.forEach((level, i) => {
    console.log(`     Level ${i}:`, level);
  });

  // 二叉搜索树
  console.log("\n4. Binary Search Tree (BST):");
  const bst = new BinarySearchTree<number>();
  const values = [50, 30, 70, 20, 40, 60, 80];
  values.forEach(v => bst.insert(v));

  console.log("   Inserted values:", values);
  console.log("   Search 40:", bst.search(40));
  console.log("   Search 100:", bst.search(100));

  // BST 中序遍历（应该是有序的）
  const bstRoot = bst.getRoot();
  console.log("   BST in-order (sorted):", inOrder(bstRoot));

  // 最大深度
  console.log("\n5. Tree Properties:");
  console.log("   Max depth of tree:", maxDepth(root));
  console.log("   Is balanced:", isBalanced(root));

  // 不平衡树
  const unbalanced = new TreeNode(1);
  unbalanced.right = new TreeNode(2);
  unbalanced.right.right = new TreeNode(3);
  unbalanced.right.right.right = new TreeNode(4);
  console.log("   Unbalanced tree is balanced:", isBalanced(unbalanced));

  // 更大树的遍历
  console.log("\n6. Larger Tree Traversal:");
  const bigTree = new TreeNode("A");
  bigTree.left = new TreeNode("B");
  bigTree.right = new TreeNode("C");
  bigTree.left.left = new TreeNode("D");
  bigTree.left.right = new TreeNode("E");
  bigTree.right.left = new TreeNode("F");
  bigTree.right.right = new TreeNode("G");
  bigTree.left.left.left = new TreeNode("H");
  bigTree.left.left.right = new TreeNode("I");

  console.log("   Pre-order:", preOrder(bigTree));
  console.log("   In-order:", inOrder(bigTree));
  console.log("   Post-order:", postOrder(bigTree));
  console.log("   Level-order:", levelOrder(bigTree));

  console.log("=== End of Demo ===\n");
}
