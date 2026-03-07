/**
 * @file 模板方法模式 (Template Method Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty easy
 * @tags template-method, behavioral, algorithm-skeleton
 * 
 * @description
 * 定义一个操作中的算法骨架，将某些步骤延迟到子类中实现
 */

// ============================================================================
// 1. 抽象类定义算法骨架
// ============================================================================

abstract class DataMiner {
  // 模板方法 - 定义算法骨架
  mine(path: string): void {
    const file = this.openFile(path);
    const rawData = this.extractData(file);
    const data = this.parseData(rawData);
    const analysis = this.analyzeData(data);
    this.sendReport(analysis);
    this.closeFile(file);
  }

  // 通用步骤
  protected analyzeData(data: unknown[]): string {
    console.log('Analyzing data...');
    return `Analysis of ${data.length} records`;
  }

  protected sendReport(analysis: string): void {
    console.log(`Sending report: ${analysis}`);
  }

  // 抽象步骤 - 子类必须实现
  protected abstract openFile(path: string): unknown;
  protected abstract extractData(file: unknown): string;
  protected abstract parseData(rawData: string): unknown[];
  protected abstract closeFile(file: unknown): void;

  // 钩子方法 - 子类可选择性重写
  protected shouldAnalyze(): boolean {
    return true;
  }
}

// ============================================================================
// 2. 具体实现
// ============================================================================

class PdfDataMiner extends DataMiner {
  protected openFile(path: string): unknown {
    console.log(`Opening PDF file: ${path}`);
    return { type: 'pdf', path };
  }

  protected extractData(file: unknown): string {
    console.log('Extracting data from PDF...');
    return 'pdf raw data';
  }

  protected parseData(rawData: string): unknown[] {
    console.log('Parsing PDF data...');
    return [{ type: 'pdf' }];
  }

  protected closeFile(file: unknown): void {
    console.log('Closing PDF file');
  }
}

class CsvDataMiner extends DataMiner {
  protected openFile(path: string): unknown {
    console.log(`Opening CSV file: ${path}`);
    return { type: 'csv', path };
  }

  protected extractData(file: unknown): string {
    console.log('Extracting data from CSV...');
    return 'csv raw data';
  }

  protected parseData(rawData: string): unknown[] {
    console.log('Parsing CSV data...');
    return [{ type: 'csv' }];
  }

  protected closeFile(file: unknown): void {
    console.log('Closing CSV file');
  }
}

// ============================================================================
// 3. 游戏AI示例
// ============================================================================

abstract class GameAI {
  // 模板方法
  takeTurn(): void {
    this.collectResources();
    this.buildStructures();
    this.buildUnits();
    this.attack();
    this.sendScouts();
    this.sendWarriors();
  }

  // 通用实现
  protected collectResources(): void {
    console.log('Collecting resources...');
  }

  protected buildStructures(): void {
    console.log('Building structures...');
  }

  protected buildUnits(): void {
    console.log('Building units...');
  }

  protected attack(): void {
    console.log('Attacking enemy...');
  }

  // 抽象方法 - 必须实现
  protected abstract sendScouts(): void;
  protected abstract sendWarriors(): void;
}

class OrcsAI extends GameAI {
  protected sendScouts(): void {
    console.log('Orc scout rushing to enemy base');
  }

  protected sendWarriors(): void {
    console.log('Orc warriors charging!');
  }

  protected override buildStructures(): void {
    console.log('Building orc strongholds...');
  }
}

class HumansAI extends GameAI {
  protected sendScouts(): void {
    console.log('Human scouts patrolling');
  }

  protected sendWarriors(): void {
    console.log('Human soldiers marching');
  }

  protected override buildStructures(): void {
    console.log('Building human castles...');
  }
}

// ============================================================================
// 4. JavaScript 函数式实现
// ============================================================================

type Step = () => void;

function createTemplateMethod(
  steps: Step[],
  hooks?: { before?: Step; after?: Step }
): () => void {
  return function () {
    hooks?.before?.();
    for (const step of steps) {
      step();
    }
    hooks?.after?.();
  };
}

// ============================================================================
// 导出
// ============================================================================

export {
  DataMiner,
  PdfDataMiner,
  CsvDataMiner,
  GameAI,
  OrcsAI,
  HumansAI,
  createTemplateMethod
};

export type { Step };
