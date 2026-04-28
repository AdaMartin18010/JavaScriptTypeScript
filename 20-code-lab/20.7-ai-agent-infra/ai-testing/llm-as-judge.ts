/**
 * @file LLM-as-a-Judge 评估模式
 * @category AI Testing → LLM Evaluation
 * @difficulty hard
 * @tags ai-testing, llm-evaluation, consensus-evaluation, rubric-scoring, quality-assurance
 *
 * @description
 * 基于大语言模型的自动化评估框架，实现"LLM-as-a-Judge"模式。
 * 支持结构化评分量规、多评委共识机制和结果聚合分析。
 *
 * 核心能力：
 * - 评估量规定义：多维评分标准与权重配置
 * - LLM评委：基于模拟推理的结构化评分
 * - 共识评估：多评委独立评分与一致性分析
 * - 结果聚合：加权平均、置信区间与分歧检测
 */

/** 评估维度 */
export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1
  scale: { min: number; max: number };
}

/** 评估量规 */
export interface EvaluationRubric {
  id: string;
  name: string;
  criteria: EvaluationCriterion[];
  overallScale: { min: number; max: number };
  instructions: string;
}

/** 单维度评分 */
export interface CriterionScore {
  criterionId: string;
  score: number;
  reasoning: string;
}

/** 单个评委的评分结果 */
export interface JudgeScore {
  judgeId: string;
  judgeModel: string;
  criterionScores: CriterionScore[];
  overallScore: number;
  overallReasoning: string;
  timestamp: number;
}

/** 评估样本 */
export interface EvaluationSample {
  id: string;
  input: string;
  output: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

/** 聚合评估结果 */
export interface EvaluationResult {
  sampleId: string;
  rubricId: string;
  aggregatedScores: Record<string, { mean: number; stdDev: number; min: number; max: number }>;
  overallScore: { mean: number; stdDev: number; confidence95: [number, number] };
  consensusLevel: 'high' | 'medium' | 'low';
  disagreements: Disagreement[];
  timestamp: number;
}

/** 分歧记录 */
export interface Disagreement {
  criterionId: string;
  judgeScores: { judgeId: string; score: number }[];
  variance: number;
}

/** 共识结果 */
export interface ConsensusResult {
  evaluationResult: EvaluationResult;
  participatingJudges: string[];
  consensusReached: boolean;
  requiredConsensus: number; // 最小一致比例
}

// ==================== 量规构建器 ====================

export class RubricBuilder {
  private criteria: EvaluationCriterion[] = [];
  private name = 'Default Rubric';
  private instructions = 'Evaluate the output based on the following criteria.';

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setInstructions(instructions: string): this {
    this.instructions = instructions;
    return this;
  }

  addCriterion(
    id: string,
    name: string,
    description: string,
    weight: number,
    scale: { min: number; max: number } = { min: 1, max: 5 }
  ): this {
    this.criteria.push({ id, name, description, weight, scale });
    return this;
  }

  build(id = `rubric-${Date.now()}`): EvaluationRubric {
    const totalWeight = this.criteria.reduce((sum, c) => sum + c.weight, 0);
    const normalized = this.criteria.map(c => ({
      ...c,
      weight: totalWeight > 0 ? c.weight / totalWeight : 1 / this.criteria.length
    }));

    return {
      id,
      name: this.name,
      criteria: normalized,
      overallScale: { min: 1, max: 5 },
      instructions: this.instructions
    };
  }
}

// ==================== LLM评委 ====================

export class LLMJudge {
  constructor(
    private judgeId: string,
    private modelName: string,
    private temperature = 0.3
  ) {}

  /**
   * 对单个样本执行评估（模拟推理过程）
   */
  evaluate(sample: EvaluationSample, rubric: EvaluationRubric): JudgeScore {
    const criterionScores: CriterionScore[] = [];

    for (const criterion of rubric.criteria) {
      const score = this.simulateScore(sample, criterion);
      criterionScores.push({
        criterionId: criterion.id,
        score,
        reasoning: this.generateReasoning(sample, criterion, score)
      });
    }

    const overallScore = this.computeOverall(criterionScores, rubric);

    return {
      judgeId: this.judgeId,
      judgeModel: this.modelName,
      criterionScores,
      overallScore,
      overallReasoning: `综合评分 ${overallScore.toFixed(2)}，基于 ${criterionScores.length} 个维度`,
      timestamp: Date.now()
    };
  }

