/**
 * @file TS 无法检查的运行时陷阱
 * @description
 * TypeScript 的静态分析有明确的边界。本文件展示 JS 运行时行为
 * 中 TS 力所不及的陷阱 — 即 "通过了类型检查，却在运行时爆炸"。
 */

// ============================================================================
// 1. any 类型的"黑洞"
// ============================================================================

export function demoAnyHazard(): void {
  console.log('=== 1. any 类型黑洞 ===');

  function processData(data: any): void {
    // TS 完全不检查任何调用
    data.nonExistentMethod();        // 编译通过！运行时 TypeError
    data.nested.deep.value = 123;    // 编译通过！运行时 TypeError
  }

  // 反例演示 (注释掉，因为会真的抛错)
  // processData(null);
  // processData({});

  console.log('  any 类型关闭所有类型检查，是 TS  unsoundness 的最大来源');
  console.log('  💡 防御: 用 unknown 替代 any，强制类型收窄后再使用');
}

// ============================================================================
// 2. 数组协变 — Cat[] 是 Animal[] 的子类型
// ============================================================================

class Animal {
  constructor(public name: string) {}
}

class Cat extends Animal {
  meow(): string {
    return 'meow';
  }
}

class Dog extends Animal {
  bark(): string {
    return 'woof';
  }
}

export function demoArrayCovariance(): void {
  console.log('\n=== 2. 数组协变陷阱 ===');

  const cats: Cat[] = [new Cat('Whiskers')];
  const animals: Animal[] = cats; // TS 允许！因为 Cat[] 是 Animal[] 的子类型

  // 但这里...
  animals.push(new Dog('Rex')); // TS 允许！Dog 是 Animal 的子类

  // cats[1] 实际上是 Dog！
  // const cat = cats[1];
  // cat.meow(); // 运行时 TypeError: Dog 没有 meow 方法

  console.log('  cats.length after pushing Dog:', cats.length);
  console.log('  💡 TS 的数组是协变的，这是 deliberate unsoundness');
  console.log('     防御: 使用 readonly T[] 或 ReadonlyArray<T> 禁止写入');
}

// ============================================================================
// 3. 类型断言 (as) — 编译器的"谎言"
// ============================================================================

export function demoTypeAssertionLies(): void {
  console.log('\n=== 3. 类型断言的谎言 ===');

  const raw = JSON.parse('{"value": 42}');
  const parsed = raw as { value: number; name: string }; // 谎言！没有 name

  console.log(`  parsed.value = ${parsed.value}`);
  console.log(`  parsed.name = ${parsed.name}`); // undefined，但 TS 认为是 string

  // 更危险的例子
  const num = 'hello' as unknown as number;
  console.log(`  'hello' as number = ${num}`); // "hello" — 完全错误但编译通过
  // num.toFixed(2); // 运行时 TypeError!

  console.log('  💡 as 是类型系统的" escape hatch"，信任开发者胜于检查');
  console.log('     防御: 使用类型守卫或 zod/io-ts 等运行时验证库');
}

// ============================================================================
// 4. 外部 JS 模块违反 .d.ts 声明
// ============================================================================

// 假设某个库的 .d.ts 声明:
// declare module "untrusted-lib" {
//   export function getUser(): { id: number; name: string };
// }

// 但实际 JS 实现可能返回:
// function getUser() { return null; } // 或 { id: "not-a-number" }

export function demoDtsMismatch(): void {
  console.log('\n=== 4. .d.ts 声明与实现不匹配 ===');
  console.log('  .d.ts 是"信任声明"，TS 不验证实际 JS 是否遵守');
  console.log('  第三方库升级时可能破坏类型契约');
  console.log('  💡 防御: 使用 strictNullChecks + 运行时验证（zod）双重保险');
}

// ============================================================================
// 5. typeof / instanceof 守卫的边界
// ============================================================================

export function demoGuardLimitations(): void {
  console.log('\n=== 5. 类型守卫的边界 ===');

  // instanceof 跨 realm 失效
  // const iframe = document.createElement('iframe');
  // const arr = new (iframe.contentWindow!.Array)(1, 2, 3);
  // arr instanceof Array → false! (不同构造函数)
  // Array.isArray(arr) → true ✓

  // typeof null === "object"
  function isObject(x: unknown): x is Record<string, unknown> {
    return typeof x === 'object' && x !== null;
  }
  console.log(`  typeof null === "object": ${typeof null === 'object'}`);
  console.log('  💡 自定义守卫必须手动排除 null');

  // in 运算符不检查值类型
  const obj = { data: undefined };
  console.log(`  'data' in obj: ${'data' in obj}`); // true
  console.log(`  obj.data: ${obj.data}`); // undefined
  console.log('  💡 `in` 只检查属性存在，不检查值是否有效');
}

// ============================================================================
// 6. 索引签名的 unsoundness
// ============================================================================

interface Dict {
  [key: string]: number;
}

export function demoIndexSignature(): void {
  console.log('\n=== 6. 索引签名 unsoundness ===');

  const dict: Dict = { count: 10 };

  // TS 允许通过任意字符串索引访问
  const key = 'nonExistent';
  const value = dict[key]; // TS 类型: number
  console.log(`  dict["nonExistent"] = ${value}`); // undefined！但类型是 number

  // 更隐蔽的:
  const keys = ['a', 'b'];
  const values = keys.map(k => dict[k]); // number[]，但可能含 undefined

  console.log('  💡 索引签名假设所有键都存在，这是 unsound 的');
  console.log('     防御: 使用 Record<K, V | undefined> 或 noUncheckedIndexedAccess');
}

