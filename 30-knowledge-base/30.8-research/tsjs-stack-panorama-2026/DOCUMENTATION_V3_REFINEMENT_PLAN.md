---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 文档第三轮精修计划

> 目标：建立文档间的交叉引用网络，修正时间线/提案状态的不一致，增强全景索引的完整性。
> 策略：小步快跑，聚焦一致性而非内容扩充。

---

## 一、发现的不一致与待修复项

### 🔴 状态错误 1：`import defer` 的 ES 版本归属

- **问题**：`JS_TS_深度技术分析.md` 第 2.1 节写"ES2025 引入了延迟模块求值概念"
- **事实**：`import defer` 是 **TC39 Stage 3**，**未进入 ES2025**。ES2025 中只有 `Promise.try`、Iterator Helpers、Set 方法、`RegExp.escape`、`Float16Array` 等。
- **修复**：将该句修正为"`import defer`（延迟模块求值）作为 TC39 Stage 3 提案正在快速推进，预计进入 ES2026"

### 🔴 状态错误 2：`Temporal` 的 Stage 状态

- **问题**：`JS_TS_深度技术分析.md` 第 2.1 节写"Temporal API：作为 Stage 3 提案持续演进"
- **事实**：Temporal 已于 **2025 年底达到 Stage 4**，是 ES2026 的确定成员（TypeScript 6.0 已内置类型）
- **修复**：修正为"Temporal API：已达 Stage 4，是 ECMAScript 2026 的确定成员"

### 🟡 时间线不一致：`Node.js 24`

- **问题**：各文档中对 Node.js 24 的时间描述有差异
  - `JS_TS_现代运行时深度分析.md`："Node.js 24（2026 年 3 月）"
  - `JS_TS_深度技术分析.md`："Node.js 24（LTS 于 2025 年 10 月发布）"
- **事实**：Node.js 24 的**首个版本**于 **2026 年 3 月**发布，**LTS 通常在 2026 年 10 月**开始
- **修复**：统一为"Node.js 24 于 2026 年 3 月发布，预计同年 10 月进入 LTS"

### 🟡 术语不一致

- **Go 重写**：有的文档写"Corsa"，有的只写"Go 重写"。建议统一为"TypeScript 7.0 / Go 重写（代号 Corsa）"，首次出现时标注代号，后续简写。
- **Type Stripping**：有的写"annotation removal"，有的写"类型剥离"。建议首次出现时写"类型剥离（Type Stripping，即 annotation removal）"

---

## 二、交叉引用网络建设

### T1. `JS_TS_深度技术分析.md` —— 增加"延伸阅读"锚点

在各节末尾或关键概念处，增加 Markdown 内部链接，指向子文档的对应深度分析：

- 第 1 节（语言语义核心特征）→ `JS_TS_语言语义模型全面分析.md`
- 第 3 节（类型系统深度洞察）→ `01_language_core.md` 的约束求解推断章节
- 第 4 节（执行模型深度洞察）→ `04_concurrency.md`
- 第 5 节（运行时与性能洞察）→ `JS_TS_现代运行时深度分析.md`
- 第 2 节（标准化演进）→ `JS_TS_标准化生态与运行时互操作.md`
- 第 3 节末尾（Gradual Typing）→ `JS_TS_学术前沿瞭望.md`

### T2. 新建的两篇瞭望文档 —— 增加"关联文档"小节

- `JS_TS_学术前沿瞭望.md` 末尾增加：
  - "Gradual Typing 的数学基础" → `JS_TS_语言语义模型全面分析.md` §6.1
  - "Structs 与性能模型" → `JS_TS_现代运行时深度分析.md` §2
- `JS_TS_标准化生态与运行时互操作.md` 末尾增加：
  - "运行时互操作的技术基础" → `JS_TS_现代运行时深度分析.md` §4、§5
  - "模块系统的规范演进" → `01_language_core.md` §8.8

### T3. 全景索引文档更新

- `00_全景综述索引与总结.md`：将 7 篇核心文档全部纳入索引，并给出每篇的"阅读建议"（谁应该读、解决什么问题）
- `99_完整分析与总结.md`：将 v3 新增文档（运行时深度分析、标准化生态、学术前沿瞭望）纳入总结性陈述

---

## 三、精修检查清单

| 编号 | 检查项 | 目标文件 | 优先级 | 验收标准 |
|------|--------|----------|--------|----------|
| R1 | 修正 `import defer` Stage 归属 | `JS_TS_深度技术分析.md` | 🔴 P0 | 明确标注 Stage 3，不归属 ES2025 |
| R2 | 修正 Temporal Stage 状态 | `JS_TS_深度技术分析.md` | 🔴 P0 | 标注 Stage 4 / ES2026 确定成员 |
| R3 | 统一 Node.js 24 时间线 | 全部涉及文档 | 🟡 P1 | 发布 2026-03 / LTS 2026-10 |
| R4 | 统一 Corsa / Go 重写术语 | 全部涉及文档 | 🟡 P1 | 首次出现：TypeScript 7.0 / Go 重写（代号 Corsa） |
| R5 | 统一 Type Stripping 术语 | 全部涉及文档 | 🟡 P1 | 首次出现：类型剥离（Type Stripping，即 annotation removal） |
| R6 | 添加交叉引用锚点 | `JS_TS_深度技术分析.md` | 🟢 P2 | 每节 ≥ 1 个内部链接 |
| R7 | 添加关联文档小节 | `JS_TS_学术前沿瞭望.md` | 🟢 P2 | 末尾新增「关联文档」≥ 2 条 |
| R8 | 添加关联文档小节 | `JS_TS_标准化生态与运行时互操作.md` | 🟢 P2 | 末尾新增「关联文档」≥ 2 条 |
| R9 | 更新全景索引 | `00_全景综述索引与总结.md` | 🟢 P2 | 7 篇核心文档 + 阅读建议 |
| R10 | 更新总结陈述 | `99_完整分析与总结.md` | 🟢 P2 | 纳入 v3 新增 3 篇文档 |

