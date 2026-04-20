/**
 * 模拟数据
 * 用于演示列表、搜索、详情等场景
 */

import { type Item } from '@/types';

/** 生成确定性 ID 的辅助函数 */
function generateId(index: number, prefix: string): string {
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

/** 示例分类列表 */
export const CATEGORIES = [
  '前端框架',
  '构建工具',
  'UI 组件库',
  '状态管理',
  '测试工具',
  '部署平台',
] as const;

/** 模拟项目数据（20 条） */
export const MOCK_ITEMS: Item[] = Array.from({ length: 20 }, (_, i) => {
  const category = CATEGORIES[i % CATEGORIES.length];
  const titles: Record<string, string> = {
    '前端框架': ['React', 'Vue', 'Svelte', 'SolidJS', 'Angular', 'Preact'],
    '构建工具': ['Vite', 'Webpack', 'Rollup', 'esbuild', 'Turbopack', 'Parcel'],
    'UI 组件库': ['Tailwind CSS', 'Shadcn UI', 'Ant Design', 'Material UI', 'Chakra UI', 'Radix UI'],
    '状态管理': ['Zustand', 'Redux Toolkit', 'Jotai', 'Recoil', 'Pinia', 'MobX'],
    '测试工具': ['Vitest', 'Jest', 'Playwright', 'Cypress', 'Testing Library', 'Storybook'],
    '部署平台': ['Vercel', 'Netlify', 'Cloudflare Pages', 'GitHub Pages', 'Surge', 'Render'],
  };

  const titleList = titles[category] ?? ['Unknown'];
  const title = titleList[i % titleList.length];

  return {
    id: generateId(i, 'item'),
    title,
    description: `${title} 是 ${category} 生态中的优秀解决方案，广泛应用于现代 Web 与移动应用开发。`,
    category,
    rating: Number((3.5 + (i % 5) * 0.3).toFixed(1)),
    createdAt: Date.now() - i * 86400000,
  };
});

/**
 * 根据关键词过滤项目
 * @param items - 项目列表
 * @param keyword - 搜索关键词
 * @returns 过滤后的列表
 */
export function filterItems(items: Item[], keyword: string): Item[] {
  if (!keyword.trim()) return items;
  const lower = keyword.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.description.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower)
  );
}

/**
 * 根据 ID 查找单个项目
 * @param id - 项目 ID
 * @returns 对应项目或 undefined
 */
export function findItemById(id: string): Item | undefined {
  return MOCK_ITEMS.find((item) => item.id === id);
}
