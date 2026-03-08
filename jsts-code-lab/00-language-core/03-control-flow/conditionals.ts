/**
 * @file 条件语句深度解析
 * @category Language Core → Control Flow
 * @difficulty warm
 * @tags conditionals, control-flow, type-guards
 */

// ============================================================================
// 1. if-else 基础
// ============================================================================

function classifyNumber(num: number): string {
  if (num > 0) {
    return 'positive';
  } else if (num < 0) {
    return 'negative';
  } else {
    return 'zero';
  }
}

// ============================================================================
// 2. 三元运算符与短路求值
// ============================================================================

/** 传统三元 */
const max = (a: number, b: number) => (a > b ? a : b);

/** 嵌套三元 (避免过深嵌套) */
const sign = (n: number) => (n > 0 ? '+' : n < 0 ? '-' : '0');

/** 短路求值模式 */
function configure(options?: { debug?: boolean; timeout?: number }) {
  const debug = options?.debug ?? false;
  const timeout = options?.timeout ?? 5000;
  return { debug, timeout };
}

// ============================================================================
// 3. switch 语句
// ============================================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

function handleRequest(method: HttpMethod): string {
  switch (method) {
    case 'GET':
      return 'Fetching resource';
    case 'POST':
      return 'Creating resource';
    case 'PUT':
    case 'PATCH':
      return 'Updating resource';
    case 'DELETE':
      return 'Deleting resource';
    default:
      // TypeScript 会检查穷尽性
      const _exhaustive: never = method;
      throw new Error(`Unknown method: ${_exhaustive}`);
  }
}

/** 对象映射替代 switch */
const methodHandlers: Record<HttpMethod, string> = {
  GET: 'Fetching resource',
  POST: 'Creating resource',
  PUT: 'Updating resource',
  PATCH: 'Updating resource',
  DELETE: 'Deleting resource'
};

function handleRequestModern(method: HttpMethod): string {
  return methodHandlers[method] ?? 'Unknown method';
}

// ============================================================================
// 4. TypeScript 类型守卫 (Type Guards)
// ============================================================================

interface Cat {
  type: 'cat';
  meow(): void;
}

interface Dog {
  type: 'dog';
  bark(): void;
}

interface Bird {
  type: 'bird';
  chirp(): void;
}

type Animal = Cat | Dog | Bird;

/** typeof 类型守卫 */
function processValue(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript 知道这里是 string
  } else if (typeof value === 'number') {
    return value.toFixed(2); // TypeScript 知道这里是 number
  } else {
    return String(value); // boolean
  }
}

/** instanceof 类型守卫 */
class Circle {
  constructor(public radius: number) {}
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle {
  constructor(public width: number, public height: number) {}
  area() {
    return this.width * this.height;
  }
}

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
  if (shape instanceof Circle) {
    return shape.area(); // TypeScript 知道是 Circle
  } else {
    return shape.area(); // TypeScript 知道是 Rectangle
  }
}

/** in 类型守卫 */
interface Admin {
  role: 'admin';
  permissions: string[];
}

interface User {
  role: 'user';
  group: string;
}

function checkAccess(person: Admin | User): string[] | string {
  if ('permissions' in person) {
    return person.permissions; // Admin
  } else {
    return person.group; // User
  }
}

/** 自定义类型谓词 */
function isCat(animal: Animal): animal is Cat {
  return animal.type === 'cat';
}

function isDog(animal: Animal): animal is Dog {
  return animal.type === 'dog';
}

function makeSound(animal: Animal): string {
  if (isCat(animal)) {
    animal.meow();
    return 'Meow!';
  } else if (isDog(animal)) {
    animal.bark();
    return 'Woof!';
  } else {
    animal.chirp();
    return 'Chirp!';
  }
}

/** 可辨识联合 (Discriminated Unions) */
interface Square {
  kind: 'square';
  size: number;
}

interface Circle2 {
  kind: 'circle';
  radius: number;
}

interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

type Shape2 = Square | Circle2 | Triangle;

function area2(shape: Shape2): number {
  switch (shape.kind) {
    case 'square':
      return shape.size ** 2;
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      // 穷尽性检查
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}

// ============================================================================
// 5. 断言函数 (Assertion Functions)
// ============================================================================

function assertDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined');
  }
}

function processUser(user: { name?: string } | null) {
  assertDefined(user);
  // TypeScript 现在知道 user 不是 null
  console.log(user.name);
}

// ============================================================================
// 导出
// ============================================================================

export {
  classifyNumber,
  max,
  handleRequest,
  handleRequestModern,
  processValue,
  getArea,
  checkAccess,
  isCat,
  isDog,
  makeSound,
  area2,
  assertDefined
};

export type { HttpMethod, Animal, Cat, Dog, Bird, Shape, Shape2 };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Conditionals Demo ===");
  
  // 数字分类
  console.log("Classify 5:", classifyNumber(5));
  console.log("Classify -3:", classifyNumber(-3));
  console.log("Classify 0:", classifyNumber(0));
  
  // 三元运算符
  console.log("Max of 10, 20:", max(10, 20));
  
  // HTTP 方法处理
  console.log("Handle GET:", handleRequest("GET"));
  console.log("Handle POST:", handleRequest("POST"));
  
  // 类型守卫
  const circle = new Circle(5);
  const rectangle = new Rectangle(4, 6);
  console.log("Circle area:", getArea(circle));
  console.log("Rectangle area:", getArea(rectangle));
  
  // 可辨识联合
  const square: Shape2 = { kind: "square", size: 5 };
  console.log("Square area:", area2(square));
  
  console.log("=== End of Demo ===\n");
}
