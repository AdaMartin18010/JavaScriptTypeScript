import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// 使用 Vite 预处理（支持 TypeScript、SCSS 等）
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto 会根据部署环境自动选择适配器：
		// - Vercel → adapter-vercel
		// - Netlify → adapter-netlify
		// - Cloudflare Pages → adapter-cloudflare
		// - 无平台 → adapter-static（prerender 模式）
		// 生产环境如需独立 Node 服务器，可替换为 adapter-node
		adapter: adapter(),

		// 别名配置（$lib 已内置，无需额外声明）
		alias: {
			$components: 'src/lib/components',
			$db: 'src/lib/db'
		}
	}
};

export default config;
