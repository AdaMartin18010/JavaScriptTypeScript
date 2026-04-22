/**
 * 型变演示 (Variance)
 *
 * 涵盖: 协变(covariance)、逆变(contravariance)、
 *       双变(bivariance)、不变(invariance),
 *       数组/函数/对象的型变行为, Readonly/Mutable 效果
 */

// ============================================================
// 类型层级基础
// ============================================================
interface Animal {
  name: string;
  move(): void;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

interface Cat extends Animal {
  color: string;
  meow(): void;
}

// ============================================================
// 1. 协变 (Covariance) — 同向变化
// ============================================================
function demoCovariance() {
  console.log("\n=== Covariance ===");

  // 数组元素位置是协变的
  const dogs: Dog[] = [{ name: "Rex", breed: "Labrador", move: () => {}, bark: () => {} }];
  const animals: Animal[] = dogs; // ✅ Dog[] 是 Animal[] 的子类型
  console.log("covariant array assignment works");

  // 对象属性是协变的
  interface Container<T> {
    value: T;
  }

  const dogContainer: Container<Dog> = {
    value: { name: "Rex", breed: "Lab", move: () => {}, bark: () => {} },
  };
  const animalContainer: Container<Animal> = dogContainer; // ✅
  console.log("covariant container value name:", animalContainer.value.name);

  // Promise 是协变的
  const dogPromise: Promise<Dog> = Promise.resolve({
    name: "Rex",
    breed: "Lab",
    move: () => {},
    bark: () => {},
  });
  const animalPromise: Promise<Animal> = dogPromise; // ✅
  animalPromise.then((a) => console.log("covariant promise:", a.name));

  // 函数返回类型是协变的
  type Producer<T> = () => T;
  const dogProducer: Producer<Dog> = () => ({
    name: "Rex",
    breed: "Lab",
    move: () => {},
    bark: () => {},
  });
  const animalProducer: Producer<Animal> = dogProducer; // ✅
  console.log("covariant producer:", animalProducer().name);
}

// ============================================================
// 2. 逆变 (Contravariance) — 反向变化
// ============================================================
function demoContravariance() {
  console.log("\n=== Contravariance ===");

  // 函数参数位置是逆变的
  type Handler<T> = (item: T) => void;

  const animalHandler: Handler<Animal> = (animal) => {
    console.log("handling animal:", animal.name);
  };

  const dogHandler: Handler<Dog> = animalHandler; // ✅
  // 因为 dogHandler 接收 Dog，可以安全传入 Animal 的处理函数
  // Animal 的处理函数只使用 name，而 Dog 也有 name

  dogHandler({ name: "Rex", breed: "Lab", move: () => {}, bark: () => {} });

  // 为什么参数不能是协变的？（不安全演示）
  // 如果允许：
  // const handleDog: (d: Dog) => void = (dog) => console.log(dog.breed);
  // const handleAnimal: (a: Animal) => void = handleDog; // 假设允许
  // handleAnimal({ name: "Cat", move: () => {} }); // 运行时崩溃：Cat 没有 breed

  console.log("contravariance ensures parameter safety");
}

// ============================================================
// 3. 双变 (Bivariance) — 双向兼容（旧行为）
// ============================================================
function demoBivariance() {
  console.log("\n=== Bivariance (legacy) ===");

  // strictFunctionTypes: false 时，函数参数是双变的
  // 这是 TypeScript 早期的不安全行为，为了兼容而存在

  // 在 strictFunctionTypes: true（推荐）下：
  let animalFn: (a: Animal) => void;
  let dogFn: (d: Dog) => void;

  // dogFn = animalFn; // ✅ 逆变：安全
  // animalFn = dogFn; // ❌ 在 strictFunctionTypes: true 下报错

  // 如果关闭 strictFunctionTypes，animalFn = dogFn 也会通过
  // 这会导致运行时安全问题

  console.log("strictFunctionTypes: true prevents bivariance issues");
}

// ============================================================
// 4. 不变 (Invariance) — 无关，必须完全一致
// ============================================================
function demoInvariance() {
  console.log("\n=== Invariance ===");

  // 可写容器通常是不变的
  interface Box<T> {
    get(): T;
    set(value: T): void;
  }

  const dogBox: Box<Dog> = {
    get: () => ({ name: "Rex", breed: "Lab", move: () => {}, bark: () => {} }),
    set: (d) => console.log("set dog:", d.name),
  };

  // const animalBox: Box<Animal> = dogBox; // ❌ 错误
  // 因为如果允许，可以通过 animalBox.set(cat) 把 Cat 放进 Dog 的 box

  // 使用显式型变标注（TS 4.7+）
  interface Producer<out T> {
    produce(): T;
  }

  interface Consumer<in T> {
    consume(item: T): void;
  }

  interface Storage<in out T> {
    get(): T;
    set(value: T): void;
  }

  const producer: Producer<Dog> = { produce: () => ({ name: "Rex", breed: "Lab", move: () => {}, bark: () => {} }) };
  const animalProducer: Producer<Animal> = producer; // ✅ out = 协变
  console.log("explicit out (covariant):", animalProducer.produce().name);

  const consumer: Consumer<Animal> = { consume: (a) => console.log("consuming:", a.name) };
  const dogConsumer: Consumer<Dog> = consumer; // ✅ in = 逆变
  dogConsumer.consume({ name: "Rex", breed: "Lab", move: () => {}, bark: () => {} });
}

// ============================================================
// 5. Readonly / Mutable 效果
// ============================================================
function demoReadonlyMutableEffects() {
  console.log("\n=== Readonly / Mutable Effects ===");

  // Mutable 数组：协变但不安全（可写入子类型不允许的值）
  const dogs: Dog[] = [];
  const animals: Animal[] = dogs; // ✅ 协变
  // animals.push({ name: "Whiskers", move: () => {} }); // Cat 类型
  // 现在 dogs 数组中有了一个 Cat！运行时类型混乱

  console.log("mutable array covariance is unsafe for writes");

  // ReadonlyArray：只读数组，协变是安全的
  const readonlyDogs: ReadonlyArray<Dog> = [
    { name: "Rex", breed: "Lab", move: () => {}, bark: () => {} },
  ];
  const readonlyAnimals: ReadonlyArray<Animal> = readonlyDogs; // ✅ 安全
  console.log("readonly array length:", readonlyAnimals.length);
  // readonlyAnimals.push(...) // ❌ 编译错误，无法写入

  // Readonly 对象属性
  interface ReadonlyContainer<T> {
    readonly value: T;
  }

  const readonlyDogContainer: ReadonlyContainer<Dog> = {
    value: { name: "Rex", breed: "Lab", move: () => {}, bark: () => {} },
  };
  const readonlyAnimalContainer: ReadonlyContainer<Animal> = readonlyDogContainer; // ✅
  console.log("readonly container:", readonlyAnimalContainer.value.name);
}

// ============================================================
// 6. 型变检查工具
// ============================================================
function demoVarianceChecks() {
  console.log("\n=== Variance Checks ===");

  // 使用条件类型检查型变方向
  type ArrayCovariant = Dog[] extends Animal[] ? true : false; // true
  type FnParamContravariant = ((x: Animal) => void) extends ((x: Dog) => void) ? true : false; // true

  const arrCov: ArrayCovariant = true;
  const fnContra: FnParamContravariant = true;

  console.log("Array covariance check:", arrCov);
  console.log("Function parameter contravariance check:", fnContra);

  // 型变关系总结
  // 位置        | 型变方向 | 原因
  // 数组元素     | 协变    | 只读安全，写入危险
  // 函数返回     | 协变    | 返回子类型更具体
  // 函数参数     | 逆变    | 接受父类型更通用
  // 对象属性(读写)| 不变   | 既有读又有写
}

// ============================================================
// 7. 反例 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // ❌ 反例 1：数组协变导致的运行时污染
  function addCatToAnimals(animals: Animal[]) {
    animals.push({ name: "Whiskers", move: () => console.log("sneak") });
  }

  const myDogs: Dog[] = [
    { name: "Rex", breed: "Lab", move: () => {}, bark: () => {} },
  ];
  // addCatToAnimals(myDogs); // 编译通过，但 myDogs 中现在有非 Dog 元素！
  // myDogs[1].bark(); // 运行时错误：Cat 没有 bark

  console.log("array covariance allows unsafe writes (commented out)");

  // ❌ 反例 2：关闭 strictFunctionTypes 的危险
  // strictFunctionTypes: false 时：
  // let f1: (x: Animal) => void;
  // let f2: (x: Dog) => void;
  // f1 = f2; // 允许但不安全

  // ❌ 反例 3：误解型变方向
  // (Dog => void) extends (Animal => void) ? 是！逆变
  // (Animal => void) extends (Dog => void) ? 否！
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Variance Demo                           ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoCovariance();
  demoContravariance();
  demoBivariance();
  demoInvariance();
  demoReadonlyMutableEffects();
  demoVarianceChecks();
  demoCounterExamples();

  console.log("\n✅ variance demo complete\n");
}

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
