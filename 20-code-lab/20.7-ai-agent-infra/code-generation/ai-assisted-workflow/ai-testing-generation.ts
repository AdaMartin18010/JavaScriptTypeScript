/**
 * AI 生成测试的策略
 *
 * 本文件提供使用 AI（Cursor/Claude/Copilot 等）生成高质量测试的 Prompt 模板、
 * 策略指导和质量管控方法。
 */

// ============================================================
// 1. 从代码生成单元测试的 Prompt
// ============================================================

/**
 * 测试框架配置
 */
export interface TestFrameworkConfig {
  name: 'vitest' | 'jest' | 'mocha' | 'node:test';
  assertionLibrary?: 'chai' | 'expect' | 'assert';
  mockingLibrary?: 'vi' | 'jest' | 'sinon';
  useTypeScript: boolean;
}

/**
 * 单元测试 Prompt 参数
 */
export interface UnitTestPromptParams {
  /** 被测函数/类的源码 */
  sourceCode: string;
  /** 文件路径 */
  filePath: string;
  /** 测试框架 */
  framework: TestFrameworkConfig;
  /** 额外依赖信息 */
  dependencies?: string[];
  /** 覆盖率要求 */
  coverageTarget?: 'basic' | 'comprehensive' | 'edge-case-heavy';
}

/**
 * 生成单元测试 Prompt
 * @param params 参数配置
 */
export function generateUnitTestPrompt(params: UnitTestPromptParams): string {
  const coverageRequirements: Record<string, string[]> = {
    basic: ['正常路径', '一个主要异常情况'],
    comprehensive: ['正常路径', '所有参数边界', '异常情况', '空值/零值处理'],
    'edge-case-heavy': [
      '正常路径',
      '所有参数边界（最大、最小、零、负值）',
      '异常情况（Error、Promise reject）',
      '空值/undefined/null 处理',
      '并发/竞态条件（如适用）',
      '大输入量性能测试',
    ],
  };

  const coverageItems = coverageRequirements[params.coverageTarget || 'comprehensive'];

  return `## 任务
请为以下代码生成单元测试。

## 源文件
路径: ${params.filePath}

\`\`\`typescript
${params.sourceCode}
\`\`\`

## 测试框架
- 框架: ${params.framework.name}
- 语言: ${params.framework.useTypeScript ? 'TypeScript' : 'JavaScript'}
${params.framework.mockingLibrary ? `- Mock 工具: ${params.framework.mockingLibrary}` : ''}

## 覆盖率要求
${coverageItems.map((item) => `- ${item}`).join('\n')}

## 输出要求
1. 测试文件路径建议: ${params.filePath.replace(/\.ts$/, '.test.ts')}
2. 使用 describe/it 结构，describe 描述被测对象，it 描述具体场景
3. 测试名称使用中文描述测试意图
4. 每个测试只验证一个概念
5. 使用 Arrange-Act-Assert 结构组织测试代码
6. 包含必要的 setup 和 teardown
7. Mock 外部依赖（数据库、API、文件系统等）
8. 添加注释说明复杂的测试数据构造逻辑
`;
}

/** 示例：为工具函数生成单元测试 */
export const unitTestExample = generateUnitTestPrompt({
  sourceCode: `export function parseDateRange(
  rangeStr: string
): { start: Date; end: Date } | null {
  const patterns = [
    { regex: /^(\\d{4})-(\\d{2})$/, type: 'month' as const },
    { regex: /^(\\d{4})-Q([1-4])$/, type: 'quarter' as const },
    { regex: /^(\\d{4})$/, type: 'year' as const },
  ];

  for (const pattern of patterns) {
    const match = rangeStr.match(pattern.regex);
    if (!match) continue;

    const year = parseInt(match[1], 10);
    if (pattern.type === 'month') {
      const month = parseInt(match[2], 10) - 1;
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59),
      };
    }
    // ... 其他模式
  }

  return null;
}`,
  filePath: 'src/utils/dateParser.ts',
  framework: { name: 'vitest', mockingLibrary: 'vi', useTypeScript: true },
  coverageTarget: 'comprehensive',
});

// ============================================================
// 2. 从用户故事生成 E2E 测试的 Prompt
// ============================================================

/**
 * 用户故事结构
 */
export interface UserStory {
  /** 作为... */
  role: string;
  /** 我想要... */
  goal: string;
  /** 以便于... */
  benefit: string;
  /** 验收标准 */
  acceptanceCriteria: string[];
}

/**
 * E2E 测试配置
 */
export interface E2ETestConfig {
  tool: 'playwright' | 'cypress' | 'selenium';
  baseUrl: string;
  authRequired?: boolean;
  testDataSetup?: string;
}

/**
 * 从用户故事生成 E2E 测试 Prompt
 * @param story 用户故事
 * @param config E2E 配置
 */
