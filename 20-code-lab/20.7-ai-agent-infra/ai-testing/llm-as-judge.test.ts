import { describe, it, expect } from 'vitest';
import {
  RubricBuilder,
  LLMJudge,
  ConsensusEvaluator,
  EvaluationAggregator
} from './llm-as-judge.js';
import type { EvaluationSample, EvaluationRubric } from './llm-as-judge.js';

describe('RubricBuilder', () => {
  it('builds a rubric with criteria', () => {
    const rubric = new RubricBuilder()
      .setName('Quality')
      .setInstructions('Evaluate quality')
      .addCriterion('c1', 'Accuracy', 'Is it accurate?', 0.5, { min: 1, max: 5 })
      .addCriterion('c2', 'Clarity', 'Is it clear?', 0.5, { min: 1, max: 5 })
      .build();

    expect(rubric.name).toBe('Quality');
    expect(rubric.criteria).toHaveLength(2);
    expect(rubric.criteria[0].weight).toBe(0.5);
    expect(rubric.criteria[1].weight).toBe(0.5);
  });

  it('normalizes weights to sum to 1', () => {
    const rubric = new RubricBuilder()
      .addCriterion('a', 'A', 'desc', 2)
      .addCriterion('b', 'B', 'desc', 2)
      .build();

    const sum = rubric.criteria.reduce((s, c) => s + c.weight, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('uses equal weights when total is 0', () => {
    const rubric = new RubricBuilder()
      .addCriterion('a', 'A', 'desc', 0)
      .addCriterion('b', 'B', 'desc', 0)
      .build();

    expect(rubric.criteria[0].weight).toBe(0.5);
    expect(rubric.criteria[1].weight).toBe(0.5);
  });
});

describe('LLMJudge', () => {
  const sample: EvaluationSample = {
    id: 's1',
    input: 'input text',
    output: 'This is a correct and coherent output with steps to guide.',
    reference: 'This is a correct and coherent output.'
  };

  const rubric: EvaluationRubric = new RubricBuilder()
    .setName('Test Rubric')
    .addCriterion('accuracy', 'Accuracy', 'Is it accurate?', 0.5, { min: 1, max: 5 })
    .addCriterion('coherence', 'Coherence', 'Is it coherent?', 0.5, { min: 1, max: 5 })
    .build();

  it('evaluates a sample and returns scores', () => {
    const judge = new LLMJudge('j1', 'mock-model', 0);
    const result = judge.evaluate(sample, rubric);

    expect(result.judgeId).toBe('j1');
    expect(result.judgeModel).toBe('mock-model');
    expect(result.criterionScores).toHaveLength(2);
    expect(result.overallScore).toBeGreaterThanOrEqual(rubric.overallScale.min);
    expect(result.overallScore).toBeLessThanOrEqual(rubric.overallScale.max);
  });

  it('computes overall score as weighted average', () => {
    const judge = new LLMJudge('j1', 'mock-model', 0);
    const result = judge.evaluate(sample, rubric);

    const expected = result.criterionScores.reduce((sum, cs) => {
      const c = rubric.criteria.find(x => x.id === cs.criterionId)!;
      return sum + cs.score * c.weight;
    }, 0);

    expect(result.overallScore).toBeCloseTo(expected, 1);
  });

  it('includes reasoning for each criterion', () => {
    const judge = new LLMJudge('j1', 'mock-model', 0);
    const result = judge.evaluate(sample, rubric);

    for (const cs of result.criterionScores) {
      expect(cs.reasoning.length).toBeGreaterThan(0);
    }
    expect(result.overallReasoning.length).toBeGreaterThan(0);
  });

  it('produces deterministic scores with temperature 0', () => {
    const judge = new LLMJudge('j1', 'mock-model', 0);
    const r1 = judge.evaluate(sample, rubric);
    const r2 = judge.evaluate(sample, rubric);
    expect(r1.overallScore).toBe(r2.overallScore);
  });
});

describe('ConsensusEvaluator', () => {
  const sample: EvaluationSample = {
    id: 's1',
    input: 'input',
    output: 'correct output with steps',
    reference: 'correct output'
  };

  const rubric: EvaluationRubric = new RubricBuilder()
    .addCriterion('accuracy', 'Accuracy', '', 1, { min: 1, max: 5 })
    .build();

  it('evaluates with a single judge as consensus', () => {
    const evaluator = new ConsensusEvaluator();
    evaluator.addJudge(new LLMJudge('j1', 'm1', 0));
    const result = evaluator.evaluateConsensus(sample, rubric, 0.7);

    expect(result.participatingJudges).toContain('j1');
    expect(result.consensusReached).toBe(true);
  });

  it('evaluates with multiple judges', () => {
    const evaluator = new ConsensusEvaluator();
    evaluator.addJudge(new LLMJudge('j1', 'm1', 0));
    evaluator.addJudge(new LLMJudge('j2', 'm2', 0));
    evaluator.addJudge(new LLMJudge('j3', 'm3', 0));

    const result = evaluator.evaluateConsensus(sample, rubric, 0.5);
    expect(result.participatingJudges).toHaveLength(3);
    expect(result.evaluationResult.overallScore.mean).toBeGreaterThanOrEqual(1);
  });

  it('reports disagreements when variance is high', () => {
    const evaluator = new ConsensusEvaluator();
    evaluator.addJudge(new LLMJudge('j1', 'm1', 1));
    evaluator.addJudge(new LLMJudge('j2', 'm2', 1));
    evaluator.addJudge(new LLMJudge('j3', 'm3', 1));

    const result = evaluator.evaluateConsensus(sample, rubric, 0.99);
    // With high temperature, variance may exist; we verify structure
    expect(result.evaluationResult.disagreements).toBeDefined();
    expect(result.evaluationResult.consensusLevel).toBeDefined();
  });

  it('reports confidence interval', () => {
    const evaluator = new ConsensusEvaluator();
    evaluator.addJudge(new LLMJudge('j1', 'm1', 0));
    evaluator.addJudge(new LLMJudge('j2', 'm2', 0));

    const result = evaluator.evaluateConsensus(sample, rubric);
    const ci = result.evaluationResult.overallScore.confidence95;
    expect(ci[0]).toBeLessThanOrEqual(ci[1]);
  });
});

describe('EvaluationAggregator', () => {
  it('aggregates empty results', () => {
    const aggregator = new EvaluationAggregator();
    const report = aggregator.aggregateBatch([]);
    expect(report.count).toBe(0);
    expect(report.meanOverall).toBe(0);
  });

  it('computes batch statistics', () => {
    const aggregator = new EvaluationAggregator();
    const mockResults = [
      {
        sampleId: 's1',
        rubricId: 'r1',
        aggregatedScores: {},
        overallScore: { mean: 3.5, stdDev: 0.2, confidence95: [3.1, 3.9] as [number, number] },
        consensusLevel: 'high' as const,
        disagreements: [],
        timestamp: Date.now()
      },
      {
        sampleId: 's2',
        rubricId: 'r1',
        aggregatedScores: {},
        overallScore: { mean: 4.2, stdDev: 0.3, confidence95: [3.6, 4.8] as [number, number] },
        consensusLevel: 'medium' as const,
        disagreements: [],
        timestamp: Date.now()
      }
    ];

    const report = aggregator.aggregateBatch(mockResults);
    expect(report.count).toBe(2);
    expect(report.meanOverall).toBeCloseTo(3.85, 2);
    expect(report.topSamples[0].score).toBeGreaterThanOrEqual(report.bottomSamples[0].score);
  });
});