  private simulateScore(sample: EvaluationSample, criterion: EvaluationCriterion): number {
    // 模拟评分：基于文本特征和内容匹配的启发式算法
    const output = sample.output;
    const reference = sample.reference;
    let base = (criterion.scale.min + criterion.scale.max) / 2;

    // 文本长度因子
    const lengthFactor = Math.min(output.length / 100, 1);
    base += (lengthFactor - 0.5) * 0.5;

    // 引用存在性因子
    if (reference) {
      const overlap = this.computeOverlap(output, reference);
      base += (overlap - 0.5);
    }

    // 特定维度调整
    if (criterion.id === 'accuracy') {
      base += output.includes('correct') || output.includes('正确') ? 0.5 : 0;
    }
    if (criterion.id === 'coherence') {
      base += output.length > 20 && output.includes('.') ? 0.3 : -0.3;
    }
    if (criterion.id === 'helpfulness') {
      base += /\d+/.test(output) || /步骤|step|guide/.test(output) ? 0.4 : 0;
    }

    // 温度扰动
    const noise = (Math.random() - 0.5) * this.temperature * 2;
    const raw = base + noise;

    return Math.max(criterion.scale.min, Math.min(criterion.scale.max, Math.round(raw * 10) / 10));
  }

  private computeOverlap(a: string, b: string): number {
    const setA = new Set(a.toLowerCase().split(/\s+/));
    const setB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private generateReasoning(sample: EvaluationSample, criterion: EvaluationCriterion, score: number): string {
    if (score >= criterion.scale.max * 0.8) {
      return `${criterion.name}表现优秀，输出质量高`;
    }
    if (score <= criterion.scale.min * 1.2) {
      return `${criterion.name}需要改进，输出未达预期`;
    }
    return `${criterion.name}表现中等，有提升空间`;
  }

  private computeOverall(criterionScores: CriterionScore[], rubric: EvaluationRubric): number {
    let weightedSum = 0;
    let weightSum = 0;

    for (const cs of criterionScores) {
      const criterion = rubric.criteria.find(c => c.id === cs.criterionId);
      if (criterion) {
        weightedSum += cs.score * criterion.weight;
        weightSum += criterion.weight;
      }
    }

    return weightSum > 0 ? Math.round((weightedSum / weightSum) * 10) / 10 : 0;
  }
}

// ==================== 共识评估器 ====================

export class ConsensusEvaluator {
  private judges: LLMJudge[] = [];

  addJudge(judge: LLMJudge): void {
    this.judges.push(judge);
  }

  /**
   * 多评委共识评估
   */
  evaluateConsensus(
    sample: EvaluationSample,
    rubric: EvaluationRubric,
    requiredConsensus = 0.7
  ): ConsensusResult {
    const judgeScores = this.judges.map(j => j.evaluate(sample, rubric));
    const result = this.aggregate(sample.id, rubric, judgeScores);

    const consensusRatio = this.calculateConsensusRatio(judgeScores, rubric);
    const consensusReached = consensusRatio >= requiredConsensus;

    return {
      evaluationResult: result,
      participatingJudges: judgeScores.map(j => j.judgeId),
      consensusReached,
      requiredConsensus
    };
  }

  private calculateConsensusRatio(judgeScores: JudgeScore[], rubric: EvaluationRubric): number {
    if (judgeScores.length < 2) return 1;

    let totalAgreement = 0;
    let totalComparisons = 0;

    for (const criterion of rubric.criteria) {
      const scores = judgeScores.map(js => {
        const cs = js.criterionScores.find(c => c.criterionId === criterion.id);
        return cs ? cs.score : 0;
      });

      for (let i = 0; i < scores.length; i++) {
        for (let j = i + 1; j < scores.length; j++) {
          const diff = Math.abs(scores[i] - scores[j]);
          const range = criterion.scale.max - criterion.scale.min;
          const agreement = range > 0 ? 1 - diff / range : 1;
          totalAgreement += agreement;
          totalComparisons++;
        }
      }
    }

    return totalComparisons > 0 ? totalAgreement / totalComparisons : 1;
  }

