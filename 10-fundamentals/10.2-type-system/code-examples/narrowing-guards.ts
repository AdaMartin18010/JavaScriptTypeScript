/**
 * 类型收窄与类型守卫演示 (Narrowing & Type Guards)
 *
 * 涵盖: typeof, instanceof, in, Array.isArray,
 *       自定义类型 guards (is), assertion functions,
 *       truthiness narrowing, equality narrowing,
 *       switch exhaustion checking
 */

// ============================================================
// 1. typeof 守卫
// ============================================================
function demoTypeofGuard() {
  console.log("\n=== typeof Guard ===");

  function process(value: string | number | boolean) {
    if (typeof value === "string") {
      console.log("string:", value.toUpperCase());
    } else if (typeof value === "number") {
      console.log("number:", value.toFixed(2));
    } else {
      console.log("boolean:", value);
    }
  }

  process("hello");
  process(3.14159);
  process(true);

  // ⚠️ typeof 的边界: null → "object" (历史 bug)
  console.log("typeof null:", typeof null); // "object"

  // ❌ 反例：typeof null === "object" 导致的安全漏洞
  function unsafeProcess(value: unknown) {
    if (typeof value === "object") {
      // value 可能是 null！
      // value.toString(); // 运行时崩溃
    }
  }

  // ✅ 正确：额外检查 null
  function safeProcess(value: unknown) {
    if (typeof value === "object" && value !== null) {
      console.log("safe object:", value.toString());
    }
  }

  safeProcess({ key: "value" });
}

// ============================================================
// 2. instanceof 守卫
// ============================================================
function demoInstanceofGuard() {
  console.log("\n=== instanceof Guard ===");

  class Dog {
    bark() {
      return "Woof!";
    }
  }

  class Cat {
    meow() {
      return "Meow!";
    }
  }

  function speak(animal: Dog | Cat) {
    if (animal instanceof Dog) {
      console.log("dog says:", animal.bark());
    } else {
      console.log("cat says:", animal.meow());
    }
  }

  speak(new Dog());
  speak(new Cat());

  // ⚠️ 反例：跨 Realm 时 instanceof 不可靠
  // iframe.contentWindow.Array(1,2,3) instanceof Array → false
  // ✅ 替代：Array.isArray
  const maybeArr: unknown = [1, 2, 3];
  console.log("Array.isArray is cross-realm safe:", Array.isArray(maybeArr));
}

// ============================================================
// 3. in 运算符守卫
// ============================================================
function demoInGuard() {
  console.log("\n=== in Guard ===");

  type Fish = { swim: () => void };
  type Bird = { fly: () => void };

  function move(animal: Fish | Bird) {
    if ("swim" in animal) {
      console.log("fish swims");
      animal.swim();
    } else {
      console.log("bird flies");
      animal.fly();
    }
  }

  const fish: Fish = { swim: () => console.log("  swimming...") };
  const bird: Bird = { fly: () => console.log("  flying...") };

  move(fish);
  move(bird);

  // ⚠️ 注意：in 检查包含继承属性
  // 对于可选属性需额外小心
}

// ============================================================
// 4. Array.isArray 守卫
// ============================================================
function demoArrayIsArray() {
  console.log("\n=== Array.isArray ===");

  function flatten(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value.join(", "); // value: string[]
    }
    return value; // value: string
  }

  console.log("flatten string:", flatten("hello"));
  console.log("flatten array:", flatten(["a", "b", "c"]));

  // ✅ 跨 realm 安全
  console.log("Array.isArray([]):", Array.isArray([]));
  console.log("Array.isArray({}):", Array.isArray({}));
}

// ============================================================
// 5. 自定义类型守卫 (type predicate: x is T)
// ============================================================
function demoCustomTypeGuard() {
  console.log("\n=== Custom Type Guard ===");

  interface User {
    id: number;
    name: string;
  }

  // 谓词函数：返回值类型为类型谓词
  function isUser(value: unknown): value is User {
    return (
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      "name" in value &&
      typeof (value as Record<string, unknown>).id === "number" &&
      typeof (value as Record<string, unknown>).name === "string"
    );
  }

  const data: unknown = { id: 1, name: "Alice" };

  if (isUser(data)) {
    console.log("valid user:", data.name); // data: User
  } else {
    console.log("invalid user data");
  }

  // ❌ 反例：虚假守卫（编译通过但运行时不可靠）
  function fakeGuard(value: unknown): value is User {
    return true; // 永远返回 true，危险！
  }

  // 使用虚假守卫会导致运行时错误
  const badData: unknown = { id: "not-a-number" };
  if (fakeGuard(badData)) {
    // 编译器相信 data 是 User，但运行时可能崩溃
    // console.log(badData.name.toUpperCase());
  }
}

