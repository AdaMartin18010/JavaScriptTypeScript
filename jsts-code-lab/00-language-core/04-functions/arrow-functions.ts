/**
 * @file 箭头函数深度解析
 * @category Language Core → Functions
 * @difficulty warm
 * @tags es6, arrow-functions, this-binding
 */

// ============================================================================
// 1. 语法对比
// ============================================================================

/** 传统函数 */
const traditional = function (x: number): number {
  return x * 2;
};

/** 箭头函数 */
const arrow = (x: number): number => x * 2;

/** 多行需要 return */
const arrowMultiLine = (x: number): number => {
  const result = x * 2;
  return result;
};

/** 单个参数可省略括号 */
const singleParam = (x: number) => x * 2; // 但 TS 通常需要类型
const singleParamTyped = (x: number) => x * 2;

/** 返回对象需要括号 */
const makeObject = (x: number) => ({ value: x, doubled: x * 2 });

// ============================================================================
// 2. this 绑定差异 (核心区别)
// ============================================================================

class Counter {
  count = 0;

  /** 传统方法 */
  incrementTraditional() {
    setTimeout(function () {
      // this.count++; // ❌ Error: this 是 undefined (严格模式) 或全局对象
    }, 100);
  }

  /** 箭头函数继承 this */
  incrementArrow() {
    setTimeout(() => {
      this.count++; // ✅ this 继承自外层 Counter 实例
    }, 100);
  }

  /** 显式绑定 (老方案) */
  incrementBind() {
    setTimeout(
      function () {
        // @ts-expect-error 演示 this 隐式 any
        this.count++;
      }.bind(this),
      100
    );
  }
}

// ============================================================================
// 3. 方法定义的最佳实践
// ============================================================================

class ModernCounter {
  private _count = 0;

  /** 箭头函数作为属性 - this 始终绑定 */
  increment = () => {
    this._count++;
  };

  /** 传统方法 - 可被继承和 super 调用 */
  decrement() {
    this._count--;
  }

  get count() {
    return this._count;
  }
}

/** 事件处理器的 this 问题 */
class Button {
  private clicks = 0;

  // 方式1：箭头函数属性 (推荐)
  handleClick = () => {
    this.clicks++;
    console.log(`Clicked ${this.clicks} times`);
  };

  // 方式2：构造函数中绑定
  handleClickBound: () => void;

  constructor() {
    this.handleClickBound = this.handleClickMethod.bind(this);
  }

  handleClickMethod() {
    this.clicks++;
  }
}

// ============================================================================
// 4. 箭头函数的限制
// ============================================================================

/** 不能作为构造函数 */
const Arrow = () => {};
// new Arrow(); // ❌ TypeError: Arrow is not a constructor

/** 没有 prototype */
console.log(Arrow.prototype); // undefined

/** 没有 arguments 对象 (使用剩余参数替代) */
const withArgs = (...args: number[]) => args.reduce((a, b) => a + b, 0);

/** 不能用作 generator */
// const gen = *() => {}; // ❌ SyntaxError

// ============================================================================
// 5. 高阶函数场景
// ============================================================================

/** 回调函数 */
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

/** 函数组合 */
const compose = <T>(...fns: Array<(x: T) => T>) => (x: T) =>
  fns.reduceRight((v, f) => f(v), x);

const pipe = <T>(...fns: Array<(x: T) => T>) => (x: T) =>
  fns.reduce((v, f) => f(v), x);

// 使用
const add5 = (x: number) => x + 5;
const multiply2 = (x: number) => x * 2;
const toString = (x: number) => String(x);

// @ts-expect-error 类型不匹配演示
const composed = compose(toString, multiply2, add5);
// @ts-expect-error 类型不匹配演示
const piped = pipe(add5, multiply2, toString);

console.log(composed(10)); // '30' ((10 + 5) * 2)
console.log(piped(10)); // '30' ((10 + 5) * 2)

// ============================================================================
// 6. 立即执行函数 (IIFE)
// ============================================================================

/** 传统 IIFE */
const result1 = (function () {
  return 'immediate';
})();

/** 箭头 IIFE */
const result2 = (() => 'immediate')();

/** 带参数的 IIFE */
const result3 = ((x: number) => x * x)(5);

// ============================================================================
// 7. 柯里化与部分应用
// ============================================================================

const curry =
  <T, U, R>(fn: (a: T, b: U) => R) =>
  (a: T) =>
  (b: U) =>
    fn(a, b);

const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
const add5Curried = curriedAdd(5);

console.log(add5Curried(3)); // 8

// ============================================================================
// 导出
// ============================================================================

export {
  traditional,
  arrow,
  makeObject,
  Counter,
  ModernCounter,
  Button,
  withArgs,
  compose,
  pipe,
  add5,
  multiply2,
  toString,
  curry,
  curriedAdd
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Arrow Functions Demo ===");
  
  // 基础箭头函数
  console.log("Arrow (5):", arrow(5));
  console.log("Traditional (5):", traditional(5));
  
  // 返回对象
  const obj = makeObject(10);
  console.log("MakeObject:", obj);
  
  // 高阶函数
  const numbers = [1, 2, 3, 4, 5];
  const doubled = numbers.map(n => n * 2);
  console.log("Doubled:", doubled);
  
  // 函数组合
  // @ts-expect-error 类型不匹配演示
  const composed = compose(toString, multiply2, add5);
  console.log("Composed (10):", composed(10));
  
  // 柯里化
  const add5Curried = curriedAdd(5);
  console.log("Curried add 5 + 3:", add5Curried(3));
  
  // IIFE
  const result = (() => "immediate")();
  console.log("IIFE result:", result);
  
  console.log("=== End of Demo ===\n");
}
