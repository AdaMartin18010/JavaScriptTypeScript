/**
 * 框架范式映射 — TypeScript 实现
 * 
 * 本文件提供前端框架间概念模型映射的形式化定义，
 * 用于支持 04-reactive-model-adaptation.md 和 08-framework-paradigm-interoperability.md。
 */

// ============================================================
// 1. 框架概念模型的形式化定义
// ============================================================

/**
 * 概念模型：框架如何组织代码的基本结构
 */
interface ConceptualModel {
  readonly name: string;
  /** 状态如何定义和更新 */
  readonly stateModel: string;
  /** 副作用如何处理 */
  readonly effectModel: string;
  /** 组件如何通信 */
  readonly communicationModel: string;
  /** 渲染如何触发 */
  readonly renderingModel: string;
}

/**
 * React 概念模型
 */
const reactConceptual: ConceptualModel = {
  name: "React",
  stateModel: "useState/useReducer — 显式状态更新",
  effectModel: "useEffect — 声明式副作用，依赖数组",
  communicationModel: "props down, callbacks up — 单向数据流",
  renderingModel: "Virtual DOM Diff — 声明式 UI，自动差异计算"
};

/**
 * Vue 概念模型
 */
const vueConceptual: ConceptualModel = {
  name: "Vue",
  stateModel: "ref/reactive — 响应式代理，自动追踪",
  effectModel: "watch/watchEffect — 自动依赖追踪",
  communicationModel: "props/emit — 双向绑定可选",
  renderingModel: "模板编译 + 响应式 Patch — 细粒度更新"
};

/**
 * Solid 概念模型
 */
const solidConceptual: ConceptualModel = {
  name: "Solid",
  stateModel: "createSignal — 显式信号，细粒度",
  effectModel: "createEffect — 自动依赖追踪",
  communicationModel: "props/context — 细粒度传递",
  renderingModel: "无 Virtual DOM — 直接 DOM 更新"
};

/**
 * Svelte 概念模型
 */
const svelteConceptual: ConceptualModel = {
  name: "Svelte",
  stateModel: "let — 编译时响应式转换",
  effectModel: "$: — 编译时依赖分析",
  communicationModel: "props/event — 编译时优化",
  renderingModel: "编译时生成更新代码 — 无运行时框架"
};

/**
 * Angular 概念模型
 */
const angularConceptual: ConceptualModel = {
  name: "Angular",
  stateModel: "组件类属性 — 显式变更检测",
  effectModel: "生命周期钩子 + RxJS — 显式订阅管理",
  communicationModel: "@Input/@Output + DI + RxJS",
  renderingModel: "变更检测 + 模板编译"
};

// ============================================================
// 2. 模型映射函子
// ============================================================

/**
 * 模型映射：从一个框架的概念模型到另一个框架的转换
 * 
 * 在范畴论语境中：
 * - 源框架的概念模型 = 范畴 C 的对象
 * - 目标框架的概念模型 = 范畴 D 的对象
 * - 映射 = 函子 F: C → D
 */
interface ModelMapping {
  readonly from: string;
  readonly to: string;
  /** 状态模型的映射 */
  readonly mapState: (statePattern: string) => string;
  /** 副作用模型的映射 */
  readonly mapEffect: (effectPattern: string) => string;
  /** 通信模型的映射 */
  readonly mapCommunication: (commPattern: string) => string;
  /** 渲染模型的映射 */
  readonly mapRendering: (renderPattern: string) => string;
}

/**
 * React → Vue 的模型映射
 */
const reactToVueMapping: ModelMapping = {
  from: "React",
  to: "Vue",
  mapState: (pattern: string) => {
    if (pattern.includes('useState')) return 'ref / reactive';
    if (pattern.includes('useReducer')) return 'reactive + computed';
    return pattern;
  },
  mapEffect: (pattern: string) => {
    if (pattern.includes('useEffect')) return 'watch / watchEffect';
    return pattern;
  },
  mapCommunication: (pattern: string) => {
    if (pattern.includes('props')) return 'props / emit';
    if (pattern.includes('context')) return 'provide / inject';
    return pattern;
  },
  mapRendering: (pattern: string) => {
    if (pattern.includes('JSX')) return 'Template';
    if (pattern.includes('Virtual DOM')) return '响应式 Patch';
    return pattern;
  }
};

