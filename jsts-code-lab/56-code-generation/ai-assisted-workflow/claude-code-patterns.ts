/**
 * Claude Code 使用模式
 *
 * Claude Code 是 Anthropic 推出的命令行 AI 编程助手，
 * 支持自然语言交互、代码重构、代码审查和批量修改。
 */

// ============================================================
// 1. 自然语言到代码的转换模式
// ============================================================

/**
 * 自然语言需求转代码的 Prompt 结构
 * Claude Code 擅长理解复杂需求并生成结构化代码。
 */
export interface NaturalLanguageToCodePrompt {
  /** 分配给 AI 的角色 */
  role: string;
  /** 业务背景和技术背景 */
  context: string;
  /** 具体的功能需求 */
  requirements: string[];
  /** 技术约束 */
  constraints: string[];
  /** 输出格式要求 */
  outputFormat: string;
}

/**
 * 构建自然语言转代码的 Prompt
 * @param prompt 提示结构
 * @returns 格式化后的 Prompt 字符串
 */
export function buildNLToCodePrompt(prompt: NaturalLanguageToCodePrompt): string {
  return `## 角色
${prompt.role}

## 背景
${prompt.context}

## 需求
${prompt.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 约束
${prompt.constraints.map((c) => `- ${c}`).join('\n')}

## 输出格式
${prompt.outputFormat}
`;
}

/** 示例：将业务需求转换为 API 端点实现 */
export const nlToCodeExample: NaturalLanguageToCodePrompt = {
  role: '经验丰富的 Node.js 后端开发工程师，专注于 RESTful API 设计和 TypeScript。',
  context: '我们正在开发一个电商平台的订单管理系统，使用 Express + TypeScript + Prisma ORM。',
  requirements: [
    '实现订单创建接口 POST /api/orders',
    '需要验证用户身份（JWT）',
    '检查商品库存是否充足',
    '创建订单后扣减库存',
    '发送订单确认邮件（异步）',
    '返回创建的订单详情',
  ],
  constraints: [
    '使用 Prisma 进行数据库操作',
    '所有函数必须有显式返回类型',
    '错误处理使用自定义的 AppError 类',
    '数据库操作需要事务支持',
    '日志使用 winston 记录关键操作',
  ],
  outputFormat: `
1. 提供完整的 TypeScript 代码（包含类型定义）
2. 代码按功能拆分为小函数
3. 包含错误处理中间件
4. 提供 Prisma schema 相关字段说明
5. 提供 curl 测试示例
`,
};

// ============================================================
// 2. 代码重构的 Prompt 工程
// ============================================================

/**
 * 重构策略枚举
 */
export enum RefactoringStrategy {
  /** 提取函数/类 */
  EXTRACT = 'extract',
  /** 重命名以提高清晰度 */
  RENAME = 'rename',
  /** 消除重复代码 */
  DEDUPLICATE = 'deduplicate',
  /** 简化条件逻辑 */
  SIMPLIFY_CONDITIONALS = 'simplify_conditionals',
  /** 引入设计模式 */
  INTRODUCE_PATTERN = 'introduce_pattern',
  /** 现代化语法（ES5→ES6+） */
  MODERNIZE = 'modernize',
  /** 类型安全增强 */
  TYPE_SAFE = 'type_safe',
}

/**
 * 重构任务配置
 */
export interface RefactoringTask {
  strategy: RefactoringStrategy;
  /** 目标代码 */
  sourceCode: string;
  /** 重构目标描述 */
  goal: string;
  /** 需要保持的行为 */
  preservedBehaviors: string[];
  /** 性能要求 */
  performanceConstraints?: string[];
}

/**
 * 生成重构 Prompt
 * @param task 重构任务
 */
export function buildRefactoringPrompt(task: RefactoringTask): string {
  const behaviorText = task.preservedBehaviors
    .map((b) => `  - ${b}`)
    .join('\n');

  const perfText = task.performanceConstraints
    ? `\n### 性能约束\n${task.performanceConstraints.map((p) => `- ${p}`).join('\n')}`
    : '';

  return `## 重构任务

### 策略: ${task.strategy}

### 目标
${task.goal}

### 原始代码
\`\`\`typescript
${task.sourceCode}
\`\`\`

### 必须保持的行为
${behaviorText}${perfText}

### 输出要求
1. 提供重构后的完整代码
2. 说明每一步重构的理由（引用代码片段）
3. 如果引入了新抽象，解释其职责
4. 标记任何潜在的行为变更风险
5. 提供验证重构正确性的测试思路
`;
}

