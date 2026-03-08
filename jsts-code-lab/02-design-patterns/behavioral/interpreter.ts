/**
 * @file 解释器模式 (Interpreter Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty hard
 * @tags interpreter, behavioral, domain-specific-language, grammar
 * 
 * @description
 * 给定一个语言，定义它的文法表示，并定义一个解释器来解释这个语言中的句子
 */

// ============================================================================
// 1. 表达式接口
// ============================================================================

interface Expression {
  interpret(context: Map<string, number>): number;
}

// ============================================================================
// 2. 终结符表达式
// ============================================================================

class NumberExpression implements Expression {
  constructor(private number: number) {}

  interpret(): number {
    return this.number;
  }
}

class VariableExpression implements Expression {
  constructor(private name: string) {}

  interpret(context: Map<string, number>): number {
    const value = context.get(this.name);
    if (value === undefined) {
      throw new Error(`Variable ${this.name} not found`);
    }
    return value;
  }
}

// ============================================================================
// 3. 非终结符表达式
// ============================================================================

class AddExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression
  ) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

class SubtractExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression
  ) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) - this.right.interpret(context);
  }
}

class MultiplyExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression
  ) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) * this.right.interpret(context);
  }
}

class DivideExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression
  ) {}

  interpret(context: Map<string, number>): number {
    const divisor = this.right.interpret(context);
    if (divisor === 0) {
      throw new Error('Division by zero');
    }
    return this.left.interpret(context) / divisor;
  }
}

// ============================================================================
// 4. 解析器
// ============================================================================

class Parser {
  private tokens: string[] = [];
  private position = 0;

  parse(expression: string): Expression {
    this.tokens = expression.match(/\d+\.?\d*|[a-zA-Z]+|[+\-*/()]/g) || [];
    this.position = 0;
    return this.parseExpression();
  }

  private parseExpression(): Expression {
    let left = this.parseTerm();

    while (this.current() === '+' || this.current() === '-') {
      const operator = this.consume();
      const right = this.parseTerm();
      if (operator === '+') {
        left = new AddExpression(left, right);
      } else {
        left = new SubtractExpression(left, right);
      }
    }

    return left;
  }

  private parseTerm(): Expression {
    let left = this.parseFactor();

    while (this.current() === '*' || this.current() === '/') {
      const operator = this.consume();
      const right = this.parseFactor();
      if (operator === '*') {
        left = new MultiplyExpression(left, right);
      } else {
        left = new DivideExpression(left, right);
      }
    }

    return left;
  }

  private parseFactor(): Expression {
    const token = this.consume();

    if (token === '(') {
      const expression = this.parseExpression();
      this.consume(); // consume ')'
      return expression;
    }

    if (/^\d/.test(token)) {
      return new NumberExpression(parseFloat(token));
    }

    return new VariableExpression(token);
  }

  private current(): string {
    return this.tokens[this.position] || '';
  }

  private consume(): string {
    return this.tokens[this.position++] || '';
  }
}

// ============================================================================
// 5. 规则引擎示例
// ============================================================================

interface Rule {
  evaluate(facts: Map<string, unknown>): boolean;
}

class ComparisonRule implements Rule {
  constructor(
    private field: string,
    private operator: '>' | '<' | '>=' | '<=' | '=' | '!=',
    private value: number
  ) {}

  evaluate(facts: Map<string, unknown>): boolean {
    const fieldValue = facts.get(this.field);
    if (typeof fieldValue !== 'number') return false;

    switch (this.operator) {
      case '>': return fieldValue > this.value;
      case '<': return fieldValue < this.value;
      case '>=': return fieldValue >= this.value;
      case '<=': return fieldValue <= this.value;
      case '=': return fieldValue === this.value;
      case '!=': return fieldValue !== this.value;
    }
  }
}

class AndRule implements Rule {
  constructor(private rules: Rule[]) {}

  evaluate(facts: Map<string, unknown>): boolean {
    return this.rules.every(rule => rule.evaluate(facts));
  }
}

class OrRule implements Rule {
  constructor(private rules: Rule[]) {}

  evaluate(facts: Map<string, unknown>): boolean {
    return this.rules.some(rule => rule.evaluate(facts));
  }
}

// ============================================================================
// 6. SQL 解析器示例
// ============================================================================

interface Query {
  execute(data: Record<string, unknown>[]): Record<string, unknown>[];
}

class SelectQuery implements Query {
  constructor(
    private columns: string[],
    private from: string,
    private where?: WhereClause
  ) {}

  execute(data: Record<string, unknown>[]): Record<string, unknown>[] {
    let result = data;

    if (this.where) {
      result = result.filter(row => this.where!.evaluate(row));
    }

    if (this.columns.length === 1 && this.columns[0] === '*') {
      return result;
    }

    return result.map(row => {
      const filtered: Record<string, unknown> = {};
      for (const col of this.columns) {
        filtered[col] = row[col];
      }
      return filtered;
    });
  }
}

class WhereClause {
  constructor(
    private field: string,
    private operator: string,
    private value: unknown
  ) {}

  evaluate(row: Record<string, unknown>): boolean {
    const fieldValue = row[this.field];
    switch (this.operator) {
      case '=': return fieldValue === this.value;
      case '!=': return fieldValue !== this.value;
      case '>': return (fieldValue as number) > (this.value as number);
      case '<': return (fieldValue as number) < (this.value as number);
      default: return false;
    }
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
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
};

export type { Expression, Rule, Query };

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Interpreter Pattern Demo ===");

  // 数学表达式解析
  const parser = new Parser();

  console.log("\nMath Expressions:");
  const expressions = ["2 + 3", "10 - 4 * 2", "(1 + 2) * 3", "100 / 5 + 5"];

  for (const expr of expressions) {
    const parsed = parser.parse(expr);
    const result = parsed.interpret(new Map());
    console.log(`${expr} = ${result}`);
  }

  // 带变量的表达式
  console.log("\nExpressions with variables:");
  const context = new Map<string, number>([["x", 10], ["y", 5]]);
  const varExpr = parser.parse("x + y * 2");
  console.log(`x=10, y=5: x + y * 2 = ${varExpr.interpret(context)}`);

  // 规则引擎演示
  console.log("\nRule Engine:");
  const ageRule = new ComparisonRule("age", ">=", 18);
  const incomeRule = new ComparisonRule("income", ">=", 50000);
  const combinedRule = new AndRule([ageRule, incomeRule]);

  const eligiblePerson = new Map<string, unknown>([["age", 25], ["income", 60000]]);
  const ineligiblePerson = new Map<string, unknown>([["age", 16], ["income", 60000]]);

  console.log("Person (age=25, income=60000) eligible:", combinedRule.evaluate(eligiblePerson));
  console.log("Person (age=16, income=60000) eligible:", combinedRule.evaluate(ineligiblePerson));

  // SQL查询演示
  console.log("\nSQL-like Query:");
  const data = [
    { name: "Alice", age: 25, city: "NYC" },
    { name: "Bob", age: 30, city: "LA" },
    { name: "Carol", age: 25, city: "NYC" }
  ];

  const query = new SelectQuery(["name", "age"], "people", new WhereClause("city", "=", "NYC"));
  const results = query.execute(data);
  console.log("SELECT name, age FROM people WHERE city = 'NYC':");
  console.log(results);

  console.log("=== End of Demo ===\n");
}
