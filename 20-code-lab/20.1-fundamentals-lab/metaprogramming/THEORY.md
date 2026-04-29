# 元编程 — 理论基础

## 1. 元编程定义

元编程是**编写能操作代码的代码**的技术：

- **编译时**: 宏、模板、代码生成
- **运行时**: 反射、代理、动态代码执行

## 2. JavaScript 元编程技术对比

| 维度 | Proxy | Reflect | Symbol | Decorators |
|------|-------|---------|--------|-----------|
| **规范阶段** | ES2015（已标准化） | ES2015（已标准化） | ES2015+（持续扩展） | TC39 Stage 3（2024） |
| **作用目标** | 对象行为拦截 | 对象操作的规范化方法 | 属性键的唯一性 / 内部钩子 | 类、方法、属性、访问器的注解 |
| **核心能力** | 13 种 trap（get/set/apply/construct 等） | 对应 Proxy trap 的标准化操作 | `Symbol.iterator`、`Symbol.toPrimitive`、`Symbol.for` 等 | 编译时/运行时元数据附加 |
| **返回值** | 代理对象（透明替换） | 操作结果（布尔/值） | 唯一原始值 | 被装饰目标的转换版本 |
| **性能影响** | 中等（引擎优化后接近原生） | 低（推荐替代直接操作） | 无 | 低（编译期展开为主） |
| **典型场景** | 响应式系统、ORM 懒加载、验证 | 配合 Proxy 实现默认行为、减少魔性代码 | 自定义迭代、对象 branding、隐藏属性 | 依赖注入、路由映射、日志/AOP |
| **polyfill 难度** | 无法完整 polyfill | 可 polyfill | 部分可 polyfill | 需 transpiler（TypeScript / Babel） |

> **搭配原则**：Proxy + Reflect 是现代 JS 元编程的黄金组合；Symbol 用于扩展语言协议；Decorators 用于声明式元数据。

## 3. Proxy Trap 代码示例

```typescript
// 响应式对象 + 自动持久化 + 验证的 Proxy 实现
function createReactiveStore<T extends Record<string, any>>(
  initial: T,
  options?: {
    validator?: (key: keyof T, value: unknown) => boolean;
    persistKey?: string;
  }
): T {
  const storage = options?.persistKey
    ? {
        load: (): Partial<T> => {
          try {
            return JSON.parse(localStorage.getItem(options.persistKey!) || '{}');
          } catch {
            return {};
          }
        },
        save: (data: T) => {
          localStorage.setItem(options.persistKey!, JSON.stringify(data));
        },
      }
    : null;

  const saved = storage?.load() ?? {};
  const state = { ...initial, ...saved };

  return new Proxy(state, {
    // 属性读取拦截 — 支持隐藏属性、日志追踪
    get(target, prop, receiver) {
      if (typeof prop === 'symbol') {
        return Reflect.get(target, prop, receiver);
      }

      console.log(`[GET] ${String(prop)}`);

      // 模拟计算属性：以 $ 开头的属性自动计算
      if (typeof prop === 'string' && prop.startsWith('$')) {
        const key = prop.slice(1) as keyof T;
        return `computed: ${JSON.stringify(target[key])}`;
      }

      return Reflect.get(target, prop, receiver);
    },

    // 属性设置拦截 — 验证 + 持久化
    set(target, prop, value, receiver) {
      if (typeof prop === 'symbol') {
        return Reflect.set(target, prop, value, receiver);
      }

      if (options?.validator && !options.validator(prop, value)) {
        console.warn(`[SET REJECTED] ${String(prop)} = ${value}`);
        return false; // 严格模式会抛出 TypeError
      }

      const oldValue = target[prop as keyof T];
      const success = Reflect.set(target, prop, value, receiver);

      if (success && oldValue !== value) {
        console.log(`[SET] ${String(prop)}: ${oldValue} → ${value}`);
        storage?.save(target);
      }

      return success;
    },

    // 属性删除拦截
    deleteProperty(target, prop) {
      console.log(`[DELETE] ${String(prop)}`);
      const success = Reflect.deleteProperty(target, prop);
      if (success) storage?.save(target);
      return success;
    },

    // 枚举拦截 — 过滤私有属性（_ 前缀）
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(
        key => typeof key !== 'string' || !key.startsWith('_')
      );
    },

    // 函数调用拦截（当 target 为函数时）
    apply(target, thisArg, args) {
      console.log(`[APPLY] args: ${JSON.stringify(args)}`);
      return Reflect.apply(target as any, thisArg, args);
    },
  }) as T;
}

// 使用示例
const user = createReactiveStore(
  { name: 'Alice', age: 30, _secret: 'internal' },
  {
    validator: (key, value) => {
      if (key === 'age') return typeof value === 'number' && value >= 0;
      return true;
    },
    persistKey: 'app:user',
  }
);

user.age = 31;        // [SET] age: 30 → 31
console.log(user.$name); // [GET] $name → computed: "Alice"
console.log(Object.keys(user)); // ['name', 'age'] — _secret 被过滤
```

## 4. Reflect API

提供拦截和操作对象的统一接口：

- `Reflect.get/set`: 属性读写
- `Reflect.construct`: 构造函数调用
- `Reflect.apply`: 函数调用
- `Reflect.defineProperty`: 属性定义

## 5. eval 与 new Function

- `eval`: 在当前作用域执行代码字符串
- `new Function`: 创建新函数，全局作用域
- 风险：代码注入、性能损耗、调试困难

## 6. 装饰器（Decorator）

TC39 Stage 3 提案，注解式元编程：

```typescript
@Controller('/users')
class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) { }
}
```

## 7. 与相邻模块的关系

- **56-code-generation**: AST 操作与代码生成
- **68-plugin-system**: 插件系统的元编程应用
- **06-ecmascript-spec-foundation**: 规范层面的元对象协议

## 参考链接

- [Proxy — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Reflect — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [Symbol — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [ECMAScript Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [JavaScript Metaprogramming with Proxy — 2ality](https://2ality.com/2014/12/es6-proxies.html)
- [Vue 3 Reactivity Source Code](https://github.com/vuejs/core/tree/main/packages/reactivity)
