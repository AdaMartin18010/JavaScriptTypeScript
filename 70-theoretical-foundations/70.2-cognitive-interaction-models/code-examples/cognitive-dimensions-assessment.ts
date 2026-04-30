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

// ============================================================
// 更多框架评估
// ============================================================

/**
 * Svelte 编译时框架的认知维度评估
 */
const svelteAssessment: CognitiveDimensions = {
  abstractionGradient: 'medium',     // 编译时魔法增加了一层抽象
  hiddenDependencies: 'high',        // 编译时转换是隐藏的
  prematureCommitment: 'low',        // 写法灵活
  progressiveEvaluation: 'medium',   // 编译后才能看到效果
  roleExpressiveness: 'medium',      // $: 标签角色明确但机制隐藏
  viscosity: 'low',                  // 修改容易
  visibility: 'low',                 // 编译时转换不可见
  closenessOfMapping: 'high',        // 接近自然 JS
  consistency: 'high',               // 语法一致
  hardMentalOperations: 'medium',    // 需要理解编译时行为
  secondaryNotation: 'low',          // 编译输出作为辅助记号
  errorProneness: 'medium'           // 编译时检查捕获错误
};

/**
 * Angular 整体认知维度评估
 */
const angularAssessment: CognitiveDimensions = {
  abstractionGradient: 'high',       // DI、RxJS、模块层级多层抽象
  hiddenDependencies: 'high',        // DI 容器中的隐式依赖
  prematureCommitment: 'high',       // 需要提前决定模块结构
  progressiveEvaluation: 'low',      // 启动慢，难以逐步评估
  roleExpressiveness: 'medium',      // 装饰器角色明确
  viscosity: 'high',                 // 重构成本高
  visibility: 'medium',              // 变更检测可见但 RxJS 流不可见
  closenessOfMapping: 'medium',      // MVC/MVVM 映射
  consistency: 'medium',             // 概念一致但 API 庞大
  hardMentalOperations: 'high',      // RxJS 操作符组合
  secondaryNotation: 'medium',       // 装饰器作为辅助记号
  errorProneness: 'medium'           // 类型系统帮助但运行时错误隐蔽
};

/**
 * Solid 细粒度响应式的认知维度评估
 */
const solidAssessment: CognitiveDimensions = {
  abstractionGradient: 'medium',     // Signal 概念简单但优化机制复杂
  hiddenDependencies: 'low',         // 依赖追踪显式
  prematureCommitment: 'low',        // 灵活
  progressiveEvaluation: 'high',     // 组件独立更新
  roleExpressiveness: 'high',        // createSignal/createEffect 明确
  viscosity: 'low',                  // 重构容易
  visibility: 'high',                // 无 VDOM，更新路径清晰
  closenessOfMapping: 'high',        // 接近 vanilla JS
  consistency: 'high',               // 一致
  hardMentalOperations: 'low',       // 心智模型简单
  secondaryNotation: 'medium',       // 信号图作为辅助
  errorProneness: 'low'              // 细粒度减少意外
};

// ============================================================
// 眼动追踪指标模拟
// ============================================================

/**
 * 模拟眼动追踪指标：衡量代码阅读时的认知负荷
 *
 * 指标来源：
 * - fixationCount: 注视点数量（越多 = 需要更多注意力）
 * - avgFixationDuration: 平均注视时长（ms，越长 = 理解越困难）
 * - saccadeLength: 眼跳距离（像素，越长 = 信息分散）
 * - regressionRate: 回视率（回视次数/总注视，越高 = 需要重读）
 */
interface EyeTrackingMetrics {
  readonly fixationCount: number;
  readonly avgFixationDuration: number; // ms
  readonly saccadeLength: number;       // px
  readonly regressionRate: number;      // 0-1
}

/**
 * 不同代码模式的眼动追踪预测模型
 *
 * 基于：Busjahn et al. "Eye Movements in Code Reading" (2015)
 */
const predictEyeTracking = (
  codePattern: 'callback-hell' | 'promise-chain' | 'async-await' | 'rxjs-pipe',
  linesOfCode: number
): EyeTrackingMetrics => {
  const base = {
    'callback-hell': { fixationCount: 2.5, avgFixationDuration: 450, saccadeLength: 180, regressionRate: 0.35 },
    'promise-chain': { fixationCount: 1.8, avgFixationDuration: 320, saccadeLength: 120, regressionRate: 0.20 },
    'async-await':   { fixationCount: 1.2, avgFixationDuration: 250, saccadeLength: 80,  regressionRate: 0.10 },
    'rxjs-pipe':     { fixationCount: 2.2, avgFixationDuration: 400, saccadeLength: 150, regressionRate: 0.28 }
  };

  const b = base[codePattern];
  return {
    fixationCount: Math.round(b.fixationCount * linesOfCode),
    avgFixationDuration: b.avgFixationDuration,
    saccadeLength: b.saccadeLength,
    regressionRate: b.regressionRate
  };
};

