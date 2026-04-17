/**
 * @file 反射系统实现
 * @category Metaprogramming → Reflection
 * @difficulty hard
 * @tags metaprogramming, reflection, introspection, metadata
 *
 * @description
 * 强大的反射系统，支持运行时类型检查、对象内省和动态代码操作。
 *
 * 反射能力：
 * - 类型检查: 运行时获取类型信息
 * - 对象内省: 检查对象结构和方法
 * - 动态调用: 运行时调用方法和访问属性
 * - 代理创建: 动态代理和拦截
 * - 类操作: 类的继承链分析
 */

import 'reflect-metadata';

// ==================== 类型反射 ====================

export class TypeReflector {
  /**
   * 获取值的类型名称
   */
  static getTypeName(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      return value.constructor?.name || 'Object';
    }
    return typeof value;
  }

  /**
   * 检查是否为指定类型
   */
  static isType<T>(value: unknown, type: new (...args: any[]) => T): value is T {
    return value instanceof type;
  }

  /**
   * 检查是否为基本类型
   */
  static isPrimitive(value: unknown): value is string | number | boolean | symbol | null | undefined {
    return value === null || 
           value === undefined || 
           typeof value !== 'object' && typeof value !== 'function';
  }

  /**
   * 获取类型的层次结构
   */
  static getPrototypeChain(ctor: Function): Function[] {
    const chain: Function[] = [ctor];
    let proto = Object.getPrototypeOf(ctor);

    while (proto && proto !== Function.prototype) {
      chain.push(proto);
      proto = Object.getPrototypeOf(proto);
    }

    return chain;
  }

  /**
   * 获取所有实现的接口（基于元数据）
   */
  static getImplementedInterfaces(target: any): string[] {
    return Reflect.getMetadata('design:interfaces', target) || [];
  }
}

// ==================== 对象反射 ====================

export interface PropertyInfo {
  name: string | symbol;
  type: string;
  enumerable: boolean;
  configurable: boolean;
  writable?: boolean;
  value?: unknown;
  getter?: boolean;
  setter?: boolean;
}

export interface MethodInfo {
  name: string | symbol;
  parameters: ParameterInfo[];
  returnType?: string;
  async: boolean;
  static: boolean;
}

export interface ParameterInfo {
  index: number;
  name?: string;
  type?: string;
  optional: boolean;
}

export class ObjectReflector {
  /**
   * 获取对象的所有属性信息
   */
  static getProperties(obj: object): PropertyInfo[] {
    const properties: PropertyInfo[] = [];
    const prototype = Object.getPrototypeOf(obj);
    const descriptors = this.getAllPropertyDescriptors(prototype);

    for (const [key, descriptor] of descriptors) {
      properties.push({
        name: key,
        type: TypeReflector.getTypeName(descriptor.value),
        enumerable: descriptor.enumerable ?? false,
        configurable: descriptor.configurable ?? false,
        writable: descriptor.writable,
        value: descriptor.value,
        getter: !!descriptor.get,
        setter: !!descriptor.set
      });
    }

    return properties;
  }

  /**
   * 获取对象的所有方法信息
   */
  static getMethods(obj: object): MethodInfo[] {
    const methods: MethodInfo[] = [];
    let prototype = Object.getPrototypeOf(obj);

    while (prototype && prototype !== Object.prototype) {
      const names = Object.getOwnPropertyNames(prototype);

      for (const name of names) {
        if (name === 'constructor') continue;

        const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (typeof descriptor?.value === 'function') {
          const paramTypes = Reflect.getMetadata('design:paramtypes', prototype, name) || [];
          const returnType = Reflect.getMetadata('design:returntype', prototype, name);

          methods.push({
            name,
            parameters: paramTypes.map((type: any, index: number) => ({
              index,
              name: `arg${index}`,
              type: type?.name || 'unknown',
              optional: false
            })),
            returnType: returnType?.name,
            async: descriptor.value[Symbol.toStringTag] === 'AsyncFunction',
            static: false
          });
        }
      }

      prototype = Object.getPrototypeOf(prototype);
    }

    return methods;
  }

