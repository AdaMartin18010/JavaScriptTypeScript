/**
 * @file 智能测试选择器
 * @category AI Testing → Test Selection
 * @difficulty hard
 * @tags ai-testing, test-selection, regression-testing, impact-analysis
 *
 * @description
 * 基于代码变更的智能测试选择器，只运行受变更影响的测试子集。
 * 通过分析代码依赖关系和变更影响范围，优化回归测试效率。
 *
 * 选择策略：
 * - 依赖图分析：建立模块→测试的依赖映射
 * - 变更指纹匹配：基于文件路径、函数签名、AST 节点匹配
 * - 历史失败预测：优先选择历史上与变更区域相关的失败测试
 * - 风险评分：结合变更复杂度、历史缺陷密度计算风险
 */

export interface CodeChange {
  filePath: string;
  changeType: 'added' | 'modified' | 'deleted';
  linesAdded: number;
  linesDeleted: number;
  functionsChanged: string[];
}

export interface TestCase {
  id: string;
  name: string;
  filePath: string;
  dependencies: string[];
  coveredFiles: string[];
  coveredFunctions: string[];
  lastFailureTime?: number;
  avgDurationMs: number;
}

export interface TestSelectionResult {
  selectedTests: TestCase[];
  excludedTests: TestCase[];
  selectionRate: number;
  estimatedTimeSavedMs: number;
  selectionReasons: Map<string, string[]>;
}

// ==================== 依赖图 ====================

export class DependencyGraph {
  /** 文件 -> 依赖它的测试 */
  private fileToTests = new Map<string, Set<string>>();
  /** 函数 -> 依赖它的测试 */
  private functionToTests = new Map<string, Set<string>>();
  /** 测试 ID -> 测试对象 */
  private tests = new Map<string, TestCase>();

  addTest(test: TestCase): void {
    this.tests.set(test.id, test);

    for (const file of test.coveredFiles) {
      if (!this.fileToTests.has(file)) {
        this.fileToTests.set(file, new Set());
      }
      this.fileToTests.get(file)!.add(test.id);
    }

    for (const func of test.coveredFunctions) {
      if (!this.functionToTests.has(func)) {
        this.functionToTests.set(func, new Set());
      }
      this.functionToTests.get(func)!.add(test.id);
    }
  }

  getTestsForFile(filePath: string): TestCase[] {
    const ids = this.fileToTests.get(filePath);
    if (!ids) return [];
    return Array.from(ids).map(id => this.tests.get(id)).filter((t): t is TestCase => t !== undefined);
  }

  getTestsForFunction(functionName: string): TestCase[] {
    const ids = this.functionToTests.get(functionName);
    if (!ids) return [];
    return Array.from(ids).map(id => this.tests.get(id)).filter((t): t is TestCase => t !== undefined);
  }

  getAllTests(): TestCase[] {
    return Array.from(this.tests.values());
  }

  /** 基于文件路径模式查找相关测试 */
  getTestsForPattern(pattern: RegExp): TestCase[] {
    const results: TestCase[] = [];
    for (const test of this.tests.values()) {
      if (test.dependencies.some(dep => pattern.test(dep)) || pattern.test(test.filePath)) {
        results.push(test);
      }
    }
    return results;
  }
}

// ==================== 变更影响分析器 ====================

export class ImpactAnalyzer {
  /**
   * 分析变更影响范围
   */
  analyzeImpact(changes: CodeChange[], graph: DependencyGraph): Map<string, number> {
    const impactScores = new Map<string, number>();

    for (const change of changes) {
      // 1. 直接文件匹配
      const directTests = graph.getTestsForFile(change.filePath);
      for (const test of directTests) {
        impactScores.set(test.id, (impactScores.get(test.id) || 0) + 10);
      }

      // 2. 函数级匹配
      for (const func of change.functionsChanged) {
        const funcTests = graph.getTestsForFunction(func);
        for (const test of funcTests) {
          impactScores.set(test.id, (impactScores.get(test.id) || 0) + 15);
        }
      }

      // 3. 路径模式匹配（处理导入关系）
      const pathPattern = new RegExp(change.filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const patternTests = graph.getTestsForPattern(pathPattern);
      for (const test of patternTests) {
        impactScores.set(test.id, (impactScores.get(test.id) || 0) + 5);
      }

      // 4. 变更复杂度加权
      const complexityWeight = Math.log2(1 + change.linesAdded + change.linesDeleted);
      for (const [testId, score] of impactScores) {
        if (directTests.some(t => t.id === testId) || change.functionsChanged.some(f =>
          graph.getTestsForFunction(f).some(t => t.id === testId))) {
          impactScores.set(testId, score * (1 + complexityWeight * 0.1));
        }
      }
    }

    return impactScores;
  }
}

// ==================== 智能测试选择器 ====================

export interface SelectionOptions {
  /** 最小影响分数阈值 */
  minImpactScore?: number;
  /** 是否包含历史失败测试 */
  includeHistoricalFailures?: boolean;
  /** 历史失败权重衰减（毫秒） */
  failureDecayMs?: number;
  /** 最大选择比例 */
  maxSelectionRate?: number;
  /** 强制包含的测试 ID */
  forceInclude?: string[];
}

export class SmartTestSelector {
  private dependencyGraph = new DependencyGraph();
  private impactAnalyzer = new ImpactAnalyzer();

  registerTest(test: TestCase): void {
    this.dependencyGraph.addTest(test);
  }

  registerTests(tests: TestCase[]): void {
    for (const test of tests) {
      this.registerTest(test);
    }
  }

