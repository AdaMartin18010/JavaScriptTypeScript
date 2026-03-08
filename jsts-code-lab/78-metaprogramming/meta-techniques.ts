/**
 * @file 元编程技术
 * @category Metaprogramming → Techniques
 * @difficulty hard
 * @tags metaprogramming, decorators, reflection, proxy
 */

// 装饰器实现
export function log(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`[LOG] Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`[LOG] ${propertyKey} returned:`, result);
    return result;
  };
}

export function measureTime(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    const start = performance.now();
    const result = await originalMethod.apply(this, args);
    const duration = performance.now() - start;
    console.log(`[TIME] ${propertyKey} took ${duration.toFixed(2)}ms`);
    return result;
  };
}

export function memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;
  const cache = new Map();
  
  descriptor.value = function(...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(`[CACHE] Hit for ${propertyKey}`);
      return cache.get(key);
    }
    
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

export function validate(schema: Record<string, (val: any) => boolean>) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const params = args[0];
      
      for (const [key, validator] of Object.entries(schema)) {
        if (!validator(params[key])) {
          throw new Error(`Validation failed for ${key}`);
        }
      }
      
      return originalMethod.apply(this, args);
    };
  };
}

// 类装饰器
export function singleton<T extends new (...args: any[]) => any>(constructor: T): T {
  let instance: any;
  
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this;
    }
  } as T;
}

export function sealed(constructor: Function): void {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

// 反射工具
export class Reflection {
  static getMethods(obj: object): string[] {
    const methods: string[] = [];
    let proto = Object.getPrototypeOf(obj);
    
    while (proto && proto !== Object.prototype) {
      methods.push(...Object.getOwnPropertyNames(proto)
        .filter(name => typeof obj[name as keyof typeof obj] === 'function' && name !== 'constructor'));
      proto = Object.getPrototypeOf(proto);
    }
    
    return [...new Set(methods)];
  }
  
  static getProperties(obj: object): string[] {
    return Object.getOwnPropertyNames(obj)
      .filter(name => typeof obj[name as keyof typeof obj] !== 'function');
  }
  
  static getMetadata(key: string, target: any): any {
    return Reflect.getMetadata?.(key, target);
  }
  
  static defineMetadata(key: string, value: any, target: any): void {
    Reflect.defineMetadata?.(key, value, target);
  }
}

// 代理模式高级应用
export function createObservable<T extends object>(obj: T, callback: (prop: string, oldVal: any, newVal: any) => void): T {
  return new Proxy(obj, {
    set(target, prop, value) {
      const oldValue = (target as any)[prop];
      const result = Reflect.set(target, prop, value);
      callback(String(prop), oldValue, value);
      return result;
    }
  });
}

export function createLazyObject<T extends Record<string, any>>(
  factory: (key: string) => any
): T {
  const cache = new Map<string, any>();
  
  return new Proxy({} as T, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined;
      
      if (!cache.has(prop)) {
        cache.set(prop, factory(prop));
      }
      
      return cache.get(prop);
    }
  });
}

export function createImmutable<T extends object>(obj: T): T {
  return new Proxy(obj, {
    set() {
      throw new Error('Cannot modify immutable object');
    },
    deleteProperty() {
      throw new Error('Cannot delete properties of immutable object');
    }
  });
}

// 代码生成器
export class CodeGenerator {
  private code: string[] = [];
  private indentLevel = 0;
  
  indent(): this {
    this.indentLevel++;
    return this;
  }
  
  dedent(): this {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
    return this;
  }
  
  line(content: string): this {
    const indent = '  '.repeat(this.indentLevel);
    this.code.push(indent + content);
    return this;
  }
  
  block(start: string, end: string, fn: () => void): this {
    this.line(start);
    this.indent();
    fn();
    this.dedent();
    this.line(end);
    return this;
  }
  
  generate(): string {
    return this.code.join('\n');
  }
}

// DSL构建器
export class DSLBuilder {
  private definitions: Map<string, any> = new Map();
  
  define(name: string, definition: any): this {
    this.definitions.set(name, definition);
    return this;
  }
  
  compile(): Record<string, Function> {
    const result: Record<string, Function> = {};
    
    for (const [name, def] of this.definitions) {
      if (typeof def === 'function') {
        result[name] = def;
      } else if (def.type === 'rule') {
        result[name] = (input: any) => this.evaluateRule(def, input);
      }
    }
    
    return result;
  }
  
  private evaluateRule(rule: any, input: any): boolean {
    switch (rule.operator) {
      case 'and':
        return rule.conditions.every((c: any) => this.evaluateRule(c, input));
      case 'or':
        return rule.conditions.some((c: any) => this.evaluateRule(c, input));
      case 'gt':
        return input[rule.field] > rule.value;
      case 'lt':
        return input[rule.field] < rule.value;
      case 'eq':
        return input[rule.field] === rule.value;
      default:
        return false;
    }
  }
}

// 依赖注入容器
export class DIContainer {
  private registrations: Map<string, { impl: any; singleton: boolean; instance?: any }> = new Map();
  
  register<T>(token: string, impl: new (...args: any[]) => T, singleton: boolean = false): void {
    this.registrations.set(token, { impl, singleton });
  }
  
  registerInstance<T>(token: string, instance: T): void {
    this.registrations.set(token, { impl: null, singleton: true, instance });
  }
  
  resolve<T>(token: string): T {
    const reg = this.registrations.get(token);
    if (!reg) throw new Error(`No registration for ${token}`);
    
    if (reg.singleton) {
      if (!reg.instance) {
        reg.instance = new reg.impl();
      }
      return reg.instance;
    }
    
    return new reg.impl();
  }
}

// 示例类（用于演示装饰器）
export class Calculator {
  fibonacci(n: number): number {
    if (n < 2) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
  
  async heavyCalculation(iterations: number): Promise<number> {
    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += Math.sqrt(i);
      await new Promise(r => setTimeout(r, 1));
    }
    return sum;
  }
  
  divide(params: { x: number; y: number }): number {
    return params.x / params.y;
  }
}

export function demo(): void {
  console.log('=== 元编程技术 ===\n');
  
  // 装饰器演示
  console.log('--- 装饰器 ---');
  const calc = new Calculator();
  
  console.log('Fibonacci(10):', calc.fibonacci(10));
  console.log('再次调用（应该命中缓存）:');
  calc.fibonacci(10);
  
  // 参数验证
  console.log('\n参数验证:');
  try {
    calc.divide({ x: 10, y: 0 });
  } catch (e) {
    console.log('验证错误:', (e as Error).message);
  }
  
  console.log('10 / 2 =', calc.divide({ x: 10, y: 2 }));
  
  // 反射
  console.log('\n--- 反射 ---');
  console.log('Calculator方法:', Reflection.getMethods(calc));
  
  // 代理
  console.log('\n--- 代理 ---');
  const state = createObservable({ count: 0, name: 'test' }, (prop, oldVal, newVal) => {
    console.log(`[Observer] ${prop}: ${oldVal} -> ${newVal}`);
  });
  
  state.count = 5;
  state.name = 'updated';
  
  // 不可变对象
  const immutable = createImmutable({ value: 42 });
  console.log('\n不可变对象:', immutable.value);
  try {
    (immutable as any).value = 100;
  } catch (e) {
    console.log('修改失败:', (e as Error).message);
  }
  
  // 代码生成
  console.log('\n--- 代码生成 ---');
  const gen = new CodeGenerator();
  gen
    .line('class Generated {')
    .indent()
    .line('constructor() {')
    .indent()
    .line('this.initialized = true;')
    .dedent()
    .line('}')
    .line('')
    .line('greet(name) {')
    .indent()
    .line('return `Hello, ${name}!`;')
    .dedent()
    .line('}')
    .dedent()
    .line('}');
  
  console.log('生成的代码:');
  console.log(gen.generate());
  
  // 依赖注入
  console.log('\n--- 依赖注入 ---');
  const container = new DIContainer();
  
  class Database {
    query() { return 'data'; }
  }
  
  class Service {
    constructor(public db: Database) {}
    getData() { return this.db.query(); }
  }
  
  container.register('db', Database, true);
  container.register('service', Service);
  
  const db1 = container.resolve<Database>('db');
  const db2 = container.resolve<Database>('db');
  console.log('单例模式:', db1 === db2 ? '同一实例' : '不同实例');
}
