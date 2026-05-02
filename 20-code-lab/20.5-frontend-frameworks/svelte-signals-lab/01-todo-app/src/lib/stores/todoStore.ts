/**
 * Svelte 5 共享状态模块（.svelte.ts）
 *
 * 使用 .svelte.ts 后缀让 Svelte 编译器识别其中的 Runes，
 * 使得 $state 等语法在模块级别也能正常工作。
 */

export interface Todo {
	id: number;
	text: string;
	completed: boolean;
	createdAt: number;
}

export type FilterType = 'all' | 'active' | 'completed';

const STORAGE_KEY = 'svelte5-todo-app';

function createTodoStore() {
	// 从 localStorage 读取初始数据
	function loadInitial(): Todo[] {
		if (typeof window === 'undefined') return [];
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Todo[];
				if (Array.isArray(parsed)) return parsed;
			}
		} catch {
			// 忽略解析错误
		}
		return [];
	}

	// $state 声明全局响应式状态
	let todos = $state<Todo[]>(loadInitial());

	// 自增 ID 计数器
	let nextId = $state(1);

	// 初始化 nextId 为现有最大 ID + 1
	if (todos.length > 0) {
		nextId = Math.max(...todos.map((t) => t.id)) + 1;
	}

	// $effect 持久化到 localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
		}
	});

	// 操作方法
	function add(text: string) {
		todos.push({
			id: nextId,
			text,
			completed: false,
			createdAt: Date.now()
		});
		nextId += 1;
	}

	function remove(id: number) {
		const idx = todos.findIndex((t) => t.id === id);
		if (idx !== -1) {
			todos.splice(idx, 1);
		}
	}

	function toggle(id: number) {
		const todo = todos.find((t) => t.id === id);
		if (todo) {
			todo.completed = !todo.completed;
		}
	}

	function clearCompleted() {
		// 只保留未完成的
		const active = todos.filter((t) => !t.completed);
		todos.length = 0;
		todos.push(...active);
	}

	function reset() {
		todos.length = 0;
	}

	return {
		get todos() {
			return todos;
		},
		add,
		remove,
		toggle,
		clearCompleted,
		reset
	};
}

export const todoStore = createTodoStore();
