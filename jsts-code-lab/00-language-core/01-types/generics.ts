/**
 * @file 泛型深度解析
 * @category Language Core → Types → Generics
 * @see ../../../JSTS全景综述/01_language_core.md#泛型
 * @difficulty medium
 * @tags generics, type-system, advanced
 */

// ============================================================================
// 1. 泛型基础
// ============================================================================

/** 泛型函数 */
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);    // 显式指定
const str = identity('hello');       // 类型推断

/** 泛型数组 */
function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

// ============================================================================
// 2. 泛型约束
// ============================================================================

/** 约束泛型必须有 length 属性 */
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('string');  // ✅ string 有 length
logLength([1, 2, 3]); // ✅ 数组有 length
// logLength(42);     // ❌ number 没有 length

/** 约束为特定键 */
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: 'Alice', age: 30 };
getProperty(person, 'name'); // ✅
// getProperty(person, 'email'); // ❌ 'email' 不是 keyof typeof person

/** 多个约束 */
interface Printable {
  toString(): string;
}
interface Serializable {
  toJSON(): string;
}

function process<T extends Printable & Serializable>(item: T): string {
  return `${item.toString()} -> ${item.toJSON()}`;
}

// ============================================================================
// 3. 泛型默认值
// ============================================================================

/** 带默认值的泛型 */
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

const strings = createArray(3, 'a'); // T 推断为 string
const numbers = createArray<number>(3, 1); // 显式指定

// ============================================================================
// 4. 泛型接口与类型别名
// ============================================================================

/** 泛型接口 */
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

class Box<T> implements Container<T> {
  constructor(private _value: T) {}
  
  get value() { return this._value; }
  getValue() { return this._value; }
  setValue(value: T) { this._value = value; }
}

/** 泛型类型别名 */
type Nullable<T> = T | null | undefined;
type ArrayOrSingle<T> = T | T[];

// ============================================================================
// 5. 条件类型
// ============================================================================

/** 基础条件类型 */
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;  // true
type B = IsString<42>;       // false

/** 分发条件类型 */
type ToArray<T> = T extends any ? T[] : never;
type StringOrNumberArray = ToArray<string | number>; // string[] | number[]

/** 禁用分发：包裹 */
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type UnifiedArray = ToArrayNonDist<string | number>; // (string | number)[]

// ============================================================================
// 6. 内置条件类型工具
// ============================================================================

/** Extract<T, U>: 从T中提取可赋值给U的类型 */
type T0 = Extract<'a' | 'b' | 'c', 'a' | 'f'>; // 'a'

/** Exclude<T, U>: 从T中排除可赋值给U的类型 */
type T1 = Exclude<'a' | 'b' | 'c', 'a' | 'f'>; // 'b' | 'c'

/** NonNullable<T>: 排除null和undefined */
type T2 = NonNullable<string | number | undefined>; // string | number

/** ReturnType<T>: 获取函数返回类型 */
type T3 = ReturnType<() => string>; // string

/** Parameters<T>: 获取函数参数类型元组 */
type T4 = Parameters<(a: number, b: string) => void>; // [number, string]

/** InstanceType<T>: 获取构造函数实例类型 */
type T5 = InstanceType<typeof Date>; // Date

// ============================================================================
// 7. 映射类型
// ============================================================================

/** 基础映射 */
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] }; // -? 移除可选

type Record<K extends keyof any, T> = { [P in K]: T };

type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/** 使用示例 */
interface User {
  id: number;
  name: string;
  email: string;
}

type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

type UserUpdate = Partial<Omit<User, 'id'>>;
// { name?: string; email?: string }

/** 重映射 */
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string; getEmail: () => string }

// ============================================================================
// 8. 逆变/协变/双变/不变
// ============================================================================

/** 协变 (Covariant): 子类型可赋值给父类型 */
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

let animals: Animal[] = [];
let dogs: Dog[] = [];

animals = dogs; // ✅ 协变
// dogs = animals; // ❌

/** 逆变 (Contravariant): 函数参数位置 */
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handleAnimal: AnimalHandler = (a) => console.log(a.name);
let handleDog: DogHandler = (d) => d.bark();

handleDog = handleAnimal; // ✅ 逆变
// handleAnimal = handleDog; // ❌

/** TypeScript 默认：函数参数是双变的 (--strictFunctionTypes 开启后为逆变) */

// ============================================================================
// 9. 泛型实战模式
// ============================================================================

/** 工厂模式 */
interface Constructor<T> {
  new (...args: any[]): T;
}

function create<T>(Ctor: Constructor<T>, ...args: any[]): T {
  return new Ctor(...args);
}

/** 混入模式 */
type ConstructorWithArgs<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends ConstructorWithArgs>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now();
    getTimestamp() { return this.timestamp; }
  };
}

/** 类型安全的API客户端 */
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function apiRequest<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return response.json();
}

// 使用
interface User {
  id: number;
  name: string;
}
const userResponse = await apiRequest<User>('/api/user/1');
// userResponse.data 类型为 User

// ============================================================================
// 导出
// ============================================================================

export {
  identity,
  reverse,
  logLength,
  getProperty,
  createArray,
  Box,
  create,
  Timestamped,
  apiRequest
};

export type {
  Container,
  Nullable,
  IsString,
  Getters
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Generics Demo ===");
  
  // 基础泛型
  console.log("Identity:", identity<number>(42));
  console.log("Identity (inferred):", identity("hello"));
  
  // 泛型数组
  const arr = [1, 2, 3];
  console.log("Original:", arr);
  console.log("Reversed:", reverse(arr));
  
  // 泛型约束
  const result = logLength("Hello TypeScript");
  console.log("LogLength result:", result);
  
  // 泛型类
  const box = new Box<string>("secret");
  console.log("Box value:", box.getValue());
  
  // 工厂函数
  const date = create(Date);
  console.log("Created date:", date.toISOString());
  
  console.log("=== End of Demo ===\n");
}