export function generateE2ETestPrompt(story: UserStory, config: E2ETestConfig): string {
  return `## 任务
请根据以下用户故事生成端到端（E2E）测试代码。

## 用户故事
- 作为: ${story.role}
- 我想要: ${story.goal}
- 以便于: ${story.benefit}

## 验收标准
${story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 技术配置
- 测试工具: ${config.tool}
- 基础 URL: ${config.baseUrl}
- 认证要求: ${config.authRequired ? '需要登录' : '无需认证'}
${config.testDataSetup ? `- 测试数据准备: ${config.testDataSetup}` : ''}

## 输出要求
1. 每个验收标准对应一个 test 用例
2. 使用 Page Object Model 模式组织页面操作
3. 测试步骤使用中文注释说明
4. 包含测试数据的创建和清理
5. 断言需验证页面元素、URL、API 响应（如适用）
6. 失败时自动截图
7. 测试之间相互独立，可并行执行
`;
}

/** 示例：电商订单流程 E2E 测试 */
export const e2eTestExample = generateE2ETestPrompt(
  {
    role: '已登录的用户',
    goal: '将商品添加到购物车并完成结算',
    benefit: '能够在线购买商品',
    acceptanceCriteria: [
      '用户可以从商品详情页点击"加入购物车"',
      '购物车页面显示已添加的商品和数量',
      '用户可以修改商品数量',
      '结算页面正确计算总价（含税费和运费）',
      '提交订单后显示成功页面并发送确认邮件',
    ],
  },
  {
    tool: 'playwright',
    baseUrl: 'https://shop.example.com',
    authRequired: true,
    testDataSetup: '使用 API 预先创建测试商品和测试用户',
  }
);

// ============================================================
// 3. AI 生成测试的局限性
// ============================================================

/**
 * AI 生成测试的已知局限性
 * 了解这些局限性有助于更好地审查和补充 AI 生成的测试。
 */
export const aiTestingLimitations = {
  /** 边界条件 */
  boundaryConditions: {
    description: 'AI 经常遗漏极端边界条件',
    examples: [
      '空数组/空字符串/空对象的处理',
      'Number.MAX_SAFE_INTEGER 附近的值',
      'Unicode 特殊字符和 emoji',
      '时区切换和闰年日期',
      '并发访问的竞态条件',
    ],
    mitigation: '在 Prompt 中显式要求"测试所有边界条件"，并人工审查边界覆盖',
  },

  /** 异步测试 */
  asyncTesting: {
    description: 'AI 生成的异步测试可能存在时序问题',
    commonMistakes: [
      '缺少 await 导致测试提前结束',
      '未处理 Promise rejection',
      'setTimeout/setInterval 未清理',
      'EventEmitter 监听器未移除',
      '数据库连接未在测试后关闭',
    ],
    mitigation: '要求 AI 使用 async/await 模式，并要求包含 cleanup 逻辑',
  },

  /** 测试数据 */
  testData: {
    description: 'AI 生成的测试数据可能不够真实或遗漏关键场景',
    examples: [
      '使用过于简单的假数据（foo/bar/baz）',
      '未考虑数据之间的关系（外键约束）',
      '缺少大规模数据的压力测试',
      '未测试特殊字符和注入尝试',
    ],
    mitigation: '提供真实数据样本，要求 AI 基于样本生成测试数据',
  },

  /** 测试可读性 */
  readability: {
    description: 'AI 可能生成难以理解的测试',
    symptoms: [
      '一个测试验证太多东西',
      '测试名称描述不清',
      '缺少注释解释复杂的构造',
      '过度使用魔法数字',
    ],
    mitigation: '要求 AI 遵循 Arrange-Act-Assert 结构，并限制每个测试的断言数量',
  },
};

/**
 * 检查 AI 生成测试的质量
 * @param testCode 测试代码字符串
 * @returns 质量评估报告
 */
export function evaluateGeneratedTests(testCode: string): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 检查常见问题
  if (!testCode.includes('describe')) {
    issues.push('缺少 describe 分组');
  }
  if ((testCode.match(/expect\(/g) || []).length < 2) {
    issues.push('断言数量过少');
  }
  if (testCode.includes('any') && testCode.includes('TypeScript')) {
    issues.push('测试中使用了 any 类型');
  }
  if (!testCode.includes('await') && testCode.includes('async')) {
    issues.push('声明了 async 但未使用 await');
  }
  if (testCode.includes('setTimeout') && !testCode.includes('clearTimeout')) {
    issues.push('可能缺少定时器清理');
  }

  // 检查覆盖率迹象
  if (!testCode.includes('null') && !testCode.includes('undefined')) {
    recommendations.push('建议增加 null/undefined 边界测试');
  }
  if (!testCode.includes('Error') && !testCode.includes('throw')) {
    recommendations.push('建议增加异常路径测试');
  }
  if (!testCode.includes('[]') && !testCode.includes("''")) {
    recommendations.push('建议增加空值边界测试');
  }

  const score = Math.max(0, 100 - issues.length * 15);

  return { score, issues, recommendations };
}

