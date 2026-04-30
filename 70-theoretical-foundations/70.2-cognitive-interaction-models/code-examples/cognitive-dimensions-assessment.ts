/**
 * 认知维度评估 — TypeScript 实现
 * 
 * 本文件提供基于 Green & Petre 认知维度记号（Cognitive Dimensions of Notations）
 * 的评估框架，用于支持 70.2 方向的认知分析。
 * 
 * @theory Cognitive Dimensions of Notations
 * @reference Green & Petre (1996), Blackwell & Green (2003)
 */

// ============================================================
// 认知维度定义
// ============================================================

/**
 * Green & Petre 提出的 14 个认知维度（核心子集）
 */
interface CognitiveDimensions {
  /** 抽象梯度（Abstraction Gradient） */
  abstractionGradient: 'low' | 'medium' | 'high';
  
  /** 隐蔽依赖（Hidden Dependencies） */
  hiddenDependencies: 'low' | 'medium' | 'high';
  
  /** 过早承诺（Premature Commitment） */
  prematureCommitment: 'low' | 'medium' | 'high';
  
  /** 渐进评估（Progressive Evaluation） */
  progressiveEvaluation: 'low' | 'medium' | 'high';
  
  /** 角色表达性（Role-Expressiveness） */
  roleExpressiveness: 'low' | 'medium' | 'high';
  
  /** 粘度（Viscosity）—— 改变的阻力 */
  viscosity: 'low' | 'medium' | 'high';
  
  /** 可见性（Visibility） */
  visibility: 'low' | 'medium' | 'high';
  
  /** 接近性（Closeness of Mapping） */
  closenessOfMapping: 'low' | 'medium' | 'high';
  
  /** 一致性（Consistency） */
  consistency: 'low' | 'medium' | 'high';
  
  /** 硬心智操作（Hard Mental Operations） */
  hardMentalOperations: 'low' | 'medium' | 'high';
  
  /** 辅助记号（Secondary Notation） */
  secondaryNotation: 'low' | 'medium' | 'high';
  
  /** 误读（Error-Proneness） */
  errorProneness: 'low' | 'medium' | 'high';
}

// ============================================================
// 异步模式的认知维度评估
// ============================================================

/**
 * 回调地狱（Callback Hell）的认知维度评估
 */
const callbackHellAssessment: CognitiveDimensions = {
  abstractionGradient: 'high',      // 嵌套层次高，抽象层次陡峭
  hiddenDependencies: 'high',       // 回调间的隐式依赖
  prematureCommitment: 'medium',    // 需要提前决定回调结构
  progressiveEvaluation: 'low',     // 难以逐步评估
  roleExpressiveness: 'low',        // 回调的角色不明确
  viscosity: 'high',                // 修改嵌套结构困难
  visibility: 'low',                // 控制流不可见
  closenessOfMapping: 'low',        // 与同步思维映射差
  consistency: 'medium',            // 回调模式一致但嵌套不一致
  hardMentalOperations: 'high',     // 需要跟踪多个上下文
  secondaryNotation: 'low',         // 无辅助记号
  errorProneness: 'high'            // 容易出错（回调地狱）
};

/**
 * Promise 链的认知维度评估
 */
const promiseChainAssessment: CognitiveDimensions = {
  abstractionGradient: 'medium',    // 线性链降低抽象梯度
  hiddenDependencies: 'medium',     // .then 间依赖较清晰
  prematureCommitment: 'low',       // 可以逐步构建链
  progressiveEvaluation: 'medium',  // 可以逐步评估
  roleExpressiveness: 'medium',     // .then/.catch 角色较明确
  viscosity: 'medium',              // 修改链比嵌套容易
  visibility: 'medium',             // 线性控制流可见
  closenessOfMapping: 'medium',     // 比回调更接近同步思维
  consistency: 'high',              // 链式 API 一致
  hardMentalOperations: 'medium',   // 需要跟踪 Promise 状态
  secondaryNotation: 'medium',      // 链式结构作为辅助记号
  errorProneness: 'medium'          // 错误处理较清晰
};

