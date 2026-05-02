<script lang="ts">
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
	import type { PageData } from './$types';

	// Svelte 5: $props() 接收服务端数据
	let { data }: { data: PageData } = $props();
	let post = $derived(data.post);

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	}
</script>

<svelte:head>
	<title>{data.meta.title} — SvelteKit 博客</title>
	<meta name="description" content={data.meta.description} />
</svelte:head>

<article class="post-detail">
	<header class="post-header">
		<h1>{post.title}</h1>
		<div class="post-meta-bar">
			<span class="author">👤 {post.author}</span>
			<span class="date">📅 {formatDate(post.publishedAt)}</span>
		</div>
		{#if post.tags.length > 0}
			<div class="post-tags">
				{#each post.tags as tag}
					<a href="/?tag={tag}" class="tag">{tag}</a>
				{/each}
			</div>
		{/if}
	</header>

	<div class="post-content">
		<MarkdownRenderer source={post.content} />
	</div>

	<footer class="post-footer">
		<a href="/" class="back-link">← 返回文章列表</a>
	</footer>
</article>

<style>
	.post-detail {
		background: white;
		border-radius: 16px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
		overflow: hidden;
	}

	.post-header {
		padding: 2.5rem 2rem 1.5rem;
		border-bottom: 1px solid #e9ecef;
	}

	.post-header h1 {
		font-size: 2rem;
		color: #1a1a2e;
		margin-bottom: 1rem;
		line-height: 1.3;
	}

	.post-meta-bar {
		display: flex;
		gap: 1.5rem;
		color: #868e96;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		background: #fff0eb;
		color: #ff3e00;
		padding: 0.3rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
		text-decoration: none;
		transition: background 0.2s ease;
	}

	.tag:hover {
		background: #ff3e00;
		color: white;
	}

	.post-content {
		padding: 2rem;
	}

	.post-footer {
		padding: 1.5rem 2rem;
		border-top: 1px solid #e9ecef;
		background: #f8f9fa;
	}

	.back-link {
		color: #495057;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.back-link:hover {
		color: #ff3e00;
	}
</style>
