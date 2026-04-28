/**
 * GitHub Copilot 高效使用模式
 *
 * GitHub Copilot 是最广泛使用的 AI 编程助手，
 * 本文件涵盖内联补全、Copilot Chat、Workspace 及提示工程技巧。
 */

// ============================================================
// 1. 内联补全的最佳实践
// ============================================================

/**
 * Copilot 内联补全触发模式
 * 通过精心设计的注释和函数签名引导 Copilot 生成期望的代码。
 */
export enum InlineCompletionTrigger {
  /** 通过详细注释描述功能 */
  DESCRIPTIVE_COMMENT = 'descriptive_comment',
  /** 通过函数签名和返回类型暗示实现 */
  TYPE_HINT = 'type_hint',
  /** 通过示例输入输出 */
  EXAMPLE_DRIVEN = 'example_driven',
  /** 通过部分实现引导 */
  PARTIAL_IMPLEMENTATION = 'partial_implementation',
  /** 通过相似代码模式 */
  PATTERN_REPETITION = 'pattern_repetition',
}

/**
 * 内联补全上下文构建器
 * 生成能够最大化 Copilot 补全质量的上下文代码。
 */
export class InlineCompletionBuilder {
  private lines: string[] = [];

  /**
   * 添加描述性注释
   * @param description 功能描述
   * @param params 参数说明
   * @param returns 返回值说明
   */
  addJSDoc(description: string, params: Record<string, string>, returns: string): this {
    this.lines.push('/**');
    this.lines.push(` * ${description}`);
    Object.entries(params).forEach(([name, desc]) => {
      this.lines.push(` * @param ${name} - ${desc}`);
    });
    this.lines.push(` * @returns ${returns}`);
    this.lines.push(' */');
    return this;
  }

  /**
   * 添加函数签名（带类型）
   * @param name 函数名
   * @param params 参数列表
   * @param returnType 返回类型
   */
  addFunctionSignature(
    name: string,
    params: Array<{ name: string; type: string; optional?: boolean }>,
    returnType: string
  ): this {
    const paramsStr = params
      .map((p) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
      .join(', ');
    this.lines.push(`function ${name}(${paramsStr}): ${returnType} {`);
    return this;
  }

  /**
   * 添加示例数据（帮助 Copilot 理解数据结构）
   */
  addExampleData<T>(variableName: string, example: T): this {
    this.lines.push(`// 示例: ${JSON.stringify(example)}`);
    this.lines.push(`const ${variableName} = ${JSON.stringify(example)};`);
    return this;
  }

  /**
   * 生成引导代码
   */
  build(): string {
    return this.lines.join('\n');
  }
}

/** 示例：引导 Copilot 生成数据验证函数 */
export const inlineCompletionExample = new InlineCompletionBuilder()
  .addJSDoc(
    '验证用户注册表单数据',
    {
      email: '用户邮箱地址',
      password: '用户密码（至少8位）',
      age: '用户年龄（必须 >= 18）',
    },
    '验证通过返回 true，否则抛出 ValidationError'
  )
  .addFunctionSignature(
    'validateRegistration',
    [
      { name: 'email', type: 'string' },
      { name: 'password', type: 'string' },
      { name: 'age', type: 'number' },
    ],
    'boolean'
  )
  .build();

/**
 * 内联补全的"上下文窗口"优化技巧
 * 确保 Copilot 能看到足够的相关代码来生成准确的补全。
 */
export const contextWindowTips = [
  '在文件顶部导入所有相关依赖，Copilot 会据此推断可用 API',
  '相关的类型定义应放在同一文件或已导入的文件中',
  '如果当前文件过长，将相似功能的函数放在一起',
  '在测试文件中，先写几个完整测试作为"范例"，Copilot 会遵循相同模式',
  '使用具名导出而非默认导出，Copilot 更容易识别使用模式',
];

// ============================================================
// 2. Copilot Chat 的使用模式
// ============================================================

/**
 * Copilot Chat 交互模式
 */
export enum CopilotChatMode {
  /** 解释现有代码 */
  EXPLAIN = 'explain',
  /** 修复错误 */
  FIX = 'fix',
  /** 生成文档 */
  DOCUMENT = 'document',
  /** 生成测试 */
  TEST = 'test',
  /** 优化性能 */
  OPTIMIZE = 'optimize',
  /** 代码转换 */
  TRANSFORM = 'transform',
}

/**
 * Copilot Chat Prompt 构建器
 */
export class CopilotChatPromptBuilder {
  private parts: string[] = [];

