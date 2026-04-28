/**
 * 私有类字段演示 (Private Class Fields)
 *
 * 涵盖: #privateField 语法、Hard Privacy、私有方法与访问器、
 *       私有静态成员、词法作用域、in 运算符品牌检查、WeakMap legacy 模拟
 */

// ============================================================
// 1. 基础私有字段
// ============================================================
class BasicPrivate {
  #secret = 42;

  getSecret(): number {
    return this.#secret;
  }

  setSecret(v: number): void {
    this.#secret = v;
  }
}

function demoBasicPrivateField() {
  console.log("\n=== Basic Private Field ===");

  const obj = new BasicPrivate();
  console.log("getSecret():", obj.getSecret()); // 42

  obj.setSecret(100);
  console.log("after setSecret(100):", obj.getSecret()); // 100

  // ❌ 类外部无法访问 #secret
  // console.log(obj.#secret); // SyntaxError

  // ❌ Object.keys 不列出私有字段
  console.log("Object.keys:", Object.keys(obj)); // []

  // ❌ JSON.stringify 不序列化私有字段
  console.log("JSON.stringify:", JSON.stringify(obj)); // {}
}

// ============================================================
// 2. 私有方法、私有 getter/setter
// ============================================================
class SecureBox {
  #content: string;
  #password: string;

  constructor(content: string, password: string) {
    this.#content = content;
    this.#password = password;
  }

  #hash(pwd: string): number {
    // 私有方法：简单的 hash 模拟
    let h = 0;
    for (let i = 0; i < pwd.length; i++) h = (h << 5) - h + pwd.charCodeAt(i);
    return h;
  }

  get #passwordHash(): number {
    return this.#hash(this.#password);
  }

  unlock(pwd: string): string | null {
    if (this.#hash(pwd) === this.#passwordHash) {
      return this.#content;
    }
    return null;
  }
}

function demoPrivateMethodsAndAccessors() {
  console.log("\n=== Private Methods & Accessors ===");

  const box = new SecureBox("treasure", "swordfish");
  console.log("unlock with correct password:", box.unlock("swordfish")); // "treasure"
  console.log("unlock with wrong password:", box.unlock("hacker")); // null

  // ❌ 私有方法不可外部调用
  // box.#hash("x"); // SyntaxError
}

// ============================================================
// 3. 私有静态成员
// ============================================================
class Registry {
  static #instances = new Map<string, Registry>();
  static #counter = 0;

  readonly id: number;

  constructor(public name: string) {
    this.id = ++Registry.#counter;
    Registry.#instances.set(name, this);
  }

  static lookup(name: string): Registry | undefined {
    return Registry.#instances.get(name);
  }

  static get count(): number {
    return Registry.#counter;
  }
}

function demoPrivateStatic() {
  console.log("\n=== Private Static Members ===");

  const r1 = new Registry("alpha");
  const r2 = new Registry("beta");

  console.log("r1.id:", r1.id); // 1
  console.log("r2.id:", r2.id); // 2
  console.log("Registry.count:", Registry.count); // 2
  console.log("Registry.lookup('alpha')?.id:", Registry.lookup("alpha")?.id); // 1

  // ❌ 静态私有字段不可外部访问
  // Registry.#counter; // SyntaxError
}

// ============================================================
// 4. 词法作用域：同类不同实例可互相访问私有字段
// ============================================================
class Wallet {
  #balance: number;

  constructor(balance: number) {
    this.#balance = balance;
  }

  transferTo(other: Wallet, amount: number): boolean {
    if (this.#balance < amount) return false;
    this.#balance -= amount;
    other.#balance += amount; // ✅ 同一类词法作用域内可访问其他实例的私有字段
    return true;
  }

  get balance(): number {
    return this.#balance;
  }
}

function demoLexicalScoping() {
  console.log("\n=== Lexical Scoping ===");

  const alice = new Wallet(100);
  const bob = new Wallet(50);

  console.log("alice.balance:", alice.balance); // 100
  console.log("bob.balance:", bob.balance); // 50

  const ok = alice.transferTo(bob, 30);
  console.log("transfer 30:", ok); // true
  console.log("alice.balance after:", alice.balance); // 70
  console.log("bob.balance after:", bob.balance); // 80
}

// ============================================================
// 5. in 运算符品牌检查
// ============================================================
class AuthenticToken {
  #brand = true;

