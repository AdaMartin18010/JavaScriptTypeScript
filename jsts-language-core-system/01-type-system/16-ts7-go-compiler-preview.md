# TS 7.0 Go 编译器预览

> TypeScript "Project Corsa"：Go 重写带来的性能飞跃
>
> 对齐版本：TypeScript 7.0 预览

---

## 1. 为什么重写编译器

TypeScript 自 2012 年起用 TypeScript 编写，随着代码库增长，性能瓶颈日益明显：

| 指标 | TS 5.x | 目标（TS 7.0） |
|------|--------|--------------|
| 编译大型项目 | 数秒到数分钟 | 亚秒级 |
| 内存占用 | 较高 | 降低 50%+ |
| 启动时间 | 较慢 | 接近瞬时 |
| IDE 响应 | 有延迟 | 实时 |

### 1.1 Go 的选择理由

- **并发模型**：Go 的 goroutine 适合并行类型检查
- **内存管理**：垃圾回收适合编译器的生命周期
- **编译速度**：Go 编译器本身极快
- **生态系统**：成熟的工具和库

---

## 2. 性能提升数据

根据微软公布的早期基准测试：

```
项目规模：100 万行 TypeScript 代码

TS 5.8 (Node.js):
  冷编译：45 秒
  增量编译：3 秒
  内存峰值：2.5 GB

TS 7.0 Go (预览):
  冷编译：8 秒 (5.6x 提升)
  增量编译：0.5 秒 (6x 提升)
  内存峰值：1.2 GB (52% 降低)
```

### 2.1 并行类型检查

Go 编译器利用多核并行处理：

```
单线程类型检查：
  文件1 → 文件2 → 文件3 → ... → 文件N

并行类型检查（Go）：
  文件1 ─┐
  文件2 ─┼→ 类型检查 workers ─→ 合并结果
  文件3 ─┘
```

---

## 3. 兼容性保证

### 3.1 语言层面 100% 兼容

```typescript
// TS 5.x 代码在 TS 7.0 中行为完全一致
interface User {
  name: string;
  age: number;
}

const user: User = { name: "Alice", age: 30 }; // 完全兼容
```

### 3.2 配置兼容

```json
{
  "compilerOptions": {
    "target": "ES2025",
    "module": "NodeNext",
    "strict": true,
    // 所有现有选项保持不变
  }
}
```

### 3.3 已知差异

| 方面 | 行为 |
|------|------|
| 错误信息格式 | 可能略有调整 |
| 性能特征 | 大幅提升 |
| 内存使用 | 降低 |
| 插件 API | 待确定 |

---

## 4. 架构变化

### 4.1 从 Node.js 到 Native

```
TS 5.x: TypeScript → tsc.js → Node.js V8 → 字节码 → 执行
TS 7.0: TypeScript → Go 源码 → Go 编译器 → 原生机器码
```

### 4.2 并发模型

```go
// Go 编译器中的并行检查（概念）
func typeCheck(files []SourceFile) {
    var wg sync.WaitGroup
    for _, file := range files {
        wg.Add(1)
        go func(f SourceFile) {
            defer wg.Done()
            checkFile(f)
        }(file)
    }
    wg.Wait()
    mergeResults()
}
```

---

## 5. 迁移策略

### 5.1 平滑过渡

```json
{
  "compilerOptions": {
    "target": "ES2025",
    "module": "NodeNext",
    // TS 7.0 将支持所有现有选项
  }
}
```

### 5.2 何时迁移

| 场景 | 建议 |
|------|------|
| 新项目 | 直接使用 TS 5.8+，平滑过渡到 7.0 |
| 现有大型项目 | 等待 LTS 版本（预计 2026 Q2） |
| 性能敏感项目 | 评估预览版 |
| 使用复杂类型体操 | 验证类型兼容性 |

---

## 6. 对生态的影响

### 6.1 工具链

- **tsserver**：Go 重写后 IDE 响应更快
- **tsc**：直接可执行文件，无需 Node.js
- **dts 生成**：更快声明文件生成

### 6.2 包管理器

```bash
# 当前
npm install -D typescript
npx tsc

# TS 7.0 可能支持
npm install -D typescript-go
# 或
npx typescript@next
```

---

## 7. 技术挑战

### 7.1 类型系统的复杂性

TypeScript 类型系统是**图灵完备**的，Go 重写需要完整实现：

```typescript
// 条件类型的递归
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
```

### 7.2 Node.js API 依赖

当前 tsc 依赖 Node.js 的文件系统 API，Go 版本需要：
- 自己实现文件系统抽象
- 处理跨平台路径
- 支持符号链接和循环引用

---

**参考规范**：TypeScript GitHub: Project Corsa | TypeScript 5.8 Release Notes

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
