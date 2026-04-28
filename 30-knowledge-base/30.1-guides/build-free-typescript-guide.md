# Build-Free TypeScript 指南

> **定位**：`30-knowledge-base/30.1-guides/`
> **新增**：2026-04

---

## 一、范式转移：从编译到直接执行

2026 年，JavaScript 运行时的最大变革之一是**原生 TypeScript 执行**（Type Stripping）：

| 运行时 | 命令 | 状态 | 特性 |
|--------|------|------|------|
| **Node.js 24+** | `node --experimental-strip-types` | 🧪 实验 | 仅移除类型注解 |
| **Deno 2.7+** | `deno run file.ts` | ✅ 稳定 | 原生执行，类型检查分离 |
| **Bun 1.3+** | `bun run file.ts` | ✅ 稳定 | 内置超快转译器 |

---

## 二、三种执行模式对比

```
传统模式（2020-2024）:
.ts ──► tsc ──► .js ──► node
     类型检查    编译      执行

Type Stripping 模式（2026）:
.ts ──► 运行时 strip-types ──► 执行
     直接移除类型注解，不检查

分离模式（推荐）:
.ts ──► tsc --noEmit（CI检查）
  │
  └──► 运行时 strip-types ──► 执行
```

---

## 三、Node.js `--experimental-strip-types`

### 3.1 基本用法

```bash
# 直接执行 TS 文件
node --experimental-strip-types app.ts

# 启用 watch 模式
node --experimental-strip-types --watch app.ts

# package.json
{
  "scripts": {
    "start": "node --experimental-strip-types app.ts",
    "dev": "node --experimental-strip-types --watch app.ts"
  }
}
```

### 3.2 限制

| 特性 | 支持状态 | 说明 |
|------|---------|------|
| 类型注解 | ✅ | 完全移除 |
| `enum` | ✅ | 转换为对象 |
| `namespace` | ✅ | 转换 |
| `interface` / `type` | ✅ | 完全移除 |
| 装饰器 | ❌ | 需 tsc 编译 |
| `const enum` | ✅ | 内联 |
| JSX/TSX | 🧪 | 实验支持 |

---

## 四、Deno 原生 TS

```bash
# 无需配置，直接执行
deno run app.ts

# 类型检查与执行分离
deno check app.ts      # 显式类型检查
deno run --no-check app.ts  # 跳过类型检查，纯执行
```

**优势**：零配置、内置格式化/测试/打包、权限沙盒。

---

## 五、Bun 原生 TS

```bash
# 最快执行
bun run app.ts

# 内置 bundler + TS 支持
bun build app.ts --outdir dist
```

**性能数据**：Bun 的 TS 启动速度是 `tsx` 的 3-5 倍，是 `ts-node` 的 10-20 倍。

---

## 六、迁移决策矩阵

| 当前工具 | 迁移目标 | 工作量 | 收益 |
|---------|---------|--------|------|
| `ts-node` | `node --experimental-strip-types` | 低 | 减少依赖 |
| `tsx` | `bun run` | 低 | 启动加速 |
| `tsc + node` | `deno run` | 中 | 工具链简化 |
| 复杂构建（webpack） | `bun build` | 高 | 构建加速 |

---

*本指南反映 2026 年 TypeScript 执行范式的变革。*