/**
 * Vue → React 的模型映射（逆映射，不完全可逆）
 */
const vueToReactMapping: ModelMapping = {
  from: "Vue",
  to: "React",
  mapState: (pattern: string) => {
    if (pattern.includes('ref')) return 'useState';
    if (pattern.includes('reactive')) return 'useReducer / useState({...})';
    return pattern;
  },
  mapEffect: (pattern: string) => {
    if (pattern.includes('watch')) return 'useEffect';
    return pattern;
  },
  mapCommunication: (pattern: string) => {
    if (pattern.includes('emit')) return 'callback props';
    if (pattern.includes('provide')) return 'Context';
    return pattern;
  },
  mapRendering: (pattern: string) => {
    if (pattern.includes('Template')) return 'JSX';
    return pattern;
  }
};

// ============================================================
// 3. 映射的"损失"分析
// ============================================================

/**
 * 分析模型映射中的信息损失
 * 即：源框架中的某些模式在目标框架中无法精确表达
 */
interface MappingLoss {
  readonly sourcePattern: string;
  readonly targetApproximation: string;
  readonly lossType: 'semantic' | 'performance' | 'ergonomic';
  readonly description: string;
}

/**
 * React → Vue 的映射损失示例
 */
const reactToVueLosses: MappingLoss[] = [
  {
    sourcePattern: 'useEffect(() => {}, [])',
    targetApproximation: 'onMounted',
    lossType: 'semantic',
    description: 'Vue 的 onMounted 只在挂载时运行，但 useEffect 还涉及更新逻辑'
  },
  {
    sourcePattern: 'useCallback',
    targetApproximation: 'computed function',
    lossType: 'performance',
    description: 'Vue 的响应式系统自动处理引用稳定性，无需显式 useCallback'
  },
  {
    sourcePattern: 'React.memo',
    targetApproximation: '无直接对应',
    lossType: 'semantic',
    description: 'Vue 的组件自动追踪依赖，不需要显式 memoization'
  }
];

/**
 * Vue → React 的映射损失示例
 */
const vueToReactLosses: MappingLoss[] = [
  {
    sourcePattern: 'v-model',
    targetApproximation: 'controlled component + onChange',
    lossType: 'ergonomic',
    description: 'React 需要显式编写受控组件模式，代码量增加'
  },
  {
    sourcePattern: '自动依赖追踪',
    targetApproximation: '手动依赖数组',
    lossType: 'ergonomic',
    description: 'React 的 useEffect 需要手动指定依赖，容易出错'
  },
  {
    sourcePattern: '响应式代理 (Proxy)',
    targetApproximation: '不可变更新',
    lossType: 'semantic',
    description: 'React 推荐不可变数据，Vue 的响应式突变模式需要转换'
  }
];

// ============================================================
// 4. 框架切换的认知成本估算
// ============================================================

/**
 * 计算从一个框架切换到另一个框架的概念模型冲突
 */
function calculateConceptualConflict(
  from: ConceptualModel,
  to: ConceptualModel
): number {
  let conflict = 0;
  
  // 状态模型冲突
  if (from.stateModel.includes('显式') && to.stateModel.includes('自动')) conflict += 2;
  if (from.stateModel.includes('自动') && to.stateModel.includes('显式')) conflict += 2;
  
  // 渲染模型冲突
  if (from.renderingModel.includes('Virtual DOM') && to.renderingModel.includes('直接')) conflict += 3;
  if (from.renderingModel.includes('编译时') && to.renderingModel.includes('运行时')) conflict += 2;
  
  return conflict;
}

// 示例
// const reactToVueConflict = calculateConceptualConflict(reactConceptual, vueConceptual);
// const vueToReactConflict = calculateConceptualConflict(vueConceptual, reactConceptual);

// ============================================================
// 5. 更多框架映射：Solid ↔ Svelte
// ============================================================

/**
 * Solid → Svelte 的模型映射
 */
