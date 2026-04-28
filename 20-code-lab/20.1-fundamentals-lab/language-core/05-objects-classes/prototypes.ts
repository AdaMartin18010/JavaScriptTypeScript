/**
 * @file 原型链深度解析
 * @category Language Core → Objects & Classes
 * @difficulty medium
 * @tags prototype, inheritance, delegation, __proto__
 */

// ============================================================================
// 1. 原型链基础
// ============================================================================

/** 创建对象与原型关系 */
const animal = {
  eat() {
    return 'eating';
  }
};

const dog = Object.create(animal);
dog.bark = () => 'barking';

console.log(dog.bark()); // 'barking' (own property)
console.log(dog.eat()); // 'eating' (inherited from animal)
console.log(Object.getPrototypeOf(dog) === animal); // true

// ============================================================================
// 2. 构造函数与 prototype
// ============================================================================

interface Person {
  name: string;
  greet(): string;
  sayGoodbye(): string;
  constructor: PersonConstructor;
}

interface PersonConstructor {
  (this: Person, name: string): void;
  new (name: string): Person;
  prototype: Person;
}

const Person = function (this: Person, name: string) {
  this.name = name;
} as unknown as PersonConstructor;

Person.prototype.greet = function (this: Person) {
  return `Hello, I'm ${this.name}`;
};

const alice = new Person('Alice');
console.log(alice.greet()); // 'Hello, I'm Alice'
console.log(Object.getPrototypeOf(alice) === Person.prototype); // true
console.log(Person.prototype.constructor === Person); // true

// ============================================================================
// 3. 原型链查找机制
// ============================================================================

function demonstrateLookup() {
  const obj = {};

  // 查找 toString 方法
  console.log(obj.toString()); // '[object Object]'

  // 原型链: obj -> Object.prototype -> null
  console.log(Object.getPrototypeOf(obj) === Object.prototype); // true
  console.log(Object.getPrototypeOf(Object.prototype)); // null
}

// ============================================================================
// 4. 继承实现 (ES5 方式)
// ============================================================================

interface AnimalES5 {
  name: string;
  eat(): string;
}

interface AnimalES5Constructor {
  (this: AnimalES5, name: string): void;
  new (name: string): AnimalES5;
  prototype: AnimalES5;
}

const AnimalES5 = function (this: AnimalES5, name: string) {
  this.name = name;
} as unknown as AnimalES5Constructor;

AnimalES5.prototype.eat = function (this: AnimalES5) {
  return `${this.name} is eating`;
};

interface DogES5 extends AnimalES5 {
  breed: string;
  bark(): string;
}

interface DogES5Constructor {
  (this: DogES5, name: string, breed: string): void;
  new (name: string, breed: string): DogES5;
  prototype: DogES5;
}

const DogES5 = function (this: DogES5, name: string, breed: string) {
  AnimalES5.call(this, name); // 调用父构造函数
  this.breed = breed;
} as unknown as DogES5Constructor;

// 设置原型链
DogES5.prototype = Object.create(AnimalES5.prototype) as DogES5;
(DogES5.prototype as unknown as { constructor: unknown }).constructor = DogES5;

DogES5.prototype.bark = function (this: DogES5) {
  return `${this.name} barks`;
};

const dog5 = new DogES5('Rex', 'German Shepherd');
console.log(dog5.eat()); // 继承方法
console.log(dog5.bark()); // 自有方法

// ============================================================================
// 5. hasOwnProperty 与属性遍历
// ============================================================================

const objWithProps = {
  ownProp: 'I am own',
  inheritedProp: undefined
};

(Object.prototype as Record<string, unknown>).inheritedProp = 'I am inherited';

console.log(objWithProps.hasOwnProperty('ownProp')); // true
console.log(objWithProps.hasOwnProperty('inheritedProp')); // false
console.log('ownProp' in objWithProps); // true (包括继承的)
console.log('inheritedProp' in objWithProps); // true

// 安全遍历自有属性
for (const key in objWithProps) {
  if (Object.prototype.hasOwnProperty.call(objWithProps, key)) {
    console.log(key, objWithProps[key as keyof typeof objWithProps]);
  }
}

// 现代方式
console.log(Object.keys(objWithProps)); // ['ownProp']
console.log(Object.getOwnPropertyNames(objWithProps));

// ============================================================================
// 6. Object.create 的多种用法
// ============================================================================

// 创建纯空对象 (无原型)
const pureEmpty = Object.create(null);
console.log(pureEmpty.toString); // undefined

// 创建指定原型的对象
const withProto = Object.create(Array.prototype);
console.log(Array.isArray(withProto)); // false (不是真数组)

// 创建带属性描述符的对象
const withDescriptors = Object.create(Object.prototype, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 30,
    writable: false, // 只读
    enumerable: true,
    configurable: false
  }
});

// ============================================================================
// 7. 修改原型 (不推荐)
// ============================================================================

// 可以动态修改原型
Person.prototype.sayGoodbye = function (this: Person) {
  return `Goodbye from ${this.name}`;
};

// 所有实例立即获得新方法
console.log(alice.sayGoodbye());

// 但不要这样做：
// Object.prototype.badPractice = () => {}; // 污染全局原型

// ============================================================================
// 8. instanceof 原理
// ============================================================================

function testInstanceof() {
  const p = new Person('Test');

  console.log(p instanceof Person); // true
  console.log(p instanceof Object); // true (原型链)
  console.log(p instanceof Array); // false

  // 自定义 instanceof 行为
  class MyClass {
    static [Symbol.hasInstance](instance: unknown) {
      return typeof instance === 'object' && instance !== null;
    }
  }

  console.log({} instanceof MyClass); // true
}

// ============================================================================
// 9. Class 是原型的语法糖
// ============================================================================

class ModernClass {
  value = 10;

  method() {
    return this.value;
  }
}

// 等价于 (大致)
function TraditionalClass(this: { value: number }) {
  this.value = 10;
}

TraditionalClass.prototype.method = function (this: { value: number }) {
  return this.value;
};

// ============================================================================
// 导出
// ============================================================================

export {
  animal,
  dog,
  Person,
  AnimalES5,
  DogES5,
  demonstrateLookup,
  testInstanceof,
  ModernClass,
  TraditionalClass
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Prototypes Demo ===");
  
  // 原型链
  const animal = { eat() { return "eating"; } };
  const dog = Object.create(animal);
  dog.bark = () => "barking";
  console.log("Dog barks:", dog.bark());
  console.log("Dog eats:", dog.eat());
  console.log("Dog's prototype is animal:", Object.getPrototypeOf(dog) === animal);
  
  // 构造函数
  interface DemoPerson {
    name: string;
    greet(): string;
  }
  const Person = function(this: DemoPerson, name: string) {
    this.name = name;
  } as unknown as new (name: string) => DemoPerson;
  Person.prototype.greet = function(this: DemoPerson) {
    return `Hello, I'm ${this.name}`;
  };
  const alice = new Person("Alice");
  console.log("Person greet:", alice.greet());
  
  // hasOwnProperty
  const obj = { ownProp: "I am own" };
  console.log("Has own property 'ownProp':", obj.hasOwnProperty("ownProp"));
  
  // 现代类
  const modern = new ModernClass();
  console.log("Modern class method:", modern.method());
  
  console.log("=== End of Demo ===\n");
}
