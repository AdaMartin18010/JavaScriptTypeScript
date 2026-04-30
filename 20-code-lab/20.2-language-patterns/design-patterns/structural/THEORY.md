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
| **Facade** | 为复杂子系统提供统一简化接口 | 大型库封装、API 网关 | 单一入口类，委派子系统 |
| **Flyweight** | 共享细粒度对象以节省内存 | 游戏实体池、字符渲染 | 分离内部/外部状态，工厂管理共享 |
| **Bridge** | 将抽象与实现解耦，可独立变化 | 跨平台 UI、多驱动支持 | 抽象层持有实现层接口 |

---

## 二、设计原理

### 2.1 为什么存在

类库的设计往往无法预见所有使用场景。结构型模式通过组合而非继承来组装对象，在不修改原有代码的情况下扩展功能。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 适配器 | 兼容旧接口 | 增加间接层 | 遗留集成 |
| 装饰器 | 动态扩展 | 调试栈变深 | 中间件 |
| 代理 | 访问控制透明 | 额外调用开销 | 资源管控 |
| 外观 | 简化使用 | 可能过度封装 | 复杂库封装 |
| 享元 | 内存节省 | 状态管理复杂 | 大量相似对象 |

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

### 3.2 Flyweight（享元模式：字符池）

```typescript
// flyweight.ts — 享元模式：共享细粒度对象

interface Glyph {
  render(font: string, size: number, color: string): void;
}

// 享元对象：内部状态（共享）
class CharacterGlyph implements Glyph {
  constructor(private char: string) {}
  render(font: string, size: number, color: string) {
    console.log(`Render '${this.char}' with ${font} ${size}px ${color}`);
  }
}

// 享元工厂：管理共享对象
class GlyphFactory {
  private pool = new Map<string, CharacterGlyph>();

  getGlyph(char: string): CharacterGlyph {
    if (!this.pool.has(char)) {
      this.pool.set(char, new CharacterGlyph(char));
      console.log(`[Factory] Created glyph for '${char}'`);
    }
    return this.pool.get(char)!;
  }

  getPoolSize() { return this.pool.size; }
}

// 客户端：外部状态（非共享）
class TextRun {
  constructor(
    private glyph: Glyph,
    private font: string,
    private size: number,
    private color: string
  ) {}
  render() { this.glyph.render(this.font, this.size, this.color); }
}

// 使用示例：大量字符渲染，共享内部状态
const factory = new GlyphFactory();
const runs: TextRun[] = [];

for (let i = 0; i < 1000; i++) {
  const char = String.fromCharCode(65 + (i % 26)); // A-Z 循环
  runs.push(new TextRun(factory.getGlyph(char), 'Arial', 12, 'black'));
}

console.log(`Pool size: ${factory.getPoolSize()}`); // 26（仅 26 个共享对象）
```

### 3.3 Facade（外观模式：复杂库封装）

```typescript
// facade.ts — 外观模式简化复杂子系统

// 子系统 A：视频处理
class VideoDecoder {
  decode(file: string): Buffer { console.log(`Decoding ${file}`); return Buffer.from([]); }
}
class VideoRenderer {
  render(buffer: Buffer): void { console.log('Rendering video'); }
}

// 子系统 B：音频处理
class AudioDecoder {
  decode(file: string): Buffer { console.log(`Decoding audio ${file}`); return Buffer.from([]); }
}
class AudioMixer {
  mix(buffer: Buffer): Buffer { console.log('Mixing audio'); return buffer; }
}

// 子系统 C：字幕处理
class SubtitleLoader {
  load(file: string): string[] { console.log(`Loading subtitles ${file}`); return []; }
}
class SubtitleRenderer {
  display(subs: string[]): void { console.log('Displaying subtitles'); }
}

// 外观：统一入口
class MediaPlayerFacade {
  private videoDecoder = new VideoDecoder();
  private videoRenderer = new VideoRenderer();
  private audioDecoder = new AudioDecoder();
  private audioMixer = new AudioMixer();
  private subtitleLoader = new SubtitleLoader();
  private subtitleRenderer = new SubtitleRenderer();

  play(videoFile: string, audioFile: string, subtitleFile?: string) {
    const video = this.videoDecoder.decode(videoFile);
    const audio = this.audioMixer.mix(this.audioDecoder.decode(audioFile));
    this.videoRenderer.render(video);
    // 音频播放...
    if (subtitleFile) {
      const subs = this.subtitleLoader.load(subtitleFile);
      this.subtitleRenderer.display(subs);
    }
    console.log('Playback started');
  }
}

// 客户端只需与外观交互
const player = new MediaPlayerFacade();
player.play('movie.mp4', 'movie.aac', 'movie.srt');
```

### 3.4 Bridge（桥接模式：抽象与实现分离）

