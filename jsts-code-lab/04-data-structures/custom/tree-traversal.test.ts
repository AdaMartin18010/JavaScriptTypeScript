import { describe, it, expect } from 'vitest';
import {
  TreeNode,
  preOrder,
  inOrder,
  postOrder,
  levelOrder,
  BinarySearchTree,
  maxDepth,
  isBalanced,
  demo
} from './tree-traversal';

describe('tree-traversal', () => {
  // Build tree:
  //      1
  //     / \
  //    2   3
  //   / \   \
  //  4   5   6
  function buildTree(): TreeNode<number> {
    const root = new TreeNode(1);
    root.left = new TreeNode(2);
    root.right = new TreeNode(3);
    root.left!.left = new TreeNode(4);
    root.left!.right = new TreeNode(5);
    root.right!.right = new TreeNode(6);
    return root;
  }

  describe('DFS traversals', () => {
    it('preOrder should return root-left-right', () => {
      expect(preOrder(buildTree())).toEqual([1, 2, 4, 5, 3, 6]);
    });

    it('inOrder should return left-root-right', () => {
      expect(inOrder(buildTree())).toEqual([4, 2, 5, 1, 3, 6]);
    });

    it('postOrder should return left-right-root', () => {
      expect(postOrder(buildTree())).toEqual([4, 5, 2, 6, 3, 1]);
    });
  });

  describe('BFS traversal', () => {
    it('levelOrder should return levels', () => {
      expect(levelOrder(buildTree())).toEqual([[1], [2, 3], [4, 5, 6]]);
    });

    it('should return empty array for null root', () => {
      expect(levelOrder(null)).toEqual([]);
    });
  });

  describe('BinarySearchTree', () => {
    it('should insert and search values', () => {
      const bst = new BinarySearchTree<number>();
      [50, 30, 70, 20, 40].forEach(v => bst.insert(v));
      expect(bst.search(40)).toBe(true);
      expect(bst.search(100)).toBe(false);
    });

    it('in-order traversal should be sorted', () => {
      const bst = new BinarySearchTree<number>();
      [50, 30, 70, 20, 40, 60, 80].forEach(v => bst.insert(v));
      expect(inOrder(bst.getRoot())).toEqual([20, 30, 40, 50, 60, 70, 80]);
    });
  });

  describe('maxDepth', () => {
    it('should calculate maximum depth', () => {
      expect(maxDepth(buildTree())).toBe(3);
    });

    it('should return 0 for null tree', () => {
      expect(maxDepth(null)).toBe(0);
    });
  });

  describe('isBalanced', () => {
    it('should return true for balanced tree', () => {
      expect(isBalanced(buildTree())).toBe(true);
    });

    it('should return false for unbalanced tree', () => {
      const root = new TreeNode(1);
      root.right = new TreeNode(2);
      root.right!.right = new TreeNode(3);
      root.right!.right!.right = new TreeNode(4);
      expect(isBalanced(root)).toBe(false);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
