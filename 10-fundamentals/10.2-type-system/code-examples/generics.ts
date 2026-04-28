/**
 * 泛型深入演示 (Generics Deep Dive)
 *
 * 涵盖: generic constraints, default type params, variance in generics,
 *       keyof + indexed access, mapped type basics
 */

// ============================================================
// 1. 泛型基础与约束
// ============================================================
function demoGenericConstraints() {
  console.log("\n=== Generic Constraints ===");

  // 无约束：只能赋值/传递
  function identity<T>(x: T): T {
    return x;
  }
  console.log("identity(42):", identity(42));
  console.log('identity("hello"):', identity("hello"));

  // 有约束：可访问约束类型的属性
  function getLength<T extends { length: number }>(x: T): number {
    return x.length;
  }

  console.log("length of string:", getLength("hello"));
  console.log("length of array:", getLength([1, 2, 3]));
  // getLength(42); // ❌ Error: number has no length

  // 多重约束（交叉类型）
  function process<T extends { id: number } & { name: string }>(item: T): string {
    return `${item.name} (#${item.id})`;
  }
  console.log("multi-constraint:", process({ id: 1, name: "Alice", extra: true }));
}

// ============================================================
// 2. 默认类型参数
// ============================================================
function demoDefaultTypeParams() {
  console.log("\n=== Default Type Parameters ===");

  // 有默认值的参数必须在后面
  type Container<T = string> = { value: T };

  const strContainer: Container = { value: "default string" };
  const numContainer: Container<number> = { value: 42 };

  console.log("default string container:", strContainer.value);
  console.log("explicit number container:", numContainer.value);

  // 多参数默认值
  type ApiResponse<Data = unknown, Error = string> =
    | { success: true; data: Data }
    | { success: false; error: Error };

  const ok: ApiResponse<number> = { success: true, data: 42 };
  const err: ApiResponse = { success: false, error: "fail" };
  console.log("default type params:", ok.data, err.error);

  // ❌ 反例：默认值不能放前面
  // type Bad<T = string, U> = { a: T; b: U }; // Error
}

// ============================================================
// 3. 泛型型变 (Variance)
// ============================================================
function demoGenericVariance() {
  console.log("\n=== Variance in Generics ===");

  interface Animal {
    name: string;
  }
  interface Dog extends Animal {
    breed: string;
  }

  // 协变：数组元素位置（读取）
  const dogs: Dog[] = [{ name: "Rex", breed: "Labrador" }];
  const animals: Animal[] = dogs; // ✅ Dog[] 是 Animal[] 的子类型
  console.log("covariant array:", animals[0].name);

  // 逆变：函数参数位置
  type Handler<T> = (item: T) => void;
  const animalHandler: Handler<Animal> = (a) => console.log(a.name);
  const dogHandler: Handler<Dog> = animalHandler; // ✅ (Animal)=>void 可赋给 (Dog)=>void
  dogHandler({ name: "Rex", breed: "Lab" });

  // 协变：函数返回位置
  type Producer<T> = () => T;
  const dogProducer: Producer<Dog> = () => ({ name: "Rex", breed: "Lab" });
  const animalProducer: Producer<Animal> = dogProducer; // ✅
  console.log("covariant producer:", animalProducer().name);

  // ❌ 反例：如果参数是协变的（不安全）
  // 如果允许 (Dog)=>void = (Animal)=>void，则传入 Animal（无 breed）会崩溃
}

// ============================================================
// 4. keyof 与索引访问类型
// ============================================================
function demoKeyofAndIndexedAccess() {
  console.log("\n=== keyof & Indexed Access ===");

  interface User {
    id: number;
    name: string;
    email: string;
  }

  // keyof 获取所有键的联合类型
  type UserKeys = keyof User; // "id" | "name" | "email"

  function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
  }

  const user: User = { id: 1, name: "Alice", email: "alice@example.com" };
  console.log("getProperty name:", getProperty(user, "name"));
  console.log("getProperty id:", getProperty(user, "id"));
  // getProperty(user, "age"); // ❌ Error: "age" not in keyof User

  // 索引访问类型
  type UserName = User["name"]; // string
  type UserIdOrName = User["id" | "name"]; // number | string

  // 数组索引访问
  type StringArray = string[];
  type ElementType = StringArray[number]; // string
  console.log("element type demo:", typeof user.name);

  // 元组索引访问
  type Point = [number, number, string];
  type XCoord = Point[0]; // number
  type PointValues = Point[number]; // number | string
  console.log("tuple index access:", typeof user.id);
}

// ============================================================
// 5. 映射类型基础
// ============================================================
function demoMappedTypes() {
  console.log("\n=== Mapped Type Basics ===");

  interface User {
    id: number;
    name: string;
    email: string;
  }

  // 将所有属性变为可选
  type PartialUser = {
    [K in keyof User]?: User[K];
  };

  const partial: PartialUser = { name: "Alice" }; // id 和 email 可省略
  console.log("partial user:", partial.name);

  // 将所有属性变为只读
  type ReadonlyUser = {
    readonly [K in keyof User]: User[K];
  };

  const readonlyUser: ReadonlyUser = { id: 1, name: "Bob", email: "bob@example.com" };
  // readonlyUser.id = 2; // ❌ Error
  console.log("readonly user:", readonlyUser.name);

  // 重映射键名（TS 4.1+）
  type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
  };

  type UserGetters = Getters<User>;
  // { getId: () => number; getName: () => string; getEmail: () => string; }

  const getters: UserGetters = {
    getId: () => 1,
    getName: () => "Alice",
    getEmail: () => "alice@example.com",
  };
  console.log("getter name:", getters.getName());
}

// ============================================================
// 6. 泛型推断实战
// ============================================================
function demoGenericInference() {
  console.log("\n=== Generic Inference ===");

  // 多参数推断
  function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
    return arr.map(fn);
  }

  const result = map([1, 2, 3], (x) => x.toString());
  // T 推断为 number, U 推断为 string, result: string[]
  console.log("inferred map:", result);

  // 从返回值推断
  function create<T>(ctor: new () => T): T {
    return new ctor();
  }

  const date = create(Date);
  console.log("inferred create Date:", date.toISOString().slice(0, 10));
}

// ============================================================
// 7. 反例 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // ❌ 反例 1：过度泛化
  // function add<T extends number>(a: T, b: T): T {
  //   return (a + b) as T; // 需要类型断言！不如直接用 number
  // }
  function add(a: number, b: number): number {
    return a + b;
  }
  console.log("simple add:", add(1, 2));

  // ❌ 反例 2：约束不足
  // function max<T>(a: T, b: T): T {
  //   return a > b ? a : b; // Error: Operator '>' cannot be applied
  // }
  function max<T extends { valueOf(): number }>(a: T, b: T): T {
    return a.valueOf() > b.valueOf() ? a : b;
  }
  console.log("max with constraint:", max(10, 20));

  // ❌ 反例 3：运行时 typeof 不能检测泛型
  // function process<T>(value: T) {
  //   // typeof value === "string" 可以工作，但不是泛型的正确用法
  // }

  // ❌ 反例 4：默认值顺序错误
  // type Bad<T = string, U> = { a: T; b: U }; // Error
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Generics Deep Dive Demo                 ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoGenericConstraints();
  demoDefaultTypeParams();
  demoGenericVariance();
  demoKeyofAndIndexedAccess();
  demoMappedTypes();
  demoGenericInference();
  demoCounterExamples();

  console.log("\n✅ generics demo complete\n");
}

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
