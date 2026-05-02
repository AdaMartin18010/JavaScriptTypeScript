import { json, error } from '@sveltejs/kit';
import { getAllPosts, createPost, getPostBySlug } from '$lib/db/posts.js';
import type { RequestHandler } from './$types';

/**
 * API 路由 —— RESTful 文章接口
 *
 * 学习要点：
 * - +server.ts 文件创建独立 API 端点
 * - 导出对应 HTTP 方法的 handler（GET / POST / PUT / DELETE）
 * - json() 辅助函数返回 JSON 响应
 * - error() 抛出标准 HTTP 错误
 * - 与页面路由完全独立，可作为外部 API 使用
 */

// GET /api/posts —— 获取文章列表或单篇文章
export const GET: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get('slug');
	const tag = url.searchParams.get('tag');

	if (slug) {
		// 获取单篇文章
		const post = getPostBySlug(slug);
		if (!post) {
			error(404, { message: '文章不存在' });
		}
		return json({ post });
	}

	// 获取文章列表
	let posts = getAllPosts();

	if (tag) {
		posts = posts.filter((p) =>
			p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
		);
	}

	return json({
		posts,
		count: posts.length,
		meta: {
			apiVersion: '1.0',
			endpoint: '/api/posts'
		}
	});
};

// POST /api/posts —— 创建新文章
export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>;

	try {
		body = await request.json();
	} catch {
		error(400, { message: '请求体必须是有效的 JSON' });
	}

	// 验证必填字段
	const required = ['title', 'excerpt', 'content', 'author'];
	const missing = required.filter((field) => !body[field] || typeof body[field] !== 'string');

	if (missing.length > 0) {
		error(400, {
			message: `缺少必填字段: ${missing.join(', ')}`
		});
	}

	// 创建文章
	const post = createPost({
		title: body.title as string,
		excerpt: body.excerpt as string,
		content: body.content as string,
		author: body.author as string,
		tags: String(body.tags ?? '')
	});

	// 返回 201 Created
	return json(
		{
			post,
			message: '文章创建成功',
			links: {
				self: `/api/posts?slug=${post.slug}`,
				html: `/blog/${post.slug}`
			}
		},
		{ status: 201 }
	);
};

// OPTIONS /api/posts —— CORS 预检
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
};
