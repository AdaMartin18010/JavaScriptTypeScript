/**
 * 结构类型 vs 名义类型演示 (Structural vs Nominal Typing)
 *
 * 涵盖: structural typing in action, branded types (nominal emulation),
 *       unique symbol branding
 */

// ============================================================
// 1. 结构类型实战 (Structural Typing)
// ============================================================
function demoStructuralTyping() {
  console.log("\n=== Structural Typing ===");

  interface Point {
    x: number;
    y: number;
  }

  function distance(p: Point): number {
    return Math.sqrt(p.x ** 2 + p.y ** 2);
  }

  // ✅ 只要结构匹配，无需显式声明实现 Point
  const pointLike = { x: 3, y: 4, color: "red" };
  console.log("distance of point-like object:", distance(pointLike));

  // 额外属性不会破坏兼容性
  const extraProps = { x: 5, y: 12, z: 0, label: "origin" };
  console.log("distance with extra props:", distance(extraProps));

  // 接口之间只要结构相同就兼容
  interface Vector {
    x: number;
    y: number;
  }

  const vec: Vector = { x: 1, y: 2 };
  const pt: Point = vec; // ✅ 结构相同，兼容
  console.log("Vector assigned to Point:", pt.x, pt.y);
}

// ============================================================
// 2. 多余属性检查 (Excess Property Checks)
// ============================================================
function demoExcessPropertyChecks() {
  console.log("\n=== Excess Property Checks ===");

  interface SquareConfig {
    color?: string;
    width?: number;
  }

  function createSquare(config: SquareConfig) {
    return {
      color: config.color ?? "red",
      area: (config.width ?? 10) ** 2,
    };
  }

  // ❌ 反例：对象字面量直接传入会触发多余属性检查
  // createSquare({ colour: "red", width: 100 }); // Error: 'colour' does not exist

  // ✅ 绕过方法 1：类型断言
  createSquare({ colour: "red", width: 100 } as SquareConfig);

  // ✅ 绕过方法 2：赋值给变量
  const options = { colour: "red", width: 100 };
  createSquare(options); // 变量不触发多余属性检查

  console.log("excess property check bypassed via variable assignment");

  // ✅ 正确做法：使用索引签名
  interface FlexibleConfig {
    color?: string;
    width?: number;
    [propName: string]: any;
  }

  function createFlexible(config: FlexibleConfig) {
    return createSquare(config);
  }
  console.log("flexible config:", createFlexible({ colour: "blue", width: 20 }));
}

// ============================================================
// 3. 品牌类型 —— 模拟名义类型 (Branded Types)
// ============================================================
function demoBrandedTypes() {
  console.log("\n=== Branded Types ===");

  // 使用交叉类型添加“品牌”标记
  type UserId = string & { __brand: "UserId" };
  type OrderId = string & { __brand: "OrderId" };

  function getUser(id: UserId) {
    return `User #${id}`;
  }

  const userId = "123" as UserId;
  const orderId = "123" as OrderId;

  console.log("getUser(userId):", getUser(userId));
  // getUser(orderId); // ❌ Error: Type 'OrderId' is not assignable to type 'UserId'

  // 实用：物理单位
  type Meters = number & { __unit: "meters" };
  type Seconds = number & { __unit: "seconds" };

  function travel(distance: Meters, time: Seconds): number {
    return distance / time; // m/s
  }

  const d = 100 as Meters;
  const t = 10 as Seconds;
  console.log("travel speed:", travel(d, t));
  // travel(t, d); // ❌ Error: 参数顺序错误
}

// 使用 unique symbol 创建无法外部伪造的品牌
declare const UserIdSymbol: unique symbol;
declare const OrderIdSymbol: unique symbol;

// ============================================================
// 4. unique symbol 品牌类型
// ============================================================
function demoUniqueSymbolBranding() {
  console.log("\n=== unique symbol Branding ===");

  type UserId = string & { [UserIdSymbol]: true };
  type OrderId = string & { [OrderIdSymbol]: true };

  function createUserId(value: string): UserId {
    return value as UserId;
  }

  function createOrderId(value: string): OrderId {
    return value as OrderId;
  }

  function lookupUser(id: UserId): string {
    return `Looking up user ${id}`;
  }

  const uid = createUserId("42");
  const oid = createOrderId("42");

  console.log(lookupUser(uid));
  // lookupUser(oid); // ❌ Error: OrderId 不能赋值给 UserId

  // 更安全的工厂模式
  interface Branded<T, B> {
    readonly value: T;
    readonly _brand: B;
  }

  type SafeUserId = Branded<string, "UserId">;
  type SafeOrderId = Branded<string, "OrderId">;

  function brand<T, B>(value: T, brand: B): Branded<T, B> {
    return { value, _brand: brand };
  }

  const safeUid = brand("99", "UserId" as const);
  console.log("safe branded value:", safeUid.value);
}

