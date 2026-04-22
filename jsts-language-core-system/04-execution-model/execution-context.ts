/**
 * @file 执行上下文与 this 绑定
 * @category Execution Model → Execution Context
 * @difficulty medium
 * @tags execution-context, this-binding, strict-mode, call-apply-bind, arrow-function
 */

// ============================================================================
// 1. 三种执行上下文类型
// ============================================================================

/** 全局执行上下文 */
function demonstrateGlobalContext(): void {
  // 在浏览器中是 window，在 Node.js 中是 global 或 globalThis
  console.log("Global this === globalThis:", (globalThis as unknown) === (globalThis as unknown));
  console.log("Global context: 代码在全局作用域运行");
}

/** 函数执行上下文 */
function demonstrateFunctionContext(): void {
  function inner() {
    console.log("Function context: 每次函数调用创建新的执行上下文");
  }
  inner();
}

/** eval 执行上下文 */
function demonstrateEvalContext(): void {
  const x = 1;
  // eval 在调用者的词法环境中执行
  // eslint-disable-next-line no-eval
  eval('console.log("Eval context: x =", x); // 访问外部变量 x');
}

// ============================================================================
// 2. this 绑定的四种规则
// ============================================================================

/** 2.1 默认绑定 */
function defaultBinding(this: unknown): void {
  console.log("Default binding this:", this);
}

/** 2.2 隐式绑定 */
const implicitObj = {
  name: "ImplicitObject",
  greet() {
    return `Hello from ${(this as { name: string }).name}`;
  }
};

/** 2.3 显式绑定 (call/apply/bind) */
function explicitGreet(this: { name: string }, greeting: string): string {
  return `${greeting}, ${this.name}!`;
}

/** 2.4 new 绑定 */
function PersonConstructor(this: { name: string }, name: string): void {
  this.name = name;
}

// ============================================================================
// 3. 严格模式 vs 非严格模式
// ============================================================================

function strictModeThis(): void {
  "use strict";
  console.log("Strict mode this:", (function (): unknown {
    return this;
  })()); // undefined
}

function nonStrictModeThis(): void {
  console.log("Non-strict mode this:", (function (): unknown {
    return this;
  })()); // global object
}

// ============================================================================
// 4. call / apply / bind
// ============================================================================

function showCallApplyBind(): void {
  const person = { name: "Alice" };

  // call
  console.log("call:", explicitGreet.call(person, "Hello"));

  // apply
  console.log("apply:", explicitGreet.apply(person, ["Hi"]));

  // bind
  const boundGreet = explicitGreet.bind(person, "Hey");
  console.log("bind:", boundGreet());
}

// ============================================================================
// 5. 箭头函数的词法 this
// ============================================================================

class ArrowFunctionThis {
  private value = 42;

  traditionalMethod(): () => number {
    return function (this: ArrowFunctionThis): number {
      return this.value;
    }.bind(this);
  }

  arrowMethod = (): number => {
    return this.value;
  };

  delayedLog(): void {
    setTimeout(() => {
      console.log("Arrow function this.value:", this.value);
    }, 0);
  }
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: 提取方法导致 this 丢失 */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: 隐式丢失 ---");
  const greet = implicitObj.greet;
  try {
    // 非严格模式下 this 会变成全局对象，严格模式下会报错
    console.log("Extracted method result:", greet());
  } catch (e) {
    console.log("Error:", (e as Error).message);
  }
}

/** 反例 2: 回调函数中的 this */
function counterExample2(): void {
  console.log("\n--- Counter-example 2: 回调中的 this ---");
  const obj = {
    name: "CallbackObj",
    delayedGreet(): void {
      setTimeout(function (this: unknown): void {
        console.log("Traditional callback this:", this); // 全局对象或 undefined
      }, 0);
    },
    safeDelayedGreet(): void {
      setTimeout(() => {
        console.log("Arrow callback this.name:", (this as { name: string }).name);
      }, 0);
    }
  };
  obj.delayedGreet();
  obj.safeDelayedGreet();
}

/** 反例 3: bind 后再 call 无效 */
function counterExample3(): void {
  console.log("\n--- Counter-example 3: bind 后 call 无效 ---");
  const obj1 = { name: "obj1" };
  const obj2 = { name: "obj2" };

  const bound = explicitGreet.bind(obj1, "Greetings");
  console.log("bound():", bound());
  console.log("bound.call(obj2):", bound.call(obj2 as unknown as { name: string }, "Hi")); // 仍然是 obj1
}

/** 反例 4: new 绑定优先级高于 bind */
function counterExample4(): void {
  console.log("\n--- Counter-example 4: new > bind ---");
  const BoundPerson = PersonConstructor.bind({ name: "BoundName" });
  const p = new (BoundPerson as new (name: string) => { name: string })("NewName");
  console.log("new 绑定优先级更高:", p.name); // "NewName"
}

/** 反例 5: 箭头函数无法用 call/apply/bind 改变 this */
function counterExample5(): void {
  console.log("\n--- Counter-example 5: 箭头函数的 this 不可变 ---");
  const obj = { value: 100 };
  const arrow = (): number => {
    return (this as { value?: number }).value ?? -1;
  };
  console.log("arrow.call(obj):", arrow.call(obj as unknown as ThisParameterType<typeof arrow>));
  console.log("箭头函数的 this 在定义时确定，无法通过 call/apply/bind 改变");
}

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Execution Context & This Binding Demo ===\n");

  // 三种上下文
  console.log("--- 1. 三种执行上下文 ---");
  demonstrateGlobalContext();
  demonstrateFunctionContext();
  demonstrateEvalContext();

  // this 绑定规则
  console.log("\n--- 2. this 绑定规则 ---");
  console.log("隐式绑定:", implicitObj.greet());

  showCallApplyBind();

  const NewPerson = PersonConstructor as unknown as new (name: string) => { name: string };
  const person = new NewPerson("Bob");
  console.log("new 绑定:", person.name);

  // 严格模式对比
  console.log("\n--- 3. 严格模式 vs 非严格模式 ---");
  strictModeThis();
  nonStrictModeThis();

  // 箭头函数
  console.log("\n--- 4. 箭头函数的词法 this ---");
  const arrowDemo = new ArrowFunctionThis();
  console.log("arrowMethod():", arrowDemo.arrowMethod());

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();
  counterExample4();
  counterExample5();

  console.log("\n=== End of Execution Context Demo ===\n");
}

export {
  demonstrateGlobalContext,
  demonstrateFunctionContext,
  demonstrateEvalContext,
  defaultBinding,
  implicitObj,
  explicitGreet,
  PersonConstructor,
  strictModeThis,
  nonStrictModeThis,
  ArrowFunctionThis,
};
