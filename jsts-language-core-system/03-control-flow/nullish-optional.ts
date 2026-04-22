/**
 * @file 空值合并与可选链
 * @category Language Core → Control Flow
 * @difficulty warm
 * @tags nullish-coalescing, optional-chaining, safe-navigation, partial-presence
 *
 * @description
 * 演示 `??` 与 `||` 的精确差异，`?.` 可选链的三种形态（属性访问、方法调用、数组访问），
 * 以及可选链与 nullish 值（0、""、false）的交互行为。
 */

// ============================================================================
// 1. ?? vs || 的精确差异（ falsy-but-valid 值）
// ============================================================================

/** 正例：使用 ?? 保护所有有效的 falsy 值 */
function safeDefault<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback;
}

/** 反例：使用 || 会误判有效的 falsy 值 */
function unsafeDefault<T>(value: T | null | undefined, fallback: T): T {
  return (value as unknown as boolean) || (fallback as unknown as boolean) as unknown as T;
}

function demoFalsyValues(): void {
  console.log('--- ?? vs ||  falsy-but-valid 对比 ---');

  const values = [0, '', false, NaN, null, undefined];
  for (const v of values) {
    const orResult = v || 'default';
    const nullishResult = v ?? 'default';
    console.log(
      `value: ${JSON.stringify(v)} | || "default": ${JSON.stringify(orResult)} | ?? "default": ${JSON.stringify(nullishResult)}`
    );
  }
}

// ============================================================================
// 2. 可选链 ?. 的三种形态
// ============================================================================

interface User {
  name: string;
  profile?: {
    address?: {
      street?: string;
      coordinates?: [number, number];
    };
  };
  greet?(): string;
  tags?: string[];
}

/** ✅ ?. 属性访问 */
function getStreet(user: User | null | undefined): string | undefined {
  return user?.profile?.address?.street;
}

/** ✅ ?.( 方法调用 */
function safeGreet(user: User | null | undefined): string | undefined {
  return user?.greet?.();
}

/** ✅ ?.[ 数组/索引访问 */
function getFirstTag(user: User | null | undefined): string | undefined {
  return user?.tags?.[0];
}

/** ✅ 动态属性名访问 */
function getDynamicProp(obj: Record<string, unknown> | null, key: string): unknown {
  return obj?.[key];
}

// ============================================================================
// 3. 可选链与 nullish 值的交互
// ============================================================================

function demoOptionalWithNullish(): void {
  console.log('\n--- 可选链与 nullish 值交互 ---');

  const userWithZero: User = { name: 'Alice', tags: [] };
  console.log('userWithZero.tags?.[0]:', userWithZero.tags?.[0]); // undefined（不是 0！）

  const userWithEmptyString: User = { name: 'Bob', profile: { address: { street: '' } } };
  console.log('street with "":', JSON.stringify(userWithEmptyString.profile?.address?.street)); // ""（保留空字符串）

  const userWithFalse: { settings?: { darkMode?: boolean } } = { settings: { darkMode: false } };
  console.log('darkMode false:', userWithFalse.settings?.darkMode); // false（保留 false）
}

// ============================================================================
// 4. 组合模式：?. + ??
// ============================================================================

/** ✅ 安全深层访问 + 默认值 */
function getStreetWithDefault(user: User | null | undefined): string {
  return user?.profile?.address?.street ?? 'Unknown Street';
}

/** ✅ 安全方法调用 + 默认值 */
function getGreetingWithDefault(user: User | null | undefined): string {
  return user?.greet?.() ?? 'Hello, Guest';
}

/** ✅ 安全数组访问 + 默认值 */
function getFirstTagWithDefault(user: User | null | undefined): string {
  return user?.tags?.[0] ?? 'no-tag';
}

// ============================================================================
// 5. 反例：可选链的误用
// ============================================================================

/** ❌ 反例：对已知非空值使用可选链（冗余且误导） */
function badOveruseOptional(user: User): string {
  // user 已声明为非空，不需要 ?.
  return user?.name ?? 'Unknown'; // 应直接写 user.name
}

/** ❌ 反例：可选链不能用于赋值左侧 */
// user?.name = 'Alice'; // SyntaxError: Invalid left-hand side in assignment

