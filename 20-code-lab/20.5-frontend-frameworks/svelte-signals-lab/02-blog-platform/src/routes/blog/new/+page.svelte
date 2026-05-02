<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	// Svelte 5: $props() 接收数据和表单返回
	let { data, form }: { data: PageData; form: ActionData } = $props();

	// 客户端状态：表单字段（用于即时反馈和验证）
	let title = $state(form?.data?.title ?? '');
	let excerpt = $state(form?.data?.excerpt ?? '');
	let content = $state(form?.data?.content ?? '');
	let author = $state(form?.data?.author ?? '');
	let tags = $state(form?.data?.tags ?? '');

	// 派生状态：字符计数
	let titleLength = $derived(title.length);
	let excerptLength = $derived(excerpt.length);
	let contentLength = $derived(content.length);

	// 派生状态：客户端即时验证
	let clientErrors = $derived({
		title: titleLength > 0 && titleLength < 2 ? '标题至少需要 2 个字符' : '',
		excerpt: excerptLength > 0 && excerptLength < 10 ? '摘要至少需要 10 个字符' : '',
		content: contentLength > 0 && contentLength < 20 ? '正文至少需要 20 个字符' : ''
	});

	// 提交状态
	let submitting = $state(false);
</script>

<svelte:head>
	<title>{data.meta.title} — SvelteKit 博客</title>
	<meta name="description" content={data.meta.description} />
</svelte:head>

<section class="new-post">
	<h1>✍️ 新建文章</h1>
	<p class="subtitle">使用 SvelteKit Form Actions 创建文章，支持服务端验证与渐进增强。</p>

	<!--
		Form Action 关键点：
		- action="?/create" → 调用 +page.server.ts 中名为 create 的 action
		- method="POST" → 必须 POST 方法
		- use:enhance → 渐进增强：JS 可用时拦截提交，无刷新处理
	-->
	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
		class="post-form"
	>
		<div class="form-group">
			<label for="title">文章标题 *</label>
			<input
				id="title"
				name="title"
				type="text"
				bind:value={title}
				placeholder="输入文章标题"
				class="form-input"
				class:error={form?.errors?.title || clientErrors.title}
				required
			/>
			<div class="field-meta">
				<span class="char-count">{titleLength} 字符</span>
				{#if form?.errors?.title}
					<span class="error-msg">{form.errors.title}</span>
				{:else if clientErrors.title}
					<span class="error-msg">{clientErrors.title}</span>
				{/if}
			</div>
		</div>

		<div class="form-group">
			<label for="author">作者 *</label>
			<input
				id="author"
				name="author"
				type="text"
				bind:value={author}
				placeholder="你的名字"
				class="form-input"
				class:error={form?.errors?.author}
				required
			/>
			{#if form?.errors?.author}
				<span class="error-msg">{form.errors.author}</span>
			{/if}
		</div>

		<div class="form-group">
			<label for="excerpt">文章摘要 *</label>
			<textarea
				id="excerpt"
				name="excerpt"
				bind:value={excerpt}
				placeholder="简短描述文章内容（支持 Markdown）"
				rows="3"
				class="form-textarea"
				class:error={form?.errors?.excerpt || clientErrors.excerpt}
				required
			></textarea>
			<div class="field-meta">
				<span class="char-count">{excerptLength} 字符</span>
				{#if form?.errors?.excerpt}
					<span class="error-msg">{form.errors.excerpt}</span>
				{:else if clientErrors.excerpt}
					<span class="error-msg">{clientErrors.excerpt}</span>
				{/if}
			</div>
		</div>

		<div class="form-group">
			<label for="content">正文内容 *</label>
			<textarea
				id="content"
				name="content"
				bind:value={content}
				placeholder="使用 Markdown 语法编写文章正文"
				rows="12"
				class="form-textarea"
				class:error={form?.errors?.content || clientErrors.content}
				required
			></textarea>
			<div class="field-meta">
				<span class="char-count">{contentLength} 字符</span>
				{#if form?.errors?.content}
					<span class="error-msg">{form.errors.content}</span>
				{:else if clientErrors.content}
					<span class="error-msg">{clientErrors.content}</span>
				{/if}
			</div>
		</div>

		<div class="form-group">
			<label for="tags">标签</label>
			<input
				id="tags"
				name="tags"
				type="text"
				bind:value={tags}
				placeholder="用逗号分隔，如：svelte, typescript, frontend"
				class="form-input"
			/>
			<span class="hint">用逗号分隔多个标签</span>
		</div>

		<div class="form-actions">
			<button type="submit" class="submit-btn" disabled={submitting}>
				{submitting ? '发布中…' : '🚀 发布文章'}
			</button>
			<a href="/" class="cancel-btn">取消</a>
		</div>
	</form>
</section>

<style>
	.new-post {
		max-width: 720px;
		margin: 0 auto;
	}

	.new-post h1 {
		font-size: 1.75rem;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #868e96;
		margin-bottom: 2rem;
	}

	.post-form {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #1a1a2e;
	}

	.form-input,
	.form-textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		background: #fff;
	}

	.form-input:focus,
	.form-textarea:focus {
		outline: none;
		border-color: #ff3e00;
		box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
	}

	.form-input.error,
	.form-textarea.error {
		border-color: #dc3545;
	}

	.form-input.error:focus,
	.form-textarea.error:focus {
		box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
	}

	.form-textarea {
		resize: vertical;
		line-height: 1.6;
	}

	.field-meta {
		display: flex;
		justify-content: space-between;
		margin-top: 0.35rem;
		font-size: 0.8rem;
	}

	.char-count {
		color: #868e96;
	}

	.error-msg {
		color: #dc3545;
		font-weight: 500;
	}

	.hint {
		display: block;
		margin-top: 0.35rem;
		font-size: 0.8rem;
		color: #868e96;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e9ecef;
	}

	.submit-btn {
		background: #ff3e00;
		color: white;
		border: none;
		padding: 0.85rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.submit-btn:hover:not(:disabled) {
		background: #e62e00;
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.cancel-btn {
		color: #868e96;
		text-decoration: none;
		font-weight: 500;
		padding: 0.85rem 1.5rem;
	}

	.cancel-btn:hover {
		color: #495057;
	}
</style>
