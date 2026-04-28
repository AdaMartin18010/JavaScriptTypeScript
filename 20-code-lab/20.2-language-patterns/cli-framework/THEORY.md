# CLI 框架理论：从脚本到产品级工具

> **目标读者**：工具开发者、DevOps 工程师、关注开发者体验的团队
> **关联文档**：``30.2-categories/cli-framework.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 2,800 字

---

## 1. CLI 设计原则

### 1.1 Unix 哲学

```
1. 每个程序只做一件事，并把它做好
2. 程序的输出应该是另一个程序的输入
3. 使用文本流作为通用接口
```

### 1.2 现代 CLI 要素

| 要素 | 示例 | 库 |
|------|------|-----|
| **参数解析** | `mycli --port 3000` | Commander.js, Yargs, Clap |
| **交互提示** | 选择列表、输入验证 | Inquirer, @clack/prompts |
| **进度展示** | 进度条、旋转器 | Ora, Consola |
| **颜色输出** | 错误红、成功绿 | Chalk, Picocolors |
| **自动补全** | Tab 补全命令 | Omelette, Fig |
| **帮助文档** | `--help` 自动生成 | Commander's built-in |

---

## 2. JS/TS CLI 生态

### 2.1 框架选型

| 框架 | 特点 | 适用 |
|------|------|------|
| **Commander.js** | 经典、稳定 | 通用 CLI |
| **Yargs** | 强大的中间件 | 复杂参数 |
| **Clack** | 现代、美观 | 交互式 CLI |
| **Ink** | React 渲染终端 | 复杂 TUI |
| **Oclif** | Heroku 出品 | 大型 CLI 框架 |

### 2.2 打包与分发

```bash
# 方案 1: npm 全局安装
npm install -g mycli

# 方案 2: npx（无需安装）
npx mycli

# 方案 3: 独立可执行文件
pkg .       # 打包为二进制
bun build --compile   # Bun 编译
```

---

## 3. 测试 CLI

```typescript
import { execa } from 'execa';

 test('should show help', async () => {
  const { stdout } = await execa('node', ['./bin/cli.js', '--help']);
  expect(stdout).toContain('Usage:');
});
```

---

## 4. 反模式

### 反模式 1：静默失败

❌ 命令失败无任何输出。
✅ 明确错误信息 + 退出码非零。

### 反模式 2：破坏管道

❌ 输出包含装饰字符（emoji、颜色码），无法管道处理。
✅ 检测 `process.stdout.isTTY`，非终端环境禁用装饰。

---

## 5. 总结

CLI 是**开发者体验的第一触点**。

**核心原则**：

1. 快速启动 (< 100ms)
2. 清晰的错误信息
3. 遵循 POSIX 惯例

---

## 参考资源

- [Commander.js](https://github.com/tj/commander.js/)
- [Clack](https://github.com/natemoo-re/clack)
- [Ink](https://github.com/vadimdemedes/ink)
- [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `argument-validator.ts`
- `cli-builder.ts`
- `command-parser.ts`
- `config-loader.ts`
- `help-generator.ts`
- `index.ts`
- `interactive-prompt.ts`
- `progress-bar.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
