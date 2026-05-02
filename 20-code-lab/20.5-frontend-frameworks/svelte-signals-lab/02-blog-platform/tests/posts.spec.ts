import { describe, it, expect, beforeEach } from 'vitest';
import {
	createPost,
	getPostBySlug,
	getAllPosts,
	getPostsByTag,
	deletePost,
	getAllTags,
	slugify,
	posts
} from '../src/lib/db/posts';

describe('数据层: posts.ts', () => {
	beforeEach(() => {
		// 清空内存存储
		posts.clear();
	});

	describe('slugify', () => {
		it('将标题转换为 URL 友好的 slug', () => {
			expect(slugify('Hello World')).toBe('hello-world');
			expect(slugify('SvelteKit 博客平台')).toBe('sveltekit-博客平台');
			expect(slugify('  Trim  Spaces  ')).toBe('trim-spaces');
		});

		it('移除特殊字符', () => {
			expect(slugify('What?!')).toBe('what');
			expect(slugify('A&B Testing')).toBe('ab-testing');
		});
	});

	describe('createPost', () => {
		it('创建文章并返回完整 Post 对象', () => {
			const post = createPost({
				title: '测试文章',
				excerpt: '这是一个测试摘要',
				content: '这是测试正文内容，长度超过二十个字符。',
				author: '测试作者',
				tags: 'test, vitest, svelte'
			});

			expect(post.id).toBeDefined();
			expect(post.slug).toBe('测试文章');
			expect(post.title).toBe('测试文章');
			expect(post.excerpt).toBe('这是一个测试摘要');
			expect(post.author).toBe('测试作者');
			expect(post.tags).toEqual(['test', 'vitest', 'svelte']);
			expect(post.publishedAt).toBeInstanceOf(Date);
		});

		it('当 slug 冲突时自动添加后缀', () => {
			createPost({
				title: '同名文章',
				excerpt: '摘要一',
				content: '正文内容一，长度超过二十个字符。',
				author: '作者A',
				tags: ''
			});

			const second = createPost({
				title: '同名文章',
				excerpt: '摘要二',
				content: '正文内容二，长度超过二十个字符。',
				author: '作者B',
				tags: ''
			});

			expect(second.slug).toBe('同名文章-1');
		});

		it('处理空标签字符串', () => {
			const post = createPost({
				title: '无标签',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: ''
			});

			expect(post.tags).toEqual([]);
		});
	});

	describe('getPostBySlug', () => {
		it('根据 slug 获取文章', () => {
			const created = createPost({
				title: '查找测试',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: ''
			});

			const found = getPostBySlug(created.slug);
			expect(found).toEqual(created);
		});

		it('不存在的 slug 返回 undefined', () => {
			expect(getPostBySlug('not-exists')).toBeUndefined();
		});
	});

	describe('getAllPosts', () => {
		it('按发布时间倒序返回文章', () => {
			const post1 = createPost({
				title: '文章一',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: ''
			});

			// 延迟一小段时间确保顺序
			const post2 = createPost({
				title: '文章二',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: ''
			});

			const all = getAllPosts();
			expect(all[0].slug).toBe(post2.slug);
			expect(all[1].slug).toBe(post1.slug);
		});
	});

	describe('getPostsByTag', () => {
		it('根据标签筛选文章（不区分大小写）', () => {
			createPost({
				title: 'Svelte 文章',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: 'Svelte, Frontend'
			});

			createPost({
				title: 'React 文章',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: 'React, Frontend'
			});

			const sveltePosts = getPostsByTag('svelte');
			expect(sveltePosts).toHaveLength(1);
			expect(sveltePosts[0].title).toBe('Svelte 文章');

			const frontendPosts = getPostsByTag('Frontend');
			expect(frontendPosts).toHaveLength(2);
		});
	});

	describe('deletePost', () => {
		it('删除文章并返回 true', () => {
			const post = createPost({
				title: '待删除',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: ''
			});

			expect(deletePost(post.slug)).toBe(true);
			expect(getPostBySlug(post.slug)).toBeUndefined();
		});

		it('删除不存在的文章返回 false', () => {
			expect(deletePost('not-exists')).toBe(false);
		});
	});

	describe('getAllTags', () => {
		it('返回所有唯一标签并排序', () => {
			createPost({
				title: '文章A',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: 'gamma, alpha'
			});

			createPost({
				title: '文章B',
				excerpt: '摘要',
				content: '正文内容，长度超过二十个字符。',
				author: '作者',
				tags: 'beta, alpha'
			});

			expect(getAllTags()).toEqual(['alpha', 'beta', 'gamma']);
		});
	});
});
