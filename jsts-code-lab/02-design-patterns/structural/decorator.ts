/**
 * @file 装饰器模式 (Decorator Pattern)
 * @category Design Patterns → Structural
 * @difficulty easy
 * @tags decorator, structural, composition
 * 
 * @description
 * 动态地给对象添加额外的职责
 */

// ============================================================================
// 1. 组件接口
// ============================================================================

interface Coffee {
  cost(): number;
  description(): string;
}

// ============================================================================
// 2. 具体组件
// ============================================================================

class SimpleCoffee implements Coffee {
  cost(): number {
    return 10;
  }

  description(): string {
    return 'Simple coffee';
  }
}

// ============================================================================
// 3. 基础装饰器
// ============================================================================

abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}

  abstract cost(): number;
  abstract description(): string;
}

// ============================================================================
// 4. 具体装饰器
// ============================================================================

class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 2;
  }

  description(): string {
    return `${this.coffee.description()}, milk`;
  }
}

class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 1;
  }

  description(): string {
    return `${this.coffee.description()}, sugar`;
  }
}

class WhipDecorator extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 3;
  }

  description(): string {
    return `${this.coffee.description()}, whip`;
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

function orderCoffee(): void {
  let coffee: Coffee = new SimpleCoffee();
  console.log(`${coffee.description()} = $${coffee.cost()}`);

  coffee = new MilkDecorator(coffee);
  console.log(`${coffee.description()} = $${coffee.cost()}`);

  coffee = new SugarDecorator(coffee);
  console.log(`${coffee.description()} = $${coffee.cost()}`);

  // 链式装饰
  const deluxeCoffee = new WhipDecorator(new MilkDecorator(new SimpleCoffee()));
  console.log(`${deluxeCoffee.description()} = $${deluxeCoffee.cost()}`);
}

// ============================================================================
// 6. TypeScript 方法装饰器示例
// ============================================================================

function timing(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = original.apply(this, args);
    const end = performance.now();
    console.log(`${propertyKey} took ${end - start}ms`);
    return result;
  };
}

class Calculator {
  @timing
  heavyCalculation(n: number): number {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += i;
    }
    return sum;
  }
}

// ============================================================================
// 7. 函数组合装饰器 (JavaScript 方式)
// ============================================================================

type Fn<T, R> = (arg: T) => R;

function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg) => fns.reduce((acc, fn) => fn(acc), arg);
}

// 装饰函数
function withLogging<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, prop) {
      const value = target[prop as keyof T];
      if (typeof value === 'function') {
        return (...args: any[]) => {
          console.log(`Calling ${String(prop)} with`, args);
          const result = value.apply(target, args);
          console.log(`Result:`, result);
          return result;
        };
      }
      return value;
    }
  });
}

// ============================================================================
// 导出
// ============================================================================

export {
  SimpleCoffee,
  MilkDecorator,
  SugarDecorator,
  WhipDecorator,
  orderCoffee,
  timing,
  Calculator,
  compose,
  withLogging
};

export type { Coffee, Fn };