/**
 * async/await 的认知维度评估
 */
const asyncAwaitAssessment: CognitiveDimensions = {
  abstractionGradient: 'low',       // 与同步代码相同的抽象梯度
  hiddenDependencies: 'low',        // 隐式依赖最少
  prematureCommitment: 'low',       // 最灵活
  progressiveEvaluation: 'high',    // 可以像同步代码一样逐步评估
  roleExpressiveness: 'high',       // async/await 角色明确
  viscosity: 'low',                 // 最容易修改
  visibility: 'high',               // 控制流完全可见
  closenessOfMapping: 'high',       // 最接近同步思维
  consistency: 'high',              // 与同步代码一致
  hardMentalOperations: 'low',      // 最小的心智操作
  secondaryNotation: 'high',        // 利用已有的同步代码记号
  errorProneness: 'low'             // 错误处理最直观
};

// ============================================================
// 框架概念模型的认知维度评估
// ============================================================

/**
 * React Hooks 的认知维度评估
 */
const reactHooksAssessment: CognitiveDimensions = {
  abstractionGradient: 'high',      // Hooks 规则增加抽象梯度
  hiddenDependencies: 'high',       // 依赖数组的隐式依赖
  prematureCommitment: 'medium',    // 需要提前决定 Hook 顺序
  progressiveEvaluation: 'medium',  // 可以逐步评估组件
  roleExpressiveness: 'medium',     // useEffect/useState 角色明确
  viscosity: 'medium',              // 修改 Hook 顺序可能破坏规则
  visibility: 'medium',             // 渲染逻辑可见但执行时机不可见
  closenessOfMapping: 'medium',     // 函数式思维映射
  consistency: 'high',              // Hooks 规则一致
  hardMentalOperations: 'high',     // 依赖数组的心智负担
  secondaryNotation: 'medium',      // ESLint 作为辅助
  errorProneness: 'medium'          // 违反规则容易出错
};

/**
 * Vue Composition API 的认知维度评估
 */
const vueCompositionAssessment: CognitiveDimensions = {
  abstractionGradient: 'medium',    // 比 Options API 陡峭但比 Hooks 平缓
  hiddenDependencies: 'low',        // 响应式依赖自动追踪
  prematureCommitment: 'low',       // 可以灵活组织逻辑
  progressiveEvaluation: 'high',    // 组合式函数可以独立测试
  roleExpressiveness: 'high',       // ref/reactive/computed 角色明确
  viscosity: 'low',                 // 重构逻辑块容易
  visibility: 'high',               // 逻辑组合清晰可见
  closenessOfMapping: 'high',       // 与模块化的直觉映射
  consistency: 'high',              // 组合式 API 一致
  hardMentalOperations: 'medium',   // Ref 包装需要心智转换
  secondaryNotation: 'high',        // 组合式函数作为辅助记号
  errorProneness: 'low'             // 自动依赖追踪减少错误
};

// ============================================================
// 评估工具函数
// ============================================================

/**
 * 计算两个认知维度评估的"认知距离"
 */
const cognitiveDistance = (
  a: CognitiveDimensions,
  b: CognitiveDimensions
): number => {
  const score = (v: string) => ({ low: 1, medium: 2, high: 3 }[v] ?? 2);
  const dimensions = Object.keys(a) as (keyof CognitiveDimensions)[];
  return dimensions.reduce((sum, dim) =>
    sum + Math.abs(score(a[dim]) - score(b[dim])), 0
  );
};

/**
 * 框架切换的认知成本估算
 */
const frameworkSwitchCost = (
  from: CognitiveDimensions,
  to: CognitiveDimensions
): { distance: number; level: 'low' | 'medium' | 'high' } => {
  const distance = cognitiveDistance(from, to);
  const level = distance < 10 ? 'low' : distance < 20 ? 'medium' : 'high';
  return { distance, level };
};

// 示例：React → Vue 的认知切换成本
// const reactToVue = frameworkSwitchCost(reactHooksAssessment, vueCompositionAssessment);

// TODO: 补充更多框架评估、眼动追踪指标、阅读时间预测模型
