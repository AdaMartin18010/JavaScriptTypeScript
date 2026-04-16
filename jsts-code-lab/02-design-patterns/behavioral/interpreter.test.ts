import { describe, it, expect } from 'vitest';
import {
  NumberExpression,
  VariableExpression,
  AddExpression,
  SubtractExpression,
  MultiplyExpression,
  DivideExpression,
  Parser,
  ComparisonRule,
  AndRule,
  OrRule,
  SelectQuery,
  WhereClause
} from './interpreter.js';

describe('interpreter pattern', () => {
  it('should evaluate basic arithmetic expressions', () => {
    const expr = new AddExpression(new NumberExpression(2), new NumberExpression(3));
    expect(expr.interpret(new Map())).toBe(5);
  });

  it('should evaluate expressions with variables', () => {
    const context = new Map<string, number>([['x', 10], ['y', 5]]);
    const expr = new AddExpression(
      new VariableExpression('x'),
      new MultiplyExpression(new VariableExpression('y'), new NumberExpression(2))
    );
    expect(expr.interpret(context)).toBe(20);
  });

  it('Parser should parse and evaluate math expressions', () => {
    const parser = new Parser();
    expect(parser.parse('2 + 3').interpret(new Map())).toBe(5);
    expect(parser.parse('10 - 4 * 2').interpret(new Map())).toBe(2);
    expect(parser.parse('(1 + 2) * 3').interpret(new Map())).toBe(9);
    expect(parser.parse('100 / 5 + 5').interpret(new Map())).toBe(25);
  });

  it('should throw on division by zero', () => {
    const expr = new DivideExpression(new NumberExpression(10), new NumberExpression(0));
    expect(() => expr.interpret(new Map())).toThrow('Division by zero');
  });

  it('ComparisonRule should evaluate correctly', () => {
    const rule = new ComparisonRule('age', '>=', 18);
    expect(rule.evaluate(new Map([['age', 25]]))).toBe(true);
    expect(rule.evaluate(new Map([['age', 16]]))).toBe(false);
  });

  it('AndRule and OrRule should combine rules', () => {
    const ageRule = new ComparisonRule('age', '>=', 18);
    const incomeRule = new ComparisonRule('income', '>=', 50000);
    const andRule = new AndRule([ageRule, incomeRule]);
    const orRule = new OrRule([ageRule, incomeRule]);

    expect(andRule.evaluate(new Map([['age', 25], ['income', 60000]]))).toBe(true);
    expect(andRule.evaluate(new Map([['age', 16], ['income', 60000]]))).toBe(false);
    expect(orRule.evaluate(new Map([['age', 25], ['income', 40000]]))).toBe(true);
  });

  it('SelectQuery should filter and project data', () => {
    const data = [
      { name: 'Alice', age: 25, city: 'NYC' },
      { name: 'Bob', age: 30, city: 'LA' },
      { name: 'Carol', age: 25, city: 'NYC' }
    ];

    const query = new SelectQuery(['name', 'age'], 'people', new WhereClause('city', '=', 'NYC'));
    const results = query.execute(data);

    expect(results).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Carol', age: 25 }
    ]);
  });

  it('SelectQuery with * should return all columns', () => {
    const data = [{ name: 'Alice', age: 25 }];
    const query = new SelectQuery(['*'], 'people');
    expect(query.execute(data)).toEqual([{ name: 'Alice', age: 25 }]);
  });
});
