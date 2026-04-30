import os

BASE = r"E:\_src\JavaScriptTypeScript"

APPEND = {
    r"20-code-lab\20.1-fundamentals-lab\ecmascript-evolution\es2026-preview\THEORY.md": """
## 深化补充

### 新增代码示例：Float16Array 与 WebGPU 计算管线

```typescript
// webgpu-compute.ts — 使用 Float16Array 上传 half-precision 张量

async function uploadHalfTensor(device: GPUDevice, data: Float16Array): GPUBuffer {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float16Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
}

// 在 WGSL 中对应类型为 f16（需启用 shader-f16 扩展）
const shaderCode = `
  enable f16;
  @group(0) @binding(0) var<storage, read> input : array<f16>;
  @compute @workgroup_size(64)
  fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
    let i = gid.x;
    if (i < arrayLength(&input)) {
      let v = input[i] * f16(2.0);
      input[i] = v;
    }
  }
`;
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| ECMA-262 Import Attributes | [tc39.es/ecma262/#sec-import-attributes](https://tc39.es/ecma262/#sec-import-attributes) | 规范正式定义 |
| V8 Import Attributes | [v8.dev/features/import-attributes](https://v8.dev/features/import-attributes) | V8 实现细节 |
| SpiderMonkey Release Notes | [developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases) | 新特性落地追踪 |
| Test262 Report | [test262.report](https://test262.report/) | 各引擎 Test262 通过率 |
| WebGPU Spec | [www.w3.org/TR/webgpu](https://www.w3.org/TR/webgpu/) | W3C WebGPU 标准 |
""",
    r"20-code-lab\20.1-fundamentals-lab\js-ts-comparison\dual-track-algorithms\THEORY.md": """
## 深化补充

### 新增代码示例：类型安全备忘录（Memoization）

```javascript
// === JavaScript —— 无类型约束，运行时可能传入非函数 ===
function memoizeJS(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 隐患：fn 非函数时不报错；参数不可序列化时静默失败
const bad = memoizeJS(null);
```

```typescript
// === TypeScript —— 泛型约束保证 fn 为函数，参数可序列化 ===
type Serializable = string | number | boolean | null | Serializable[];

function memoizeTS<T extends Serializable[], R>(
  fn: (...args: T) => R
): (...args: T) => R {
  const cache = new Map<string, R>();
  return (...args: T): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// 编译期排除非法用法
const fib = memoizeTS((n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(40)); // 快速返回
// memoizeTS(123); // ❌ 编译错误
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| TypeScript Handbook — Generics | [typescriptlang.org/docs/handbook/2/generics.html](https://www.typescriptlang.org/docs/handbook/2/generics.html) | 泛型深度指南 |
| ECMA-262 Abstract Operations | [tc39.es/ecma262/#sec-abstract-operations](https://tc39.es/ecma262/#sec-abstract-operations) | 类型转换规范 |
| VisuAlgo — Sorting | [visualgo.net/en/sorting](https://visualgo.net/en/sorting) | 算法可视化 |
| Algorithm Design Manual | [algorist.com](https://www.algorist.com/) | 算法设计权威教材 |
| Total TypeScript | [totaltypescript.com](https://www.totaltypescript.com/) | TS 高级模式实战 |
""",
    r"20-code-lab\20.1-fundamentals-lab\js-ts-comparison\pattern-migration\THEORY.md": """
## 深化补充

### 新增代码示例：回调地狱 → Promise + async/await 类型化迁移

```javascript
// === Before: JavaScript 回调风格 ===
function fetchUserJS(userId, callback) {
  fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(data => callback(null, data))
    .catch(err => callback(err));
}

fetchUserJS('123', (err, user) => {
  if (err) return console.error(err);
  console.log(user.name);
});
```

```typescript
// === After: TypeScript Promise + async/await ===
interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUserTS(userId: string): Promise<User> {
  const res = await fetch(`/api/users/${userId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<User>;
}

// 使用处获得完整类型推断
const user = await fetchUserTS('123');
console.log(user.name.toUpperCase()); // 编译期已知为 string
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| TypeScript Migration Handbook | [typescriptlang.org/docs/handbook/migrating-from-javascript.html](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html) | 官方迁移指南 |
| ts-migrate | [github.com/airbnb/ts-migrate](https://github.com/airbnb/ts-migrate) | AirBnB 迁移工具 |
| type-coverage | [github.com/plantain-00/type-coverage](https://github.com/plantain-00/type-coverage) | 类型覆盖率统计 |
| ESLint no-explicit-any | [typescript-eslint.io/rules/no-explicit-any](https://typescript-eslint.io/rules/no-explicit-any/) | any 使用规约 |
| Total TypeScript — Migration | [totaltypescript.com](https://www.totaltypescript.com/) | 迁移策略课程 |
""",
    r"20-code-lab\20.1-fundamentals-lab\THEORY.md": """
## 深化补充

### 新增代码示例：Temporal Dead Zone (TDZ) 与隐式转换陷阱

```typescript
// tdz-deep-dive.ts

// 1. TDZ：typeof 在死区内也会报错
function tdzDemo() {
  console.log(typeof notYet); // ❌ ReferenceError: Cannot access 'notYet' before initialization
  let notYet = 42;
}

// 2. 隐式转换边缘案例
function coercionTraps() {
  const cases = [
    { expr: "[] + {}", expected: "[object Object]" },
    { expr: "{} + []", expected: 0 }, // 在语句开头 {} 被解析为代码块
    { expr: "[] + []", expected: "" },
    { expr: "1 + '2'", expected: "12" },
    { expr: "1 - '2'", expected: -1 },
  ];
  return cases;
}

// 3. 闭包内存泄漏模式
function leakPattern() {
  const bigData = new Array(1e6).fill('x');
  return {
    getSize: () => bigData.length, // bigData 被闭包捕获，无法释放
  };
}
const leaky = leakPattern();
// 即使不再需要 bigData，它仍驻留内存
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| ECMA-262 Lexical Environments | [tc39.es/ecma262/#sec-lexical-environments](https://tc39.es/ecma262/#sec-lexical-environments) | 作用域与 TDZ 规范 |
| MDN — Closures | [developer.mozilla.org/en-US/docs/Web/JavaScript/Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) | 闭包详解 |
| MDN — Event Loop | [developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) | 事件循环可视化 |
| V8 Blog — Trash Talk | [v8.dev/blog/trash-talk](https://v8.dev/blog/trash-talk) | 垃圾回收机制 |
| 2ality — JavaScript Types | [2ality.com/2020/04/types-javascript.html](https://2ality.com/2020/04/types-javascript.html) | JS 类型系统深度分析 |
| JavaScript.info | [javascript.info](https://javascript.info/) | 现代 JS 教程 |
""",
    r"20-code-lab\20.1-fundamentals-lab\web-apis-lab\THEORY.md": """
## 深化补充

### 新增代码示例：TransformStream 文本处理与 CompressionStream

```typescript
// stream-transform.ts — TransformStream 实时转换

const upperCaseTransform = new TransformStream<string, string>({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  },
});

// 将 ReadableStream 通过 TransformStream 流向 WritableStream
const source = new ReadableStream({
  start(controller) {
    controller.enqueue('hello');
    controller.enqueue('world');
    controller.close();
  },
});

const writer = new WritableStream({
  write(chunk) {
    console.log(chunk); // HELLO, WORLD
  },
});

source.pipeThrough(upperCaseTransform).pipeTo(writer);

// CompressionStream — 在浏览器端压缩数据上传
async function compressData(data: string): Promise<Blob> {
  const stream = new Blob([data]).stream();
  const compressed = stream.pipeThrough(new CompressionStream('gzip'));
  const response = new Response(compressed);
  return response.blob();
}
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| WHATWG Streams Standard | [streams.spec.whatwg.org](https://streams.spec.whatwg.org/) | Streams 规范原文 |
| MDN — TransformStream | [developer.mozilla.org/en-US/docs/Web/API/TransformStream](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream) | TransformStream API |
| MDN — CompressionStream | [developer.mozilla.org/en-US/docs/Web/API/CompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream) | 压缩流 API |
| MDN — Web Locks API | [developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) | 跨标签页锁 |
| web.dev — Streams | [web.dev/streams](https://web.dev/streams/) | Streams 实践指南 |
| Can I Use — Streams | [caniuse.com/streams](https://caniuse.com/streams) | 浏览器兼容性 |
| W3C — WebGPU | [www.w3.org/TR/webgpu](https://www.w3.org/TR/webgpu/) | WebGPU 标准 |
""",
    r"20-code-lab\20.10-formal-verification\formal-semantics\THEORY.md": """
## 深化补充

### 新增代码示例：简单类型 λ 演算（STLC）类型检查器

```typescript
// stlc-typechecker.ts — Simply Typed Lambda Calculus

type Type =
  | { kind: 'Base'; name: string }
  | { kind: 'Arrow'; domain: Type; codomain: Type };

type Term =
  | { kind: 'Var'; name: string }
  | { kind: 'Abs'; param: string; paramType: Type; body: Term }
  | { kind: 'App'; func: Term; arg: Term };

function typeCheck(term: Term, ctx: Map<string, Type>): Type | null {
  switch (term.kind) {
    case 'Var': {
      const t = ctx.get(term.name);
      return t ?? null;
    }
    case 'Abs': {
      const newCtx = new Map(ctx);
      newCtx.set(term.param, term.paramType);
      const bodyType = typeCheck(term.body, newCtx);
      return bodyType ? { kind: 'Arrow', domain: term.paramType, codomain: bodyType } : null;
    }
    case 'App': {
      const funcType = typeCheck(term.func, ctx);
      const argType = typeCheck(term.arg, ctx);
      if (!funcType || !argType) return null;
      if (funcType.kind === 'Arrow' && typeEqual(funcType.domain, argType)) {
        return funcType.codomain;
      }
      return null;
    }
  }
}

function typeEqual(a: Type, b: Type): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'Base' && b.kind === 'Base') return a.name === b.name;
  if (a.kind === 'Arrow' && b.kind === 'Arrow') {
    return typeEqual(a.domain, b.domain) && typeEqual(a.codomain, b.codomain);
  }
  return false;
}

// 示例：λx:Nat. x 的类型为 Nat → Nat
const nat: Type = { kind: 'Base', name: 'Nat' };
const identity = { kind: 'Abs', param: 'x', paramType: nat, body: { kind: 'Var', name: 'x' } } as Term;
console.log(typeCheck(identity, new Map())); // Arrow(Base(Nat), Base(Nat))
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| TAPL — Official Site | [cis.upenn.edu/~bcpierce/tapl](https://www.cis.upenn.edu/~bcpierce/tapl/) | Types and Programming Languages |
| TAPL — MIT Press | [mitpress.mit.edu/9780262162098](https://mitpress.mit.edu/9780262162098/types-and-programming-languages/) | 权威教材购买页 |
| Software Foundations — PLF | [softwarefoundations.cis.upenn.edu/plf-current](https://softwarefoundations.cis.upenn.edu/plf-current/index.html) | Coq 形式化验证教材 |
| K Framework Tutorial | [kframework.org/k-distribution/k-tutorial](https://kframework.org/k-distribution/k-tutorial/) | K 框架官方教程 |
| PLT Redex Docs | [docs.racket-lang.org/redex](https://docs.racket-lang.org/redex/) | Redex 语义工程化文档 |
| Winskel — Formal Semantics | [mitpress.mit.edu/9780262731034](https://mitpress.mit.edu/9780262731034/the-formal-semantics-of-programming-languages/) | 形式语义经典教材 |
| MIT 6.820 Program Analysis | [ocw.mit.edu/courses/6-820-fundamentals-of-program-analysis-fall-2015](https://ocw.mit.edu/courses/6-820-fundamentals-of-program-analysis-fall-2015/) | MIT 程序分析课程 |
""",
    r"20-code-lab\20.10-formal-verification\formal-verification\THEORY.md": """
## 深化补充

### 新增代码示例：不可空数组精化类型与状态机穷尽检查

```typescript
// refinement-types.ts — 模拟精化类型保证数组非空

declare const NonEmptyBrand: unique symbol;
type NonEmptyArray<T> = T[] & { [NonEmptyBrand]: true };

function assertNonEmpty<T>(arr: T[]): NonEmptyArray<T> {
  if (arr.length === 0) throw new Error('Array must not be empty');
  return arr as NonEmptyArray<T>;
}

function first<T>(arr: NonEmptyArray<T>): T {
  return arr[0]; // 编译期已排除空数组，无需额外检查
}

// 状态机穷尽检查
type State = 'idle' | 'loading' | 'success' | 'error';

function handleState(state: State): string {
  switch (state) {
    case 'idle': return 'Waiting...';
    case 'loading': return 'Loading...';
    case 'success': return 'Done!';
    case 'error': return 'Failed!';
    default:
      // 若新增状态未处理，此处触发编译错误
      const _exhaustive: never = state;
      return _exhaustive;
  }
}
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| TLA+ Home Page | [lamport.azurewebsites.net/tla/tla.html](https://lamport.azurewebsites.net/tla/tla.html) | Leslie Lamport 官方 |
| Learn TLA+ | [learntla.com](https://learntla.com/) | TLA+ 入门教程 |
| Software Foundations | [softwarefoundations.cis.upenn.edu](https://softwarefoundations.cis.upenn.edu/) | Coq 形式化验证教材 |
| Theorem Proving in Lean 4 | [leanprover.github.io/theorem_proving_in_lean4](https://leanprover.github.io/theorem_proving_in_lean4/) | Lean 官方教材 |
| Z3 Guide | [microsoft.github.io/z3guide](https://microsoft.github.io/z3guide/) | Z3 官方教程 |
| Dafny Documentation | [dafny.org](https://dafny.org/) | 微软程序验证语言 |
| Infer by Meta | [fbinfer.com](https://fbinfer.com/) | 静态分析工具 |
| Frama-C | [frama-c.com](https://frama-c.com/) | C 程序形式化验证平台 |
| seL4 Proofs | [sel4.systems/About/seL4-proofs.pml](https://sel4.systems/About/seL4-proofs.pml) | 操作系统形式化验证 |
| AWS s2n Formal Verification | [aws.github.io/s2n-tls/usage-guide/ch15-formal-verification.html](https://aws.github.io/s2n-tls/usage-guide/ch15-formal-verification.html) | AWS TLS 验证实践 |
| CPDT | [adam.chlipala.net/cpdt](http://adam.chlipala.net/cpdt/) | Coq 高级教程 |
| Natural Number Game | [adam.math.hhu.de/#/g/leanprover-community/nng4](https://adam.math.hhu.de/#/g/leanprover-community/nng4) | Lean 交互式入门 |
""",
    r"20-code-lab\20.11-rust-toolchain\toolchain-configuration\CATEGORY.md": """
## 深化补充

### 新增代码示例：justfile 与 sccache 加速混合构建

```justfile
# justfile — Rust + Node.js 混合任务

build:
    cargo build --release
    pnpm run build

lint:
    cargo clippy --all-targets --all-features -- -D warnings
    pnpm oxlint src/

test:
    cargo nextest run
    pnpm test

fmt:
    cargo fmt --all
    pnpm biome format . --write
```

```yaml
# .github/workflows/ci.yml — sccache 加速片段
- name: Run sccache
  uses: mozilla-actions/sccache-action@v0.0.3
- run: cargo build --release
  env:
    SCCACHE_GHA_ENABLED: "true"
    RUSTC_WRAPPER: "sccache"
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| Rust Analyzer Manual | [rust-analyzer.github.io/manual.html](https://rust-analyzer.github.io/manual.html) | IDE 支持手册 |
| Cargo Nextest | [nexte.st](https://nexte.st/) | 下一代 Rust 测试运行器 |
| sccache | [github.com/mozilla/sccache](https://github.com/mozilla/sccache) | 编译缓存 |
| cargo-machete | [github.com/bnjbvr/cargo-machete](https://github.com/bnjbvr/cargo-machete) | 未使用依赖检测 |
| rust-toolchain.toml | [rust-lang.github.io/rustup/overrides.html](https://rust-lang.github.io/rustup/overrides.html#the-toolchain-file) | 工具链锁定规范 |
| Oxc Config | [oxc.rs/docs/guide/usage/linter/config.html](https://oxc.rs/docs/guide/usage/linter/config.html) | Oxlint 配置参考 |
| Biome Config | [biomejs.dev/reference/configuration](https://biomejs.dev/reference/configuration/) | Biome 配置手册 |
| Rspack Config | [rspack.dev/config](https://www.rspack.dev/config/) | Rspack 配置指南 |
""",
    r"20-code-lab\20.11-rust-toolchain\toolchain-configuration\rust-toolchain-migration\THEORY.md": """
## 深化补充

### 新增代码示例：cargo-outdated 集成与 MSRV CI 检查

```bash
#!/bin/bash
# check-msrv.sh — 在 CI 中验证 MSRV

set -e
MSRV="1.70.0"

echo "=== Checking MSRV: $MSRV ==="
rustup install "$MSRV"
cargo +"$MSRV" check --all-targets --all-features

echo "=== Running cargo-outdated ==="
cargo install cargo-outdated
cargo outdated --exit-code 1
```

```yaml
# .github/workflows/msrv.yml
name: MSRV Check
on: [pull_request]
jobs:
  msrv:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: 1.70.0
      - run: cargo check --all-features
      - run: cargo test
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| Rust Edition Guide | [doc.rust-lang.org/edition-guide](https://doc.rust-lang.org/edition-guide/) | Edition 迁移官方指南 |
| Cargo SemVer | [doc.rust-lang.org/cargo/reference/semver.html](https://doc.rust-lang.org/cargo/reference/semver.html) | Cargo 语义化版本 |
| rustup components history | [rust-lang.github.io/rustup-components-history](https://rust-lang.github.io/rustup-components-history/) | 组件可用性历史 |
| This Week in Rust | [this-week-in-rust.org](https://this-week-in-rust.org/) | 社区周刊 |
| cargo-outdated | [github.com/kbknapp/cargo-outdated](https://github.com/kbknapp/cargo-outdated) | 依赖更新检查 |
| cargo-msrv | [github.com/foresterre/cargo-msrv](https://github.com/foresterre/cargo-msrv) | MSRV 自动查找 |
| Rust Release Blog | [blog.rust-lang.org](https://blog.rust-lang.org/) | 官方发布博客 |
""",
    r"20-code-lab\20.2-language-patterns\architecture-patterns\hexagonal\THEORY.md": """
## 深化补充

### 新增代码示例：CLI 适配器与 Redis 事件发布适配器

```typescript
// cli-adapter.ts — 命令行驱动端口

interface RegisterUserCLI {
  run(args: string[]): Promise<void>;
}

class RegisterUserCLIAdapter implements RegisterUserCLI {
  constructor(private useCase: RegisterUserUseCase) {}

  async run(args: string[]): Promise<void> {
    const [email, password] = args;
    if (!email || !password) {
      console.error('Usage: register <email> <password>');
      process.exit(1);
    }
    await this.useCase.execute(email, password);
    console.log('User registered successfully');
  }
}

// redis-event-publisher.ts — 消息队列 driven 端口

interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}

class RedisEventPublisher implements EventPublisher {
  constructor(private redis: RedisClient) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.redis.publish('events', JSON.stringify(event));
  }
}
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| Matthias Noback — Hexagonal Architecture Book | [matthiasnoback.nl/book/principles-of-hexagonal-architecture](https://matthiasnoback.nl/book/principles-of-hexagonal-architecture/) | 六边形架构专著 |
| Building Microservices — Sam Newman | [samnewman.io/books/building_microservices](https://samnewman.io/books/building_microservices/) | 微服务构建权威 |
| PoEAA — Martin Fowler | [martinfowler.com/eaaCatalog](https://martinfowler.com/eaaCatalog/) | 企业应用架构模式 |
| NestJS Custom Providers | [docs.nestjs.com/fundamentals/custom-providers](https://docs.nestjs.com/fundamentals/custom-providers) | TS 框架依赖注入 |
| tsyringe | [github.com/microsoft/tsyringe](https://github.com/microsoft/tsyringe) | 微软 TS DI 容器 |
| inversifyjs | [inversify.io](https://inversify.io/) | IoC 容器 |
""",
}

results = []
for rel_path, extra in APPEND.items():
    full_path = os.path.join(BASE, rel_path)
    with open(full_path, "r", encoding="utf-8") as f:
        original = f.read()
    # For CATEGORY.md, preserve frontmatter by simply appending (frontmatter is at start)
    new_content = original + extra
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    size = os.path.getsize(full_path)
    results.append((rel_path, size))
    print(f"{rel_path}: {size} bytes")

print("\n=== Final Byte Sizes ===")
for rel_path, size in results:
    print(f"{rel_path}: {size}")
