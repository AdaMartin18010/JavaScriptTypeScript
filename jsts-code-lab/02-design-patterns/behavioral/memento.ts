/**
 * @file 备忘录模式 (Memento Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty easy
 * @tags memento, behavioral, state-snapshot, undo-redo
 * 
 * @description
 * 在不破坏封装性的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态
 */

// ============================================================================
// 1. 备忘录接口 (窄接口)
// ============================================================================

interface Memento {
  getName(): string;
  getDate(): string;
  getState(): string;
}

// ============================================================================
// 2. 具体备忘录
// ============================================================================

class ConcreteMemento implements Memento {
  constructor(
    private state: string,
    private date: string
  ) {}

  getState(): string {
    return this.state;
  }

  getName(): string {
    return `${this.date} / (${this.state.substring(0, 9)}...)`;
  }

  getDate(): string {
    return this.date;
  }
}

// ============================================================================
// 3. 原发器
// ============================================================================

class Editor {
  private text = '';
  private cursorX = 0;
  private cursorY = 0;
  private selectionWidth = 0;

  setText(text: string): void {
    this.text = text;
  }

  setCursor(x: number, y: number): void {
    this.cursorX = x;
    this.cursorY = y;
  }

  setSelection(width: number): void {
    this.selectionWidth = width;
  }

  getText(): string {
    return this.text;
  }

  save(): Memento {
    return new ConcreteMemento(
      JSON.stringify({
        text: this.text,
        cursorX: this.cursorX,
        cursorY: this.cursorY,
        selectionWidth: this.selectionWidth
      }),
      new Date().toISOString()
    );
  }

  restore(memento: Memento): void {
    const state = JSON.parse(memento.getState());
    this.text = state.text;
    this.cursorX = state.cursorX;
    this.cursorY = state.cursorY;
    this.selectionWidth = state.selectionWidth;
  }
}

// ============================================================================
// 4. 负责人
// ============================================================================

class History {
  private mementos: Memento[] = [];
  private currentIndex = -1;

  backup(memento: Memento): void {
    // 删除当前位置之后的所有历史
    this.mementos = this.mementos.slice(0, this.currentIndex + 1);
    this.mementos.push(memento);
    this.currentIndex++;
  }

  undo(): Memento | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.mementos[this.currentIndex];
    }
    return null;
  }

  redo(): Memento | null {
    if (this.currentIndex < this.mementos.length - 1) {
      this.currentIndex++;
      return this.mementos[this.currentIndex];
    }
    return null;
  }

  getHistory(): string[] {
    return this.mementos.map(m => m.getName());
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.mementos.length - 1;
  }
}

// ============================================================================
// 5. 游戏存档示例
// ============================================================================

interface GameState {
  level: number;
  health: number;
  position: { x: number; y: number };
  inventory: string[];
}

class GameCharacter {
  private level = 1;
  private health = 100;
  private position = { x: 0, y: 0 };
  private inventory: string[] = [];

  setLevel(level: number): void {
    this.level = level;
  }

  setHealth(health: number): void {
    this.health = health;
  }

  setPosition(x: number, y: number): void {
    this.position = { x, y };
  }

  addItem(item: string): void {
    this.inventory.push(item);
  }

  createSavepoint(name: string): GameSavepoint {
    const state: GameState = {
      level: this.level,
      health: this.health,
      position: { ...this.position },
      inventory: [...this.inventory]
    };
    return new GameSavepoint(name, state);
  }

  loadSavepoint(savepoint: GameSavepoint): void {
    const state = savepoint.getState();
    this.level = state.level;
    this.health = state.health;
    this.position = { ...state.position };
    this.inventory = [...state.inventory];
  }

  getStatus(): string {
    return `Level: ${this.level}, Health: ${this.health}, Position: (${this.position.x}, ${this.position.y})`;
  }
}

class GameSavepoint {
  constructor(
    private name: string,
    private state: GameState
  ) {}

  getName(): string {
    return this.name;
  }

  getState(): GameState {
    return { ...this.state };
  }
}

class SaveManager {
  private savepoints: Map<string, GameSavepoint> = new Map();

  addSavepoint(name: string, savepoint: GameSavepoint): void {
    this.savepoints.set(name, savepoint);
  }

  getSavepoint(name: string): GameSavepoint | undefined {
    return this.savepoints.get(name);
  }

  listSavepoints(): string[] {
    return Array.from(this.savepoints.keys());
  }
}

// ============================================================================
// 6. 使用 JavaScript 的结构化克隆
// ============================================================================

class ModernEditor {
  private state: Record<string, unknown> = {};

  setState(key: string, value: unknown): void {
    this.state[key] = value;
  }

  getState(key: string): unknown {
    return this.state[key];
  }

  // 使用结构化克隆创建深拷贝
  save(): Record<string, unknown> {
    return structuredClone(this.state);
  }

  restore(snapshot: Record<string, unknown>): void {
    this.state = structuredClone(snapshot);
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  ConcreteMemento,
  Editor,
  History,
  GameCharacter,
  GameSavepoint,
  SaveManager,
  ModernEditor
};

export type { Memento, GameState };