  /**
   * 设置模式
   */
  setMode(mode: CopilotChatMode): this {
    const modeDescriptions: Record<CopilotChatMode, string> = {
      [CopilotChatMode.EXPLAIN]: '请解释以下代码的工作原理：',
      [CopilotChatMode.FIX]: '以下代码有错误，请修复并解释原因：',
      [CopilotChatMode.DOCUMENT]: '请为以下代码生成详细的 JSDoc 文档：',
      [CopilotChatMode.TEST]: '请为以下代码生成单元测试：',
      [CopilotChatMode.OPTIMIZE]: '请优化以下代码的性能，并解释优化点：',
      [CopilotChatMode.TRANSFORM]: '请将以下代码转换为指定格式：',
    };
    this.parts.push(modeDescriptions[mode]);
    return this;
  }

  /**
   * 添加代码块
   */
  addCode(code: string, language = 'typescript'): this {
    this.parts.push(`\`\`\`${language}\n${code}\n\`\`\``);
    return this;
  }

  /**
   * 添加上下文信息
   */
  addContext(context: string): this {
    this.parts.push(`上下文信息: ${context}`);
    return this;
  }

  /**
   * 添加约束条件
   */
  addConstraint(constraint: string): this {
    this.parts.push(`约束: ${constraint}`);
    return this;
  }

  /**
   * 构建最终 Prompt
   */
  build(): string {
    return this.parts.join('\n\n');
  }
}

/** 示例：使用 Copilot Chat 解释复杂算法 */
export const explainCodeExample = new CopilotChatPromptBuilder()
  .setMode(CopilotChatMode.EXPLAIN)
  .addCode(`function topologicalSort(graph: Map<string, string[]>): string[] {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const result: string[] = [];

  function visit(node: string) {
    if (temp.has(node)) throw new Error('Cycle detected');
    if (visited.has(node)) return;
    temp.add(node);
    for (const dep of graph.get(node) || []) {
      visit(dep);
    }
    temp.delete(node);
    visited.add(node);
    result.unshift(node);
  }

  for (const node of graph.keys()) {
    visit(node);
  }

  return result;
}`)
  .addConstraint('用中文解释，适合初级开发者理解')
  .build();

// ============================================================
// 3. Copilot Workspace（实验性）
// ============================================================

/**
 * Copilot Workspace 任务类型
 * Workspace 允许从自然语言需求直接生成多文件变更。
 */
export interface CopilotWorkspaceTask {
  /** 需求描述 */
  requirement: string;
  /** 涉及的文件路径 */
  affectedFiles: string[];
  /** 预期输出 */
  expectedOutcome: string;
  /** 技术栈约束 */
  techStack: string[];
}

/**
 * 生成 Workspace 任务描述
 * @param task 任务配置
 */
export function buildWorkspaceTask(task: CopilotWorkspaceTask): string {
  return `## 需求
${task.requirement}

## 技术栈
${task.techStack.map((t) => `- ${t}`).join('\n')}

## 涉及文件
${task.affectedFiles.map((f) => `- ${f}`).join('\n')}

## 预期结果
${task.expectedOutcome}

## 约束
1. 所有变更必须在指定文件范围内
2. 保持现有代码风格一致
3. 变更后所有现有测试必须通过
4. 添加必要的类型定义
`;
}

/** 示例：使用 Workspace 添加新功能 */
export const workspaceExample: CopilotWorkspaceTask = {
  requirement: '为用户管理模块添加分页查询功能，支持按用户名搜索和按注册时间排序',
  techStack: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'Zod'],
  affectedFiles: [
    'src/routes/user.ts',
    'src/services/userService.ts',
    'src/validators/userValidator.ts',
    'src/types/pagination.ts',
  ],
  expectedOutcome: `
- GET /api/users 支持 page、limit、search、sortBy、sortOrder 查询参数
- 返回标准分页响应格式 { data, pagination: { page, limit, total, totalPages } }
- 使用 Zod 验证查询参数
- Prisma 查询使用正确的 skip/take/orderBy
`,
};

// ============================================================
// 4. 提示工程技巧（注释即 Prompt）
// ============================================================

/**
 * Copilot 提示模式集合
 * 通过在代码中嵌入特定格式的注释来引导 AI 行为。
 */