// 示例：阅读 10 行 async-await vs callback-hell
// const asyncMetrics = predictEyeTracking('async-await', 10);
// const callbackMetrics = predictEyeTracking('callback-hell', 10);
// 预期：asyncMetrics.fixationCount < callbackMetrics.fixationCount

// ============================================================
// 阅读时间预测模型
// ============================================================

/**
 * 代码阅读时间预测模型
 *
 * 基于认知科学文献的综合模型：
 * T_read = T_base × (1 + CL_intrinsic) × (1 + CL_extraneous) × (1 + syntax_complexity)
 *
 * 其中：
 * - T_base: 每行代码的基础阅读时间（约 300ms/行，专家）
 * - CL_intrinsic: 内在认知负荷（0-2）
 * - CL_extraneous: 外在认知负荷（0-2）
 * - syntax_complexity: 语法复杂度（嵌套深度 × 操作符数 / 10）
 */

interface ReadingTimeParams {
  readonly linesOfCode: number;
  readonly intrinsicLoad: number;    // 0-2
  readonly extraneousLoad: number;   // 0-2
  readonly maxNestingDepth: number;
  readonly operatorCount: number;
  readonly expertise: 'novice' | 'intermediate' | 'expert';
}

const predictReadingTime = (params: ReadingTimeParams): {
  readonly estimatedSeconds: number;
  readonly breakdown: {
    readonly baseTime: number;
    readonly cognitiveOverhead: number;
    readonly syntaxOverhead: number;
  };
} => {
  const basePerLine = { novice: 800, intermediate: 500, expert: 300 }[params.expertise];
  const baseTime = params.linesOfCode * basePerLine / 1000;

  const syntaxComplexity = (params.maxNestingDepth * params.operatorCount) / 10;
  const cognitiveMultiplier = (1 + params.intrinsicLoad) * (1 + params.extraneousLoad);
  const syntaxMultiplier = 1 + syntaxComplexity;

  const total = baseTime * cognitiveMultiplier * syntaxMultiplier;

  return {
    estimatedSeconds: Math.round(total),
    breakdown: {
      baseTime: Math.round(baseTime * 10) / 10,
      cognitiveOverhead: Math.round(baseTime * (cognitiveMultiplier - 1) * 10) / 10,
      syntaxOverhead: Math.round(baseTime * cognitiveMultiplier * (syntaxMultiplier - 1) * 10) / 10
    }
  };
};

// 示例：预测理解 20 行回调地狱的阅读时间
// const callbackReadingTime = predictReadingTime({
//   linesOfCode: 20,
//   intrinsicLoad: 1.5,
//   extraneousLoad: 1.8,
//   maxNestingDepth: 5,
//   operatorCount: 12,
//   expertise: 'intermediate'
// });
// 预期：约 20 × 0.5 × 2.5 × 2.3 ≈ 57 秒

// 示例：预测理解 20 行 async/await 的阅读时间
// const asyncReadingTime = predictReadingTime({
//   linesOfCode: 20,
//   intrinsicLoad: 0.5,
//   extraneousLoad: 0.3,
//   maxNestingDepth: 2,
//   operatorCount: 6,
//   expertise: 'intermediate'
// });
// 预期：约 20 × 0.5 × 1.3 × 1.2 ≈ 16 秒

// ============================================================
// 综合认知成本对比
// ============================================================

/**
 * 综合认知成本 = 认知距离 × 阅读时间 × 错误概率
 */
const comprehensiveCognitiveCost = (
  from: CognitiveDimensions,
  to: CognitiveDimensions,
  loc: number,
  expertise: 'novice' | 'intermediate' | 'expert'
): {
  readonly distance: number;
  readonly estimatedMinutes: number;
  readonly errorProbability: number;
} => {
  const distance = cognitiveDistance(from, to);
  const readingTime = predictReadingTime({
    linesOfCode: loc,
    intrinsicLoad: distance / 15,
    extraneousLoad: distance / 20,
    maxNestingDepth: 3,
    operatorCount: 8,
    expertise
  });

  // 错误概率：距离越大、 expertise 越低，错误概率越高
  const expertiseFactor = { novice: 0.4, intermediate: 0.2, expert: 0.08 }[expertise];
  const errorProbability = Math.min(0.95, expertiseFactor + distance / 100);

  return {
    distance,
    estimatedMinutes: Math.round(readingTime.estimatedSeconds / 6) / 10,
    errorProbability: Math.round(errorProbability * 100) / 100
  };
};