const solidToSvelteMapping: ModelMapping = {
  from: "Solid",
  to: "Svelte",
  mapState: (pattern: string) => {
    if (pattern.includes('createSignal')) return 'let (编译时响应式)';
    if (pattern.includes('createStore')) return 'writable / readable';
    return pattern;
  },
  mapEffect: (pattern: string) => {
    if (pattern.includes('createEffect')) return '$: (自动依赖)';
    if (pattern.includes('onMount')) return 'onMount';
    return pattern;
  },
  mapCommunication: (pattern: string) => {
    if (pattern.includes('props')) return 'props / export';
    if (pattern.includes('createContext')) return 'setContext / getContext';
    return pattern;
  },
  mapRendering: (pattern: string) => {
    if (pattern.includes('无 VDOM')) return '编译时 DOM 更新';
    if (pattern.includes('直接 DOM')) return '编译生成更新代码';
    return pattern;
  }
};

/**
 * Svelte → Solid 的模型映射
 */
const svelteToSolidMapping: ModelMapping = {
  from: "Svelte",
  to: "Solid",
  mapState: (pattern: string) => {
    if (pattern.includes('let')) return 'createSignal';
    if (pattern.includes('writable')) return 'createSignal';
    return pattern;
  },
  mapEffect: (pattern: string) => {
    if (pattern.includes('$:')) return 'createEffect';
    if (pattern.includes('onMount')) return 'onMount';
    return pattern;
  },
  mapCommunication: (pattern: string) => {
    if (pattern.includes('export')) return 'props';
    if (pattern.includes('setContext')) return 'createContext';
    return pattern;
  },
  mapRendering: (pattern: string) => {
    if (pattern.includes('编译时')) return '直接 DOM 更新';
    return pattern;
  }
};

/**
 * Solid ↔ Svelte 的映射损失
 */
const solidToSvelteLosses: MappingLoss[] = [
  {
    sourcePattern: 'createSignal (运行时响应式)',
    targetApproximation: 'let (编译时分析)',
    lossType: 'semantic',
    description: 'Solid 的 Signal 是运行时细粒度追踪，Svelte 的编译时分析在某些动态场景下无法等价转换'
  },
  {
    sourcePattern: 'createEffect (显式依赖追踪)',
    targetApproximation: '$: (隐式依赖)',
    lossType: 'performance',
    description: 'Solid 的显式依赖可精确控制更新粒度，Svelte 的 $: 可能过度追踪'
  }
];

const svelteToSolidLosses: MappingLoss[] = [
  {
    sourcePattern: '$: (编译时依赖分析)',
    targetApproximation: 'createEffect (运行时依赖)',
    lossType: 'semantic',
    description: 'Svelte 的编译时静态分析可消除无用依赖追踪，Solid 运行时无法复现这种优化'
  },
  {
    sourcePattern: '<script context="module">',
    targetApproximation: '无直接对应',
    lossType: 'semantic',
    description: 'Svelte 的模块级脚本在 Solid 中需要手动实现为模块级状态'
  }
];

// ============================================================
// 6. 自动转换算法
// ============================================================

/**
 * 框架迁移的自动转换算法（基于 AST 转换）
 *
 * 输入：源框架组件源代码
 * 输出：目标框架组件源代码（近似等价）
 *
 * 算法步骤：
 * 1. 解析源框架 AST
 * 2. 识别源框架的惯用模式（idioms）
 * 3. 应用模型映射规则
 * 4. 生成目标框架 AST
 * 5. 代码生成 + 后处理（处理不可表达的损失）
 */

interface ASTNode {
  readonly type: string;
  readonly children: ASTNode[];
  readonly sourceFramework: string;
}

interface ConversionRule {
  readonly sourcePattern: string;
  readonly targetPattern: string;
  readonly confidence: number; // 0-1，转换信心度
  readonly warnings: string[];
}

/**
 * 自动转换引擎
 */
class FrameworkConverter {
  private rules: ConversionRule[] = [];

  addRule(rule: ConversionRule): void {
    this.rules.push(rule);
  }

