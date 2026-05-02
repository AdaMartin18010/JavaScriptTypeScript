import { getAllPosts, getAllTags } from '$lib/db/posts.js';
import type { PageServerLoad } from './$types';

/**
 * 首页服务端加载函数
 *
 * 学习要点：
 * - +page.server.ts 中的 load 函数只在服务端执行
 * - 返回的数据会被序列化并嵌入到 HTML 中（SSR）
 * - 页面组件通过 $props() 接收 data
 * - 支持 streaming：返回 Promise 会自动流式传输
 */
export const load: PageServerLoad = async () => {
	// 从内存数据库获取所有文章和标签
	const posts = getAllPosts();
	const tags = getAllTags();

	// 可以在这里添加更多服务端逻辑：
	// - 数据库查询
	// - 外部 API 调用
	// - 权限检查
	// - 缓存控制

	return {
		posts,
		tags,
		meta: {
			title: 'SvelteKit 博客',
			description: '基于 SvelteKit 2 的全栈博客平台演示'
		}
	};
};
