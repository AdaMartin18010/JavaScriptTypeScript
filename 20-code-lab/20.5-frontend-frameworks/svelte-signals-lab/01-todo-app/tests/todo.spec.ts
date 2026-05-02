import { describe, it, expect, beforeEach } from 'vitest';
import { todoStore, type Todo } from '../src/lib/stores/todoStore';

describe('todoStore', () => {
	beforeEach(() => {
		// 重置状态
		todoStore.reset();
	});

	it('should add a todo', () => {
		todoStore.add('学习 Svelte 5 Runes');
		expect(todoStore.todos.length).toBe(1);
		expect(todoStore.todos[0].text).toBe('学习 Svelte 5 Runes');
		expect(todoStore.todos[0].completed).toBe(false);
	});

	it('should toggle todo completion', () => {
		todoStore.add('阅读文档');
		const id = todoStore.todos[0].id;

		expect(todoStore.todos[0].completed).toBe(false);

		todoStore.toggle(id);
		expect(todoStore.todos[0].completed).toBe(true);

		todoStore.toggle(id);
		expect(todoStore.todos[0].completed).toBe(false);
	});

	it('should remove a todo', () => {
		todoStore.add('任务 A');
		todoStore.add('任务 B');
		const id = todoStore.todos[0].id;

		todoStore.remove(id);
		expect(todoStore.todos.length).toBe(1);
		expect(todoStore.todos[0].text).toBe('任务 B');
	});

	it('should clear completed todos', () => {
		todoStore.add('任务 1');
		todoStore.add('任务 2');
		todoStore.add('任务 3');

		todoStore.toggle(todoStore.todos[0].id);
		todoStore.toggle(todoStore.todos[2].id);

		expect(todoStore.todos.filter((t: Todo) => t.completed).length).toBe(2);

		todoStore.clearCompleted();
		expect(todoStore.todos.length).toBe(1);
		expect(todoStore.todos[0].text).toBe('任务 2');
		expect(todoStore.todos[0].completed).toBe(false);
	});

	it('should filter todos correctly', () => {
		todoStore.add('未完成任务');
		todoStore.add('已完成任务');
		todoStore.toggle(todoStore.todos[1].id);

		const all = todoStore.todos.filter(() => true);
		const active = todoStore.todos.filter((t: Todo) => !t.completed);
		const completed = todoStore.todos.filter((t: Todo) => t.completed);

		expect(all.length).toBe(2);
		expect(active.length).toBe(1);
		expect(active[0].text).toBe('未完成任务');
		expect(completed.length).toBe(1);
		expect(completed[0].text).toBe('已完成任务');
	});

	it('should assign unique ids', () => {
		todoStore.add('任务 1');
		todoStore.add('任务 2');
		todoStore.add('任务 3');

		const ids = todoStore.todos.map((t: Todo) => t.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});
