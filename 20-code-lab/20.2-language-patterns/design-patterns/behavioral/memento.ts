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
  private savepoints = new Map<string, GameSavepoint>();

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

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Memento Pattern Demo ===");

  // 文本编辑器演示
  console.log("\nText Editor:");
  const editor = new Editor();
  const history = new History();

  editor.setText("Hello");
  editor.setCursor(5, 0);
  history.backup(editor.save());
  console.log("Saved state 1:", editor.getText());

  editor.setText("Hello World");
  editor.setCursor(11, 0);
  history.backup(editor.save());
  console.log("Saved state 2:", editor.getText());

  editor.setText("Hello World!");
  history.backup(editor.save());
  console.log("Saved state 3:", editor.getText());

  console.log("\nUndo operations:");
  const undo1 = history.undo();
  if (undo1) {
    editor.restore(undo1);
    console.log("After undo:", editor.getText());
  }

  const undo2 = history.undo();
  if (undo2) {
    editor.restore(undo2);
    console.log("After another undo:", editor.getText());
  }

  console.log("\nRedo operation:");
  const redo = history.redo();
  if (redo) {
    editor.restore(redo);
    console.log("After redo:", editor.getText());
  }

  // 游戏存档演示
  console.log("\nGame Save System:");
  const player = new GameCharacter();
  const saveManager = new SaveManager();

  player.setLevel(1);
  player.setHealth(100);
  player.setPosition(0, 0);
  player.addItem("Sword");
  saveManager.addSavepoint("start", player.createSavepoint("Level 1 Start"));
  console.log("Initial status:", player.getStatus());

  player.setLevel(5);
  player.setHealth(80);
  player.setPosition(100, 200);
  player.addItem("Shield");
  saveManager.addSavepoint("mid", player.createSavepoint("Level 5 Mid"));
  console.log("After progress:", player.getStatus());

  console.log("\nLoading savepoint 'start'...");
  const savepoint = saveManager.getSavepoint("start");
  if (savepoint) {
    player.loadSavepoint(savepoint);
    console.log("After loading:", player.getStatus());
  }

  // 现代编辑器演示
  console.log("\nModern Editor with structuredClone:");
  const modernEditor = new ModernEditor();
  modernEditor.setState("text", "Original");
  modernEditor.setState("cursor", { x: 10, y: 5 });

  const snapshot = modernEditor.save();
  console.log("Original state:", modernEditor.getState("text"));

  modernEditor.setState("text", "Modified");
  console.log("Modified state:", modernEditor.getState("text"));

  modernEditor.restore(snapshot);
  console.log("Restored state:", modernEditor.getState("text"));

  console.log("=== End of Demo ===\n");
}
