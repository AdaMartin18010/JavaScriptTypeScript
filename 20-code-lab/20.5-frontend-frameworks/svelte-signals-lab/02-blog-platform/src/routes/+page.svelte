<script lang="ts">
	import type { PageData } from './$types';

	// Svelte 5: 使用 $props() 接收服务端 load 返回的数据
	let { data }: { data: PageData } = $props();

	// 派生状态：格式化后的文章列表
	let posts = $derived(data.posts);
	let tags = $derived(data.tags);

	// 格式化日期
	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(date));
	}

	// 标签点击筛选（客户端状态演示）
	let selectedTag = $state<string | null>(null);
	let filteredPosts = $derived(
		selectedTag
			? posts.filter((p) => p.tags.some((t) => t === selectedTag))
			: posts
	);
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
</svelte:head>

<section class="hero">
	<h1>📝 SvelteKit 博客平台</h1>
	<p class="subtitle">探索全栈开发的优雅之道 —— 从服务端加载到渐进增强表单</p>
	<a href="/blog/new" class="cta-button">✍️ 写一篇文章</a>
</section>

{#if tags.length > 0}
	<section class="tag-filter">
		<span class="filter-label">标签筛选：</span>
		<button
			class="tag-btn"
			class:active={selectedTag === null}
			onclick={() => (selectedTag = null)}
		>
			全部
		</button>
		{#each tags as tag}
			<button
				class="tag-btn"
				class:active={selectedTag === tag}
				onclick={() => (selectedTag = tag)}
			>
				{tag}
			</button>
		{/each}
	</section>
{/if}

<section class="post-list">
	{#if filteredPosts.length === 0}
		<div class="empty-state">
			<p>暂无文章，来 <a href="/blog/new">写第一篇</a> 吧！</p>
		</div>
	{:else}
		<div class="post-grid">
			{#each filteredPosts as post (post.id)}
				<article class="post-card">
					<a href="/blog/{post.slug}" class="post-link">
						<h2>{post.title}</h2>
						<p class="excerpt">{post.excerpt}</p>
						<div class="post-meta">
							<span class="author">👤 {post.author}</span>
							<span class="date">📅 {formatDate(post.publishedAt)}</span>
						</div>
						{#if post.tags.length > 0}
							<div class="post-tags">
								{#each post.tags as tag}
									<span class="tag">{tag}</span>
								{/each}
							</div>
						{/if}
					</a>
				</article>
			{/each}
		</div>
	{/if}
</section>

<style>
	.hero {
		text-align: center;
		padding: 2rem 0 2.5rem;
		border-bottom: 1px solid #e9ecef;
		margin-bottom: 2rem;
	}

	.hero h1 {
		font-size: 2.25rem;
		color: #1a1a2e;
		margin-bottom: 0.75rem;
	}

	.subtitle {
		font-size: 1.1rem;
		color: #6c757d;
		margin-bottom: 1.5rem;
	}

	.cta-button {
		display: inline-block;
		background: #ff3e00;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		font-size: 1rem;
		transition: background 0.2s ease;
		border: none;
		cursor: pointer;
	}

	.cta-button:hover {
		background: #e62e00;
	}

	.tag-filter {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		padding: 0.75rem 1rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.filter-label {
		font-weight: 500;
		color: #495057;
		font-size: 0.9rem;
	}

	.tag-btn {
		background: #e9ecef;
		border: none;
		padding: 0.35rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tag-btn:hover {
		background: #dee2e6;
	}

	.tag-btn.active {
		background: #ff3e00;
		color: white;
	}

	.post-grid {
		display: grid;
		gap: 1.25rem;
	}

	.post-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.post-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.post-link {
		display: block;
		padding: 1.5rem;
		color: inherit;
		text-decoration: none;
	}

	.post-link h2 {
		font-size: 1.35rem;
		color: #1a1a2e;
		margin-bottom: 0.5rem;
		transition: color 0.2s ease;
	}

	.post-link:hover h2 {
		color: #ff3e00;
	}

	.excerpt {
		color: #6c757d;
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.post-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: #868e96;
		margin-bottom: 0.75rem;
	}

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.post-tags .tag {
		background: #fff0eb;
		color: #ff3e00;
		padding: 0.2rem 0.6rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #868e96;
		background: white;
		border-radius: 12px;
	}
</style>
