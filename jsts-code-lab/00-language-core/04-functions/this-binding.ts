/**
 * @file this 绑定深度解析
 * @category Language Core → Functions
 * @difficulty medium
 * @tags this, bind, call, apply, execution-context
 */

// ============================================================================
// 1. this 的四种绑定规则
// ============================================================================

/** 1. 默认绑定 (独立调用) */
function defaultBinding() {
  console.log(this); // 严格模式: undefined, 非严格: 全局对象
}

// defaultBinding();

/** 2. 隐式绑定 (方法调用) */
const obj = {
  name: 'Object',
  greet() {
    return `Hello from ${this.name}`;
  }
};

console.log(obj.greet()); // 'Hello from Object'

/** 隐式丢失问题 */
const greetFn = obj.greet;
// console.log(greetFn()); // ❌ undefined (严格模式)

/** 3. 显式绑定 (call/apply/bind) */
function explicitGreet(this: { name: string }) {
  return `Hello, ${this.name}`;
}

const person = { name: 'Alice' };
console.log(explicitGreet.call(person)); // 'Hello, Alice'
console.log(explicitGreet.apply(person)); // 'Hello, Alice'
const boundGreet = explicitGreet.bind(person);
console.log(boundGreet()); // 'Hello, Alice'

/** 4. new 绑定 */
function Person(name: string) {
  // @ts-ignore
  this.name = name;
}

// @ts-ignore
const alice = new Person('Alice');
console.log(alice.name); // 'Alice'

// ============================================================================
// 2. call vs apply vs bind
// ============================================================================

function introduce(greeting: string, punctuation: string) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const user = { name: 'Bob' };

/** call - 参数列表 */
const callResult = introduce.call(user, 'Hi', '!');

/** apply - 参数数组 */
const applyResult = introduce.apply(user, ['Hello', '.']);

/** bind - 返回新函数 */
const boundIntroduce = introduce.bind(user, 'Hey');
const bindResult = boundIntroduce('?');

console.log({ callResult, applyResult, bindResult });

// ============================================================================
// 3. 硬绑定与软绑定
// ============================================================================

/** 硬绑定 (bind 的 polyfill) */
function hardBind<T extends (...args: any[]) => any>(
  fn: T,
  context: ThisParameterType<T>
): OmitThisParameter<T> {
  return function (...args: Parameters<T>): ReturnType<T> {
    return fn.apply(context, args);
  } as OmitThisParameter<T>;
}

// ============================================================================
// 4. 箭头函数的 this (词法绑定)
// ============================================================================

class Timer {
  private count = 0;

  start() {
    // 箭头函数：this 在定义时确定
    setInterval(() => {
      this.count++;
      console.log(this.count);
    }, 1000);
  }

  // 传统函数 + bind 方式
  startTraditional() {
    setInterval(
      function () {
        // @ts-ignore
        this.count++;
        // @ts-ignore
        console.log(this.count);
      }.bind(this),
      1000
    );
  }
}

// ============================================================================
// 5. DOM 事件处理中的 this
// ============================================================================

class EventHandler {
  private element: HTMLElement | null = null;

  // 方法1：箭头函数 (推荐)
  handleClickArrow = () => {
    console.log(this);
  };

  // 方法2：构造函数中绑定
  constructor() {
    this.handleClickBound = this.handleClickMethod.bind(this);
  }

  handleClickMethod() {
    console.log(this);
  }

  handleClickBound: () => void;

  // 方法3：addEventListener 的第三个参数 (不建议)
  handleClickTraditional() {
    console.log(this);
  }
}

// ============================================================================
// 6. 类中的 this
// ============================================================================

class SafeButton {
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  // 方式1：箭头函数属性 (this 安全)
  onClick = () => {
    this.handleClick();
  };

  private handleClick() {
    console.log(`Clicked: ${this.label}`);
  }

  // 方式2：装饰器/元编程 (需要额外配置)
  // 方式3：Proxy 拦截
}

// ============================================================================
// 7. 严格模式 vs 非严格模式
// ============================================================================

function checkThis() {
  'use strict';
  console.log(this); // undefined
}

function checkThisNonStrict() {
  console.log(this); // 全局对象 (浏览器: window, Node: global)
}

// ============================================================================
// 8. 工具函数实现
// ============================================================================

/** 安全的 bind */
function safeBind<T extends (...args: any[]) => any>(
  fn: T,
  thisArg: ThisParameterType<T>
): (...args: Parameters<T>) => ReturnType<T> {
  return fn.bind(thisArg);
}

/** 自动绑定所有方法 */
function autoBind<T extends object>(instance: T): T {
  const prototype = Object.getPrototypeOf(instance);
  const propertyNames = Object.getOwnPropertyNames(prototype);

  for (const key of propertyNames) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    if (descriptor && typeof descriptor.value === 'function' && key !== 'constructor') {
      // @ts-ignore
      instance[key] = instance[key].bind(instance);
    }
  }

  return instance;
}

// ============================================================================
// 导出
// ============================================================================

export {
  defaultBinding,
  explicitGreet,
  Person,
  introduce,
  hardBind,
  Timer,
  EventHandler,
  SafeButton,
  checkThis,
  checkThisNonStrict,
  safeBind,
  autoBind
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== This Binding Demo ===");
  
  // 隐式绑定
  const obj = {
    name: "Test Object",
    greet() {
      return `Hello from ${this.name}`;
    }
  };
  console.log("Implicit binding:", obj.greet());
  
  // 显式绑定
  const person = { name: "Alice" };
  console.log("ExplicitGreet.call:", explicitGreet.call(person));
  
  // bind
  const boundGreet = explicitGreet.bind(person);
  console.log("Bound greet:", boundGreet());
  
  // call vs apply
  function introduce(greeting: string, punctuation: string) {
    return `${greeting}, I'm ${this.name}${punctuation}`;
  }
  console.log("Call:", introduce.call(person, "Hello", "!"));
  console.log("Apply:", introduce.apply(person, ["Hi", "."]));
  
  // new 绑定
  function Person(name: string) {
    (this as any).name = name;
  }
  const alice = new (Person as any)("Alice");
  console.log("New binding:", alice.name);
  
  console.log("=== End of Demo ===\n");
}
