/**
 * @file AI测试模块
 * @module AI Testing
 * @description
 * AI驱动的测试技术集合：
 * - 智能测试生成 (AiTestGenerator)
 * - 基于属性的测试生成 (PropertyBasedGenerator)
 * - 突变测试 (MutationTesting)
 * - 覆盖率计算 (CoverageCalculator)
 * - 智能测试选择 (SmartTestSelector)
 * - 模糊测试 (FuzzingGenerator)
 * - 视觉回归测试 (VisualRegression)
 * - LLM-as-a-Judge 评估 (LLMAsJudge)
 */

export * as AiTestGenerator from './ai-test-generator.js';
export * as PropertyBasedGenerator from './property-based-generator.js';
export * as MutationTesting from './mutation-testing.js';
export * as CoverageCalculator from './coverage-calculator.js';
export * as SmartTestSelector from './smart-test-selector.js';
export * as FuzzingGenerator from './fuzzing-generator.js';
export * as VisualRegression from './visual-regression.js';
export * as LLMAsJudge from './llm-as-judge.js';
