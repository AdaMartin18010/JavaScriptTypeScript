/**
 * @file JS #private 与 TS private 运行时对比
 * @category JS/TS Comparison
 * @difficulty medium
 * @tags runtime-semantics, private-fields, class, type-erasure
 *
 * @description
 * 对比 JavaScript 原生私有字段 `#field` 与 TypeScript `private` 修饰符
 * 在编译后产物、原型链可见性、反射访问上的运行时差异。
 */

// ============================================================================
// 1. JavaScript 原生私有字段 (#private)
// ============================================================================

class JsPrivateUser {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  greet() {
    return `Hello, ${this.#name}`;
  }
}

// ============================================================================
// 2. TypeScript private 修饰符（编译后完全消失）
// ============================================================================

class TsPrivateUser {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

// ============================================================================
// 3. 运行时行为对比演示
// ============================================================================

export function comparePrivateFields(): void {
  console.log('=== JS #private vs TS private 运行时对比 ===\n');

  const jsUser = new JsPrivateUser('Alice');
  const tsUser = new TsPrivateUser('Bob');

  // 3.1 原型链可见性
  console.log('【原型链可见性】');
  console.log('JS #private 在原型链上不存在:', '#name' in JsPrivateUser.prototype === false);
  console.log('TS private 在原型链上存在（编译后变为普通字段）:', 'name' in TsPrivateUser.prototype === false);
  // 注意：实例上的 TS private 编译后就是普通字段
  console.log('TS private 实例上可枚举:', Object.keys(tsUser).includes('name'));
  console.log('JS #private 实例上不可枚举:', Object.keys(jsUser).includes('#name') === false);

  // 3.2 反射访问
  console.log('\n【反射访问】');
  console.log('TS private 可通过索引访问:', (tsUser as unknown as Record<string, unknown>).name);
  try {
    // @ts-expect-error 故意访问私有字段以演示运行时差异
    console.log('JS #private 直接访问:', jsUser.#name);
  } catch (e) {
    console.log('JS #private 直接访问报错:', (e as Error).message);
  }

  // 3.3 子类继承差异
  console.log('\n【子类继承】');
  console.log('JS #private 完全不可被继承访问，子类需重新定义');
  console.log('TS private 编译后子类可通过原型链访问（但 TS 编译器会静态报错）');
}
