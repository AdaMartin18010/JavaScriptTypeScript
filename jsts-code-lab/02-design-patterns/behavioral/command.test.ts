import { describe, it, expect } from 'vitest';
import {
  TextEditor,
  InsertCommand,
  DeleteCommand,
  CommandHistory,
  MacroCommand,
  createCommand
} from './command.js';

describe('command pattern', () => {
  it('InsertCommand should insert text and undo correctly', () => {
    const editor = new TextEditor();
    const insert = new InsertCommand(editor, 'Hello');

    insert.execute();
    expect(editor.getContent()).toBe('Hello');

    insert.undo();
    expect(editor.getContent()).toBe('');
  });

  it('CommandHistory should support undo and redo', () => {
    const editor = new TextEditor();
    const history = new CommandHistory();

    history.execute(new InsertCommand(editor, 'Hello '));
    history.execute(new InsertCommand(editor, 'World'));
    expect(editor.getContent()).toBe('Hello World');

    history.undo();
    expect(editor.getContent()).toBe('Hello ');

    history.redo();
    expect(editor.getContent()).toBe('Hello World');
  });

  it('CommandHistory should clear redo history on new execute', () => {
    const editor = new TextEditor();
    const history = new CommandHistory();

    history.execute(new InsertCommand(editor, 'A'));
    history.execute(new InsertCommand(editor, 'B'));
    history.undo();
    expect(history.canRedo()).toBe(true);

    history.execute(new InsertCommand(editor, 'C'));
    expect(history.canRedo()).toBe(false);
    expect(editor.getContent()).toBe('AC');
  });

  it('MacroCommand should execute and undo multiple commands', () => {
    const editor = new TextEditor();
    const macro = new MacroCommand();

    // All commands capture cursor position 0, so execution order produces 'World Hello'
    macro.add(new InsertCommand(editor, 'Hello'));
    macro.add(new InsertCommand(editor, ' '));
    macro.add(new InsertCommand(editor, 'World'));

    macro.execute();
    expect(editor.getContent()).toBe('World Hello');

    macro.undo();
    expect(editor.getContent()).toBe('');
  });

  it('DeleteCommand should delete text and restore on undo', () => {
    const editor = new TextEditor();
    editor.insert('Hello World', 0);
    editor.setCursor(6);

    const history = new CommandHistory();
    history.execute(new DeleteCommand(editor, 5));

    expect(editor.getContent()).toBe('Hello ');

    history.undo();
    expect(editor.getContent()).toBe('Hello World');
  });

  it('createCommand should produce working functional commands', () => {
    const editor = new TextEditor();
    const cmd = createCommand(
      () => editor.insert('Hi', 0),
      () => editor.delete(0, 2)
    );

    cmd.execute();
    expect(editor.getContent()).toBe('Hi');

    cmd.undo();
    expect(editor.getContent()).toBe('');
  });
});
