/**
 * @file 空值合并运算符 (??)
 * @category ECMAScript Evolution → ES2020
 * @see ../../../JSTS全景综述/01_language_core.md#空值合并运算符
 * @difficulty easy
 * @tags es2020, operator, nullish, default-values
 * 
 * @description
 * ES2020 引入的 ?? 运算符，仅在左侧为 null 或 undefined 时返回右侧值
 * 与 || 的区别：|| 对所有 falsy 值都生效，?? 只对 null/undefined 生效
 */

// ============================================================================
// 1. 基础用法
// ============================================================================

/** 提供默认值 */
const value1: string | null = null;
const result1 = value1 ?? 'default';
console.log(result1); // 'default'

const value2: string | undefined = undefined;
const result2 = value2 ?? 'default';
console.log(result2); // 'default'

// ============================================================================
// 2. ?? 与 || 的核心区别
// ============================================================================

console.log('\n=== ?? vs || 对比 ===');

const testValues = [0, '', false, null, undefined, NaN];

testValues.forEach(val => {
  console.log(`${JSON.stringify(val)}:`);
  console.log(`  || 'default' = ${JSON.stringify(val || 'default')}`);
  console.log(`  ?? 'default' = ${JSON.stringify(val ?? 'default')}`);
});

// 输出:
// 0:     || 'default' = 'default',  ?? 'default' = 0
// '':    || 'default' = 'default',  ?? 'default' = ''
// false: || 'default' = 'default',  ?? 'default' = false
// null:  || 'default' = 'default',  ?? 'default' = 'default'
// undefined: || 'default' = 'default',  ?? 'default' = 'default'
// NaN:   || 'default' = 'default',  ?? 'default' = NaN

// ============================================================================
// 3. 实际应用场景
// ============================================================================

/** 数字默认值 (0 是有效值) */
function configurePort(userPort: number | undefined): number {
  return userPort ?? 3000; // 0 是有效端口，不会被覆盖
}

console.log('Port (undefined):', configurePort(undefined)); // 3000
console.log('Port (0):', configurePort(0));                 // 0 ✅
console.log('Port (8080):', configurePort(8080));           // 8080

/** 字符串默认值 (空字符串是有效值) */
function greet(name: string | undefined): string {
  return `Hello, ${name ?? 'Guest'}`;
}

console.log('Greet (undefined):', greet(undefined)); // 'Hello, Guest'
console.log("Greet (''):", greet(''));               // 'Hello, ' ✅
console.log("Greet ('Alice'):", greet('Alice'));     // 'Hello, Alice'

/** 布尔值默认值 */
function enableFeature(enabled: boolean | undefined): boolean {
  return enabled ?? true; // false 是有效值
}

console.log('Feature (undefined):', enableFeature(undefined)); // true
console.log('Feature (false):', enableFeature(false));         // false ✅

// ============================================================================
// 4. 配置对象默认值
// ============================================================================

interface ServerConfig {
  host?: string;
  port?: number;
  ssl?: boolean;
  timeout?: number;
}

function createServer(config: ServerConfig = {}) {
  const {
    host = 'localhost',
    port = 3000,
    ssl = false,
    timeout = 5000
  } = config;
  
  return { host, port, ssl, timeout };
}

// 使用 ?? 实现同样的功能
function createServerWithNullish(config: ServerConfig = {}) {
  return {
    host: config.host ?? 'localhost',
    port: config.port ?? 3000,
    ssl: config.ssl ?? false,
    timeout: config.timeout ?? 5000
  };
}

console.log('\nConfig:', createServer({ port: 0, timeout: undefined }));
// { host: 'localhost', port: 0, ssl: false, timeout: 5000 }

// ============================================================================
// 5. 与可选链结合使用
// ============================================================================

interface User {
  profile?: {
    name?: string;
    age?: number;
  };
}

function getUserDisplayName(user: User | null): string {
  return user?.profile?.name ?? 'Anonymous';
}

const user1: User = { profile: { name: 'Alice' } };
const user2: User = { profile: {} };
const user3: User | null = null;

console.log('\nUser names:');
console.log(getUserDisplayName(user1)); // 'Alice'
console.log(getUserDisplayName(user2)); // 'Anonymous'
console.log(getUserDisplayName(user3)); // 'Anonymous'

// ============================================================================
// 6. 链式使用
// ============================================================================

const a = null;
const b = undefined;
const c = 'value';

const chainResult = a ?? b ?? c ?? 'final';
console.log('\nChain result:', chainResult); // 'value'

// ============================================================================
// 7. 注意事项
// ============================================================================

/** ❌ 不能与 && 或 || 直接混用 (需要括号) */
// const mixed = null || undefined ?? 'default'; // SyntaxError

/** ✅ 使用括号明确优先级 */
const mixed1 = (null || undefined) ?? 'default'; // 'default'
const mixed2 = null || (undefined ?? 'default'); // 'default'

/** 常见模式：设置多个默认值 */
function processConfig(input: {
  timeout?: number;
  retries?: number;
  backoff?: number;
}) {
  const timeout = input.timeout ?? 5000;
  const retries = input.retries ?? 3;
  const backoff = input.backoff ?? 1000;
  
  return { timeout, retries, backoff };
}

// ============================================================================
// 8. 与逻辑赋值运算符结合 (ES2021)
// ============================================================================

/** ??= : 仅在 nullish 时赋值 */
let config: { timeout?: number } = {};
config.timeout ??= 5000;  // 设置默认值
config.timeout ??= 10000; // 不覆盖，因为已经有值

console.log('\nConfig after ??=:', config); // { timeout: 5000 }

/** 对比 ||= : 仅在 falsy 时赋值 */
let settings: { port?: number } = { port: 0 };
settings.port ||= 3000;  // 会覆盖 0 (因为 0 是 falsy)
console.log('Settings after ||=:', settings); // { port: 3000 }

settings = { port: 0 };
settings.port ??= 3000;  // 不会覆盖 0
console.log('Settings after ??=:', settings); // { port: 0 }

// ============================================================================
// 导出
// ============================================================================

export {
  configurePort,
  greet,
  enableFeature,
  createServer,
  createServerWithNullish,
  getUserDisplayName,
  processConfig
};

export type { ServerConfig, User };
