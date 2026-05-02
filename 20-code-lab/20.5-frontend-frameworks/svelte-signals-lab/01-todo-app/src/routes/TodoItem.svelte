<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Todo } from '$lib/stores/todoStore';

	// Props: todo 对象 + 回调
	let { todo, onToggle, onDelete }: {
		todo: Todo;
		onToggle: (id: number) => void;
		onDelete: (id: number) => void;
	} = $props();

	// 编辑状态
	let isEditing = $state(false);
	let editText = $state('');
	let inputRef: HTMLInputElement | undefined = $state(undefined);

	// 进入编辑模式
	function startEdit() {
		editText = todo.text;
		isEditing = true;
		// 聚焦输入框
		$effect(() => {
			if (isEditing && inputRef) {
				inputRef.focus();
				inputRef.select();
			}
		});
	}

	// 保存编辑
	function saveEdit() {
		const trimmed = editText.trim();
		if (trimmed) {
			todo.text = trimmed;
		}
		isEditing = false;
	}

	// 取消编辑
	function cancelEdit() {
		isEditing = false;
	}

	// 键盘处理
	function handleEditKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			saveEdit();
		} else if (event.key === 'Escape') {
			cancelEdit();
		}
	}

	// 失去焦点保存
	function handleBlur() {
		saveEdit();
	}
</script>

<div
	class="todo-item"
	class:completed={todo.completed}
	class:editing={isEditing}
	transition:fade={{ duration: 200 }}
>
	{#if isEditing}
		<input
			bind:this={inputRef}
			bind:value={editText}
			onkeydown={handleEditKeydown}
			onblur={handleBlur}
			class="edit-input"
		/>
	{:else}
		<label class="todo-label">
			<input
				type="checkbox"
				checked={todo.completed}
				onchange={() => onToggle(todo.id)}
				class="checkbox"
			/>
			<span class="checkmark"></span>
			<span class="text" ondblclick={startEdit} role="button" tabindex="0">
				{todo.text}
			</span>
		</label>
		<button onclick={() => onDelete(todo.id)} class="delete-btn" aria-label="删除">×</button>
	{/if}
</div>

<style>
	.todo-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: #f9fafb;
		border-radius: 12px;
		transition: background 0.2s, transform 0.15s;
	}

	.todo-item:hover {
		background: #f3f4f6;
	}

	.todo-item.completed .text {
		text-decoration: line-through;
		color: #9ca3af;
	}

	.todo-item.editing {
		background: #eef2ff;
	}

	.todo-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		cursor: pointer;
	}

	.checkbox {
		appearance: none;
		width: 22px;
		height: 22px;
		border: 2px solid #d1d5db;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.checkbox:checked {
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-color: transparent;
	}

	.checkbox:checked::after {
		content: '';
		position: absolute;
		left: 6px;
		top: 2px;
		width: 5px;
		height: 10px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}

	.text {
		font-size: 0.9375rem;
		color: #374151;
		flex: 1;
		word-break: break-word;
		user-select: none;
	}

	.delete-btn {
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		color: #d1d5db;
		font-size: 1.25rem;
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.delete-btn:hover {
		background: #fee2e2;
		color: #ef4444;
	}

	.edit-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 2px solid #667eea;
		border-radius: 8px;
		font-size: 0.9375rem;
		outline: none;
		background: white;
	}
</style>
