/**
 * @file 命令模式 (Command Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty medium
 * @tags command, behavioral, undo-redo, queue
 */

// ============================================================================
// 1. 命令接口
// ============================================================================

interface Command {
  execute(): void;
  undo(): void;
}

// ============================================================================
// 2. 接收者
// ============================================================================

class TextEditor {
  private content = '';
  private selectionStart = 0;
  private selectionEnd = 0;

  getContent(): string {
    return this.content;
  }

  insert(text: string, position: number): void {
    this.content = this.content.slice(0, position) + text + this.content.slice(position);
    this.setCursor(position + text.length);
  }

  delete(start: number, length: number): string {
    const deleted = this.content.slice(start, start + length);
    this.content = this.content.slice(0, start) + this.content.slice(start + length);
    this.setCursor(start);
    return deleted;
  }

  setCursor(position: number): void {
    this.selectionStart = this.selectionEnd = position;
  }

  getCursor(): number {
    return this.selectionStart;
  }
}

// ============================================================================
// 3. 具体命令
// ============================================================================

class InsertCommand implements Command {
  private position: number;

  constructor(
    private editor: TextEditor,
    private text: string
  ) {
    this.position = editor.getCursor();
  }

  execute(): void {
    this.editor.insert(this.text, this.position);
  }

  undo(): void {
    this.editor.delete(this.position, this.text.length);
  }
}

class DeleteCommand implements Command {
  private deletedText = '';
  private position: number;

  constructor(
    private editor: TextEditor,
    private length: number
  ) {
    this.position = editor.getCursor();
  }

  execute(): void {
    this.deletedText = this.editor.delete(this.position, this.length);
  }

  undo(): void {
    this.editor.insert(this.deletedText, this.position);
  }
}

// ============================================================================
// 4. 调用者 (Invoker)
// ============================================================================

class CommandHistory {
  private history: Command[] = [];
  private currentIndex = -1;

  execute(command: Command): void {
    // 清除 redo 历史
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    command.execute();
    this.history.push(command);
    this.currentIndex++;
  }

  undo(): boolean {
    if (this.currentIndex < 0) return false;

    this.history[this.currentIndex].undo();
    this.currentIndex--;
    return true;
  }

  redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) return false;

    this.currentIndex++;
    this.history[this.currentIndex].execute();
    return true;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}

// ============================================================================
// 5. 宏命令 (组合命令)
// ============================================================================

class MacroCommand implements Command {
  private commands: Command[] = [];

  add(command: Command): void {
    this.commands.push(command);
  }

  execute(): void {
    for (const command of this.commands) {
      command.execute();
    }
  }

  undo(): void {
    // 反向撤销
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

// ============================================================================
// 6. 异步命令队列
// ============================================================================

interface AsyncCommand {
  execute(): Promise<void>;
  undo(): Promise<void>;
}

class AsyncCommandQueue {
  private queue: AsyncCommand[] = [];
  private running = false;

  async add(command: AsyncCommand): Promise<void> {
    this.queue.push(command);
    if (!this.running) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.running = true;
    
    while (this.queue.length > 0) {
      const command = this.queue.shift()!;
      try {
        await command.execute();
      } catch (error) {
        console.error('Command failed:', error);
        await command.undo();
      }
    }
    
    this.running = false;
  }
}

// ============================================================================
// 7. 函数式命令 (JavaScript 风格)
// ============================================================================

type CommandFn = () => void;
type UndoFn = () => void;

function createCommand(execute: CommandFn, undo: UndoFn): Command {
  return { execute, undo };
}

// 使用
const editor = new TextEditor();

const insertHello = createCommand(
  () => editor.insert('Hello', 0),
  () => editor.delete(0, 5)
);

// ============================================================================
// 导出
// ============================================================================

export {
  TextEditor,
  InsertCommand,
  DeleteCommand,
  CommandHistory,
  MacroCommand,
  AsyncCommandQueue,
  createCommand
};

export type { Command, AsyncCommand, CommandFn, UndoFn };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Command Pattern Demo ===");
  
  // 文本编辑器
  const editor = new TextEditor();
  const history = new CommandHistory();
  
  // 插入文本
  history.execute(new InsertCommand(editor, "Hello "));
  console.log("After insert 'Hello':", editor.getContent());
  
  history.execute(new InsertCommand(editor, "World"));
  console.log("After insert 'World':", editor.getContent());
  
  // 撤销
  history.undo();
  console.log("After undo:", editor.getContent());
  
  // 重做
  history.redo();
  console.log("After redo:", editor.getContent());
  
  // 宏命令
  const macro = new MacroCommand();
  macro.add(new InsertCommand(editor, "!"));
  macro.add(new InsertCommand(editor, "!"));
  history.execute(macro);
  console.log("After macro:", editor.getContent());
  
  console.log("Can undo:", history.canUndo());
  console.log("Can redo:", history.canRedo());
  
  console.log("=== End of Demo ===\n");
}