  /**
   * 动态调用方法
   */
  static invokeMethod(obj: object, methodName: string | symbol, args: any[] = []): any {
    const method = (obj as any)[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method ${String(methodName)} not found`);
    }
    return method.apply(obj, args);
  }

  /**
   * 动态获取/设置属性
   */
  static getProperty(obj: object, propertyName: string | symbol): any {
    return (obj as any)[propertyName];
  }

  static setProperty(obj: object, propertyName: string | symbol, value: any): void {
    (obj as any)[propertyName] = value;
  }

  /**
   * 检查对象是否有指定属性
   */
  static hasProperty(obj: object, propertyName: string | symbol): boolean {
    return propertyName in obj;
  }

  /**
   * 获取属性的描述符
   */
  static getPropertyDescriptor(obj: object, propertyName: string | symbol): PropertyDescriptor | undefined {
    let target = obj;
    
    while (target) {
      const descriptor = Object.getOwnPropertyDescriptor(target, propertyName);
      if (descriptor) return descriptor;
      
      target = Object.getPrototypeOf(target);
    }
    
    return undefined;
  }

  private static getAllPropertyDescriptors(obj: object): Map<string | symbol, PropertyDescriptor> {
    const descriptors = new Map<string | symbol, PropertyDescriptor>();
    let target = obj;

    while (target && target !== Object.prototype) {
      const names = [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertySymbols(target)];
      
      for (const name of names) {
        if (!descriptors.has(name)) {
          const descriptor = Object.getOwnPropertyDescriptor(target, name);
          if (descriptor) {
            descriptors.set(name, descriptor);
          }
        }
      }

      target = Object.getPrototypeOf(target);
    }

    return descriptors;
  }
}

// ==================== 类反射 ====================

export interface ClassInfo {
  name: string;
  baseClass?: string;
  interfaces: string[];
  constructors: ConstructorInfo[];
  properties: PropertyInfo[];
  methods: MethodInfo[];
  staticProperties: PropertyInfo[];
  staticMethods: MethodInfo[];
}

export interface ConstructorInfo {
  parameters: ParameterInfo[];
}

export class ClassReflector {
  /**
   * 获取类的完整信息
   */
  static getClassInfo(ctor: new (...args: any[]) => any): ClassInfo {
    const prototype = ctor.prototype;
    const instance = Object.create(prototype);

    return {
      name: ctor.name,
      baseClass: Object.getPrototypeOf(ctor)?.name,
      interfaces: TypeReflector.getImplementedInterfaces(ctor),
      constructors: this.getConstructors(ctor),
      properties: ObjectReflector.getProperties(instance),
      methods: ObjectReflector.getMethods(instance),
      staticProperties: this.getStaticProperties(ctor),
      staticMethods: this.getStaticMethods(ctor)
    };
  }

  /**
   * 创建类的实例
   */
  static createInstance<T>(ctor: new (...args: any[]) => T, args: any[] = []): T {
    return new ctor(...args);
  }

  /**
   * 检查类是否实现了接口
   */
  static implementsInterface(ctor: new (...args: any[]) => any, interfaceName: string): boolean {
    const interfaces = TypeReflector.getImplementedInterfaces(ctor);
    return interfaces.includes(interfaceName);
  }

  /**
   * 获取类的继承链
   */
  static getInheritanceChain(ctor: new (...args: any[]) => any): string[] {
    const chain: string[] = [ctor.name];
    let proto = Object.getPrototypeOf(ctor);

    while (proto && proto !== Function.prototype && proto.name) {
      chain.push(proto.name);
      proto = Object.getPrototypeOf(proto);
    }

    return chain;
  }

  /**
   * 混入多个类
   */
  static mixin<T extends new (...args: any[]) => any>(
    baseClass: T,
    ...mixins: (new (...args: any[]) => any)[]
  ): T {
    class MixedClass extends baseClass {}

    for (const mixin of mixins) {
      const mixinPrototype = mixin.prototype;
      const propertyNames = Object.getOwnPropertyNames(mixinPrototype);

      for (const name of propertyNames) {
        if (name !== 'constructor') {
          const descriptor = Object.getOwnPropertyDescriptor(mixinPrototype, name);
          if (descriptor) {
            Object.defineProperty(MixedClass.prototype, name, descriptor);
          }
        }
      }
    }

    return MixedClass as T;
  }

  private static getConstructors(ctor: new (...args: any[]) => any): ConstructorInfo[] {
    const paramTypes = Reflect.getMetadata('design:paramtypes', ctor) || [];
    
    return [{
      parameters: paramTypes.map((type: any, index: number) => ({
        index,
        type: type?.name || 'unknown',
        optional: false
      }))
    }];
  }

  private static getStaticProperties(ctor: new (...args: any[]) => any): PropertyInfo[] {
    const properties: PropertyInfo[] = [];
    const names = Object.getOwnPropertyNames(ctor);

    for (const name of names) {
      const descriptor = Object.getOwnPropertyDescriptor(ctor, name);
      if (descriptor && typeof descriptor.value !== 'function') {
        properties.push({
          name,
          type: TypeReflector.getTypeName(descriptor.value),
          enumerable: descriptor.enumerable ?? false,
          configurable: descriptor.configurable ?? false,
          writable: descriptor.writable,
          value: descriptor.value
        });
      }
    }

    return properties;
  }

  private static getStaticMethods(ctor: new (...args: any[]) => any): MethodInfo[] {
    const methods: MethodInfo[] = [];
    const names = Object.getOwnPropertyNames(ctor);

    for (const name of names) {
      const descriptor = Object.getOwnPropertyDescriptor(ctor, name);
      if (descriptor && typeof descriptor.value === 'function') {
        methods.push({
          name,
          parameters: [],
          async: descriptor.value[Symbol.toStringTag] === 'AsyncFunction',
          static: true
        });
      }
    }

    return methods;
  }
}

// ==================== 元数据反射 ====================

export class MetadataReflector {
  /**
   * 定义元数据
   */
  static define(metadataKey: any, metadataValue: any, target: object, propertyKey?: string | symbol): void {
    if (propertyKey) {
      Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
    } else {
      Reflect.defineMetadata(metadataKey, metadataValue, target);
    }
  }

  /**
   * 获取元数据
   */
  static get(metadataKey: any, target: object, propertyKey?: string | symbol): any {
    if (propertyKey) {
      return Reflect.getMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.getMetadata(metadataKey, target);
  }

  /**
   * 检查元数据是否存在
   */
  static has(metadataKey: any, target: object, propertyKey?: string | symbol): boolean {
    if (propertyKey) {
      return Reflect.hasMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.hasMetadata(metadataKey, target);
  }

  /**
   * 获取所有元数据键
   */
  static getKeys(target: object, propertyKey?: string | symbol): any[] {
    if (propertyKey) {
      return Reflect.getMetadataKeys(target, propertyKey);
    }
    return Reflect.getMetadataKeys(target);
  }
}

// ==================== 代理工厂 ====================

export class ProxyFactory {
  /**
   * 创建观察代理
   */
  static createObservable<T extends object>(
    target: T,
    onChange: (property: string | symbol, oldValue: any, newValue: any) => void
  ): T {
    return new Proxy(target, {
      set(obj, prop, value) {
        const oldValue = (obj as any)[prop];
        const result = Reflect.set(obj, prop, value);
        if (oldValue !== value) {
          onChange(prop, oldValue, value);
        }
        return result;
      }
    });
  }

  /**
   * 创建验证代理
   */
  static createValidator<T extends object>(
    target: T,
    validators: Record<string | symbol, (value: any) => boolean | string>
  ): T {
    return new Proxy(target, {
      set(obj, prop, value) {
        const validator = validators[prop];
        if (validator) {
          const result = validator(value);
          if (result !== true) {
            throw new Error(typeof result === 'string' ? result : `Invalid value for ${String(prop)}`);
          }
        }
        return Reflect.set(obj, prop, value);
      }
    });
  }

  /**
   * 创建延迟加载代理
   */
  static createLazy<T extends object>(
    factory: (key: string | symbol) => any
  ): T {
    const cache = new Map<string | symbol, any>();

    return new Proxy({} as T, {
      get(_obj, prop) {
        if (typeof prop !== 'string' && typeof prop !== 'symbol') return undefined;

        if (!cache.has(prop)) {
          cache.set(prop, factory(prop));
        }
        return cache.get(prop);
      }
    });
  }

  /**
   * 创建不可变代理
   */
  static createImmutable<T extends object>(target: T): Readonly<T> {
    return new Proxy(target, {
      set() {
        throw new Error('Cannot modify immutable object');
      },
      deleteProperty() {
        throw new Error('Cannot delete properties of immutable object');
      }
    }) as Readonly<T>;
  }

  /**
   * 创建方法拦截代理
   */
  static createInterceptor<T extends object>(
    target: T,
    handlers: {
      before?: (method: string | symbol, args: any[]) => void | Promise<void>;
      after?: (method: string | symbol, args: any[], result: any) => void | Promise<void>;
      onError?: (method: string | symbol, args: any[], error: Error) => void;
    }
  ): T {
    return new Proxy(target, {
      get(obj, prop) {
        const value = (obj as any)[prop];
        
        if (typeof value === 'function') {
          return async function (...args: any[]) {
            try {
              if (handlers.before) {
                await handlers.before(prop, args);
              }

              const result = await value.apply(obj, args);

              if (handlers.after) {
                await handlers.after(prop, args, result);
              }

              return result;
            } catch (error) {
              if (handlers.onError) {
                handlers.onError(prop, args, error as Error);
              }
              throw error;
            }
          };
        }

        return value;
      }
    });
  }
}

// ==================== 演示 ====================

interface ILogger {
  log(message: string): void;
}

class BaseService {
  protected name = 'BaseService';
  
  baseMethod() {
    return 'base';
  }
}

class UserService extends BaseService implements ILogger {
  private users = new Map<string, any>();
  
  constructor() {
    super();
  }

  log(message: string): void {
    console.log(`[UserService] ${message}`);
  }

  async getUser(id: string): Promise<any> {
    return this.users.get(id);
  }

  createUser(data: { name: string; email: string }): any {
    const id = `user-${Date.now()}`;
    this.users.set(id, { id, ...data });
    return { id, ...data };
  }

  static staticMethod(): string {
    return 'static';
  }
}

export function demo(): void {
  console.log('=== 反射系统 ===\n');

  // 类型反射
  console.log('--- 类型反射 ---');
  console.log('Type of "hello":', TypeReflector.getTypeName('hello'));
  console.log('Type of {}:', TypeReflector.getTypeName({}));
  console.log('Type of new Date():', TypeReflector.getTypeName(new Date()));

  const service = new UserService();

  // 对象反射
  console.log('\n--- 对象反射 ---');
  const properties = ObjectReflector.getProperties(service);
  console.log('Properties:', properties.map(p => String(p.name)));

  const methods = ObjectReflector.getMethods(service);
  console.log('Methods:', methods.map(m => String(m.name)));

  // 动态调用
  console.log('\n--- 动态调用 ---');
  const result = ObjectReflector.invokeMethod(service, 'createUser', [{ name: 'John', email: 'john@example.com' }]);
  console.log('Dynamic call result:', result);

  // 类反射
  console.log('\n--- 类反射 ---');
  const classInfo = ClassReflector.getClassInfo(UserService);
  console.log('Class name:', classInfo.name);
  console.log('Base class:', classInfo.baseClass);
  console.log('Inheritance chain:', ClassReflector.getInheritanceChain(UserService));

  // 元数据反射
  console.log('\n--- 元数据反射 ---');
  MetadataReflector.define('custom:version', '1.0.0', UserService);
  console.log('Metadata version:', MetadataReflector.get('custom:version', UserService));

  // 代理工厂
  console.log('\n--- 代理工厂 ---');
  
  // 观察代理
  const observableService = ProxyFactory.createObservable(service, (prop, oldVal, newVal) => {
    console.log(`[Observer] ${String(prop)}: ${oldVal} -> ${newVal}`);
  });
  (observableService as any).name = 'ModifiedService';

  // 验证代理
  const validatedService = ProxyFactory.createValidator(service, {
    name: (v) => typeof v === 'string' || 'Name must be a string'
  });
  try {
    (validatedService as any).name = 123;
  } catch (e) {
    console.log('Validation error:', (e as Error).message);
  }

  // 不可变代理
  const immutable = ProxyFactory.createImmutable({ value: 42 });
  console.log('Immutable value:', (immutable as any).value);
  try {
    (immutable as any).value = 100;
  } catch (e) {
    console.log('Immutable error:', (e as Error).message);
  }

  // 方法拦截代理
  console.log('\n--- 方法拦截 ---');
  const interceptedService = ProxyFactory.createInterceptor(service, {
    before: (method, args) => {
      console.log(`[Interceptor] Before ${String(method)}`);
    },
    after: (method, args, result) => {
      console.log(`[Interceptor] After ${String(method)}, result:`, result);
    }
  });

  interceptedService.createUser({ name: 'Jane', email: 'jane@example.com' });
}