/** ❌ 反例：可选链短路返回 undefined，不区分 null 和 undefined */
function badNullCheck(user: User | null): string | null | undefined {
  // 如果需要区分 "属性不存在" 和 "值为 null"，可选链无法满足
  return user?.profile?.address?.street;
  // 即使 address 显式为 null，也返回 undefined
}

// ============================================================================
// 6. 传统 && 链 vs 可选链
// ============================================================================

/** 传统方式：冗长且可能误报类型 */
function getStreetLegacy(user: User | null | undefined): string | undefined {
  return user && user.profile && user.profile.address && user.profile.address.street;
}

/** 现代方式：简洁且类型安全 */
function getStreetModern(user: User | null | undefined): string | undefined {
  return user?.profile?.address?.street;
}

/** 反例：&& 链在 0/""/false 时意外短路 */
function legacyTrap(): void {
  console.log('\n--- && 链的反例陷阱 ---');
  const obj: { data?: { count?: number } } = { data: { count: 0 } };

  // && 链：0 是 falsy，导致意外短路
  const legacy = obj.data && obj.data.count !== undefined && obj.data.count;
  console.log('legacy && chain with 0:', legacy); // false（不是 0！）

  // 可选链：正确返回 0
  const modern = obj.data?.count;
  console.log('modern ?. with 0:', modern); // 0
}

// ============================================================================
// 7. 可选链的短路语义
// ============================================================================

/** 演示可选链在短路时不会继续求值 */
function demoShortCircuit(): void {
  console.log('\n--- 可选链短路语义 ---');

  const user: User | null = null;

  // 以下表达式不会抛出，因为 user 为 null 时立即短路返回 undefined
  const street = user?.profile?.address?.street;
  console.log('null user?.profile?.address?.street:', street); // undefined

  const greet = user?.greet?.();
  console.log('null user?.greet?.():', greet); // undefined

  const tag = user?.tags?.[0];
  console.log('null user?.tags?.[0]:', tag); // undefined
}

// ============================================================================
// 导出
// ============================================================================

export {
  safeDefault,
  getStreet,
  safeGreet,
  getFirstTag,
  getDynamicProp,
  getStreetWithDefault,
  getGreetingWithDefault,
  getFirstTagWithDefault,
  badOveruseOptional,
  badNullCheck,
  getStreetLegacy,
  getStreetModern
};

export type { User };

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log('=== Nullish Coalescing & Optional Chaining Demo ===\n');

  demoFalsyValues();

  console.log('\n--- 正例：?. 三种形态 ---');
  const alice: User = {
    name: 'Alice',
    profile: {
      address: {
        street: 'Main St',
        coordinates: [10, 20]
      }
    },
    greet: () => 'Hi!',
    tags: ['admin', 'editor']
  };
  console.log('getStreet(alice):', getStreet(alice));
  console.log('safeGreet(alice):', safeGreet(alice));
  console.log('getFirstTag(alice):', getFirstTag(alice));
  console.log('getDynamicProp(alice, "name"):', getDynamicProp(alice, 'name'));

  const bob: User = { name: 'Bob' };
  console.log('getStreet(bob):', getStreet(bob)); // undefined
  console.log('safeGreet(bob):', safeGreet(bob)); // undefined
  console.log('getFirstTag(bob):', getFirstTag(bob)); // undefined

  console.log('\n--- 正例：?. + ?? 组合 ---');
  console.log('getStreetWithDefault(alice):', getStreetWithDefault(alice)); // "Main St"
  console.log('getStreetWithDefault(bob):', getStreetWithDefault(bob)); // "Unknown Street"
  console.log('getGreetingWithDefault(alice):', getGreetingWithDefault(alice)); // "Hi!"
  console.log('getGreetingWithDefault(bob):', getGreetingWithDefault(bob)); // "Hello, Guest"

  demoOptionalWithNullish();
  legacyTrap();
  demoShortCircuit();

  console.log('\n--- 反例：过度使用可选链 ---');
  console.log('badOveruseOptional(alice):', badOveruseOptional(alice)); // "Alice"
  // 虽然结果正确，但 user?.name 在 user 必然存在时是冗余的

  console.log('\n=== End of Demo ===\n');
}