  static isAuthentic(obj: unknown): obj is AuthenticToken {
    return obj instanceof Object && #brand in obj;
  }
}

class FakeToken {
  #brand = true; // 不同的 PrivateName，虽然名字相同但唯一 ID 不同
}

function demoBrandCheck() {
  console.log("\n=== Brand Check with `in` ===");

  const real = new AuthenticToken();
  const fake = new FakeToken();

  console.log("AuthenticToken.isAuthentic(real):", AuthenticToken.isAuthentic(real)); // true
  console.log("AuthenticToken.isAuthentic(fake):", AuthenticToken.isAuthentic(fake)); // false
  console.log("AuthenticToken.isAuthentic({}):", AuthenticToken.isAuthentic({})); // false
  console.log("AuthenticToken.isAuthentic(null):", AuthenticToken.isAuthentic(null)); // false

  // #brand in real 在 AuthenticToken 类外部是 SyntaxError
}

// ============================================================
// 6. WeakMap 作为 legacy 私有字段实现
// ============================================================
const _weakPrivate = new WeakMap<LegacyPrivateInstance, { secret: number }>();

interface LegacyPrivateInstance {}

class LegacyPrivate implements LegacyPrivateInstance {
  constructor() {
    _weakPrivate.set(this, { secret: 42 });
  }

  getSecret(): number {
    return _weakPrivate.get(this)!.secret;
  }

  setSecret(v: number): void {
    _weakPrivate.get(this)!.secret = v;
  }
}

function demoWeakMapLegacy() {
  console.log("\n=== WeakMap Legacy Private ===");

  const obj = new LegacyPrivate();
  console.log("getSecret():", obj.getSecret()); // 42
  obj.setSecret(99);
  console.log("after setSecret(99):", obj.getSecret()); // 99

  // WeakMap 的键是弱引用，对象被 GC 后条目自动消失
  console.log("WeakMap simulates hard privacy without native syntax");
}

// ============================================================
// 7. 私有字段与 Proxy 的不可见性
// ============================================================
class SecretHolder {
  #data = "classified";

  reveal(): string {
    return this.#data;
  }
}

function demoProxyInvisibility() {
  console.log("\n=== Private Fields + Proxy ===");

  const holder = new SecretHolder();
  const proxied = new Proxy(holder, {
    get(t, prop, receiver) {
      console.log(`  proxy trap: ${String(prop)}`);
      return Reflect.get(t, prop, receiver);
    },
  });

  // reveal() 的 "get" 操作经过 trap
  console.log("proxied.reveal():", proxied.reveal());

  // 但 #data 的读取在 reveal() 内部，完全不经过 Proxy
}

// ============================================================
// 8. 私有字段不继承
// ============================================================
class BaseVault {
  #code = 1234;

  getCode(): number {
    return this.#code;
  }
}

class AdvancedVault extends BaseVault {
  // 子类无法访问父类的 #code
  // getParentCode() { return this.#code; } // SyntaxError

  getCodeViaSuper(): number {
    return super.getCode(); // ✅ 只能通过父类的公有/保护方法间接访问
  }
}

function demoNoInheritance() {
  console.log("\n=== Private Fields Not Inherited ===");

  const vault = new AdvancedVault();
  console.log("vault.getCode():", vault.getCode()); // 1234
  console.log("vault.getCodeViaSuper():", vault.getCodeViaSuper()); // 1234
}

// ============================================================
// 反例集合 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // 反例 1：试图用 as any 绕过 #private（编译期失败）
  // const p = new BasicPrivate();
  // console.log((p as any).#secret); // SyntaxError，不是运行时错误

  // 反例 2：Reflect.ownKeys 看不到私有字段
  const holder = new SecretHolder();
  console.log("Reflect.ownKeys:", Reflect.ownKeys(holder)); // []

  // 反例 3：Object.getOwnPropertyDescriptor 对私有字段无效
  // 私有字段根本不是属性
  console.log("getOwnPropertyDescriptor:", Object.getOwnPropertyDescriptor(holder, "#data" as any)); // undefined

  // 反例 4：结构类型兼容性陷阱
  class A {
    #x = 1;
    name = "A";
  }
  class B {
    #x = 2;
    name = "B";
  }
  const a: A = new B(); // TypeScript 允许：只看 public 形状
  console.log("structural typing ignores #private:", a.name); // "B"
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Private Class Fields Demo               ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoBasicPrivateField();
  demoPrivateMethodsAndAccessors();
  demoPrivateStatic();
  demoLexicalScoping();
  demoBrandCheck();
  demoWeakMapLegacy();
  demoProxyInvisibility();
  demoNoInheritance();
  demoCounterExamples();

  console.log("\n✅ private-fields demo complete\n");
}

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
