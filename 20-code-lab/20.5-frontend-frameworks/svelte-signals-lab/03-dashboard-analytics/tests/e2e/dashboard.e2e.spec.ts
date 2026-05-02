import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('page has correct title', async ({ page }) => {
		await expect(page).toHaveTitle(/Dashboard Analytics/);
	});

	test('renders KPI cards', async ({ page }) => {
		const cards = page.locator('article.kpi-card');
		await expect(cards).toHaveCount(4);
		await expect(page.getByText('总收入')).toBeVisible();
		await expect(page.getByText('总订单')).toBeVisible();
		await expect(page.getByText('客单价')).toBeVisible();
		await expect(page.getByText('完成率')).toBeVisible();
	});

	test('renders charts', async ({ page }) => {
		await expect(page.locator('.chart-card svg')).toHaveCount(3);
	});

	test('renders data table with rows', async ({ page }) => {
		const rows = page.locator('table.data-table tbody tr');
		await expect(rows.first()).toBeVisible();
	});

	test('sidebar toggle works', async ({ page }) => {
		const toggle = page.getByLabel('切换侧边栏');
		await toggle.click();
		await expect(page.locator('.dashboard.sidebar-closed')).toBeVisible();
		await toggle.click();
		await expect(page.locator('.dashboard:not(.sidebar-closed)')).toBeVisible();
	});

	test('table search filters rows', async ({ page }) => {
		const searchInput = page.locator('input[type="search"]');
		await searchInput.fill('ZZZZ_NOT_EXISTS');
		await expect(page.locator('.empty-state')).toBeVisible();
		await searchInput.fill('');
		await expect(page.locator('.empty-state')).not.toBeVisible();
	});

	test('table pagination controls are present', async ({ page }) => {
		await expect(page.getByLabel('上一页')).toBeVisible();
		await expect(page.getByLabel('下一页')).toBeVisible();
	});
});