// ============================================================
// 4. 人机协作：AI 生成 + 人工审查
// ============================================================

/**
 * 人机协作测试生成工作流
 */
export enum TestGenerationWorkflow {
  /** AI 初稿 → 人工审查 → AI 修正 */
  ITERATIVE = 'iterative',
  /** AI 生成 → 人工补充边界 → AI 整合 */
  HYBRID = 'hybrid',
  /** 人工写核心测试 → AI 扩展覆盖 */
  HUMAN_FIRST = 'human_first',
}

/**
 * 测试审查清单
 */
export interface TestReviewChecklist {
  /** 逻辑覆盖 */
  logicCoverage: boolean;
  /** 边界条件 */
  boundaryCoverage: boolean;
  /** 错误处理 */
  errorHandling: boolean;
  /** 测试独立性 */
  testIsolation: boolean;
  /** 可维护性 */
  maintainability: boolean;
  /** 运行速度 */
  executionSpeed: boolean;
}

/**
 * 协作工作流配置
 */
export interface CollaborativeWorkflowConfig {
  workflow: TestGenerationWorkflow;
  /** AI 负责的部分 */
  aiResponsibilities: string[];
  /** 人工负责的部分 */
  humanResponsibilities: string[];
  /** 审查阈值（AI 生成测试的最低质量分） */
  reviewThreshold: number;
}

/**
 * 标准协作工作流配置
 */
export const standardCollaborativeWorkflow: CollaborativeWorkflowConfig = {
  workflow: TestGenerationWorkflow.ITERATIVE,
  aiResponsibilities: [
    '生成基础测试框架和正常路径测试',
    '为常见边界条件生成测试',
    '编写测试辅助函数和 fixtures',
    '生成 Mock 数据和 stub 实现',
  ],
  humanResponsibilities: [
    '审查边界条件是否充分',
    '补充业务特定的边界场景',
    '验证测试是否真正验证了预期行为（而非实现细节）',
    '确保测试名称准确描述测试意图',
    '优化测试执行性能',
  ],
  reviewThreshold: 80,
};

/**
 * 生成协作工作流 Prompt
 * 告诉 AI 它在协作中的角色和边界。
 */
export function generateCollaborativePrompt(
  config: CollaborativeWorkflowConfig,
  task: string
): string {
  return `## 工作模式: 人机协作

### 我的角色（人类开发者）
${config.humanResponsibilities.map((r) => `- ${r}`).join('\n')}

### 你的角色（AI 助手）
${config.aiResponsibilities.map((r) => `- ${r}`).join('\n')}

### 质量门槛
AI 生成的测试质量分必须达到 ${config.reviewThreshold}/100 以上。

### 当前任务
${task}

### 交互规则
1. 先生成初稿并自我评估质量
2. 明确标出"需要人工审查的部分"
3. 对不确定的边界条件使用 TODO 标记
4. 接受反馈后进行迭代改进
`;
}

// ============================================================
// 5. 测试 Prompt 模板库
// ============================================================

/**
 * 预设测试生成 Prompt 模板
 */
export const testPromptTemplates = {
  /** React 组件测试 */
  reactComponent: (componentName: string, props: string[]): string =>
    `请为 React 组件 "${componentName}" 生成测试。

Props: ${props.join(', ')}

要求:
1. 使用 @testing-library/react 和 vitest
2. 测试渲染输出、Props 传递、用户交互
3. 使用 screen.getByRole 等语义化查询
4. 模拟 API 调用和路由参数
5. 测试无障碍属性（aria-label 等）
6. 使用 userEvent 模拟真实用户行为
`,

  /** API 端点测试 */
  apiEndpoint: (method: string, path: string, expectedStatus: number): string =>
    `请为 ${method.toUpperCase()} ${path} 接口生成测试。

预期状态码: ${expectedStatus}

要求:
1. 使用 vitest + supertest
2. 测试正常请求、参数验证失败、认证失败
3. Mock 数据库层和外部服务
4. 验证响应结构符合 Zod schema
5. 每个测试独立，自动清理数据
`,

  /** 自定义 Hook 测试 */
  customHook: (hookName: string): string =>
    `请为自定义 Hook "${hookName}" 生成测试。

要求:
1. 使用 @testing-library/react 的 renderHook
2. 测试初始状态、状态更新、副作用清理
3. 模拟依赖的 context 和外部服务
4. 测试 hook 在组件卸载时的清理行为
`,

  /** 工具函数测试 */
  utilityFunction: (functionName: string, inputTypes: string, outputType: string): string =>
    `请为纯函数 "${functionName}" 生成全面测试。

签名: (${inputTypes}) => ${outputType}

要求:
1. 基于属性测试（property-based）思路生成边界用例
2. 输入空间覆盖: 有效值、边界值、异常值
3. 验证输出满足所有后置条件
4. 纯函数必须测试引用透明性（相同输入始终相同输出）
`,
};
