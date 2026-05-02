<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { todoStore, type FilterType } from '$lib/stores/todoStore';
	import TodoItem from './TodoItem.svelte';
	import TodoFilter from './TodoFilter.svelte';

	// 输入框内容
	let inputValue = $state('');

	// 当前筛选条件
	let currentFilter = $state<FilterType>('all');

	// 派生：筛选后的 todo 列表
	let filteredTodos = $derived(
		todoStore.todos.filter((t) => {
			if (currentFilter === 'active') return !t.completed;
			if (currentFilter === 'completed') return t.completed;
			return true;
		})
	);

	// 派生：统计
	let completedCount = $derived(todoStore.todos.filter((t) => t.completed).length);
	let totalCount = $derived(todoStore.todos.length);
	let progressPercent = $derived(totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100));

	// 添加 todo
	function handleAdd() {
		const text = inputValue.trim();
		if (!text) return;
		todoStore.add(text);
		inputValue = '';
	}

	// 键盘回车添加
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleAdd();
		}
	}

	// 切换完成
	function handleToggle(id: number) {
		todoStore.toggle(id);
	}

	// 删除 todo
	function handleDelete(id: number) {
		todoStore.remove(id);
	}

	// 清空已完成
	function clearCompleted() {
		todoStore.clearCompleted();
	}
</script>

<div class="todo-app">
	<header>
		<h1>TODO 清单</h1>
		<p class="subtitle">Svelte 5 Runes 实战</p>
	</header>

	<!-- 进度条 -->
	{#if totalCount > 0}
		<div class="progress-bar" transition:fade={{ duration: 200 }}>
			<div class="progress-track">
				<div class="progress-fill" style="width: {progressPercent}%"></div>
			</div>
			<span class="progress-text">{completedCount}/{totalCount} 完成 ({progressPercent}%)</span>
		</div>
	{/if}

	<!-- 输入区 -->
	<div class="input-area">
		<input
			type="text"
			bind:value={inputValue}
			onkeydown={handleKeydown}
			placeholder="添加新任务，按回车确认..."
			class="todo-input"
		/>
		<button onclick={handleAdd} class="add-btn" aria-label="添加">+</button>
	</div>

	<!-- 筛选器 -->
	{#if totalCount > 0}
		<TodoFilter bind:filter={currentFilter} />
	{/if}

	<!-- 列表 -->
	<ul class="todo-list">
		{#each filteredTodos as todo (todo.id)}
			<li transition:fly={{ y: 20, duration: 250 }}>
				<TodoItem {todo} onToggle={handleToggle} onDelete={handleDelete} />
			</li>
		{/each}
	</ul>

	<!-- 空状态 -->
	{#if filteredTodos.length === 0}
		<div class="empty-state" transition:fade={{ duration: 300 }}>
			{#if totalCount === 0}
				<p>📝 暂无任务，添加一个开始吧！</p>
			{:else if currentFilter === 'completed'}
				<p>✨ 还没有已完成的任务</p>
			{:else if currentFilter === 'active'}
				<p>🎉 所有任务都已完成！</p>
			{:else}
				<p>📝 暂无任务</p>
			{/if}
		</div>
	{/if}

	<!-- 底部操作 -->
	{#if totalCount > 0}
		<div class="footer" transition:fade={{ duration: 200 }}>
			<span class="count">剩余 {totalCount - completedCount} 项</span>
			{#if completedCount > 0}
				<button onclick={clearCompleted} class="clear-btn">清除已完成</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.todo-app {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	header {
		text-align: center;
	}

	h1 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1f2937;
		letter-spacing: -0.025em;
	}

	.subtitle {
		color: #6b7280;
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}

	.progress-bar {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-track {
		height: 6px;
		background: #e5e7eb;
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea, #764ba2);
		border-radius: 999px;
		transition: width 0.4s ease;
	}

	.progress-text {
		font-size: 0.75rem;
		color: #6b7280;
		text-align: right;
	}

	.input-area {
		display: flex;
		gap: 0.5rem;
	}

	.todo-input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.2s;
	}

	.todo-input:focus {
		border-color: #667eea;
	}

	.add-btn {
		width: 44px;
		height: 44px;
		border: none;
		border-radius: 12px;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.todo-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 2rem 0;
		color: #9ca3af;
		font-size: 0.9375rem;
	}

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 0.75rem;
		border-top: 1px solid #f3f4f6;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.clear-btn {
		background: none;
		border: none;
		color: #ef4444;
		cursor: pointer;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.clear-btn:hover {
		color: #dc2626;
		text-decoration: underline;
	}
</style>