// ============================================================
// 5. 类 + 私有字段模拟名义类型
// ============================================================
function demoClassNominal() {
  console.log("\n=== Class-based Nominal Types ===");

  class UserId {
    private __brand!: void;
    constructor(public value: string) {}
  }

  class OrderId {
    private __brand!: void;
    constructor(public value: string) {}
  }

  function fetchUser(id: UserId) {
    return `User ${id.value}`;
  }

  const userId = new UserId("100");
  const orderId = new OrderId("100");

  console.log(fetchUser(userId));
  // fetchUser(orderId); // ❌ Error: OrderId 不是 UserId

  // 即使结构完全相同，私有字段导致不兼容
  class ProductId {
    private __brand!: void;
    constructor(public value: string) {}
  }

  // const productId = new ProductId("100");
  // fetchUser(productId); // ❌ Error
  console.log("private fields create nominal distinction");
}

// ============================================================
// 6. 结构类型的优势与风险
// ============================================================
function demoProsAndCons() {
  console.log("\n=== Pros & Cons of Structural Typing ===");

  // ✅ 优势 1：易于模拟 (mock)
  interface Logger {
    log: (msg: string) => void;
  }

  function useLogger(logger: Logger) {
    logger.log("hello");
  }

  // 无需实现 Logger 接口，只需结构匹配
  const mockLogger = { log: (msg: string) => console.log("mock:", msg) };
  useLogger(mockLogger);

  // ✅ 优势 2：灵活组合
  interface Named {
    name: string;
  }
  interface Aged {
    age: number;
  }

  function greetNamed(n: Named) {
    console.log("Hello", n.name);
  }

  const person = { name: "Alice", age: 30 };
  greetNamed(person); // ✅ person 有 name，兼容 Named

  // ❌ 风险：意外兼容
  interface Car {
    name: string;
    speed: number;
  }

  interface Person {
    name: string;
    speed: number; // 跑步速度
  }

  function drive(car: Car) {
    console.log(`Driving ${car.name} at ${car.speed} km/h`);
  }

  const runner: Person = { name: "Usain", speed: 37 };
  drive(runner); // ❌ 编译通过，但语义错误！
  console.log("structural typing allows semantic mismatches (runner as car)");
}

// ============================================================
// 7. 反例 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // ❌ 反例 1：对象字面量多余属性检查
  interface Config {
    host: string;
    port: number;
  }
  // const cfg: Config = { host: "localhost", port: 3000, ssl: true }; // Error

  // ✅ 绕过
  const bypass = { host: "localhost", port: 3000, ssl: true };
  const cfg: Config = bypass; // 不报错
  console.log("excess property check bypass:", cfg.host);

  // ❌ 反例 2：品牌类型仍可被强制转换绕过
  type Email = string & { __brand: "Email" };
  const fakeEmail = "not-an-email" as Email; // 类型断言可伪造
  console.log("branded type bypassed via assertion:", fakeEmail);

  // ✅ 缓解：使用工厂函数 + 运行时验证
  function createEmail(value: string): Email {
    if (!value.includes("@")) {
      throw new Error("Invalid email");
    }
    return value as Email;
  }
  const validEmail = createEmail("user@example.com");
  console.log("validated email:", validEmail);

  // ❌ 反例 3：结构相同但语义不同
  type Celsius = number;
  type Fahrenheit = number;
  const c: Celsius = 100;
  const f: Fahrenheit = c; // 编译通过，但 100°C ≠ 100°F！
  console.log("same structure, different semantics:", c, f);
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Structural vs Nominal Typing Demo           ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoStructuralTyping();
  demoExcessPropertyChecks();
  demoBrandedTypes();
  demoUniqueSymbolBranding();
  demoClassNominal();
  demoProsAndCons();
  demoCounterExamples();

  console.log("\n✅ structural-nominal demo complete\n");
}

if (require.main === module) {
  demo();
}
