/**
 * Cursor IDE 最佳实践
 *
 * Cursor 是一款基于 VS Code 的 AI 原生 IDE，深度集成了 GPT-4/Claude 等大语言模型。
 * 本文件涵盖 Cursor Rules 配置、AI 代码审查、Composer 多文件编辑及测试生成 Prompt。
 */

// ============================================================
// 1. Cursor Rules 配置（.cursorrules）
// ============================================================

/**
 * 推荐的 .cursorrules 文件模板
 * 放置在项目根目录，Cursor 会自动读取并遵循这些规则。
 */
export const cursorRulesTemplate = `
# Cursor Rules for JavaScript/TypeScript Project

## 通用规则
- 优先使用 TypeScript，所有新文件必须是 .ts 或 .tsx
- 遵循项目现有的 ESLint 和 Prettier 配置
- 使用函数式编程风格，避免类继承（除非必要）
- 所有公共 API 必须包含 JSDoc 注释

## 代码风格
- 使用单引号字符串
- 缩进使用 2 个空格
- 最大行宽 100 字符
- 使用显式返回类型（公共函数）

## 命名规范
- 变量/函数: camelCase
- 常量: UPPER_SNAKE_CASE
- 类型/接口: PascalCase
- 文件名: kebab-case.ts

## 错误处理
- 使用自定义错误类，避免直接抛出原始 Error
- 异步函数必须使用 try/catch 或 .catch()
- 用户-facing 的错误消息必须可本地化

## AI 生成约束
- 生成代码后必须询问是否生成对应的单元测试
- 不要生成超过 50 行的函数，超出时拆分为子函数
- 使用现代 ECMAScript 特性（ES2022+）
- 避免使用 any 类型，优先使用 unknown + 类型守卫
`;

// ============================================================
// 2. AI 生成代码的审查清单
// ============================================================

/**
 * AI 代码审查检查项
 * 用于人工复核 AI 生成的代码，确保质量和安全性。
 */
export interface AICodeReviewChecklist {
  /** 代码是否遵循项目编码规范 */
  codingStandards: boolean;
  /** 是否存在类型安全问题（TypeScript） */
  typeSafety: boolean;
  /** 是否包含适当的错误处理 */
  errorHandling: boolean;
  /** 是否存在潜在的安全漏洞（XSS、SQL 注入等） */
  securityRisks: boolean;
  /** 是否有重复代码或可以重构的部分 */
  duplication: boolean;
  /** 变量/函数命名是否清晰表达意图 */
  namingClarity: boolean;
  /** 是否包含必要的注释和文档 */
  documentation: boolean;
  /** 边界条件是否被正确处理 */
  edgeCases: boolean;
  /** 性能是否存在明显问题 */
  performance: boolean;
  /** 依赖的 API 是否最新且有效 */
  apiValidity: boolean;
}

/**
 * 执行审查清单检查
 * @param code AI 生成的代码字符串
 * @returns 审查结果报告
 */
export function performAICodeReview(code: string): {
  checklist: AICodeReviewChecklist;
  issues: string[];
  passed: boolean;
} {
  const issues: string[] = [];

  // 模拟安全检查
  if (code.includes('eval(') || code.includes('Function(')) {
    issues.push('⚠️ 发现动态代码执行，存在安全风险');
  }
  if (code.includes('innerHTML') && !code.includes('DOMPurify')) {
    issues.push('⚠️ 使用 innerHTML 但未进行 XSS 防护');
  }
  if (code.includes('any')) {
    issues.push('⚠️ 发现 any 类型，应替换为更具体的类型');
  }
  if (!code.includes('try') && code.includes('await')) {
    issues.push('⚠️ 异步代码缺少错误处理');
  }

  const checklist: AICodeReviewChecklist = {
    codingStandards: !code.includes('var '),
    typeSafety: !code.includes(': any') && code.includes(': '),
    errorHandling: code.includes('try') || code.includes('.catch'),
    securityRisks: issues.filter((i) => i.includes('安全')).length === 0,
    duplication: !code.includes('// TODO: 重构'),
    namingClarity: true,
    documentation: code.includes('/**') || code.includes('//'),
    edgeCases: code.includes('if (') && code.includes('else'),
    performance: !code.includes('for (let i = 0; i'),
    apiValidity: true,
  };

  const passed = Object.values(checklist).every(Boolean) && issues.length === 0;

  return { checklist, issues, passed };
}

// ============================================================
// 3. Cursor Composer 工作流（多文件编辑）
// ============================================================

/**
 * Composer 工作流模式
 * Cursor Composer 允许 AI 同时编辑多个文件，适合大型重构和功能开发。
 */
export enum ComposerWorkflowMode {
  /** 从零创建多文件模块 */
  SCAFFOLD = 'scaffold',
  /** 跨文件重构 */
  REFACTOR = 'refactor',
  /** 添加横切关注点（日志、错误处理等） */
  CROSS_CUTTING = 'cross_cutting',
  /** 类型定义同步更新 */
  TYPE_SYNC = 'type_sync',
}

/**
 * Composer 任务描述结构
 * 提供给 AI 的上下文信息，帮助其理解多文件关系。
 */