// ============================================================
// 6. 断言函数 (Assertion Functions)
// ============================================================
function demoAssertionFunctions() {
  console.log("\n=== Assertion Functions ===");

  function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
      throw new Error(`Value must be defined, got ${value}`);
    }
  }

  function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
      throw new Error(`Expected string, got ${typeof value}`);
    }
  }

  const maybeName: string | null = "Alice";
  assertIsDefined(maybeName);
  // 此后 maybeName 的类型收窄为 string
  console.log("asserted string length:", maybeName.length);

  const raw: unknown = "hello";
  assertIsString(raw);
  // 此后 raw 的类型为 string
  console.log("asserted string upper:", raw.toUpperCase());
}

// ============================================================
// 7. Truthiness Narrowing
// ============================================================
function demoTruthinessNarrowing() {
  console.log("\n=== Truthiness Narrowing ===");

  function getLength(str: string | null | undefined): number {
    if (str) {
      // str 被收窄为 string
      return str.length;
    }
    return 0;
  }

  console.log("truthy length:", getLength("hello"));
  console.log("falsy length:", getLength(null));
  console.log("empty length:", getLength("")); // 注意：空字符串是 falsy

  // 注意：0, "", false, null, undefined, NaN 都是 falsy
  const value: string | number | undefined = 0;
  if (value) {
    console.log("truthy");
  } else {
    // value 仍可能是 0, "", false, null, undefined
    console.log("falsy or zero/empty string/false");
  }
}

// ============================================================
// 8. Equality Narrowing
// ============================================================
function demoEqualityNarrowing() {
  console.log("\n=== Equality Narrowing ===");

  type Status = "loading" | "success" | "error" | null;

  function getMessage(status: Status): string {
    if (status === null) {
      return "not started";
    }
    if (status === "loading") {
      return "loading...";
    }
    if (status === "success") {
      return "done!";
    }
    // 剩余推断为 "error"
    return `failed: ${status}`;
  }

  console.log(getMessage(null));
  console.log(getMessage("loading"));
  console.log(getMessage("success"));
  console.log(getMessage("error"));

  // === undefined / === null 的收窄
  function check(value: string | undefined) {
    if (value === undefined) {
      return "missing";
    }
    return value.toUpperCase(); // value: string
  }

  console.log(check("hello"));
  console.log(check(undefined));
}

// ============================================================
// 9. Switch Exhaustiveness Checking
// ============================================================
function demoSwitchExhaustiveness() {
  console.log("\n=== Switch Exhaustiveness ===");

  type Direction = "north" | "south" | "east" | "west";

  // ✅ 安全：穷尽检查确保所有 case 被处理
  function moveSafe(direction: Direction): string {
    switch (direction) {
      case "north": return "向上";
      case "south": return "向下";
      case "east": return "向右";
      case "west": return "向左";
      default:
        // direction 的类型为 never
        // 如果新增 Direction 成员而未更新 switch，此处编译报错
        const _exhaustive: never = direction;
        return _exhaustive;
    }
  }

  console.log(moveSafe("north"));
  console.log(moveSafe("east"));

  // ❌ 反例：不安全的 switch（新增联合成员不会报错）
  function moveUnsafe(direction: Direction): string {
    switch (direction) {
      case "north": return "向上";
      case "south": return "向下";
      case "east": return "向右";
      // 忘记 "west" —— 编译器不会报错（无 default exhaustive check）
      default: return "unknown";
    }
  }
  console.log(moveUnsafe("west")); // 运行时返回 "unknown"，而非编译错误
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Narrowing & Type Guards Demo            ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoTypeofGuard();
  demoInstanceofGuard();
  demoInGuard();
  demoArrayIsArray();
  demoCustomTypeGuard();
  demoAssertionFunctions();
  demoTruthinessNarrowing();
  demoEqualityNarrowing();
  demoSwitchExhaustiveness();

  console.log("\n✅ narrowing-guards demo complete\n");
}

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
