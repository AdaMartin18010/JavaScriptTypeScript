import { describe, it, expect, vi } from 'vitest';
import { TaskModel, ConsoleTaskView, TaskController } from './mvc-architecture.js';

describe('MVC architecture', () => {
  it('TaskModel should add, toggle, delete tasks and notify listeners', () => {
    const model = new TaskModel();
    const listener = vi.fn();
    model.subscribe(listener);

    const task = model.addTask('Test task');
    expect(task.title).toBe('Test task');
    expect(task.completed).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);

    const toggled = model.toggleTask(task.id);
    expect(toggled?.completed).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);

    const deleted = model.deleteTask(task.id);
    expect(deleted).toBe(true);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('TaskModel should filter completed and pending tasks', () => {
    const model = new TaskModel();
    const t1 = model.addTask('Task 1');
    const t2 = model.addTask('Task 2');
    model.toggleTask(t1.id);
    expect(model.getCompletedTasks().length).toBe(1);
    expect(model.getPendingTasks().length).toBe(1);
  });

  it('TaskController should handle empty title error', () => {
    const model = new TaskModel();
    const view = new ConsoleTaskView();
    const errorSpy = vi.spyOn(view, 'displayError');
    const controller = new TaskController(model, view);
    controller.handleAddTask('  ');
    expect(errorSpy).toHaveBeenCalledWith('任务标题不能为空');
  });

  it('TaskController should handle toggle and delete non-existing task', () => {
    const model = new TaskModel();
    const view = new ConsoleTaskView();
    const errorSpy = vi.spyOn(view, 'displayError');
    const controller = new TaskController(model, view);
    controller.handleToggleTask('nonexistent');
    expect(errorSpy).toHaveBeenCalledWith('任务 nonexistent 不存在');
    controller.handleDeleteTask('nonexistent');
    expect(errorSpy).toHaveBeenCalledWith('任务 nonexistent 不存在');
  });
});