/** 重构示例：将回调地狱转换为 async/await */
export const refactoringExample: RefactoringTask = {
  strategy: RefactoringStrategy.MODERNIZE,
  sourceCode: `function getUserData(userId, callback) {
  db.connect(function(err, conn) {
    if (err) { return callback(err); }
    conn.query('SELECT * FROM users WHERE id = ?', [userId], function(err, rows) {
      if (err) { conn.release(); return callback(err); }
      if (rows.length === 0) { conn.release(); return callback(new Error('Not found')); }
      conn.query('SELECT * FROM orders WHERE user_id = ?', [userId], function(err, orders) {
        conn.release();
        if (err) return callback(err);
        callback(null, { user: rows[0], orders: orders });
      });
    });
  });
}`,
  goal: '将回调式代码重构为使用 async/await 和 Promise 的现代 TypeScript 代码',
  preservedBehaviors: [
    '数据库连接必须在使用后释放',
    '用户不存在时返回 404 错误',
    '查询失败时传递原始错误',
    '返回的数据结构保持不变',
  ],
  performanceConstraints: ['保持连接池的高效使用'],
};

// ============================================================
// 3. 代码审查的 Prompt 模板
// ============================================================

/**
 * 审查维度
 */
export interface ReviewDimension {
  /** 审查类别 */
  category: string;
  /** 检查项列表 */
  checks: string[];
  /** 严重程度 */
  severity: 'info' | 'warning' | 'critical';
}

/**
 * 标准代码审查维度
 */
export const standardReviewDimensions: ReviewDimension[] = [
  {
    category: '代码质量',
    checks: ['函数是否单一职责', '命名是否清晰', '是否存在代码异味'],
    severity: 'warning',
  },
  {
    category: '类型安全',
    checks: ['any 类型使用是否合理', '是否缺少类型守卫', '泛型使用是否恰当'],
    severity: 'critical',
  },
  {
    category: '安全性',
    checks: ['是否存在注入风险', '敏感数据是否脱敏', '权限检查是否完整'],
    severity: 'critical',
  },
  {
    category: '性能',
    checks: ['是否存在 N+1 查询', '循环中是否有冗余计算', '大对象是否按需加载'],
    severity: 'warning',
  },
  {
    category: '可维护性',
    checks: ['是否遵循 SOLID 原则', '依赖关系是否合理', '是否包含必要的注释'],
    severity: 'info',
  },
];

/**
 * 生成代码审查 Prompt
 * @param code 待审查代码
 * @param dimensions 审查维度（默认使用标准维度）
 * @param focusAreas 特别关注领域
 */
export function buildCodeReviewPrompt(
  code: string,
  filePath: string,
  dimensions: ReviewDimension[] = standardReviewDimensions,
  focusAreas: string[] = []
): string {
  const dimensionText = dimensions
    .map(
      (d) => `#### ${d.category} (${d.severity})
${d.checks.map((c) => `- ${c}`).join('\n')}`
    )
    .join('\n\n');

  const focusText =
    focusAreas.length > 0
      ? `\n### 特别关注\n${focusAreas.map((f) => `- ${f}`).join('\n')}\n`
      : '';

  return `## 代码审查请求

### 文件
${filePath}

### 代码
\`\`\`typescript
${code}
\`\`\`

### 审查维度
${dimensionText}${focusText}

### 输出格式
对每个发现的问题，按以下格式输出：

｛
  "severity": "info|warning|critical",
  "category": "问题类别",
  "line": "相关行号或代码片段",
  "issue": "问题描述",
  "suggestion": "改进建议",
  "refactored_code": "建议的重构代码（如有）"
｝

最后给出总体评价和优先修复建议（Top 3）。
`;
}

