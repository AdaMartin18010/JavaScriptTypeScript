import { test, expect } from '@playwright/test';

/**
 * E2E 测试 —— Playwright
 *
 * 覆盖场景：
 * - 首页加载与文章列表渲染
 * - 标签筛选交互
 * - 文章详情页导航
 * - 新建文章表单提交
 * - API 端点测试
 */

test.describe('博客平台 E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('首页显示文章列表和导航', async ({ page }) => {
		// 验证页面标题
		await expect(page).toHaveTitle(/SvelteKit 博客/);

		// 验证导航栏
		await expect(page.locator('.logo')).toHaveText('SvelteKit 博客');
		await expect(page.locator('.nav-link[href="/blog/new"]')).toBeVisible();

		// 验证文章卡片存在（种子数据有 3 篇）
		const cards = page.locator('.post-card');
		await expect(cards).toHaveCount(3);

		// 验证文章标题可见
		await expect(page.locator('.post-card h2').first()).toBeVisible();
	});

	test('标签筛选功能', async ({ page }) => {
		// 点击第一个标签按钮
		const firstTag = page.locator('.tag-btn').nth(1);
		await firstTag.click();

		// 验证按钮激活状态
		await expect(firstTag).toHaveClass(/active/);

		// 点击"全部"恢复
		await page.locator('.tag-btn').first().click();
		await expect(page.locator('.post-card')).toHaveCount(3);
	});

	test('文章详情页导航', async ({ page }) => {
		// 点击第一篇文章
		const firstPost = page.locator('.post-card').first();
		const title = await firstPost.locator('h2').textContent();
		await firstPost.click();

		// 验证进入详情页
		await expect(page.locator('.post-detail h1')).toHaveText(title ?? '');

		// 验证返回链接
		await page.locator('.back-link').click();
		await expect(page).toHaveURL('/');
	});

	test('新建文章表单 —— 完整流程', async ({ page }) => {
		await page.goto('/blog/new');

		// 验证表单页面
		await expect(page.locator('h1')).toHaveText('✍️ 新建文章');

		// 填写表单
		await page.locator('input[name="title"]').fill('E2E 测试文章');
		await page.locator('input[name="author"]').fill('Playwright 测试');
		await page.locator('textarea[name="excerpt"]').fill('这是由 Playwright 自动化测试创建的摘要内容。');
		await page.locator('textarea[name="content"]').fill(
			'# E2E 测试正文\n\n这是一篇通过 Playwright E2E 测试创建的文章。\n\n- 支持 Markdown\n- 自动验证\n- 服务端渲染'
		);
		await page.locator('input[name="tags"]').fill('e2e, playwright, testing');

		// 提交表单
		await page.locator('.submit-btn').click();

		// 验证重定向到文章详情页
		await expect(page.locator('.post-detail h1')).toHaveText('E2E 测试文章');
		await expect(page.locator('.author')).toContainText('Playwright 测试');

		// 验证返回首页后能看到新文章
		await page.goto('/');
		await expect(page.locator('.post-card h2').first()).toHaveText('E2E 测试文章');
	});

	test('新建文章表单 —— 验证错误', async ({ page }) => {
		await page.goto('/blog/new');

		// 提交空表单
		await page.locator('.submit-btn').click();

		// 验证仍在表单页
		await expect(page).toHaveURL('/blog/new');

		// 验证错误消息
		await expect(page.locator('.error-msg')).toContainText(/至少需要/);
	});

	test('API 端点 —— GET /api/posts', async ({ request }) => {
		const response = await request.get('/api/posts');
		expect(response.ok()).toBe(true);

		const body = await response.json();
		expect(body.posts).toBeInstanceOf(Array);
		expect(body.count).toBeGreaterThanOrEqual(3);
		expect(body.meta.apiVersion).toBe('1.0');
	});

	test('API 端点 —— GET /api/posts?slug=', async ({ request }) => {
		// 先获取列表
		const listRes = await request.get('/api/posts');
		const listBody = await listRes.json();
		const firstSlug = listBody.posts[0].slug;

		// 查询单篇
		const response = await request.get(`/api/posts?slug=${firstSlug}`);
		expect(response.ok()).toBe(true);

		const body = await response.json();
		expect(body.post.slug).toBe(firstSlug);
	});

	test('API 端点 —— POST /api/posts', async ({ request }) => {
		const response = await request.post('/api/posts', {
			data: {
				title: 'API 测试文章',
				excerpt: '通过 API 创建的测试文章摘要。',
				content: '这是 API 测试的正文内容，必须超过二十个字符。',
				author: 'API Tester',
				tags: 'api, test'
			}
		});

		expect(response.status()).toBe(201);

		const body = await response.json();
		expect(body.post.title).toBe('API 测试文章');
		expect(body.message).toBe('文章创建成功');
		expect(body.links.html).toContain('/blog/');
	});

	test('API 端点 —— POST 验证错误', async ({ request }) => {
		const response = await request.post('/api/posts', {
			data: {
				title: '', // 空标题
				excerpt: '摘要',
				content: '正文',
				author: 'Tester'
			}
		});

		expect(response.status()).toBe(400);
	});
});
