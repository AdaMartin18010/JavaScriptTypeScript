/**
 * @file 数据处理管道
 * @category Real World Examples → Data Processing
 * @difficulty medium
 * @tags data-processing, pipeline, etl, stream
 */

// ============================================================================
// 1. 管道阶段接口
// ============================================================================

interface PipelineStage<I, O> {
  process(input: I): O | Promise<O>;
}

// ============================================================================
// 2. 管道构建器
// ============================================================================

class Pipeline<T> {
  private stages: Array<(input: unknown) => unknown> = [];

  pipe<U>(stage: PipelineStage<T, U>): Pipeline<U> {
    this.stages.push(stage.process.bind(stage) as (input: unknown) => unknown);
    return this as unknown as Pipeline<U>;
  }

  async execute(input: T): Promise<unknown> {
    let result: unknown = input;
    for (const stage of this.stages) {
      result = await stage(result);
    }
    return result;
  }
}

// ============================================================================
// 3. 具体处理阶段
// ============================================================================

// 验证阶段
class ValidationStage implements PipelineStage<unknown, unknown> {
  constructor(private schema: Record<string, (value: unknown) => boolean>) {}

  process(input: unknown): unknown {
    const data = input as Record<string, unknown>;
    for (const [key, validator] of Object.entries(this.schema)) {
      if (!(key in data) || !validator(data[key])) {
        throw new Error(`Validation failed for field: ${key}`);
      }
    }
    return input;
  }
}

// 转换阶段
class TransformStage<T, U> implements PipelineStage<T, U> {
  constructor(private transformer: (input: T) => U) {}

  process(input: T): U {
    return this.transformer(input);
  }
}

// 过滤阶段
class FilterStage<T> implements PipelineStage<T[], T[]> {
  constructor(private predicate: (item: T) => boolean) {}

  process(input: T[]): T[] {
    return input.filter(this.predicate);
  }
}

// 聚合阶段
class AggregateStage<T, U> implements PipelineStage<T[], U> {
  constructor(private aggregator: (items: T[]) => U) {}

  process(input: T[]): U {
    return this.aggregator(input);
  }
}

// ============================================================================
// 4. CSV 处理器
// ============================================================================

interface CSVRow {
  [key: string]: string;
}

class CSVParser implements PipelineStage<string, CSVRow[]> {
  process(input: string): CSVRow[] {
    const lines = input.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: CSVRow = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
  }
}

class CSVTransformer implements PipelineStage<CSVRow[], CSVRow[]> {
  constructor(private transforms: Record<string, (value: string) => string>) {}

  process(input: CSVRow[]): CSVRow[] {
    return input.map(row => {
      const newRow: CSVRow = { ...row };
      for (const [key, transform] of Object.entries(this.transforms)) {
        if (key in newRow) {
          newRow[key] = transform(newRow[key]);
        }
      }
      return newRow;
    });
  }
}

// ============================================================================
// 5. 数据清洗管道
// ============================================================================

interface UserData {
  id: string;
  name: string;
  email: string;
  age: number;
}

class DataCleaningPipeline {
  static create() {
    return new Pipeline<unknown>()
      .pipe(new ValidationStage({
        id: v => typeof v === 'string' && v.length > 0,
        name: v => typeof v === 'string' && v.length > 0,
        email: v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        age: v => typeof v === 'number' && v > 0
      }))
      .pipe(new TransformStage<unknown, UserData>(input => input as UserData))
      .pipe(new TransformStage<UserData, UserData>(user => ({
        ...user,
        name: user.name.trim().toLowerCase(),
        email: user.email.trim().toLowerCase()
      })));
  }
}

// ============================================================================
// 6. 批处理
// ============================================================================

class BatchProcessor<T, R> {
  constructor(
    private batchSize: number,
    private processor: (batch: T[]) => Promise<R[]>
  ) {}

  async process(items: T[]): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchResults = await this.processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  }
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export async function demo() {
  // CSV 处理管道
  const csvPipeline = new Pipeline<string>()
    .pipe(new CSVParser())
    .pipe(new CSVTransformer({
      email: v => v.toLowerCase(),
      name: v => v.trim()
    }))
    .pipe(new FilterStage<CSVRow>(row => row.email.includes('@')));

  const csvData = `name,email
  John Doe, john@example.com
  Jane Smith, jane@example.com
  Invalid User, invalid-email`;

  const processed = await csvPipeline.execute(csvData);
  console.log(processed);

  // 批处理
  const batchProcessor = new BatchProcessor<number, number>(
    100,
    async (batch) => batch.map(n => n * 2)
  );

  const numbers = Array.from({ length: 1000 }, (_, i) => i);
  const doubled = await batchProcessor.process(numbers);
  console.log(doubled.slice(0, 10)); // [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
}

// ============================================================================
// 导出
// ============================================================================

export {
  Pipeline,
  ValidationStage,
  TransformStage,
  FilterStage,
  AggregateStage,
  CSVParser,
  CSVTransformer,
  DataCleaningPipeline,
  BatchProcessor,
  demo
};

export type { PipelineStage, CSVRow, UserData };
