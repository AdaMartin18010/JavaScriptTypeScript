/**
 * 内存数据层 —— 博客文章存储
 *
 * 本模块提供：
 * - Post / NewPost 类型定义
 * - 内存中的文章存储（Map）
 * - CRUD 操作函数
 * - slug 生成与验证
 *
 * 注意：当前为演示目的使用内存存储。
 * 生产环境应替换为数据库（Prisma + SQLite/PostgreSQL 等）。
 */

export interface Post {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	author: string;
	publishedAt: Date;
	tags: string[];
}

export interface NewPost {
	title: string;
	excerpt: string;
	content: string;
	author: string;
	tags: string;
}

// 内存存储：slug → Post
const posts = new Map<string, Post>();

// 初始化一些示例文章
function seed(): void {
	const samples: NewPost[] = [
		{
			title: '深入理解 Svelte 5 Runes',
			excerpt: '探索 $state、$derived、$effect 等全新响应式原语的设计哲学与使用模式。',
			content:
				'# 深入理解 Svelte 5 Runes\n\nSvelte 5 引入了全新的响应式系统 —— Runes。\n\n## $state\n\n`$state` 用于声明响应式状态……\n\n## $derived\n\n`$derived` 用于创建派生值，自动追踪依赖……\n\n## $effect\n\n`$effect` 用于执行副作用，相当于 React 的 useEffect，但无需手动管理依赖数组。',
			author: 'Svelte 探索者',
			tags: 'svelte,frontend,runes'
		},
		{
			title: 'SvelteKit 服务端加载最佳实践',
			excerpt: '如何高效使用 load 函数、streaming 和缓存策略构建高性能全栈应用。',
			content:
				'# SvelteKit 服务端加载最佳实践\n\n## 服务端 load\n\n在 `+page.server.ts` 中导出 `load` 函数……\n\n## Streaming\n\nSvelteKit 支持渐进式流式传输，提升首屏体验……\n\n## 缓存策略\n\n通过 `setHeaders` 和 `cache-control` 控制 CDN 和浏览器缓存。',
			author: '全栈开发者',
			tags: 'sveltekit,backend,performance'
		},
		{
			title: 'TypeScript 5.7 新特性速览',
			excerpt: '泛型类型收窄、检查器性能优化、ESM 互操作性改进等关键更新。',
			content:
				'# TypeScript 5.7 新特性速览\n\n## 泛型类型收窄\n\nTypeScript 5.7 在泛型类型推断上有了显著改进……\n\n## 性能优化\n\n编译器内部重构使得大型项目的类型检查速度提升了 10-20%……',
			author: '类型体操选手',
			tags: 'typescript,language'
		}
	];

	for (const post of samples) {
		createPost(post);
	}
}

// 工具函数：生成 URL 友好的 slug
export function slugify(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// 工具函数：生成唯一 ID
function generateId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// 创建文章
export function createPost(data: NewPost): Post {
	const slug = slugify(data.title);

	// 处理标签
	const tags = data.tags
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);

	// 如果 slug 已存在，追加唯一后缀
	let uniqueSlug = slug;
	let counter = 1;
	while (posts.has(uniqueSlug)) {
		uniqueSlug = `${slug}-${counter}`;
		counter++;
	}

	const post: Post = {
		id: generateId(),
		slug: uniqueSlug,
		title: data.title.trim(),
		excerpt: data.excerpt.trim(),
		content: data.content.trim(),
		author: data.author.trim(),
		publishedAt: new Date(),
		tags
	};

	posts.set(uniqueSlug, post);
	return post;
}

// 根据 slug 获取文章
export function getPostBySlug(slug: string): Post | undefined {
	return posts.get(slug);
}

// 获取所有文章（按发布时间倒序）
export function getAllPosts(): Post[] {
	return Array.from(posts.values()).sort(
		(a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
	);
}

// 根据标签筛选文章
export function getPostsByTag(tag: string): Post[] {
	return getAllPosts().filter((post) =>
		post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
	);
}

// 删除文章
export function deletePost(slug: string): boolean {
	return posts.delete(slug);
}

// 获取所有标签
export function getAllTags(): string[] {
	const tagSet = new Set<string>();
	for (const post of posts.values()) {
		for (const tag of post.tags) {
			tagSet.add(tag);
		}
	}
	return Array.from(tagSet).sort();
}

// 初始化种子数据
seed();

// 导出底层存储（仅用于测试）
export { posts };
