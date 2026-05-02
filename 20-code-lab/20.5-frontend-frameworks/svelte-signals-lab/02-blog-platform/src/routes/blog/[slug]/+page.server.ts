import { error } from '@sveltejs/kit';
import { getPostBySlug } from '$lib/db/posts.js';
import type { PageServerLoad } from './$types';

/**
 * 文章详情页服务端加载函数
 *
 * 学习要点：
 * - 通过 params.slug 获取动态路由参数
 * - 数据不存在时抛出 404 错误（error(404, ...)）
 * - SvelteKit 会自动处理错误页面渲染
 */
export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	// 根据 slug 查询文章
	const post = getPostBySlug(slug);

	if (!post) {
		// 抛出 404 错误，SvelteKit 会渲染 +error.svelte 或默认错误页
		error(404, {
			message: `文章 "${slug}" 不存在`
		});
	}

	return {
		post,
		meta: {
			title: post.title,
			description: post.excerpt
		}
	};
};
