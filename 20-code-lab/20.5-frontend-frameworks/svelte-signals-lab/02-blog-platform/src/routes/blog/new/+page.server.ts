import { fail, redirect } from '@sveltejs/kit';
import { createPost } from '$lib/db/posts.js';
import type { Actions, PageServerLoad } from './$types';

/**
 * 新建文章页 —— Form Actions 演示
 *
 * 学习要点：
 * - actions 对象处理表单提交
 * - default action 处理未指定 action 的表单
 * - request.formData() 获取表单数据
 * - fail(400, { ... }) 返回验证错误（HTTP 400）
 * - redirect(303, url) 成功后的重定向
 * - SvelteKit 自动处理渐进增强（use:enhance）
 */

export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: '新建文章',
			description: '创建一篇新的博客文章'
		}
	};
};

export const actions: Actions = {
	// 命名 action: ?/create
	create: async ({ request }) => {
		const formData = await request.formData();

		const title = formData.get('title');
		const excerpt = formData.get('excerpt');
		const content = formData.get('content');
		const author = formData.get('author');
		const tags = formData.get('tags');

		// 服务端验证
		const errors: Record<string, string> = {};

		if (!title || typeof title !== 'string' || title.trim().length < 2) {
			errors.title = '标题至少需要 2 个字符';
		}

		if (!excerpt || typeof excerpt !== 'string' || excerpt.trim().length < 10) {
			errors.excerpt = '摘要至少需要 10 个字符';
		}

		if (!content || typeof content !== 'string' || content.trim().length < 20) {
			errors.content = '正文至少需要 20 个字符';
		}

		if (!author || typeof author !== 'string' || author.trim().length < 1) {
			errors.author = '请输入作者名称';
		}

		// 如果有验证错误，返回 fail（保留表单数据）
		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				data: {
					title: String(title ?? ''),
					excerpt: String(excerpt ?? ''),
					content: String(content ?? ''),
					author: String(author ?? ''),
					tags: String(tags ?? '')
				}
			});
		}

		// 创建文章
		const post = createPost({
			title: title as string,
			excerpt: excerpt as string,
			content: content as string,
			author: author as string,
			tags: String(tags ?? '')
		});

		// 成功重定向到文章详情页
		redirect(303, `/blog/${post.slug}`);
	}
};