export interface ComposerTask {
  mode: ComposerWorkflowMode;
  /** 需要编辑的文件路径列表 */
  targetFiles: string[];
  /** 任务目标描述 */
  goal: string;
  /** 文件间的依赖关系说明 */
  dependencies: string[];
  /** 约束条件 */
  constraints: string[];
}

/**
 * 创建 Composer 多文件编辑任务
 * @param task 任务配置
 * @returns 格式化后的 Composer Prompt
 */
export function createComposerPrompt(task: ComposerTask): string {
  const constraintText = task.constraints
    .map((c) => `  - ${c}`)
    .join('\n');

  const dependencyText = task.dependencies
    .map((d) => `  - ${d}`)
    .join('\n');

  return `## 任务模式: ${task.mode}

### 目标
${task.goal}

### 涉及文件
${task.targetFiles.map((f) => `- ${f}`).join('\n')}

### 文件依赖关系
${dependencyText}

### 约束条件
${constraintText}

### 要求
1. 同时修改所有相关文件，保持逻辑一致性
2. 每次修改后说明变更原因
3. 如果涉及接口变更，同步更新所有实现和调用方
4. 保持测试可运行状态
`;
}

/** Composer 工作流示例：为现有模块添加日志中间件 */
export const composerExampleTask: ComposerTask = {
  mode: ComposerWorkflowMode.CROSS_CUTTING,
  targetFiles: [
    'src/middleware/logger.ts',
    'src/api/user.ts',
    'src/api/order.ts',
    'src/types/api.ts',
  ],
  goal: '为所有 API 模块添加统一的请求/响应日志记录',
  dependencies: [
    'api/user.ts 和 api/order.ts 都使用 types/api.ts 中的 ApiRequest 类型',
    'logger.ts 需要导出统一的日志函数',
  ],
  constraints: [
    '日志格式必须为 JSON',
    '不要修改 API 的公共接口签名',
    '日志中不得包含敏感信息（密码、token）',
  ],
};

// ============================================================
// 4. AI 生成测试的 Prompt 模板
// ============================================================

/**
 * Cursor 测试生成 Prompt 模板集合
 */
export const cursorTestPrompts = {
  /**
   * 为指定函数生成单元测试
   * @param functionName 目标函数名
   * @param functionCode 函数源码
   * @param testFramework 测试框架（jest/vitest）
   */
  unitTest: (functionName: string, functionCode: string, testFramework: 'jest' | 'vitest' = 'vitest'): string =>
    `请为以下函数生成 ${testFramework} 单元测试。

函数名: ${functionName}

源码:
\`\`\`typescript
${functionCode}
\`\`\`

要求:
1. 覆盖正常路径、边界条件和异常情况
2. 使用 describe + it 结构组织测试
3. 测试名称使用中文描述测试场景
4. 如果需要 mock，使用 vi.fn()（vitest）或 jest.fn()
5. 包含至少 5 个测试用例
6. 输出完整的测试文件代码，可直接运行
`,

  /**
   * 生成组件测试（React/Vue）
   */
  componentTest: (componentName: string, componentCode: string, library: 'react' | 'vue' = 'react'): string =>
    `请为以下 ${library} 组件生成测试代码。

组件名: ${componentName}

源码:
\`\`\`tsx
${componentCode}
\`\`\`

要求:
1. 使用 ${library === 'react' ? '@testing-library/react' : '@vue/test-utils'}
2. 测试用户交互（点击、输入等）
3. 测试 Props 传递和状态变化
4. 包含快照测试（可选）
5. 模拟 API 调用和外部依赖
`,

  /**
   * 生成集成测试
   */
  integrationTest: (moduleName: string, apiEndpoints: string[]): string =>
    `请为模块 "${moduleName}" 生成集成测试。

涉及的 API 端点:
${apiEndpoints.map((e) => `- ${e}`).join('\n')}

要求:
1. 使用 supertest 测试 HTTP 接口
2. 测试完整的数据流（请求 → 处理 → 响应）
3. 测试数据库状态变更（使用内存数据库或事务回滚）
4. 验证错误响应的状态码和错误消息
5. 所有测试完成后清理数据
`,
};

// ============================================================
// 5. 实用函数：从文件内容生成 Cursor Context
// ============================================================

/**
 * 为 Cursor Chat 生成带上下文的 Prompt
 * 自动包含项目相关的类型定义和依赖信息。
 */
export function generateCursorContext(
  userQuery: string,
  relatedFiles: Array<{ path: string; content: string }>
): string {
  const contextBlock = relatedFiles
    .map((file) => `--- ${file.path} ---\n${file.content}\n`)
    .join('\n');

  return `基于以下项目文件上下文，回答我的问题。

${contextBlock}

--- 用户问题 ---
${userQuery}

请提供可以直接复制使用的代码，并简要说明实现思路。
`;
}

/**
 * 快速修复 Prompt：针对特定错误生成修复建议
 */
export function quickFixPrompt(errorMessage: string, codeSnippet: string): string {
  return `我遇到了以下错误，请帮我修复代码。

错误信息:
\`\`\`
${errorMessage}
\`\`\`

相关代码:
\`\`\`typescript
${codeSnippet}
\`\`\`

要求:
1. 解释错误原因
2. 提供修复后的完整代码
3. 说明如何避免类似错误
`;
}
