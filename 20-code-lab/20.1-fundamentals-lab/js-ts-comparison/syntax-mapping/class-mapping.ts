/**
 * @file 对象与类映射：JavaScript → TypeScript
 * @description 展示 ES6 Class / Object 与 TS 的访问修饰符、泛型类、抽象类、接口的映射
 * @aligns ECMA-262 §15.7, TypeScript Spec §8
 */

// ============================================================================
// JS Version: ES6 Class + Object Literal
// ============================================================================

class JsPerson {
  // @ts-ignore JS 中隐式创建属性，TS 严格模式需显式声明
  constructor(name) {
    // @ts-ignore
    this.name = name;
  }
  greet() {
    // @ts-ignore
    return "Hi, I'm " + this.name;
  }
}

class JsDog extends JsPerson {
  // @ts-ignore
  constructor(name, breed) {
    // @ts-ignore
    super(name);
    // @ts-ignore
    this.breed = breed;
  }
  greet() {
    // @ts-ignore
    return "Woof! I'm " + this.name + ", a " + this.breed;
  }
}

// ============================================================================
// TS Version: 访问修饰符、参数属性、抽象类、接口、泛型
// ============================================================================

// 1. 接口：纯编译时结构约束，无运行时开销
interface Named {
  name: string;
}

interface Greetable {
  greet(): string;
}

// 2. 抽象类：编译时概念，编译后变为普通类
abstract class TsAnimal implements Named {
  constructor(public name: string) {}
  abstract makeSound(): string;
  move(): string {
    return `${this.name} is moving`;
  }
}

// 3. 具体类：参数属性 (public) 编译时自动生成 this.x = x
class TsDog extends TsAnimal implements Greetable {
  constructor(name: string, private breed: string) {
    super(name);
  }
  makeSound(): string {
    return "Woof!";
  }
  greet(): string {
    return `Hi, I'm ${this.name}, a ${this.breed}`;
  }
}

// 4. 泛型类
class Container<T> {
  constructor(private value: T) {}
  getValue(): T {
    return this.value;
  }
  map<U>(fn: (value: T) => U): Container<U> {
    return new Container(fn(this.value));
  }
}

// 5. 结构化子类型：对象字面量只要结构匹配即可赋值给接口
const personLike: Named = { name: "Alice", age: 30 } as Named; // age 是多余属性，需 as 断言或满足具体接口

// 6. 静态成员与 readonly
class Config {
  static readonly version = "1.0.0";
}

export { TsAnimal, TsDog, Container, Config, type Named, type Greetable };
