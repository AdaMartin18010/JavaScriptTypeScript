import { test, expect } from '@playwright/test';

test.describe('TODO App E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should add a todo', async ({ page }) => {
		const input = page.locator('.todo-input');
		const addBtn = page.locator('.add-btn');

		await input.fill('学习 Svelte 5');
		await addBtn.click();

		await expect(page.locator('.todo-item .text')).toContainText('学习 Svelte 5');
	});

	test('should add todo by pressing Enter', async ({ page }) => {
		const input = page.locator('.todo-input');

		await input.fill('按回车添加');
		await input.press('Enter');

		await expect(page.locator('.todo-item .text')).toContainText('按回车添加');
	});

	test('should mark a todo as completed', async ({ page }) => {
		const input = page.locator('.todo-input');
		await input.fill('待完成任务');
		await input.press('Enter');

		const checkbox = page.locator('.todo-item .checkbox');
		await checkbox.check();

		await expect(page.locator('.todo-item')).toHaveClass(/completed/);
	});

	test('should delete a todo', async ({ page }) => {
		const input = page.locator('.todo-input');
		await input.fill('将被删除');
		await input.press('Enter');

		await expect(page.locator('.todo-item')).toHaveCount(1);

		const deleteBtn = page.locator('.delete-btn');
		await deleteBtn.click();

		await expect(page.locator('.todo-item')).toHaveCount(0);
		await expect(page.locator('.empty-state')).toBeVisible();
	});

	test('should filter todos', async ({ page }) => {
		const input = page.locator('.todo-input');

		// 添加两个任务
		await input.fill('任务 A');
		await input.press('Enter');
		await input.fill('任务 B');
		await input.press('Enter');

		// 完成任务 B
		const checkboxes = page.locator('.todo-item .checkbox');
		await checkboxes.nth(1).check();

		// 筛选"未完成"
		await page.locator('.filter-btn', { hasText: '未完成' }).click();
		await expect(page.locator('.todo-item')).toHaveCount(1);
		await expect(page.locator('.todo-item .text')).toContainText('任务 A');

		// 筛选"已完成"
		await page.locator('.filter-btn', { hasText: '已完成' }).click();
		await expect(page.locator('.todo-item')).toHaveCount(1);
		await expect(page.locator('.todo-item .text')).toContainText('任务 B');

		// 筛选"全部"
		await page.locator('.filter-btn', { hasText: '全部' }).click();
		await expect(page.locator('.todo-item')).toHaveCount(2);
	});

	test('should clear completed todos', async ({ page }) => {
		const input = page.locator('.todo-input');

		await input.fill('任务 1');
		await input.press('Enter');
		await input.fill('任务 2');
		await input.press('Enter');

		const checkboxes = page.locator('.todo-item .checkbox');
		await checkboxes.first().check();

		const clearBtn = page.locator('.clear-btn');
		await clearBtn.click();

		await expect(page.locator('.todo-item')).toHaveCount(1);
		await expect(page.locator('.todo-item .text')).toContainText('任务 2');
	});

	test('should show progress bar', async ({ page }) => {
		const input = page.locator('.todo-input');
		await input.fill('任务 1');
		await input.press('Enter');
		await input.fill('任务 2');
		await input.press('Enter');

		await expect(page.locator('.progress-bar')).toBeVisible();
		await expect(page.locator('.progress-text')).toContainText('0/2 完成 (0%)');

		const checkboxes = page.locator('.todo-item .checkbox');
		await checkboxes.first().check();

		await expect(page.locator('.progress-text')).toContainText('1/2 完成 (50%)');
	});
});