// ============================================================
// 4. 批量修改的工作流
// ============================================================

/**
 * 批量修改任务类型
 */
export enum BatchModificationType {
  /** 重命名标识符 */
  RENAME_SYMBOL = 'rename_symbol',
  /** 迁移 API 调用 */
  MIGRATE_API = 'migrate_api',
  /** 统一错误处理 */
  UNIFY_ERROR_HANDLING = 'unify_error_handling',
  /** 添加类型注解 */
  ADD_TYPES = 'add_types',
  /** 升级依赖语法 */
  UPGRADE_SYNTAX = 'upgrade_syntax',
}

/**
 * 批量修改任务配置
 */
export interface BatchModificationTask {
  type: BatchModificationType;
  /** 目标文件匹配模式 */
  filePattern: string;
  /** 变更描述 */
  description: string;
  /** 变更规则 */
  rules: Array<{
    /** 匹配模式（字符串或正则描述） */
    match: string;
    /** 替换内容 */
    replace: string;
    /** 适用条件 */
    condition?: string;
  }>;
  /** 需要保持的不变条件 */
  invariants: string[];
}

/**
 * 生成批量修改 Prompt（适用于 Claude Code 的批量编辑）
 * @param task 批量修改任务
 */
export function buildBatchModificationPrompt(task: BatchModificationTask): string {
  const rulesText = task.rules
    .map(
      (r, i) => `${i + 1}. 匹配: \`${r.match}\`
   替换为: \`${r.replace}\`${r.condition ? `\n   条件: ${r.condition}` : ''}`
    )
    .join('\n\n');

  return `## 批量修改任务

### 类型: ${task.type}

### 描述
${task.description}

### 目标文件
匹配模式: \`${task.filePattern}\`

### 修改规则
${rulesText}

### 不变条件（绝对不能改变）
${task.invariants.map((inv) => `- ${inv}`).join('\n')}

### 执行要求
1. 先列出所有匹配到的文件
2. 对每个文件展示变更 diff
3. 说明每个变更的理由
4. 批量应用前等待确认
5. 变更后运行类型检查（tsc --noEmit）确保无错误
`;
}

/** 示例：批量迁移废弃的 API */
export const batchMigrationExample: BatchModificationTask = {
  type: BatchModificationType.MIGRATE_API,
  filePattern: 'src/**/*.ts',
  description: '将项目中所有对旧版 httpClient.get 的调用迁移到新的 request 方法',
  rules: [
    {
      match: 'httpClient.get(url, params)',
      replace: 'httpClient.request("GET", url, { params })',
      condition: '第二个参数是对象（查询参数）',
    },
    {
      match: 'httpClient.get(url)',
      replace: 'httpClient.request("GET", url)',
      condition: '只有一个参数',
    },
  ],
  invariants: [
    '不得改变请求的 HTTP 方法',
    '不得改变请求的 URL',
    '不得改变响应数据的处理逻辑',
    '保持原有的错误处理不变',
  ],
};

// ============================================================
// 5. Claude Code 会话管理工具
// ============================================================

/**
 * Claude Code 会话上下文管理
 * 帮助在多轮对话中保持上下文连贯性。
 */
export class ClaudeSessionManager {
  private context: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  /**
   * 添加用户消息
   */
  addUserMessage(content: string): void {
    this.context.push({ role: 'user', content });
  }

  /**
   * 添加助手消息
   */
  addAssistantMessage(content: string): void {
    this.context.push({ role: 'assistant', content });
  }

  /**
   * 生成带上下文的续接 Prompt
   * 在长时间会话中用于提醒 AI 当前任务背景。
   */
  generateContinuationPrompt(newRequest: string): string {
    const recentContext = this.context
      .slice(-6)
      .map((msg) => `${msg.role === 'user' ? '我' : '你'}: ${msg.content.substring(0, 200)}...`)
      .join('\n');

    return `## 会话上下文（最近几轮）
${recentContext}

## 新请求
${newRequest}

请基于以上上下文继续。如果与之前的工作相关，请保持一致性。
`;
  }

  /**
   * 清空上下文
   */
  clear(): void {
    this.context = [];
  }
}
