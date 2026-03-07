/**
 * @file Proxy 代理深度解析
 * @category Language Core → Metaprogramming
 * @difficulty hard
 * @tags proxy, trap, interceptor, metaprogramming
 */

// ============================================================================
// 1. 基础 Proxy
// ============================================================================

const target = { name: 'Alice', age: 30 };

const handler: ProxyHandler<typeof target> = {
  get(target, prop, receiver) {
    console.log(`Getting ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },

  set(target, prop, value, receiver) {
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};

const proxy = new Proxy(target, handler);

proxy.name; // Getting name
proxy.age = 31; // Setting age = 31

// ============================================================================
// 2. 验证 Proxy
// ============================================================================

function createValidator<T extends object>(target: T): T {
  return new Proxy(target, {
    set(target, prop, value) {
      if (prop === 'age') {
        if (typeof value !== 'number' || value < 0 || value > 150) {
          throw new Error('Invalid age');
        }
      }
      return Reflect.set(target, prop, value);
    }
  });
}

const person = createValidator({ name: '', age: 0 });
person.name = 'Alice';
person.age = 30; // ✅
// person.age = -5; // ❌ Error

// ============================================================================
// 3. 私有属性保护
// ============================================================================

function withPrivacy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, prop) {
      if (typeof prop === 'string' && prop.startsWith('_')) {
        throw new Error(`Access to private property "${prop}"`);
      }
      return Reflect.get(target, prop);
    },

    set(target, prop, value) {
      if (typeof prop === 'string' && prop.startsWith('_')) {
        throw new Error(`Cannot modify private property "${prop}"`);
      }
      return Reflect.set(target, prop, value);
    },

    deleteProperty(target, prop) {
      if (typeof prop === 'string' && prop.startsWith('_')) {
        throw new Error(`Cannot delete private property "${prop}"`);
      }
      return Reflect.deleteProperty(target, prop);
    },

    ownKeys(target) {
      return Reflect.ownKeys(target).filter(
        key => typeof key !== 'string' || !key.startsWith('_')
      );
    }
  });
}

const secureObj = withPrivacy({ public: 'visible', _private: 'secret' });
console.log(secureObj.public); // 'visible'
// console.log(secureObj._private); // ❌ Error
console.log(Object.keys(secureObj)); // ['public']

// ============================================================================
// 4. 响应式系统 (简化版 Vue3)
// ============================================================================

type Effect = () => void;

const targetMap = new WeakMap<object, Map<string | symbol, Set<Effect>>>();
let activeEffect: Effect | null = null;

function track(target: object, key: string | symbol) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
}

function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  dep?.forEach(effect => effect());
}

function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    }
  });
}

function effect(fn: Effect) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 使用
const state = reactive({ count: 0 });
effect(() => {
  console.log('Count:', state.count);
});
state.count++; // 自动触发 effect

// ============================================================================
// 5. 函数调用拦截 (函数 Proxy)
// ============================================================================

function createLoggerFn<T extends (...args: any[]) => any>(fn: T): T {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      console.log(`Calling ${target.name} with`, args);
      const result = Reflect.apply(target, thisArg, args);
      console.log(`Result:`, result);
      return result;
    }
  });
}

const loggedAdd = createLoggerFn((a: number, b: number) => a + b);
loggedAdd(2, 3);

// ============================================================================
// 6. 构造函数拦截
// ============================================================================

function singleton<T extends new (...args: any[]) => object>(Constructor: T): T {
  let instance: object | null = null;

  return new Proxy(Constructor, {
    construct(target, args) {
      if (!instance) {
        instance = Reflect.construct(target, args);
      }
      return instance;
    }
  }) as T;
}

@singleton
class Database {
  constructor() {
    console.log('Database created');
  }
}

const db1 = new Database();
const db2 = new Database();
console.log(db1 === db2); // true

// ============================================================================
// 7. Revocable Proxy (可撤销代理)
// ============================================================================

const sensitive = { password: 'secret123' };

const { proxy: revocableProxy, revoke } = Proxy.revocable(sensitive, {
  get(target, prop) {
    return Reflect.get(target, prop);
  }
});

console.log(revocableProxy.password); // 'secret123'
revoke();
// console.log(revocableProxy.password); // ❌ TypeError: Cannot perform 'get' on a proxy that has been revoked

// ============================================================================
// 8. 完整 Trap 列表
// ============================================================================

const fullHandler: ProxyHandler<object> = {
  // 属性读取
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  },

  // 属性设置
  set(target, prop, value, receiver) {
    return Reflect.set(target, prop, value, receiver);
  },

  // 属性删除
  deleteProperty(target, prop) {
    return Reflect.deleteProperty(target, prop);
  },

  // 属性枚举
  ownKeys(target) {
    return Reflect.ownKeys(target);
  },

  // Object.getOwnPropertyNames
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(target, prop);
  },

  // Object.defineProperty
  defineProperty(target, prop, descriptor) {
    return Reflect.defineProperty(target, prop, descriptor);
  },

  // in 操作符
  has(target, prop) {
    return Reflect.has(target, prop);
  },

  // 函数调用
  apply(target, thisArg, args) {
    return Reflect.apply(target as AnyFunction, thisArg, args);
  },

  // new 操作符
  construct(target, args, newTarget) {
    return Reflect.construct(target as new (...args: any[]) => any, args, newTarget);
  },

  // Object.getPrototypeOf
  getPrototypeOf(target) {
    return Reflect.getPrototypeOf(target);
  },

  // Object.setPrototypeOf
  setPrototypeOf(target, proto) {
    return Reflect.setPrototypeOf(target, proto);
  },

  // Object.preventExtensions
  preventExtensions(target) {
    return Reflect.preventExtensions(target);
  },

  // Object.isExtensible
  isExtensible(target) {
    return Reflect.isExtensible(target);
  }
};

type AnyFunction = (...args: any[]) => any;

// ============================================================================
// 导出
// ============================================================================

export {
  createValidator,
  withPrivacy,
  reactive,
  effect,
  createLoggerFn,
  singleton,
  revocableProxy,
  revoke
};
