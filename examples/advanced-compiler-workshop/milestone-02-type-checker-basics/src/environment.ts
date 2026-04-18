/**
 * @file 类型环境（Type Environment）
 * @category Advanced Compiler Workshop → Milestone 2
 *
 * 实现栈式作用域，支持变量定义和查找。
 * 类型环境 Γ 是类型推导的核心上下文。
 */

import type { Type } from './types.js';

export class TypeEnvironment {
  /** 作用域栈，每个作用域是一个名称到类型的映射 */
  private scopes: Map<string, Type>[] = [new Map()];

  /** 接口定义的全局映射（跨作用域可见） */
  private interfaces = new Map<string, Type>();

  /** 进入新作用域 */
  pushScope(): void {
    this.scopes.push(new Map());
  }

  /** 退出当前作用域 */
  popScope(): void {
    if (this.scopes.length > 1) {
      this.scopes.pop();
    }
  }

  /**
   * 在当前作用域定义变量
   * 若已存在则覆盖（允许同一作用域内重新赋值时的类型更新）
   */
  define(name: string, type: Type): void {
    const current = this.scopes[this.scopes.length - 1];
    current.set(name, type);
  }

  /**
   * 查找变量的类型，从内层作用域向外层查找
   * 返回 undefined 表示未找到
   */
  lookup(name: string): Type | undefined {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const type = this.scopes[i].get(name);
      if (type) return type;
    }
    return undefined;
  }

  /**
   * 定义接口类型（全局可见）
   */
  defineInterface(name: string, type: Type): void {
    this.interfaces.set(name, type);
  }

  /**
   * 查找接口类型
   */
  lookupInterface(name: string): Type | undefined {
    return this.interfaces.get(name);
  }

  /**
   * 获取当前作用域中所有已定义的名称
   */
  getCurrentScopeNames(): string[] {
    return Array.from(this.scopes[this.scopes.length - 1].keys());
  }

  /**
   * 创建环境的快照（用于调试）
   */
  snapshot(): string {
    const lines: string[] = [];
    for (let i = 0; i < this.scopes.length; i++) {
      const indent = '  '.repeat(i);
      lines.push(`${indent}Scope ${i}:`);
      for (const [name, type] of this.scopes[i].entries()) {
        const { typeToString } = require('./types.js') as typeof import('./types.js');
        lines.push(`${indent}  ${name}: ${typeToString(type)}`);
      }
    }
    return lines.join('\n');
  }
}
