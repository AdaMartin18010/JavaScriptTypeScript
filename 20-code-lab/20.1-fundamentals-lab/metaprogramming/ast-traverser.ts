/**
 * @file AST 遍历器（简化版对象遍历）
 * @category Metaprogramming → AST Traversal
 * @difficulty hard
 * @tags metaprogramming, ast, traversal, visitor-pattern, tree-walk
 *
 * @description
 * 将任意 JavaScript 对象结构转换为可遍历的 AST 节点树，支持 Visitor 模式遍历、条件查找和结构转换。
 */

/** AST 节点类型 */
export type NodeType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'function'
  | 'symbol'
  | 'bigint';

/** AST 节点 */
export interface ASTNode {
  /** 节点类型 */
  type: NodeType;
  /** 节点原始值 */
  value: unknown;
  /** 节点键名 */
  key?: string | number;
  /** 节点路径 */
  path: string;
  /** 父节点 */
  parent?: ASTNode;
  /** 子节点列表 */
  children: ASTNode[];
}

/** 访问者接口 */
export interface Visitor {
  /** 进入节点时调用 */
  enter?: (node: ASTNode, parent: ASTNode | undefined) => void;
  /** 离开节点时调用 */
  exit?: (node: ASTNode, parent: ASTNode | undefined) => void;
  /** 按类型分发的处理器 */
  [key: string]: ((node: ASTNode, parent: ASTNode | undefined) => void) | undefined;
}

/** AST 遍历器 */
export class ASTTraverser {
  /**
   * 将任意对象转换为 AST 节点树
   * @param value - 任意值
   * @param key - 当前键名
   * @param parent - 父节点
   * @param path - 当前路径
   * @returns AST 根节点
   */
  parse(value: unknown, key?: string | number, parent?: ASTNode, path = ''): ASTNode {
    const currentPath = key !== undefined ? `${path}${path ? '.' : ''}${String(key)}` : path;
    const node: ASTNode = {
      type: this.inferType(value),
      value,
      key,
      path: currentPath,
      parent,
      children: []
    };

    if (node.type === 'object' && value !== null) {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const child = this.parse(v, k, node, currentPath);
        node.children.push(child);
      }
    } else if (node.type === 'array' && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const child = this.parse(value[i], i, node, currentPath);
        node.children.push(child);
      }
    }

    return node;
  }

  /**
   * 遍历 AST 节点树
   * @param node - 根节点
   * @param visitor - 访问者对象
   */
  traverse(node: ASTNode, visitor: Visitor): void {
    this.visitNode(node, undefined, visitor);
  }

  /**
   * 查找匹配条件的所有节点
   * @param node - 根节点
   * @param predicate - 匹配条件
   * @returns 匹配的节点列表
   */
  find(node: ASTNode, predicate: (node: ASTNode) => boolean): ASTNode[] {
    const results: ASTNode[] = [];
    this.traverse(node, {
      enter: (n) => {
        if (predicate(n)) results.push(n);
      }
    });
    return results;
  }

  /**
   * 查找单个匹配节点
   * @param node - 根节点
   * @param predicate - 匹配条件
   * @returns 第一个匹配的节点，或 undefined
   */
  findOne(node: ASTNode, predicate: (node: ASTNode) => boolean): ASTNode | undefined {
    let result: ASTNode | undefined;
    this.traverse(node, {
      enter: (n) => {
        if (!result && predicate(n)) {
          result = n;
        }
      }
    });
    return result;
  }

  /**
   * 转换对象结构
   * @param value - 原始值
   * @param transformer - 转换函数
   * @returns 转换后的值
   */
  transform<T = unknown>(value: T, transformer: (node: ASTNode) => unknown): unknown {
    const root = this.parse(value);
    return this.transformNode(root, transformer);
  }

  /**
   * 收集所有叶子节点
   * @param node - 根节点
   * @returns 叶子节点列表
   */
  getLeaves(node: ASTNode): ASTNode[] {
    return this.find(node, n => n.children.length === 0);
  }

  /**
   * 获取节点深度
   * @param node - 目标节点
   * @returns 深度值（根节点为 0）
   */
  getDepth(node: ASTNode): number {
    let depth = 0;
    let current = node.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  private visitNode(node: ASTNode, parent: ASTNode | undefined, visitor: Visitor): void {
    const typeHandler = visitor[node.type];
    visitor.enter?.(node, parent);
    typeHandler?.(node, parent);

    for (const child of node.children) {
      this.visitNode(child, node, visitor);
    }

    visitor.exit?.(node, parent);
  }

  private transformNode(node: ASTNode, transformer: (node: ASTNode) => unknown): unknown {
    const transformed = transformer(node);

    if (node.type === 'object' && transformed !== null && typeof transformed === 'object' && !Array.isArray(transformed)) {
      const result: Record<string, unknown> = {};
      for (const child of node.children) {
        const key = String(child.key!);
        result[key] = this.transformNode(child, transformer);
      }
      return result;
    }

    if (node.type === 'array' && Array.isArray(transformed)) {
      return node.children.map(child => this.transformNode(child, transformer));
    }

    return transformed;
  }

  private inferType(value: unknown): NodeType {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    const type = typeof value;
    switch (type) {
      case 'string': return 'string';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'function': return 'function';
      case 'symbol': return 'symbol';
      case 'bigint': return 'bigint';
      case 'object': return Array.isArray(value) ? 'array' : 'object';
      default: return 'object';
    }
  }
}
