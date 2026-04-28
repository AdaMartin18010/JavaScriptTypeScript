import { describe, it, expect } from 'vitest';
import {
  Pipeline,
  ValidationStage,
  TransformStage,
  FilterStage,
  AggregateStage,
  CSVParser,
  CSVTransformer,
  DataCleaningPipeline,
  BatchProcessor,
} from './pipeline.js';

describe('Pipeline', () => {
  it('should execute a single stage', async () => {
    const pipeline = new Pipeline<number>()
      .pipe(new TransformStage<number, number>(x => x * 2));

    expect(await pipeline.execute(5)).toBe(10);
  });

  it('should chain multiple stages', async () => {
    const pipeline = new Pipeline<number>()
      .pipe(new TransformStage<number, number>(x => x + 1))
      .pipe(new TransformStage<number, number>(x => x * 2));

    expect(await pipeline.execute(3)).toBe(8);
  });

  it('should handle async stages', async () => {
    const pipeline = new Pipeline<number>()
      .pipe({
        process: async (x: number) => x + 10
      });

    expect(await pipeline.execute(5)).toBe(15);
  });
});

describe('ValidationStage', () => {
  it('should pass valid data', () => {
    const stage = new ValidationStage({
      name: v => typeof v === 'string' && v.length > 0,
      age: v => typeof v === 'number' && v > 0,
    });

    expect(() => stage.process({ name: 'Alice', age: 30 })).not.toThrow();
  });

  it('should throw on invalid data', () => {
    const stage = new ValidationStage({
      name: v => typeof v === 'string' && v.length > 0,
    });

    expect(() => stage.process({ age: 30 })).toThrow('Validation failed for field: name');
  });
});

describe('FilterStage', () => {
  it('should filter items based on predicate', () => {
    const stage = new FilterStage<number>(x => x > 5);
    expect(stage.process([1, 6, 2, 8])).toEqual([6, 8]);
  });
});

describe('AggregateStage', () => {
  it('should aggregate items', () => {
    const stage = new AggregateStage<number, number>(nums => nums.reduce((a, b) => a + b, 0));
    expect(stage.process([1, 2, 3, 4])).toBe(10);
  });
});

describe('CSVParser', () => {
  it('should parse simple CSV', () => {
    const parser = new CSVParser();
    const result = parser.process('name,age\nAlice,30\nBob,25');
    expect(result).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ]);
  });

  it('should return empty array for insufficient lines', () => {
    const parser = new CSVParser();
    expect(parser.process('name,age')).toEqual([]);
  });
});

describe('CSVTransformer', () => {
  it('should transform specified columns', () => {
    const transformer = new CSVTransformer({
      name: v => v.toUpperCase(),
    });

    const result = transformer.process([{ name: 'Alice', age: '30' }]);
    expect(result).toEqual([{ name: 'ALICE', age: '30' }]);
  });
});

describe('DataCleaningPipeline', () => {
  it('should clean valid user data', async () => {
    const pipeline = DataCleaningPipeline.create();
    const result = await pipeline.execute({
      id: '1',
      name: '  ALICE  ',
      email: 'Alice@EXAMPLE.COM',
      age: 30,
    });

    expect(result).toMatchObject({
      id: '1',
      name: 'alice',
      email: 'alice@example.com',
      age: 30,
    });
  });

  it('should throw on invalid email', async () => {
    const pipeline = DataCleaningPipeline.create();
    await expect(
      pipeline.execute({ id: '1', name: 'Alice', email: 'invalid', age: 30 })
    ).rejects.toThrow('Validation failed for field: email');
  });
});

describe('BatchProcessor', () => {
  it('should process items in batches', async () => {
    const processor = new BatchProcessor<number, number>(2, async batch =>
      batch.map(x => x * 2)
    );

    const result = await processor.process([1, 2, 3, 4, 5]);
    expect(result).toEqual([2, 4, 6, 8, 10]);
  });

  it('should handle empty input', async () => {
    const processor = new BatchProcessor<number, number>(2, async batch =>
      batch.map(x => x * 2)
    );

    const result = await processor.process([]);
    expect(result).toEqual([]);
  });
});
