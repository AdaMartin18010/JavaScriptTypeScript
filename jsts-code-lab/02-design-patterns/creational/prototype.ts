/**
 * @file 原型模式 (Prototype Pattern)
 * @category Design Patterns → Creational
 * @difficulty easy
 * @tags prototype, clone, creational
 */

// ============================================================================
// 1. 基础原型实现
// ============================================================================

interface Prototype<T> {
  clone(): T;
}

class Document implements Prototype<Document> {
  constructor(
    public title: string,
    public content: string,
    public author: string,
    public createdAt: Date = new Date()
  ) {}

  clone(): Document {
    // 深拷贝
    return new Document(
      this.title,
      this.content,
      this.author,
      new Date(this.createdAt.getTime())
    );
  }

  displayInfo(): string {
    return `${this.title} by ${this.author}`;
  }
}

// ============================================================================
// 2. 使用结构化克隆 (现代方式)
// ============================================================================

class Shape implements Prototype<Shape> {
  constructor(
    public type: string,
    public x: number,
    public y: number,
    public metadata: Record<string, unknown> = {}
  ) {}

  clone(): Shape {
    // 使用结构化克隆算法
    return structuredClone(this);
  }

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }
}

// ============================================================================
// 3. 原型注册表
// ============================================================================

class PrototypeRegistry {
  private prototypes = new Map<string, Prototype<unknown>>();

  register(name: string, prototype: Prototype<unknown>): void {
    this.prototypes.set(name, prototype);
  }

  create<T>(name: string): T {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      throw new Error(`Prototype '${name}' not found`);
    }
    return prototype.clone() as T;
  }
}

// ============================================================================
// 4. JavaScript 的原型继承
// ============================================================================

const carPrototype = {
  wheels: 4,
  drive() {
    return 'Driving...';
  },
  clone() {
    return Object.create(this);
  }
};

const myCar = carPrototype.clone();
myCar.color = 'red';

// ============================================================================
// 5. 复杂对象克隆
// ============================================================================

class GameCharacter implements Prototype<GameCharacter> {
  constructor(
    public name: string,
    public level: number,
    public inventory: string[],
    public stats: { health: number; mana: number; strength: number }
  ) {}

  clone(): GameCharacter {
    return new GameCharacter(
      this.name,
      this.level,
      [...this.inventory], // 浅拷贝数组
      { ...this.stats } // 浅拷贝对象
    );
  }

  deepClone(): GameCharacter {
    return new GameCharacter(
      this.name,
      this.level,
      structuredClone(this.inventory),
      structuredClone(this.stats)
    );
  }
}

// ============================================================================
// 6. 深拷贝工具
// ============================================================================

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;

  const cloned = {} as T;
  for (const key of Object.keys(obj)) {
    cloned[key as keyof T] = deepClone(obj[key as keyof T]);
  }
  return cloned;
}

// ============================================================================
// 导出
// ============================================================================

export {
  Document,
  Shape,
  PrototypeRegistry,
  carPrototype,
  GameCharacter,
  deepClone
};

export type { Prototype };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Prototype Pattern Demo ===");
  
  // 文档克隆
  const doc1 = new Document("Original", "Content here", "Alice");
  const doc2 = doc1.clone();
  console.log("Original:", doc1.displayInfo());
  console.log("Clone:", doc2.displayInfo());
  console.log("Different instances:", doc1 !== doc2);
  
  // Shape 克隆
  const shape1 = new Shape("circle", 10, 20, { radius: 5 });
  const shape2 = shape1.clone();
  console.log("Shape 1:", shape1);
  console.log("Shape 2 (cloned):", shape2);
  
  // 原型注册表
  const registry = new PrototypeRegistry();
  registry.register("doc", doc1);
  const cloned = registry.create<Document>("doc");
  console.log("Registry clone:", cloned.displayInfo());
  
  // 深拷贝
  const gameChar = new GameCharacter("Hero", 10, ["sword", "shield"], { health: 100, mana: 50, strength: 20 });
  const charCopy = gameChar.deepClone();
  console.log("Game char:", gameChar);
  console.log("Deep clone:", charCopy);
  
  console.log("=== End of Demo ===\n");
}
