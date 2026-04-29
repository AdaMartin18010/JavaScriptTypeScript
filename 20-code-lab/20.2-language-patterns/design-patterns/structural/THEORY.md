# 结构型设计模式（Structural Patterns）

> **定位**：`20-code-lab/20.2-language-patterns/design-patterns/structural`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**类与对象的组合**问题。通过适配器、装饰器、代理等结构模式在不改变原有接口的情况下扩展功能。核心原则：**优先组合而非继承**，通过对象组合来实现新的功能，而非通过类继承。

### 1.2 形式化基础

结构型模式关注如何**组装对象和类**以形成更大的结构。它们在不修改原有代码的前提下，提供扩展功能的新方式，符合开闭原则。

### 1.3 模式速查表

| 模式 | 意图 | 典型场景 | TypeScript 实现要点 |
|------|------|---------|--------------------|
| **Adapter** | 接口不兼容类的转换包装 | 第三方库集成、旧系统对接 | 实现目标接口，包装源对象 |
| **Decorator** | 动态附加额外职责 | 中间件、日志、缓存 | 实现基础接口，持有同类型引用 |
| **Proxy** | 控制对对象的访问 | 懒加载、权限校验、缓存代理 | 实现目标接口，拦截操作 |
| **Composite** | 统一处理单个对象与组合对象 | UI 组件树、文件系统 | 组件接口 + 叶子节点 + 容器节点 |

---

## 二、设计原理

### 2.1 为什么存在

类库的设计往往无法预见所有使用场景。结构型模式通过组合而非继承来组装对象，在不修改原有代码的情况下扩展功能。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 适配器 | 兼容旧接口 | 增加间接层 | 遗留集成 |
| 装饰器 | 动态扩展 | 调试栈变深 | 中间件 |

### 2.3 与相关技术的对比

与继承对比：结构模式偏好组合，继承是静态绑定。组合在运行时灵活替换组件，继承在编译期固定关系。

---

## 三、实践映射

### 3.1 从理论到代码

**Adapter（旧 API 适配新接口）**

```typescript
// 新系统期望的接口
interface ModernLogger {
  log(level: 'info' | 'warn' | 'error', message: string): void;
}

// 遗留第三方库的接口
class LegacyLogger {
  writeMessage(msg: string, severity: number) {
    const map = { 1: 'INFO', 2: 'WARN', 3: 'ERROR' };
    console.log(`[${map[severity as 1|2|3]}] ${msg}`);
  }
}

// 适配器：将新接口转换为旧接口
class LoggerAdapter implements ModernLogger {
  constructor(private legacy: LegacyLogger) {}

  log(level: 'info' | 'warn' | 'error', message: string) {
    const severityMap = { info: 1, warn: 2, error: 3 };
    this.legacy.writeMessage(message, severityMap[level]);
  }
}

// 可运行示例
const modern: ModernLogger = new LoggerAdapter(new LegacyLogger());
modern.log('info', 'System started');  // [INFO] System started
modern.log('error', 'Disk full');      // [ERROR] Disk full
```

**Decorator（日志装饰器）**

```typescript
interface DataService {
  fetchData(id: string): Promise<string>;
}

class BasicDataService implements DataService {
  async fetchData(id: string) {
    await new Promise(r => setTimeout(r, 100)); // 模拟网络
    return `Data for ${id}`;
  }
}

class LoggingDecorator implements DataService {
  constructor(private wrapped: DataService) {}

  async fetchData(id: string): Promise<string> {
    console.log(`[LOG] fetchData called with id=${id}`);
    const start = performance.now();
    const result = await this.wrapped.fetchData(id);
    console.log(`[LOG] fetchData completed in ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  }
}

class CachingDecorator implements DataService {
  private cache = new Map<string, string>();
  constructor(private wrapped: DataService) {}

  async fetchData(id: string): Promise<string> {
    if (this.cache.has(id)) {
      console.log(`[CACHE] Hit for id=${id}`);
      return this.cache.get(id)!;
    }
    const data = await this.wrapped.fetchData(id);
    this.cache.set(id, data);
    return data;
  }
}

// 可运行示例：可组合装饰
const service = new CachingDecorator(
  new LoggingDecorator(new BasicDataService())
);
await service.fetchData('user-1'); // miss，打印日志
await service.fetchData('user-1'); // hit，直接返回缓存
```

**Proxy（虚拟代理：懒加载图片）**

```typescript
interface Image {
  display(): void;
}

class RealImage implements Image {
  constructor(private filename: string) {
    this.loadFromDisk();
  }
  private loadFromDisk() {
    console.log(`Loading ${this.filename} from disk...`);
  }
  display() {
    console.log(`Displaying ${this.filename}`);
  }
}

class ImageProxy implements Image {
  private realImage?: RealImage;
  constructor(private filename: string) {}

  display() {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// 可运行示例
const thumb = new ImageProxy('huge-photo.jpg');
console.log('Proxy created, image NOT loaded yet');
thumb.display(); // 此时才真正加载并显示
thumb.display(); // 直接显示，不再加载
```

**Composite（UI 组件树）**

```typescript
abstract class UIComponent {
  abstract render(indent?: string): void;
}

class Button extends UIComponent {
  constructor(private label: string) { super(); }
  render(indent = '') {
    console.log(`${indent}<Button>${this.label}</Button>`);
  }
}

class Panel extends UIComponent {
  private children: UIComponent[] = [];
  constructor(private title: string) { super(); }

  add(child: UIComponent) { this.children.push(child); }
  remove(child: UIComponent) {
    this.children = this.children.filter(c => c !== child);
  }

  render(indent = '') {
    console.log(`${indent}<Panel title="${this.title}">`);
    this.children.forEach(c => c.render(indent + '  '));
    console.log(`${indent}</Panel>`);
  }
}

// 可运行示例：统一处理单个对象与组合对象
const root = new Panel('Main');
const sidebar = new Panel('Sidebar');
sidebar.add(new Button('Home'));
sidebar.add(new Button('Settings'));
root.add(sidebar);
root.add(new Button('Submit'));
root.render();
// <Panel title="Main">
//   <Panel title="Sidebar">
//     <Button>Home</Button>
//     <Button>Settings</Button>
//   </Panel>
//   <Button>Submit</Button>
// </Panel>
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 适配器用于修复设计缺陷 | 适配器解决接口不匹配，而非设计错误 |
| 装饰器与继承等价 | 装饰器动态组合，继承静态绑定 |
| 代理就是装饰器 | 代理侧重访问控制，装饰器侧重功能增强 |
| 组合模式必须有树结构 | 核心是对单个和组合的统一处理，树是最常见形式 |

### 3.3 扩展阅读

- [GoF Design Patterns — Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns)
- [Refactoring Guru: Structural Patterns](https://refactoring.guru/design-patterns/structural-patterns)
- [MDN: Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [TypeScript Handbook: Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- `20.2-language-patterns/design-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