// ============================================================================
// 7. this 参数类型 vs 运行时 this
// ============================================================================

class Greeter {
  constructor(private message: string) {}

  greet(this: Greeter): string {
    return `Hello, ${this.message}`;
  }
}

export function demoThisMismatch(): void {
  console.log('\n=== 7. this 参数类型 ===');

  const greeter = new Greeter('World');
  const fn = greeter.greet;

  // TS: fn 的类型是 (this: Greeter) => string
  // 但直接调用: fn() — TS 报错！
  // 运行时如果强制调用:
  // console.log(fn()); // TypeError: Cannot read properties of undefined

  // 反例: 回调中丢失 this
  // setTimeout(greeter.greet, 100); // TS 可能报错，但 JS 会丢失 this

  console.log('  TS 的 this 参数是编译时契约，运行时无法强制执行');
  console.log('  💡 防御: 使用箭头函数或 .bind(this)');
}

// ============================================================================
// 8. 对象突变后类型收窄失效
// ============================================================================

interface User {
  role: 'admin' | 'user';
  permissions: string[];
}

export function demoMutationInvalidation(): void {
  console.log('\n=== 8. 突变导致类型收窄失效 ===');

  const user: User = {
    role: 'admin',
    permissions: ['read', 'write'],
  };

  if (user.role === 'admin') {
    // TS 知道 user.role 是 'admin'
    // 但如果外部代码修改了 role...
    // (user as any).role = 'user';
    // 下面的代码在运行时不再安全！
    console.log('  admin 权限:', user.permissions);
  }

  console.log('  💡 TS 不追踪对象突变，类型收窄可能被外部修改破坏');
  console.log('     防御: 使用 readonly + as const，或函数式不可变数据');
}

// ============================================================================
// 9. JSON.parse 返回 any — 无验证入口
// ============================================================================

export function demoJsonParse(): void {
  console.log('\n=== 9. JSON.parse 的类型真空 ===');

  const raw = '{"id": "not-a-number", "active": "yes"}';
  const data = JSON.parse(raw) as { id: number; active: boolean };

  // data.id 实际是 "not-a-number"，但 TS 认为是 number
  // data.active 实际是 "yes"，但 TS 认为是 boolean

  console.log(`  data.id 实际类型: ${typeof data.id}`); // string
  console.log(`  data.active 实际类型: ${typeof data.active}`); // string

  console.log('  💡 JSON.parse 返回 any，as 断言是危险的信任跳跃');
  console.log('     防御: 使用 zod / valibot / io-ts 进行运行时 Schema 验证');
}

// ============================================================================
// 10. Function.prototype.call 绕过参数检查
// ============================================================================

function strictFn(a: number, b: string): string {
  return `${a}-${b}`;
}

export function demoCallBypass(): void {
  console.log('\n=== 10. Function.prototype.call 绕过检查 ===');

  // 正常调用: strictFn(1, 'x') — TS 检查参数
  // 但通过 call:
  const result = strictFn.call(null, 'wrong', 123);
  console.log(`  strictFn.call(null, 'wrong', 123) = ${result}`); // "wrong-123"
  // 参数类型完全没检查！

  // apply 同样:
  const result2 = strictFn.apply(null, [true, {}] as any);
  console.log(`  apply with wrong types = ${result2}`);

  console.log('  💡 call/apply 接受 any[]，完全绕过参数类型检查');
}

// ============================================================================
// 11. 装饰器元数据的运行时不可信
// ============================================================================

// @Reflect.metadata('design:type', String)
// class MyClass {
//   @Reflect.metadata('design:paramtypes', [Number, Number])
//   add(a: number, b: number): number { return a + b; }
// }

export function demoDecoratorMetadataUnsound(): void {
  console.log('\n=== 11. 装饰器元数据不可信 ===');
  console.log('  emitDecoratorMetadata 基于类型注解生成元数据');
  console.log('  如果开发者说谎: `method(x: string)` 但实际接受 number');
  console.log('  Reflect.metadata 仍记录 String，导致 DI 系统注入错误');
  console.log('  💡 元数据是"类型注解的镜像"，不验证运行时实际行为');
}

// ============================================================================
// 12. 隐式 any — noImplicitAny 关闭时的灾难
// ============================================================================

// 当 tsconfig.json 中 noImplicitAny: false 时:
// function bad(x) { return x + 1; } // x 隐式为 any

export function demoImplicitAny(): void {
  console.log('\n=== 12. 隐式 any ===');
  console.log('  noImplicitAny: false 时，未注解参数隐式为 any');
  console.log('  整个函数体关闭类型检查，成为类型漏洞');
  console.log('  💡 防御: 始终开启 strict + noImplicitAny');
}

// ============================================================================
// 主演示
// ============================================================================

export function demo(): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     TS 无法检查的运行时陷阱 — 类型系统的边界                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  demoAnyHazard();
  demoArrayCovariance();
  demoTypeAssertionLies();
  demoDtsMismatch();
  demoGuardLimitations();
  demoIndexSignature();
  demoThisMismatch();
  demoMutationInvalidation();
  demoJsonParse();
  demoCallBypass();
  demoDecoratorMetadataUnsound();
  demoImplicitAny();

  console.log('\n✅ TS 无法检查的运行时陷阱演示完成');
  console.log('   核心结论: TS 类型是编译时契约，不是运行时保证；');
  console.log('   关键路径应配合运行时验证（zod / io-ts / 单元测试）');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demo();
}
