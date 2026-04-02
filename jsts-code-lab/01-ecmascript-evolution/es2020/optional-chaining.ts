/**
 * @file 可选链操作符 (?.)
 * @category ECMAScript Evolution → ES2020
 * @see ../../../JSTS全景综述/01_language_core.md#可选链操作符
 * @difficulty easy
 * @tags es2020, operator, safety, nullish-coalescing
 * 
 * @description
 * ES2020 引入的可选链操作符 ?. 用于安全地访问嵌套对象的属性
 * 当引用为 null 或 undefined 时，表达式短路返回 undefined
 */

// ============================================================================
// 1. 基础用法
// ============================================================================

interface UserProfile {
  name?: string;
}

interface User {
  name: string;
  profile?: UserProfile;
  address?: {
    street?: string;
    city?: string;
    country?: {
      code?: string;
      name?: string;
    };
  };
  contacts?: {
    email?: string;
    phone?: string;
  }[];
}

const user: User = {
  name: 'Alice',
  address: {
    city: 'Beijing'
    // street 和 country 未定义
  }
};

/** 传统写法：多层条件检查 */
function getCountryNameTraditional(user: User): string | undefined {
  return user && user.address && user.address.country && user.address.country.name;
}

/** 可选链写法：简洁安全 */
function getCountryNameModern(user: User): string | undefined {
  return user.address?.country?.name;
}

console.log('Traditional:', getCountryNameTraditional(user)); // undefined
console.log('Modern:', getCountryNameModern(user));           // undefined

// ============================================================================
// 2. 不同场景的使用
// ============================================================================

/** 属性访问 */
const city = user.address?.city;      // 'Beijing'
const street = user.address?.street;  // undefined
const countryCode = user.address?.country?.code; // undefined

/** 方法调用 */
interface ApiClient {
  fetch?: () => Promise<unknown>;
}

const client: ApiClient = {};
// client.fetch(); // ❌ TypeError: Cannot read property 'fetch' of undefined
client.fetch?.(); // ✅ 安全调用，返回 undefined

/** 函数式编程场景 */
const callbacks: Array<(() => void) | undefined> = [
  () => console.log('first'),
  undefined,
  () => console.log('third')
];

callbacks.forEach(cb => cb?.()); // 只执行存在的回调

/** 括号表达式 */
const items: string[] | undefined = ['a', 'b', 'c'];
const firstItem = items?.[0];     // 'a'
const lastItem = items?.[items.length - 1]; // 'c'

// ============================================================================
// 3. 与空值合并运算符结合使用
// ============================================================================

/** 提供默认值 */
const userCity = user.address?.city ?? 'Unknown City';
const userStreet = user.address?.street ?? 'Unknown Street';

console.log('City:', userCity);     // 'Beijing'
console.log('Street:', userStreet); // 'Unknown Street'

/** 注意：?. 与 || 的区别 */
const value = '';
console.log(value || 'default');      // 'default' (假值都触发)
console.log(value ?? 'default');      // '' (仅 null/undefined 触发)

// ============================================================================
// 4. 短路行为
// ============================================================================

let sideEffectCount = 0;

function getUser(): User | null {
  sideEffectCount++;
  return null;
}

// 当 getUser() 返回 null 时，后面的表达式不会执行
const result = getUser()?.address?.city;
console.log('Side effects:', sideEffectCount); // 1

// ============================================================================
// 5. 删除操作
// ============================================================================

const obj: { a?: { b?: string } } = { a: { b: 'value' } };

/** 安全删除 */
delete obj.a?.b; // 安全删除，即使 a 是 undefined 也不会报错

// ============================================================================
// 6. 与 TypeScript 类型收窄结合
// ============================================================================

function processUser(user: User | null | undefined) {
  // TypeScript 知道 user?.name 可能是 undefined
  const name: string | undefined = user?.name;
  
  // 需要类型守卫
  if (user?.address?.city) {
    // 这里 TypeScript 知道 city 存在且是 string
    console.log(user.address.city.toUpperCase());
  }
}

// ============================================================================
// 7. 错误用法示例
// ============================================================================

/** ❌ 不能用于赋值左侧 */
// user?.address?.city = 'New York'; // SyntaxError

/** ❌ 不能与 new 一起使用 */
// new user?.constructor; // SyntaxError

/** ❌ 不能用于模板字符串标签 */
// user?.templateFn`hello`; // SyntaxError

/** ✅ 正确的赋值检查 */
if (user.address) {
  user.address.city = 'New York'; // 正常赋值
}

// ============================================================================
// 8. 实际应用场景
// ============================================================================

/** API 响应处理 */
interface ApiResponse {
  data?: {
    users?: Array<{
      profile?: {
        avatar?: {
          url?: string;
        };
      };
    }>;
  };
}

function getAvatarUrl(response: ApiResponse): string | undefined {
  return response.data?.users?.[0]?.profile?.avatar?.url;
}

/** DOM 操作 */
function getElementText(selector: string): string | undefined {
  // 浏览器环境
  // return document.querySelector(selector)?.textContent ?? undefined;
  return undefined;
}

/** 链式配置访问 */
interface Config {
  server?: {
    database?: {
      connection?: {
        pool?: {
          max?: number;
          min?: number;
        };
      };
    };
  };
}

function getPoolSize(config: Config): number {
  return config.server?.database?.connection?.pool?.max ?? 10;
}

// ============================================================================
// 导出
// ============================================================================

export {
  getCountryNameTraditional,
  getCountryNameModern,
  getAvatarUrl,
  getPoolSize,
  processUser
};

export type { User, ApiResponse, Config };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Optional Chaining Demo ===");
  
  const user: User = {
    name: "Alice",
    address: {
      city: "Beijing"
    }
  };
  
  // 安全访问嵌套属性
  console.log("City:", user.address?.city);
  console.log("Street:", user.address?.street);
  console.log("Country:", user.address?.country?.name);
  
  // 方法调用
  const apiClient: ApiClient = {};
  const result = apiClient.fetch?.();
  console.log("Safe method call:", result);
  
  // 数组访问
  const items: string[] | undefined = ["a", "b", "c"];
  console.log("First item:", items?.[0]);
  console.log("Last item:", items?.[items.length - 1]);
  
  // 与空值合并结合
  const displayName = user?.profile?.name ?? "Anonymous";
  console.log("Display name:", displayName);
  
  console.log("=== End of Demo ===\n");
}