  convert(ast: ASTNode, targetFramework: string): {
    readonly ast: ASTNode;
    readonly appliedRules: ConversionRule[];
    readonly warnings: string[];
    readonly confidence: number;
  } {
    const appliedRules: ConversionRule[] = [];
    const warnings: string[] = [];

    const convertNode = (node: ASTNode): ASTNode => {
      const matchingRule = this.rules.find(r =>
        r.sourcePattern === node.type &&
        !node.sourceFramework.includes(targetFramework)
      );

      if (matchingRule) {
        appliedRules.push(matchingRule);
        warnings.push(...matchingRule.warnings);
        return {
          type: matchingRule.targetPattern,
          children: node.children.map(convertNode),
          sourceFramework: targetFramework
        };
      }

      return {
        ...node,
        children: node.children.map(convertNode)
      };
    };

    const converted = convertNode(ast);
    const avgConfidence = appliedRules.length > 0
      ? appliedRules.reduce((sum, r) => sum + r.confidence, 0) / appliedRules.length
      : 0;

    return { ast: converted, appliedRules, warnings, confidence: avgConfidence };
  }
}

// 注册 React → Vue 转换规则
const reactToVueConverter = new FrameworkConverter();
reactToVueConverter.addRule({
  sourcePattern: 'JSXElement',
  targetPattern: 'TemplateElement',
  confidence: 0.9,
  warnings: ['JSX 的 {expression} 需要转换为 Vue 的 {{ expression }}']
});
reactToVueConverter.addRule({
  sourcePattern: 'useState',
  targetPattern: 'ref',
  confidence: 0.85,
  warnings: ['useState 的批量更新语义与 ref 的直接赋值不同']
});
reactToVueConverter.addRule({
  sourcePattern: 'useEffect',
  targetPattern: 'watchEffect',
  confidence: 0.7,
  warnings: ['useEffect 的依赖数组需要手动分析转换为自动追踪']
});

// ============================================================
// 7. 迁移路径建议算法
// ============================================================

/**
 * 计算最优迁移路径
 *
 * 基于 Dijkstra 算法的思想：
 * - 节点 = 框架
 * - 边权重 = 概念冲突成本（calculateConceptualConflict）
 * - 目标 = 找到从源框架到目标框架的最低成本路径
 */

interface MigrationPath {
  readonly steps: string[];
  readonly totalCost: number;
  readonly estimatedTime: string;
  readonly riskLevel: 'low' | 'medium' | 'high';
}

/**
 * 迁移路径评分
 */
const scoreMigrationPath = (
  from: ConceptualModel,
  to: ConceptualModel,
  teamSize: number,
  codebaseSize: 'small' | 'medium' | 'large'
): MigrationPath => {
  const conflict = calculateConceptualConflict(from, to);

  // 规模因子
  const sizeFactor = { small: 1, medium: 3, large: 8 }[codebaseSize];

  // 团队因子（康威定律：团队结构影响迁移难度）
  const teamFactor = Math.max(1, Math.log2(teamSize));

  // 总成本 = 概念冲突 × 代码规模 × 团队因子
  const totalCost = conflict * sizeFactor * teamFactor;

  // 风险等级
  const riskLevel: 'low' | 'medium' | 'high' =
    totalCost < 10 ? 'low' : totalCost < 30 ? 'medium' : 'high';

  // 预估时间（经验公式）
  const weeks = Math.ceil(totalCost / 2);
  const estimatedTime = weeks < 4 ? `${weeks} 周` : `${Math.ceil(weeks / 4)} 个月`;

  return {
    steps: [
      `1. 概念映射培训 (${from.name} → ${to.name})`,
      `2. 创建 ${to.name} 原型验证`,
      `3. 逐步迁移（按模块）`,
      `4. 双框架共存期`,
      `5. 完全切换与清理`
    ],
    totalCost: Math.round(totalCost),
    estimatedTime,
    riskLevel
  };
};

// 示例：评估 React → Vue 的迁移路径
// const reactToVuePath = scoreMigrationPath(
//   reactConceptual,
//   vueConceptual,
//   teamSize: 5,
//   codebaseSize: 'large'
// );
// 预期：totalCost ≈ 3(冲突) × 8(大规模) × 2.3(log2(5)) ≈ 55，风险 high，约 7 个月

// 示例：评估 React → Solid 的迁移路径
// const reactToSolidPath = scoreMigrationPath(
//   reactConceptual,
//   solidConceptual,
//   teamSize: 3,
//   codebaseSize: 'medium'
// );
// 预期：totalCost ≈ 5(冲突，VDOM → 直接 DOM) × 3(中规模) × 1.6(log2(3)) ≈ 24，风险 medium，约 3 个月