  private aggregate(
    sampleId: string,
    rubric: EvaluationRubric,
    judgeScores: JudgeScore[]
  ): EvaluationResult {
    const aggregatedScores: EvaluationResult['aggregatedScores'] = {};
    const disagreements: Disagreement[] = [];

    for (const criterion of rubric.criteria) {
      const scores = judgeScores.map(js => {
        const cs = js.criterionScores.find(c => c.criterionId === criterion.id);
        return cs ? cs.score : 0;
      });

      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
      const stdDev = Math.sqrt(variance);

      aggregatedScores[criterion.id] = {
        mean: Math.round(mean * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        min: Math.min(...scores),
        max: Math.max(...scores)
      };

      if (stdDev > 0.8) {
        disagreements.push({
          criterionId: criterion.id,
          judgeScores: judgeScores.map(js => {
            const cs = js.criterionScores.find(c => c.criterionId === criterion.id);
            return { judgeId: js.judgeId, score: cs ? cs.score : 0 };
          }),
          variance: Math.round(variance * 100) / 100
        });
      }
    }

    const overallScores = judgeScores.map(js => js.overallScore);
    const overallMean = overallScores.reduce((a, b) => a + b, 0) / overallScores.length;
    const overallStdDev = Math.sqrt(
      overallScores.reduce((sum, s) => sum + (s - overallMean) ** 2, 0) / overallScores.length
    );
    const margin = 1.96 * (overallStdDev / Math.sqrt(overallScores.length));

    let consensusLevel: EvaluationResult['consensusLevel'] = 'high';
    if (overallStdDev > 1.0) consensusLevel = 'low';
    else if (overallStdDev > 0.5) consensusLevel = 'medium';

    return {
      sampleId,
      rubricId: rubric.id,
      aggregatedScores,
      overallScore: {
        mean: Math.round(overallMean * 100) / 100,
        stdDev: Math.round(overallStdDev * 100) / 100,
        confidence95: [
          Math.round((overallMean - margin) * 100) / 100,
          Math.round((overallMean + margin) * 100) / 100
        ]
      },
      consensusLevel,
      disagreements,
      timestamp: Date.now()
    };
  }
}

// ==================== 评估聚合器 ====================

export class EvaluationAggregator {
  /**
   * 批量评估并生成统计报告
   */
  aggregateBatch(results: EvaluationResult[]): BatchReport {
    if (results.length === 0) {
      return { count: 0, meanOverall: 0, consensusHigh: 0, consensusLow: 0, topSamples: [], bottomSamples: [] };
    }

    const overallScores = results.map(r => r.overallScore.mean);
    const meanOverall = overallScores.reduce((a, b) => a + b, 0) / overallScores.length;
    const consensusHigh = results.filter(r => r.consensusLevel === 'high').length;
    const consensusLow = results.filter(r => r.consensusLevel === 'low').length;

    const sorted = [...results].sort((a, b) => b.overallScore.mean - a.overallScore.mean);

    return {
      count: results.length,
      meanOverall: Math.round(meanOverall * 100) / 100,
      consensusHigh,
      consensusLow,
      topSamples: sorted.slice(0, 3).map(r => ({ id: r.sampleId, score: r.overallScore.mean })),
      bottomSamples: sorted.slice(-3).reverse().map(r => ({ id: r.sampleId, score: r.overallScore.mean }))
    };
  }
}

export interface BatchReport {
  count: number;
  meanOverall: number;
  consensusHigh: number;
  consensusLow: number;
  topSamples: { id: string; score: number }[];
  bottomSamples: { id: string; score: number }[];
}

// ==================== 演示 ====================

export async function demo(): Promise<void> {
  console.log('=== LLM-as-a-Judge 评估 ===\n');

  // 构建评估量规
  const rubric = new RubricBuilder()
    .setName('代码生成质量评估')
    .setInstructions('评估AI生成的代码片段质量')
    .addCriterion('accuracy', '准确性', '代码是否逻辑正确，无语法错误', 0.4, { min: 1, max: 5 })
    .addCriterion('coherence', '连贯性', '代码结构是否清晰，命名规范', 0.3, { min: 1, max: 5 })
    .addCriterion('helpfulness', '有用性', '是否包含注释、错误处理', 0.3, { min: 1, max: 5 })
    .build();

  console.log(`量规: ${rubric.name}`);
  console.log(`维度: ${rubric.criteria.map(c => c.name).join(', ')}`);

  // 创建样本
  const sample: EvaluationSample = {
    id: 'code-gen-1',
    input: '写一个求斐波那契数列的函数',
    output: 'function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }',
    reference: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2); }'
  };

  // 单评委评估
  const judge1 = new LLMJudge('judge-1', 'gpt-mock', 0.2);
  const score1 = judge1.evaluate(sample, rubric);
  console.log(`\n--- 单评委 (${score1.judgeModel}) ---`);
  console.log(`总体评分: ${score1.overallScore}`);
  for (const cs of score1.criterionScores) {
    console.log(`  ${cs.criterionId}: ${cs.score} — ${cs.reasoning}`);
  }

  // 多评委共识评估
  const consensus = new ConsensusEvaluator();
  consensus.addJudge(judge1);
  consensus.addJudge(new LLMJudge('judge-2', 'claude-mock', 0.4));
  consensus.addJudge(new LLMJudge('judge-3', 'llama-mock', 0.5));

  const consensusResult = consensus.evaluateConsensus(sample, rubric, 0.7);
  const result = consensusResult.evaluationResult;

  console.log('\n--- 共识评估 (3位评委) ---');
  console.log(`总体均值: ${result.overallScore.mean} ± ${result.overallScore.stdDev}`);
  console.log(`95%置信区间: [${result.overallScore.confidence95[0]}, ${result.overallScore.confidence95[1]}]`);
  console.log(`共识水平: ${result.consensusLevel}`);
  console.log(`分歧维度: ${result.disagreements.length > 0 ? result.disagreements.map(d => d.criterionId).join(', ') : '无'}`);

  // 批量聚合
  const aggregator = new EvaluationAggregator();
  const batchReport = aggregator.aggregateBatch([result]);
  console.log('\n--- 批量聚合报告 ---');
  console.log(`样本数: ${batchReport.count}`);
  console.log(`平均总分: ${batchReport.meanOverall}`);
  console.log(`高共识数: ${batchReport.consensusHigh}`);
}
