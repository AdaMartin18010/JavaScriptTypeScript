import { describe, it, expect } from 'vitest';
import {
  RuntimeTypeChecker,
  narrowUnknownToString,
  castAnyToType,
  compareAnyVsUnknown,
  demo,
} from './gradual-boundary-demo.js';

describe('gradual-boundary-demo', () => {
  it('应通过原始类型运行时检查', () => {
    expect(() => RuntimeTypeChecker.check<string>('hello', 'string')).not.toThrow();
    expect(() => RuntimeTypeChecker.check<number>(42, 'number')).not.toThrow();
    expect(() => RuntimeTypeChecker.check<boolean>(true, 'boolean')).not.toThrow();
  });

  it('应在原始类型不匹配时抛出 TypeError', () => {
    expect(() => RuntimeTypeChecker.check<string>(42, 'string')).toThrow(TypeError);
    expect(() => RuntimeTypeChecker.check<number>('42', 'number')).toThrow(TypeError);
    expect(() => RuntimeTypeChecker.check<boolean>(1, 'boolean')).toThrow(TypeError);
  });

  it('应通过数组类型运行时检查', () => {
    expect(() => RuntimeTypeChecker.check<number[]>([1, 2, 3], 'number[]')).not.toThrow();
    expect(() => RuntimeTypeChecker.check<string[]>(['a', 'b'], 'string[]')).not.toThrow();
  });

  it('应在数组元素类型不匹配时抛出 TypeError', () => {
    expect(() => RuntimeTypeChecker.check<number[]>([1, 'two', 3], 'number[]')).toThrow(TypeError);
  });

  it('应通过对象结构运行时检查', () => {
    expect(() =>
      RuntimeTypeChecker.check<{ name: string; age: number }>(
        { name: 'Alice', age: 30 },
        '{name:string,age:number}'
      )
    ).not.toThrow();
  });

  it('应在对象结构不匹配时抛出 TypeError', () => {
    expect(() =>
      RuntimeTypeChecker.check<{ name: string; age: number }>(
        { name: 'Alice', age: 'thirty' },
        '{name:string,age:number}'
      )
    ).toThrow(TypeError);
  });

  it('unknown 到具体类型需要显式窄化（成功场景）', () => {
    const raw: unknown = 'hello';
    const result = narrowUnknownToString(raw);
    expect(result).toBe('hello');
    expect(typeof result).toBe('string');
  });

  it('unknown 到具体类型需要显式窄化（失败场景）', () => {
    const raw: unknown = 42;
    expect(() => narrowUnknownToString(raw)).toThrow(TypeError);
  });

  it('any 可隐式转换为任何类型（演示 unsound 特性）', () => {
    const value: unknown = 42;
    const casted = castAnyToType<string>(value, 'string');
    // 运行时类型仍然是 number，但 any 语义允许这种转换
    expect(typeof casted).toBe('number');
  });

  it('compareAnyVsUnknown 应返回包含预期场景的对比结果', () => {
    const result = compareAnyVsUnknown();
    expect(result.length).toBeGreaterThanOrEqual(3);

    const scenarios = result.map((r) => r.scenario);
    expect(scenarios).toContain('赋值给 string 类型变量');
    expect(scenarios).toContain('访问不存在的属性 (.nonExistentProp)');
    expect(scenarios).toContain('作为函数调用');

    const assignment = result.find((r) => r.scenario === '赋值给 string 类型变量');
    expect(assignment!.anyBehavior).toContain('编译通过');
    expect(assignment!.unknownBehavior).toContain('TS 编译错误');
  });

  it('demo() 应无异常执行', () => {
    expect(() => demo()).not.toThrow();
  });
});
