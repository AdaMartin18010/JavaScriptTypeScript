import { describe, it, expect } from 'vitest';
import {
  Editor,
  History,
  GameCharacter,
  SaveManager,
  ModernEditor
} from './memento.js';

describe('memento pattern', () => {
  it('Editor should save and restore state via memento', () => {
    const editor = new Editor();
    editor.setText('Hello');
    editor.setCursor(5, 0);

    const memento = editor.save();
    expect(memento.getState()).toContain('Hello');

    editor.setText('Hello World');
    expect(editor.getText()).toBe('Hello World');

    editor.restore(memento);
    expect(editor.getText()).toBe('Hello');
  });

  it('History should support undo and redo', () => {
    const editor = new Editor();
    const history = new History();

    editor.setText('State 1');
    history.backup(editor.save());

    editor.setText('State 2');
    history.backup(editor.save());

    editor.setText('State 3');
    history.backup(editor.save());

    const undo1 = history.undo();
    editor.restore(undo1!);
    expect(editor.getText()).toBe('State 2');

    const redo = history.redo();
    editor.restore(redo!);
    expect(editor.getText()).toBe('State 3');
  });

  it('History should return null when nothing to undo/redo', () => {
    const history = new History();
    expect(history.undo()).toBeNull();
    expect(history.redo()).toBeNull();
  });

  it('GameCharacter should save and load savepoints', () => {
    const player = new GameCharacter();
    const saveManager = new SaveManager();

    player.setLevel(1);
    player.setHealth(100);
    player.setPosition(0, 0);
    player.addItem('Sword');
    saveManager.addSavepoint('start', player.createSavepoint('Level 1 Start'));

    player.setLevel(5);
    player.setHealth(80);
    player.setPosition(100, 200);
    player.addItem('Shield');

    const savepoint = saveManager.getSavepoint('start');
    player.loadSavepoint(savepoint!);

    expect(player.getStatus()).toContain('Level: 1');
    expect(player.getStatus()).toContain('Health: 100');
    expect(player.getStatus()).toContain('Position: (0, 0)');
  });

  it('SaveManager should list savepoints', () => {
    const player = new GameCharacter();
    const saveManager = new SaveManager();

    saveManager.addSavepoint('auto', player.createSavepoint('Auto'));
    saveManager.addSavepoint('manual', player.createSavepoint('Manual'));

    expect(saveManager.listSavepoints()).toContain('auto');
    expect(saveManager.listSavepoints()).toContain('manual');
  });

  it('ModernEditor should use structuredClone for snapshots', () => {
    const editor = new ModernEditor();
    editor.setState('text', 'Original');
    editor.setState('cursor', { x: 10, y: 5 });

    const snapshot = editor.save();
    editor.setState('text', 'Modified');
    (editor.getState('cursor') as { x: number; y: number }).x = 99;

    editor.restore(snapshot);
    expect(editor.getState('text')).toBe('Original');
    expect(editor.getState('cursor')).toEqual({ x: 10, y: 5 });
  });
});
