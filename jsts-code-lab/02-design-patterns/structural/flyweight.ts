/**
 * @file 享元模式 (Flyweight Pattern)
 * @category Design Patterns → Structural
 * @difficulty medium
 * @tags flyweight, structural, memory-optimization, cache
 * 
 * @description
 * 运用共享技术有效地支持大量细粒度的对象
 */

// ============================================================================
// 1. 享元接口
// ============================================================================

interface TreeType {
  name: string;
  color: string;
  texture: string;
}

interface Tree {
  x: number;
  y: number;
  type: TreeType;
  draw(): void;
}

// ============================================================================
// 2. 享元工厂
// ============================================================================

class TreeTypeFactory {
  private static types = new Map<string, TreeType>();

  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = `${name}-${color}-${texture}`;
    
    if (!this.types.has(key)) {
      console.log(`Creating new tree type: ${key}`);
      this.types.set(key, { name, color, texture });
    }
    
    return this.types.get(key)!;
  }

  static getTypeCount(): number {
    return this.types.size;
  }
}

// ============================================================================
// 3. 具体享元 (Context)
// ============================================================================

class ConcreteTree implements Tree {
  constructor(
    public x: number,
    public y: number,
    public type: TreeType
  ) {}

  draw(): void {
    console.log(`Drawing ${this.type.name} tree at (${this.x}, ${this.y}) with color ${this.type.color}`);
  }
}

// ============================================================================
// 4. 森林管理器
// ============================================================================

class Forest {
  private trees: Tree[] = [];

  plantTree(x: number, y: number, name: string, color: string, texture: string): void {
    const type = TreeTypeFactory.getTreeType(name, color, texture);
    const tree = new ConcreteTree(x, y, type);
    this.trees.push(tree);
  }

  draw(): void {
    for (const tree of this.trees) {
      tree.draw();
    }
  }

  getTreeCount(): number {
    return this.trees.length;
  }

  getTypeCount(): number {
    return TreeTypeFactory.getTypeCount();
  }
}

// ============================================================================
// 5. 字符享元示例 (文本编辑器)
// ============================================================================

interface CharacterStyle {
  font: string;
  size: number;
  color: string;
}

class CharacterStyleFactory {
  private static styles = new Map<string, CharacterStyle>();

  static getStyle(font: string, size: number, color: string): CharacterStyle {
    const key = `${font}-${size}-${color}`;
    
    if (!this.styles.has(key)) {
      this.styles.set(key, { font, size, color });
    }
    
    return this.styles.get(key)!;
  }
}

class Character {
  constructor(
    private char: string,
    private x: number,
    private y: number,
    private style: CharacterStyle
  ) {}

  draw(): void {
    console.log(`Drawing '${this.char}' at (${this.x}, ${this.y}) with ${this.style.font} ${this.style.size}px ${this.style.color}`);
  }
}

// ============================================================================
// 6. 连接池示例
// ============================================================================

class DatabaseConnection {
  private id: number;
  private inUse = false;

  constructor(id: number) {
    this.id = id;
    console.log(`Creating connection ${id}`);
  }

  query(sql: string): void {
    if (!this.inUse) {
      throw new Error('Connection not acquired');
    }
    console.log(`Connection ${this.id} executing: ${sql}`);
  }

  isInUse(): boolean {
    return this.inUse;
  }

  acquire(): void {
    this.inUse = true;
  }

  release(): void {
    this.inUse = false;
  }
}

class ConnectionPool {
  private pool: DatabaseConnection[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  acquire(): DatabaseConnection {
    // 查找空闲连接
    for (const conn of this.pool) {
      if (!conn.isInUse()) {
        conn.acquire();
        return conn;
      }
    }

    // 创建新连接
    if (this.pool.length < this.maxSize) {
      const conn = new DatabaseConnection(this.pool.length + 1);
      conn.acquire();
      this.pool.push(conn);
      return conn;
    }

    throw new Error('Connection pool exhausted');
  }

  release(conn: DatabaseConnection): void {
    conn.release();
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  TreeTypeFactory,
  ConcreteTree,
  Forest,
  CharacterStyleFactory,
  Character,
  ConnectionPool,
  DatabaseConnection
};

export type { TreeType, Tree, CharacterStyle };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Flyweight Pattern Demo ===");
  
  // 森林示例
  const forest = new Forest();
  
  // 种植大量树但共享类型
  forest.plantTree(1, 1, "Oak", "Green", "Rough");
  forest.plantTree(2, 3, "Oak", "Green", "Rough");
  forest.plantTree(5, 5, "Pine", "Dark Green", "Smooth");
  forest.plantTree(8, 2, "Oak", "Green", "Rough");
  forest.plantTree(10, 10, "Birch", "White", "Smooth");
  
  console.log(`Total trees: ${forest.getTreeCount()}`);
  console.log(`Unique types: ${forest.getTypeCount()}`);
  
  forest.draw();
  
  // 连接池
  const pool = new ConnectionPool(3);
  const conn1 = pool.acquire();
  const conn2 = pool.acquire();
  conn1.query("SELECT * FROM users");
  conn2.query("INSERT INTO logs VALUES ('test')");
  pool.release(conn1);
  const conn3 = pool.acquire(); // 复用 conn1
  console.log("\nConnection 1 === Connection 3:", conn1 === conn3);
  
  console.log("=== End of Demo ===\n");
}
