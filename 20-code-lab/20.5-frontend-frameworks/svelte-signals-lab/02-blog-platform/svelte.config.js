import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// 使用 Vite 预处理（支持 TypeScript、SCSS 等）
	preprocess: vitePreprocess(),

	kit: {
		// 使用 adapter-node 以支持 Docker 容器内 Node 服务器运行
		adapter: adapter(),

		// 别名配置（$lib 已内置，无需额外声明）
		alias: {
			$components: 'src/lib/components',
			$db: 'src/lib/db'
		}
	}
};

export default config;