```typescript
// bridge.ts — 桥接模式：UI 控件与渲染引擎解耦

// 实现层接口
interface Renderer {
  renderButton(x: number, y: number, width: number, height: number, label: string): void;
  renderCheckbox(x: number, y: number, label: string, checked: boolean): void;
}

// 具体实现 A：Web DOM 渲染
class DomRenderer implements Renderer {
  renderButton(x: number, y: number, w: number, h: number, label: string) {
    console.log(`[DOM] <button style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${label}</button>`);
  }
  renderCheckbox(x: number, y: number, label: string, checked: boolean) {
    console.log(`[DOM] <input type="checkbox" style="left:${x}px;top:${y}px" ${checked ? 'checked' : ''}> ${label}`);
  }
}

// 具体实现 B：Canvas 渲染
class CanvasRenderer implements Renderer {
  renderButton(x: number, y: number, w: number, h: number, label: string) {
    console.log(`[Canvas] fillRect(${x},${y},${w},${h}); fillText("${label}",${x + w/2},${y + h/2});`);
  }
  renderCheckbox(x: number, y: number, label: string, checked: boolean) {
    console.log(`[Canvas] strokeRect(${x},${y},16,16); ${checked ? 'fillRect(...)' : ''} fillText("${label}",${x + 20},${y + 12});`);
  }
}

// 抽象层
abstract class UIWidget {
  constructor(protected renderer: Renderer) {}
  abstract draw(): void;
}

class Button extends UIWidget {
  constructor(renderer: Renderer, private x: number, private y: number, private label: string) {
    super(renderer);
  }
  draw() {
    this.renderer.renderButton(this.x, this.y, 100, 40, this.label);
  }
}

class Checkbox extends UIWidget {
  constructor(renderer: Renderer, private x: number, private y: number, private label: string, private checked: boolean) {
    super(renderer);
  }
  draw() {
    this.renderer.renderCheckbox(this.x, this.y, this.label, this.checked);
  }
}

// 客户端：可在运行时切换渲染引擎
const widgets: UIWidget[] = [
  new Button(new DomRenderer(), 10, 10, 'OK'),
  new Checkbox(new CanvasRenderer(), 10, 60, 'Accept', true),
];
widgets.forEach(w => w.draw());
```

### 3.5 常见误区

| 误区 | 正确理解 |
|------|---------|
| 适配器用于修复设计缺陷 | 适配器解决接口不匹配，而非设计错误 |
| 装饰器与继承等价 | 装饰器动态组合，继承静态绑定 |
| 代理就是装饰器 | 代理侧重访问控制，装饰器侧重功能增强 |
| 组合模式必须有树结构 | 核心是对单个和组合的统一处理，树是最常见形式 |
| 外观模式隐藏所有细节 | 外观提供便捷入口，高级用户仍可访问子系统 |
| 享元模式会提升速度 | 享元主要节省内存，可能因查找开销略微降低速度 |

### 3.6 扩展阅读

- [GoF Design Patterns — Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns)
- [Refactoring Guru: Structural Patterns](https://refactoring.guru/design-patterns/structural-patterns)
- [MDN: Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [TypeScript Handbook: Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Patterns.dev: Structural Patterns](https://www.patterns.dev/posts/classic-design-patterns/#structural-design-patterns) — 现代 Web 结构型模式
- [SourceMaking: Structural Patterns](https://sourcemaking.com/design_patterns/structural_patterns) — 结构型模式详解
- [Dive Into Design Patterns](https://refactoring.guru/design-patterns/book) — 设计模式书籍（免费在线）
- [TypeScript Design Patterns](https://github.com/torokmark/design_patterns_in_typescript) — TS 实现的设计模式集合
- [Do Factory: JavaScript Design Patterns](https://www.dofactory.com/javascript/design-patterns) — JS 设计模式参考
- [MDN: Object Composition](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects#composing_objects) — 对象组合指南
- [Composition over Inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance) — 组合优于继承原则
- [Adapter Pattern (Wikipedia)](https://en.wikipedia.org/wiki/Adapter_pattern)
- [Decorator Pattern (Wikipedia)](https://en.wikipedia.org/wiki/Decorator_pattern)
- [Proxy Pattern (Wikipedia)](https://en.wikipedia.org/wiki/Proxy_pattern)
- [Composite Pattern (Wikipedia)](https://en.wikipedia.org/wiki/Composite_pattern)
- [Facade Pattern (Wikipedia)](https://en.wikipedia.org/wiki/Facade_pattern)
- [Flyweight Pattern (Wikipedia)](https://en.wikipedia.org/wiki/Flyweight_pattern)
- [Bridge Pattern (Wikipedia)](https://en.wikipedia.org/wiki/Bridge_pattern)
- `20.2-language-patterns/design-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
