/**
 * @file 方差与结构化子类型演示器
 * @category JS/TS Comparison → Semantic Models
 * @difficulty medium
 * @tags variance, subtyping, structural-typing, contravariance, covariance
 *
 * @description
 * 通过可编译的代码示例展示：
 * - 对象类型的宽度子类型（Width Subtyping）
 * - 函数类型的参数逆变（Contravariance）与返回值协变（Covariance）
 * - TS 4.7+ 的 `in` / `out` 方差标注
 *
 * 规范对齐: TS Handbook — Variance Annotations、Bierman et al. (2014) §Subtyping
 */

// ============================================================================
// 1. 对象宽度子类型（Width Subtyping）
// ============================================================================

interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

/**
 * 宽度子类型演示：Dog 拥有 Animal 的所有属性，因此 Dog 可以赋值给 Animal。
 * 这体现了结构化子类型的核心思想。
 */
export function demoWidthSubtyping(): { success: boolean; message: string } {
  const dog: Dog = { name: 'Buddy', breed: 'Golden Retriever' };
  const animal: Animal = dog; // OK: Dog <: Animal

  return {
    success: animal.name === 'Buddy',
    message: 'Dog 赋值给 Animal 成功（宽度子类型）'
  };
}

// ============================================================================
// 2. 函数参数逆变与返回值协变
// ============================================================================

/**
 * 函数类型的子类型规则：
 * - 参数位置：逆变（Contravariant）
 *   若 (Animal) => void <: (Dog) => void，则意味着需要 Dog 的地方可以用 Animal 替代。
 *   实际上反过来才成立：(Dog) => void <: (Animal) => void。
 * - 返回位置：协变（Covariant）
 *   若 () => Dog <: () => Animal，因为返回更具体的类型是安全的。
 */

export type AnimalHandler = (a: Animal) => void;
export type DogHandler = (d: Dog) => void;

export type AnimalFactory = () => Animal;
export type DogFactory = () => Dog;

/**
 * 返回值协变演示：DogFactory 可以赋值给 AnimalFactory。
 */
export function demoReturnCovariance(): { success: boolean; message: string } {
  const dogFactory: DogFactory = () => ({ name: 'Buddy', breed: 'Golden Retriever' });
  const animalFactory: AnimalFactory = dogFactory; // OK: 返回值协变

  const result = animalFactory();
  return {
    success: result.name === 'Buddy',
    message: 'DogFactory 赋值给 AnimalFactory 成功（返回值协变）'
  };
}

/**
 * 参数逆变演示：AnimalHandler 可以赋值给 DogHandler。
 * 解释：能处理 Animal 的函数，一定能处理 Dog（因为 Dog 是 Animal 的子类型）。
 * 因此 (Animal) => void <: (Dog) => void，参数位置是逆变的。
 */
export function demoParamContravariance(): { success: boolean; message: string } {
  const animalHandler: AnimalHandler = (a) => {
    console.log(`Hello, ${a.name}`);
  };
  const dogHandler: DogHandler = animalHandler; // OK: 参数逆变

  dogHandler({ name: 'Buddy', breed: 'Golden Retriever' });
  return {
    success: true,
    message: 'AnimalHandler 赋值给 DogHandler 成功（参数逆变）'
  };
}

// ============================================================================
// 3. TS 4.7+ 的 `in` / `out` 方差标注
// ============================================================================

/**
 * `out` 标注：类型参数 T 仅出现在输出位置（协变）。
 * `in` 标注：类型参数 T 仅出现在输入位置（逆变）。
 */

// 协变接口：T 只出现在返回值位置
export interface Box<out T> {
  getValue(): T;
}

// 逆变接口：T 只出现在参数位置
export interface Sink<in T> {
  consume(value: T): void;
}

// 不变接口：T 同时出现在输入和输出位置（未标注 in/out）
export interface Mutable<T> {
  getValue(): T;
  setValue(value: T): void;
}

/**
 * 演示 `out` 标注的协变行为：
 * Box<Dog> 可以赋值给 Box<Animal>。
 */
export function demoOutCovariance(): { success: boolean; message: string } {
  const dogBox: Box<Dog> = {
    getValue: () => ({ name: 'Buddy', breed: 'Golden Retriever' })
  };
  const animalBox: Box<Animal> = dogBox; // OK: out T 允许协变

  return {
    success: animalBox.getValue().name === 'Buddy',
    message: 'Box<Dog> 赋值给 Box<Animal> 成功（out 协变）'
  };
}

/**
 * 演示 `in` 标注的逆变行为：
 * Sink<Animal> 可以赋值给 Sink<Dog>。
 */
export function demoInContravariance(): { success: boolean; message: string } {
  const animalSink: Sink<Animal> = {
    consume: (a) => {
      console.log(`Consumed: ${a.name}`);
    }
  };
  const dogSink: Sink<Dog> = animalSink; // OK: in T 允许逆变

  dogSink.consume({ name: 'Buddy', breed: 'Golden Retriever' });
  return {
    success: true,
    message: 'Sink<Animal> 赋值给 Sink<Dog> 成功（in 逆变）'
  };
}

/**
 * 演示未标注 in/out 时的不变行为：
 * Mutable<Dog> 不能赋值给 Mutable<Animal>，反之亦然。
 *
 * 注意：这在 TypeScript 的类型层面是编译时行为，运行时我们仅演示其"预期"行为。
 */
export function demoInvariance(): { explained: string } {
  return {
    explained:
      'Mutable<T> 中 T 同时出现在输入和输出位置，因此是不变的。' +
      'Mutable<Dog> 不能赋值给 Mutable<Animal>，因为 setValue 接受 Animal 时' +
      '可能传入非 Dog 的值，破坏类型安全。'
  };
}

// ============================================================================
// 4. --strictFunctionTypes 行为差异说明
// ============================================================================

/**
 * 在 --strictFunctionTypes 关闭时（如方法声明），参数位置默认是双变的（bivariant）。
 * 开启 --strictFunctionTypes 后，函数类型的参数位置严格为逆变。
 *
 * 本演示器通过独立的函数类型（而非方法）展示严格的逆变行为，
 * 对应 --strictFunctionTypes 开启的场景。
 */

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 方差与结构化子类型演示 ===\n');

  console.log(demoWidthSubtyping());
  console.log(demoReturnCovariance());
  console.log(demoParamContravariance());
  console.log(demoOutCovariance());
  console.log(demoInContravariance());
  console.log(demoInvariance());
}