  /**
   * 基于代码变更选择需要运行的测试
   */
  selectTests(changes: CodeChange[], options: SelectionOptions = {}): TestSelectionResult {
    const {
      minImpactScore = 1,
      includeHistoricalFailures = true,
      failureDecayMs = 7 * 24 * 60 * 60 * 1000, // 7 天
      maxSelectionRate = 1.0,
      forceInclude = []
    } = options;

    const allTests = this.dependencyGraph.getAllTests();
    const impactScores = this.impactAnalyzer.analyzeImpact(changes, this.dependencyGraph);
    const selected = new Set<string>();
    const reasons = new Map<string, string[]>();

    // 1. 基于影响分数选择
    for (const [testId, score] of impactScores) {
      if (score >= minImpactScore) {
        selected.add(testId);
        if (!reasons.has(testId)) reasons.set(testId, []);
        reasons.get(testId)!.push(`impact-score: ${score.toFixed(1)}`);
      }
    }

    // 2. 包含历史失败测试
    if (includeHistoricalFailures) {
      const now = Date.now();
      for (const test of allTests) {
        if (test.lastFailureTime) {
          const age = now - test.lastFailureTime;
          const weight = Math.exp(-age / failureDecayMs);
          if (weight > 0.3) {
            selected.add(test.id);
            if (!reasons.has(test.id)) reasons.set(test.id, []);
            reasons.get(test.id)!.push(`historical-failure: weight=${weight.toFixed(2)}`);
          }
        }
      }
    }

    // 3. 强制包含
    for (const id of forceInclude) {
      selected.add(id);
      if (!reasons.has(id)) reasons.set(id, []);
      reasons.get(id)!.push('forced');
    }

    // 4. 限制选择比例
    let finalSelected: TestCase[];
    const maxCount = Math.floor(allTests.length * maxSelectionRate);

    if (selected.size > maxCount) {
      // 按影响分数排序，取前 N 个
      const scored = Array.from(selected)
        .map(id => ({ id, score: impactScores.get(id) || 0 }))
        .sort((a, b) => b.score - a.score);
      finalSelected = scored.slice(0, maxCount)
        .map(s => this.dependencyGraph.getAllTests().find(t => t.id === s.id))
        .filter((t): t is TestCase => t !== undefined);
    } else {
      finalSelected = allTests.filter(t => selected.has(t.id));
    }

    const excluded = allTests.filter(t => !selected.has(t.id));
    const totalDuration = allTests.reduce((sum, t) => sum + t.avgDurationMs, 0);
    const selectedDuration = finalSelected.reduce((sum, t) => sum + t.avgDurationMs, 0);

    return {
      selectedTests: finalSelected,
      excludedTests: excluded,
      selectionRate: allTests.length > 0 ? finalSelected.length / allTests.length : 0,
      estimatedTimeSavedMs: totalDuration - selectedDuration,
      selectionReasons: reasons
    };
  }

  /**
   * 生成选择报告
   */
  formatResult(result: TestSelectionResult): string {
    const lines = [
      'Smart Test Selection Report',
      '==========================',
      `Selected:    ${result.selectedTests.length} tests`,
      `Excluded:    ${result.excludedTests.length} tests`,
      `Selection rate: ${(result.selectionRate * 100).toFixed(1)}%`,
      `Time saved:  ${(result.estimatedTimeSavedMs / 1000).toFixed(1)}s`,
      '',
      'Selected Tests:',
      ...result.selectedTests.map(t => {
        const reason = result.selectionReasons.get(t.id)?.join(', ') || 'unknown';
        return `  [${t.id}] ${t.name} (${t.avgDurationMs}ms) - ${reason}`;
      })
    ];
    return lines.join('\n');
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 智能测试选择 ===\n');

  const selector = new SmartTestSelector();

  const tests: TestCase[] = [
    {
      id: 't1',
      name: 'should calculate sum',
      filePath: 'math.test.ts',
      dependencies: ['math.ts'],
      coveredFiles: ['math.ts'],
      coveredFunctions: ['add'],
      avgDurationMs: 50
    },
    {
      id: 't2',
      name: 'should calculate difference',
      filePath: 'math.test.ts',
      dependencies: ['math.ts'],
      coveredFiles: ['math.ts'],
      coveredFunctions: ['subtract'],
      avgDurationMs: 45
    },
    {
      id: 't3',
      name: 'should fetch user',
      filePath: 'api.test.ts',
      dependencies: ['api.ts', 'http.ts'],
      coveredFiles: ['api.ts', 'http.ts'],
      coveredFunctions: ['fetchUser'],
      avgDurationMs: 200,
      lastFailureTime: Date.now() - 86400000 // 1 天前失败
    },
    {
      id: 't4',
      name: 'should render button',
      filePath: 'ui.test.ts',
      dependencies: ['button.tsx'],
      coveredFiles: ['button.tsx'],
      coveredFunctions: ['Button'],
      avgDurationMs: 120
    },
    {
      id: 't5',
      name: 'should validate email',
      filePath: 'utils.test.ts',
      dependencies: ['utils.ts'],
      coveredFiles: ['utils.ts'],
      coveredFunctions: ['validateEmail'],
      avgDurationMs: 30
    }
  ];

  selector.registerTests(tests);

  // 模拟代码变更：修改了 math.ts 中的 add 函数
  const changes: CodeChange[] = [
    {
      filePath: 'math.ts',
      changeType: 'modified',
      linesAdded: 3,
      linesDeleted: 1,
      functionsChanged: ['add']
    }
  ];

  const result = selector.selectTests(changes, {
    minImpactScore: 5,
    includeHistoricalFailures: true
  });

  console.log(selector.formatResult(result));
}
