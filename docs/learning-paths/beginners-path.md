# 初学者学习路径 (Beginners Path)

> 适合 JavaScript/TypeScript 初学者的系统化学习路径

## 目录

- [初学者学习路径 (Beginners Path)](#初学者学习路径-beginners-path)
  - [目录](#目录)
  - [🎯 学习目标](#-学习目标)
  - [📚 第一阶段：TypeScript 基础 (1-2 周)](#-第一阶段typescript-基础-1-2-周)
    - [1.1 语言核心基础](#11-语言核心基础)
    - [1.2 类型系统进阶](#12-类型系统进阶)
  - [📚 第二阶段：设计模式入门 (1-2 周)](#-第二阶段设计模式入门-1-2-周)
    - [2.1 创建型模式](#21-创建型模式)
    - [2.2 结构型模式](#22-结构型模式)
    - [2.3 行为型模式](#23-行为型模式)
  - [📚 第三阶段：测试驱动开发 (1 周)](#-第三阶段测试驱动开发-1-周)
    - [3.1 单元测试基础](#31-单元测试基础)
    - [3.2 TDD 实践](#32-tdd-实践)
  - [📚 第四阶段：前端框架入门 (1-2 周)](#-第四阶段前端框架入门-1-2-周)
    - [4.1 前端框架基础](#41-前端框架基础)
    - [4.2 实战项目](#42-实战项目)
  - [🛠️ 配套练习](#️-配套练习)
    - [练习 1: 类型系统挑战](#练习-1-类型系统挑战)
    - [练习 2: 设计模式应用](#练习-2-设计模式应用)
    - [练习 3: 测试编写](#练习-3-测试编写)
  - [📖 推荐资源](#-推荐资源)
    - [官方文档](#官方文档)
    - [书籍](#书籍)
    - [在线课程](#在线课程)
  - [🎯 里程碑验证机制](#-里程碑验证机制)
    - [阶段 1 验证：TypeScript 基础](#阶段-1-验证typescript-基础)
    - [阶段 2 验证：设计模式入门](#阶段-2-验证设计模式入门)
    - [阶段 3 验证：测试驱动开发](#阶段-3-验证测试驱动开发)
    - [阶段 4 验证：前端框架入门](#阶段-4-验证前端框架入门)
  - [✅ 阶段检查清单](#-阶段检查清单)
    - [TypeScript 基础](#typescript-基础)
    - [设计模式](#设计模式)
    - [测试](#测试)
    - [实战能力](#实战能力)
  - [🚀 下一步](#-下一步)

## 🎯 学习目标

完成本学习路径后，你将能够：

- 掌握 TypeScript 基础语法和类型系统
- 理解常用设计模式并能在代码中应用
- 编写高质量的单元测试
- 构建简单的 Web 应用程序

**预计学习时间**: 4-6 周（每天 2-3 小时）

---

## 📚 第一阶段：TypeScript 基础 (1-2 周)

### 1.1 语言核心基础

**模块**: [00-language-core](../../jsts-code-lab/00-language-core/)

**学习内容**:

- 基础类型：string, number, boolean, array, tuple
- 接口 (Interface) 和类型别名 (Type Alias)
- 函数类型和泛型基础
- 枚举和字面量类型

**实践任务**:

```typescript
// 练习：定义一个用户系统类型
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// 实现一个泛型函数
define function filterByProperty<T, K extends keyof T>(
  items: T[],
  key: K,
  value: T[K]
): T[] {
  return items.filter(item => item[key] === value);
}
```

### 1.2 类型系统进阶

**模块**: [10-js-ts-comparison](../../jsts-code-lab/10-js-ts-comparison/)

**学习内容**:

- 类型推断和类型断言
- 类型收窄 (Type Narrowing)
- 条件类型和映射类型基础
- 类型守卫函数

**关键概念**:

| 概念 | 说明 | 示例 |
|------|------|------|
| 类型推断 | 编译器自动推导类型 | `let x = 1; // 推断为 number` |
| 类型断言 | 告诉编译器变量的类型 | `value as string` |
| 类型守卫 | 运行时检查缩小类型 | `typeof`, `instanceof` |

---

## 📚 第二阶段：设计模式入门 (1-2 周)

### 2.1 创建型模式

**模块**: [02-design-patterns](../../jsts-code-lab/02-design-patterns/)
**理论文档**: [设计模式理论](../../jsts-code-lab/02-design-patterns/THEORY.md)

**重点学习**:

1. **工厂模式 (Factory)** - 对象创建的封装
2. **单例模式 (Singleton)** - 全局唯一实例
3. **建造者模式 (Builder)** - 复杂对象的逐步构建

**代码实践**:

```typescript
// 工厂模式示例
abstract class Animal {
  abstract speak(): string;
}

class Dog extends Animal {
  speak() { return 'Woof!'; }
}

class Cat extends Animal {
  speak() { return 'Meow!'; }
}

class AnimalFactory {
  static create(type: 'dog' | 'cat'): Animal {
    return type === 'dog' ? new Dog() : new Cat();
  }
}
```

### 2.2 结构型模式

**重点学习**:

1. **装饰器模式 (Decorator)** - 动态添加功能
2. **适配器模式 (Adapter)** - 接口转换
3. **代理模式 (Proxy)** - 访问控制

### 2.3 行为型模式

**重点学习**:

1. **观察者模式 (Observer)** - 事件订阅通知
2. **策略模式 (Strategy)** - 算法封装替换

---

## 📚 第三阶段：测试驱动开发 (1 周)

### 3.1 单元测试基础

**模块**: [07-testing](../../jsts-code-lab/07-testing/)

**学习内容**:

- 测试框架 Vitest 的使用
- 断言库和匹配器
- 测试用例组织结构
- Mock 和 Stub

**实践示例**:

```typescript
import { describe, it, expect } from 'vitest';
import { Calculator } from './calculator';

describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    const calc = new Calculator();
    expect(calc.add(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    const calc = new Calculator();
    expect(calc.add(-2, 3)).toBe(1);
  });
});
```

### 3.2 TDD 实践

**红-绿-重构循环**:

1. 🔴 红：编写失败的测试
2. 🟢 绿：编写最简单的代码使测试通过
3. 🔵 重构：优化代码，保持测试通过

---

## 📚 第四阶段：前端框架入门 (1-2 周)

### 4.1 前端框架基础

**模块**: [18-frontend-frameworks](../../jsts-code-lab/18-frontend-frameworks/)

**学习内容**:

- 组件化思维
- 状态管理基础
- 生命周期理解
- 响应式原理

### 4.2 实战项目

**建议项目**: 待办事项应用 (Todo App)

**功能要求**:

- 添加/删除/完成任务
- 本地存储持久化
- 筛选不同状态任务
- 简单的 UI 样式

---

## 🛠️ 配套练习

### 练习 1: 类型系统挑战

**难度**: ⭐⭐

实现一个类型安全的 EventEmitter：

```typescript
class TypedEventEmitter<Events extends Record<string, any>> {
  // 你的实现
}

// 使用示例
const emitter = new TypedEventEmitter<{
  userLogin: { userId: string; timestamp: number };
  userLogout: { userId: string };
}>();

emitter.emit('userLogin', { userId: '123', timestamp: Date.now() }); // ✅
emitter.emit('userLogin', { userId: '123' }); // ❌ 类型错误
```

### 练习 2: 设计模式应用

**难度**: ⭐⭐⭐

使用装饰器模式实现一个日志记录功能：

```typescript
// 为任何方法添加执行时间记录
@logExecutionTime
fetchData() {
  // ...
}
// 输出: "fetchData executed in 23ms"
```

### 练习 3: 测试编写

**难度**: ⭐⭐

为以下函数编写完整的测试套件：

```typescript
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

**测试要求**:

- 正常邮箱格式
- 边界情况（空字符串、特殊字符）
- 无效格式

---

## 📖 推荐资源

### 官方文档

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN JavaScript Guide](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide)

### 书籍

1. *TypeScript 编程* - 鲍尔斯
2. *JavaScript 高级程序设计* (第4版) - Matt Frisbie
3. *学习 JavaScript 数据结构与算法* - 洛伊安妮·格罗纳

### 在线课程

- [TypeScript 入门教程](https://ts.xcatliu.com/)
- [JavaScript.info](https://zh.javascript.info/)

---

## 🎯 里程碑验证机制

每个阶段完成后，通过以下验证确认掌握程度：

### 阶段 1 验证：TypeScript 基础

**理论自检**（必须全部通过）：

1. [ ] 能解释 `interface` 和 `type` 的 3 个核心区别
2. [ ] 能手写一个包含泛型约束的工具类型（如 `Pick<T, K>`）
3. [ ] 能解释类型收窄的 3 种方式（typeof、instanceof、in）
4. [ ] 能识别并修复 5 个常见的类型错误

**实践验证**：

- **Checkpoint 项目**: 实现一个类型安全的 `EventEmitter`
  - 要求：支持泛型事件名称和回调参数类型
  - 代码位置: `jsts-code-lab/00-language-core/event-emitter-typed.ts`
  - 通过标准: `vitest run` 全部通过

**预计时间**: 1-2 周 | **难度**: ⭐⭐

---

### 阶段 2 验证：设计模式入门

**理论自检**：

1. [ ] 能画出工厂模式、观察者模式、策略模式的 UML 图
2. [ ] 能说出每个设计模式的适用场景和反模式
3. [ ] 能在代码中识别出使用了哪种设计模式

**实践验证**：

- **Checkpoint 项目**: 为 Todo 应用添加 3 种设计模式
  - 工厂模式：创建不同类型的 Todo（普通/重复/截止日期）
  - 观察者模式：Todo 状态变化通知 UI 更新
  - 策略模式：不同的排序策略（日期/优先级/字母）
  - 代码位置: `jsts-code-lab/02-design-patterns/todo-app-patterns/`
  - 通过标准: 模式实现正确 + 单元测试覆盖

**预计时间**: 1-2 周 | **难度**: ⭐⭐⭐

---

### 阶段 3 验证：测试驱动开发

**理论自检**：

1. [ ] 能解释 TDD 的红-绿-重构循环
2. [ ] 能区分单元测试、集成测试、E2E 测试的边界
3. [ ] 能说出 Mock 和 Stub 的区别

**实践验证**：

- **Checkpoint 项目**: 用 TDD 实现一个计算器
  - 要求：先写测试，再写实现，最后重构
  - 功能：加减乘除、幂运算、链式调用
  - 代码位置: `jsts-code-lab/07-testing/calculator-tdd/`
  - 通过标准: 测试覆盖率 ≥ 90%

**预计时间**: 1 周 | **难度**: ⭐⭐⭐

---

### 阶段 4 验证：前端框架入门

**理论自检**：

1. [ ] 能解释组件化开发的核心思想
2. [ ] 能区分 props 和 state
3. [ ] 能解释单向数据流的意义

**实践验证**：

- **Checkpoint 项目**: 完成 `examples/beginner-todo-master` 的 Milestone 3
  - 要求：使用 React + TypeScript 实现可交互的 Todo 列表
  - 通过标准: 功能完整 + TypeScript 无错误 + 通过 E2E 测试

**预计时间**: 1-2 周 | **难度**: ⭐⭐⭐

---

## ✅ 阶段检查清单

### TypeScript 基础

- [ ] 能独立定义复杂类型和接口
- [ ] 理解并能使用泛型
- [ ] 掌握类型收窄技巧
- [ ] 能读懂类型声明文件 (.d.ts)

### 设计模式

- [ ] 能解释 SOLID 原则
- [ ] 能在代码中应用至少 5 种设计模式
- [ ] 理解设计模式的适用场景

### 测试

- [ ] 能编写单元测试
- [ ] 理解 TDD 的基本流程
- [ ] 能使用 Mock 隔离依赖

### 实战能力

- [ ] 独立完成 Todo App
- [ ] 代码结构清晰，类型安全
- [ ] 有完整的测试覆盖

---

## 🚀 下一步

完成初学者路径后，可以继续：

- [中级学习路径](./intermediate-path.md) - 深入学习架构和性能优化
- [jsts-code-lab 中级模块](../jsts-code-lab/README.md#中级模块)

---

**💡 学习建议**:

1. **实践优先**：每学一个概念都要写代码验证
2. **阅读源码**：看优秀的开源项目如何组织代码
3. **记录笔记**：建立自己的知识库
4. **参与社区**：在 GitHub、Stack Overflow 提问和回答