---

## 四、优先级矩阵

```
紧急度 ↑
        │  R1,R2          R3,R4,R5
   高   │    ●               ●●●
        │
        │                   R6,R7,R8
   低   │                      ●●●
        │
        └────────────────────────────→ 影响范围
               小                     大
```

- **P0（本周）**：状态错误修正，避免传播错误信息
- **P1（两周内）**：术语与时间线统一，降低读者认知摩擦
- **P2（一个月内）**：交叉引用与索引完善，提升知识网络密度

---

## 五、执行清单

- [ ] T1：`JS_TS_深度技术分析.md` 修正 `import defer`、`Temporal`、Node.js 24 时间线；增加交叉引用
- [ ] T2：`JS_TS_现代运行时深度分析.md` 统一 Node.js 24 时间线；统一 "Go 重写/Corsa" 术语
- [ ] T3：`JS_TS_学术前沿瞭望.md` 增加"关联文档"小节
- [ ] T4：`JS_TS_标准化生态与运行时互操作.md` 增加"关联文档"小节
- [ ] T5：`00_全景综述索引与总结.md` 更新为 v3 完整索引
- [ ] T6：`99_完整分析与总结.md` 更新为 v3 完整总结
- [ ] T7：全局快速检查 `TypeScript 7.0/Corsa`、`Type Stripping` 术语一致性

---

## 六、自动化交叉引用校验脚本

```typescript
// scripts/validate-cross-references.ts
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

interface ValidationResult {
  file: string;
  missing: string[];
  orphaned: string[];
}

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractInternalLinks(content: string): string[] {
  const linkRegex = /\[.*?\]\((?!https?:\/\/)(.+?)\)/g;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1].split('#')[0]); // 去掉锚点
  }
  return links;
}

function validateCrossReferences(baseDir: string): ValidationResult[] {
  const files = findMarkdownFiles(baseDir);
  const fileSet = new Set(files.map((f) => relative(baseDir, f)));
  const results: ValidationResult[] = [];

  for (const file of files) {
    const relPath = relative(baseDir, file);
    const content = readFileSync(file, 'utf-8');
    const links = extractInternalLinks(content);

    const missing = links.filter((link) => {
      const resolved = join(baseDir, link);
      return !fileSet.has(link) && !fileSet.has(relative(baseDir, resolved));
    });

    if (missing.length > 0) {
      results.push({ file: relPath, missing, orphaned: [] });
    }
  }

  return results;
}

// 运行：
// const issues = validateCrossReferences('./30-knowledge-base');
// issues.forEach(i => console.log(`${i.file}: missing ${i.missing.join(', ')}`));
```

---

## 七、参考链接

- [TC39 Proposals – GitHub](https://github.com/tc39/proposals)
- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)
- [TypeScript 7.0 Roadmap / Corsa](https://devblogs.microsoft.com/typescript/)
- [ES2025 Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [ECMA-262 规范](https://tc39.es/ecma262/)
- [TypeScript 设计目标](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)
- [Deno 官方博客 — Type Stripping](https://deno.com/blog/v2.0)
- [Bun 运行时文档](https://bun.sh/docs)
- [Node.js 官方文档](https://nodejs.org/docs/latest/api/)
- [WebAssembly 规范](https://webassembly.github.io/spec/)
- [本项目全景索引](../00_全景综述索引与总结.md)

---

预计用时：**1 天**


---

## 深化补充：自动化脚本与权威链接

### GitHub Actions 交叉引用校验工作流

```yaml
# .github/workflows/validate-cross-references.yml
name: Validate Cross References
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # 每周一自动运行

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install -g tsx
      - run: tsx scripts/validate-cross-references.ts ./30-knowledge-base
```

---

### 更多权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| TC39 Process | <https://tc39.es/process-document/> | ECMAScript 提案流程 |
| Node.js Release Schedule | <https://nodejs.org/en/about/previous-releases> | 官方发布时间表 |
| TypeScript 7.0 Roadmap | <https://devblogs.microsoft.com/typescript/> | 微软 TypeScript 博客 |
| ECMA-262 Specification | <https://tc39.es/ecma262/> | ECMAScript 语言规范 |
| Deno Type Stripping | <https://deno.com/blog/v2.0> | Deno 类型剥离博客 |
| Bun Runtime Docs | <https://bun.sh/docs> | Bun 官方文档 |
| WebAssembly Spec | <https://webassembly.github.io/spec/> | WASM 规范 |
| MDN Web Docs | <https://developer.mozilla.org/> | Web 技术权威文档 |
