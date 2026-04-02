/**
 * @file 原始类型深度解析
 * @category Language Core → Types
 * @see ../../../JSTS全景综述/01_language_core.md#类型系统
 * @difficulty warm
 * @tags types, primitives, es2020, bigint
 * 
 * @description
 * JavaScript 有7种原始类型：string, number, boolean, null, undefined, symbol, bigint
 * TypeScript 增加了：any, unknown, never, void, enum
 */

// ============================================================================
// 1. 字符串 (String)
// ============================================================================

/** 字符串声明方式 */
const str1: string = '单引号';
const str2: string = "双引号";
const str3: string = `模板字符串 ${str1}`;

/** 模板字符串的高级用法 */
function tag(strings: TemplateStringsArray, ...values: unknown[]) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
}
const tagged = tag`Hello ${'World'}!`;

// ============================================================================
// 2. 数字 (Number) - IEEE 754 双精度浮点数
// ============================================================================

/** 整数与浮点数 */
const int: number = 42;
const float: number = 3.14159;
const scientific: number = 1.23e10;
const hex: number = 0xff;      // 255
const binary: number = 0b1010; // 10
const octal: number = 0o755;   // 493

/** 特殊数值 */
const infinity: number = Infinity;
const negativeInfinity: number = -Infinity;
const notANumber: number = NaN;

/** ⚠️ 浮点数精度问题 */
console.log(0.1 + 0.2 === 0.3); // false!
console.log(0.1 + 0.2);         // 0.30000000000000004

/** 解决方案：使用整数运算或 epsilon 比较 */
const EPSILON = Number.EPSILON;
function roughlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

// ============================================================================
// 3. BigInt (ES2020) - 任意精度整数
// ============================================================================

/** BigInt 创建方式 */
const big1: bigint = 9007199254740991n;        // 字面量后缀 'n'
const big2: bigint = BigInt('9007199254740991999'); // 构造函数
const big3: bigint = BigInt(42);               // 从number转换

/** BigInt vs Number 对比 */
const maxSafeInt = Number.MAX_SAFE_INTEGER; // 9007199254740991
const bigger = maxSafeInt + 1;
console.log(maxSafeInt === bigger); // false? 实际上可能是true！

// 使用 BigInt 解决
const bigMax = 9007199254740991n;
const bigBigger = bigMax + 1n;
console.log(bigMax === bigBigger); // false ✅

/** ⚠️ BigInt 不能与 Number 混合运算 */
// const mixed = 10n + 5; // ❌ Error: Cannot mix BigInt and other types
const mixed = 10n + BigInt(5); // ✅ 20n

/** BigInt 的限制 */
// - 不能用于 Math 对象的方法
// - 不能用于 JSON.stringify (需要自定义转换)
// - 位运算与 Number 不同

// ============================================================================
// 4. 布尔值 (Boolean)
// ============================================================================

const bool: boolean = true;

/** 真值与假值 */
const falsyValues = [false, 0, '', null, undefined, NaN, 0n, -0];
const truthyValues = [true, 1, 'hello', [], {}, -1, Infinity];

/** 严格相等 vs 宽松相等 */
console.log(false == 0);  // true (宽松)
console.log(false === 0); // false (严格)
console.log(null == undefined);  // true
console.log(null === undefined); // false

// ============================================================================
// 5. Symbol (ES2015) - 唯一标识符
// ============================================================================

/** 创建 Symbol */
const sym1: symbol = Symbol();
const sym2: symbol = Symbol('描述');
const sym3: symbol = Symbol('描述');

console.log(sym2 === sym3); // false! 每次创建都是唯一的

/** 全局 Symbol 注册表 */
const globalSym1 = Symbol.for('app.id');
const globalSym2 = Symbol.for('app.id');
console.log(globalSym1 === globalSym2); // true

/** Well-Known Symbols */
const iterable = {
  [Symbol.iterator]() {
    let count = 0;
    return {
      next() {
        return count < 3 
          ? { value: count++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

// ============================================================================
// 6. null vs undefined
// ============================================================================

/** null: 有意的空值 */
let user: { name: string } | null = null;

/** undefined: 未初始化的值 */
let data: string | undefined;
console.log(data); // undefined

/** 可选参数与属性 */
function greet(name?: string) {
  return name ?? 'Guest';
}

interface Config {
  host: string;
  port?: number; // 可选，可能是 undefined
}

/** 空值合并运算符 (??) - 只在 null/undefined 时生效 */
const value1 = 0 ?? 'default';      // 0
const value2 = '' ?? 'default';     // ''
const value3 = null ?? 'default';   // 'default'
const value4 = undefined ?? 'default'; // 'default'

// ============================================================================
// 7. TypeScript 特殊类型
// ============================================================================

/** any: 关闭类型检查 (避免使用) */
let anything: any = 4;
anything = 'string';
try {
  anything.toFixed(); // 编译通过，但可能运行时错误
} catch {
  // 故意演示 any 的运行时风险
}

/** unknown: 类型安全的 any */
let unknownValue: unknown = 4;
// unknownValue.toFixed(); // ❌ Error
if (typeof unknownValue === 'number') {
  unknownValue.toFixed(); // ✅
}

/** never: 永不返回的类型 */
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

/** void: 无返回值 */
function logMessage(msg: string): void {
  console.log(msg);
}

/** 字面量类型 */
const literalString: 'hello' = 'hello';
const literalNumber: 42 = 42;
const literalBool: true = true;

/** 联合类型 */
type Status = 'pending' | 'success' | 'error';
type ID = string | number;

/** 交叉类型 */
type Animal = { name: string };
type Bird = { fly(): void };
type FlyingAnimal = Animal & Bird;

// ============================================================================
// 导出供测试使用
// ============================================================================

export {
  roughlyEqual,
  EPSILON,
  tag,
  greet,
  iterable
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Primitives Demo ===");
  
  // 字符串
  console.log("Template string:", str3);
  
  // 数字精度
  console.log("0.1 + 0.2:", 0.1 + 0.2);
  console.log("Roughly equal:", roughlyEqual(0.1 + 0.2, 0.3));
  
  // BigInt
  const big = 9007199254740991n;
  console.log("BigInt + 1n:", big + 1n);
  
  // Symbol
  const sym = Symbol("demo");
  console.log("Symbol:", sym.toString());
  
  // 空值合并
  const value = null ?? "default";
  console.log("Nullish coalescing:", value);
  
  // unknown 类型
  let unknownValue: unknown = 42;
  if (typeof unknownValue === "number") {
    console.log("Unknown as number:", unknownValue.toFixed(2));
  }
  
  console.log("=== End of Demo ===\n");
}
