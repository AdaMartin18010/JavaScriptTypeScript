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

// TODO: 补充更多框架映射、自动转换算法、迁移路径建议