export const copilotPromptPatterns = {
  /**
   * 角色设定注释
   * 让 Copilot 以特定角色生成代码。
   */
  rolePrompt: (role: string, task: string): string =>
    `// 你是一个${role}
// 请${task}
`,

  /**
   * 步骤分解注释
   * 将复杂任务分解为步骤，Copilot 会按步骤生成。
   */
  stepByStep: (steps: string[]): string =>
    steps.map((step, i) => `// 步骤 ${i + 1}: ${step}`).join('\n') + '\n',

  /**
   * 输出格式指定
   */
  outputFormat: (format: string): string =>
    `// 输出格式要求: ${format}\n`,

  /**
   * 否定约束（告诉 Copilot 不要做什么）
   */
  negativeConstraint: (constraint: string): string =>
    `// 注意: 不要${constraint}\n`,

  /**
   * 使用特定库/方法
   */
  useSpecific: (library: string, method: string): string =>
    `// 使用 ${library} 的 ${method} 方法实现\n`,

  /**
   * 生成后动作
   */
  postAction: (action: string): string =>
    `// 完成后: ${action}\n`,
};

/** 综合示例：使用多种提示模式 */
export const comprehensivePromptExample = `
// 你是一个精通 TypeScript 的类型安全专家
// 请为以下接口生成 Zod 验证模式
// 步骤 1: 定义基础类型的验证规则
// 步骤 2: 定义嵌套对象的验证规则
// 步骤 3: 组合成完整的验证模式并导出
// 输出格式要求: 使用 z.object() 语法，包含 .email()、.min() 等 refine 规则
// 注意: 不要 any 类型，所有字段必须严格验证
// 完成后: 生成对应的 TypeScript 类型推断

interface UserRegistration {
  email: string;
  password: string;
  confirmPassword: string;
  profile: {
    nickname: string;
    age: number;
    tags: string[];
  };
}
`;

// ============================================================
// 5. 效率优化：快捷键和配置
// ============================================================

/**
 * Copilot 效率配置建议
 */
export const copilotEfficiencyConfig = {
  /** VS Code 设置 */
  vscodeSettings: {
    // 启用 Tab 键接受建议
    'github.copilot.editor.enableAutoCompletions': true,
    // 延迟显示建议（毫秒）
    'github.copilot.editor.enableAutoCompletionsDelay': 50,
    // 内联建议的最大行数
    'editor.inlineSuggest.maxLines': 20,
    // 对特定语言禁用 Copilot
    'github.copilot.enable': {
      '*': true,
      markdown: false,
      plaintext: false,
    },
  },

  /** 常用快捷键 */
  shortcuts: [
    { key: 'Tab', action: '接受当前建议' },
    { key: 'Ctrl + →', action: '逐词接受建议（Windows）' },
    { key: 'Cmd + →', action: '逐词接受建议（Mac）' },
    { key: 'Esc', action: '拒绝当前建议' },
    { key: 'Alt + \\', action: '手动触发建议（Windows）' },
    { key: 'Option + \\', action: '手动触发建议（Mac）' },
    { key: 'Ctrl + Enter', action: '打开 Copilot Chat（Inline）' },
  ],

  /** 提高准确率的实践 */
  accuracyTips: [
    '在函数前添加具体、完整的 JSDoc',
    '使用描述性的变量名（Copilot 会利用命名推断意图）',
    '保持一致的代码风格（缩进、引号等）',
    '导入需要的依赖后再请求补全',
    '对于复杂逻辑，先写伪代码注释再逐行实现',
    '使用类型别名而非内联类型（Copilot 更容易识别）',
  ],
};

/**
 * 检测 Copilot 建议质量的启发式方法
 * 用于自动判断是否应该接受 AI 建议。
 */
export function estimateSuggestionQuality(suggestion: string): {
  score: number;
  concerns: string[];
} {
  const concerns: string[] = [];
  let score = 100;

  // 检测潜在问题模式
  if (suggestion.includes('TODO') || suggestion.includes('FIXME')) {
    concerns.push('建议中包含未完成的 TODO');
    score -= 20;
  }
  if (suggestion.includes('any')) {
    concerns.push('建议使用了 any 类型');
    score -= 15;
  }
  if (suggestion.includes('console.log')) {
    concerns.push('建议中包含调试用的 console.log');
    score -= 10;
  }
  if (suggestion.split('\n').length > 30) {
    concerns.push('建议代码过长，可能需要拆分');
    score -= 10;
  }
  if (/\b(eval|Function|setTimeout\s*\(\s*["'])/.test(suggestion)) {
    concerns.push('建议中包含潜在危险的动态执行');
    score -= 30;
  }

  return { score: Math.max(0, score), concerns };
}
