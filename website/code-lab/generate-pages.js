import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(__dirname, '../../jsts-code-lab/MODULE_INVENTORY.json'), 'utf-8');
const inventory = JSON.parse(raw.replace(/^\uFEFF/, ''));

const groups = [
  { id: 'language-core', title: '语言核心 (00-09)', filter: m => parseInt(m.number) >= 0 && parseInt(m.number) <= 9 },
  { id: 'engineering-ecosystem', title: '工程与生态 (10-39)', filter: m => parseInt(m.number) >= 10 && parseInt(m.number) <= 39 },
  { id: 'runtime-architecture', title: '运行时与架构 (50-54)', filter: m => parseInt(m.number) >= 50 && parseInt(m.number) <= 54 },
  { id: 'ai-frontier', title: 'AI 与前沿 (33, 55-56, 82, 94)', filter: m => ['33','55','56','82','94'].includes(m.number) },
  { id: 'distributed-enterprise', title: '分布式与企业 (59, 61-75)', filter: m => (parseInt(m.number) >= 61 && parseInt(m.number) <= 75) || m.number === '59' },
  { id: 'theoretical-depth', title: '理论深度 (40-41, 77-81)', filter: m => (parseInt(m.number) >= 40 && parseInt(m.number) <= 41) || (parseInt(m.number) >= 77 && parseInt(m.number) <= 81) },
  { id: 'specialized-labs', title: '实验室专题 (90-96)', filter: m => parseInt(m.number) >= 90 && parseInt(m.number) <= 96 },
];

function getMaturityEmoji(cat) {
  if (cat === 'mature') return '🌳';
  if (cat === 'usable') return '🌿';
  return '🌱';
}

function getMaturityLabel(cat) {
  if (cat === 'mature') return '成熟';
  if (cat === 'usable') return '可用';
  return '初稿';
}

function formatModule(m) {
  const num = m.number;
  const name = m.name.replace(/^\d+-/, '');
  const impl = m.implementation_count;
  const tests = m.test_count;
  const badge = getMaturityEmoji(m.category);
  const label = getMaturityLabel(m.category);
  return `| ${badge} **${num}** | ${name} | ${label} | ${impl} | ${tests} | [查看](../../jsts-code-lab/${m.name}/) |`;
}

// Generate main index page
let mainContent = `# 🧪 代码实验室

> [jsts-code-lab](https://github.com/AdaMartin18010/JavaScriptTypeScript/tree/main/jsts-code-lab) 是本项目配套的代码实验室，包含 **96+ 技术模块**，从语言核心到前沿工程的完整实现。

## 模块成熟度图例

| 图例 | 状态 | 说明 |
|------|------|------|
| 🌳 | 成熟 | 核心模块，文件数多、有测试、内容扎实 |
| 🌿 | 可用 | 生态/工程模块，有基础实现 |
| 🌱 | 初稿 | 前沿/企业模块，基础骨架，持续完善中 |

## 模块总览

| 编号 | 模块名称 | 状态 | 实现文件 | 测试文件 | 源码 |
|------|----------|------|----------|----------|------|
`;

for (const m of inventory) {
  mainContent += formatModule(m) + '\n';
}

mainContent += `
---

## 按主题浏览

`;

for (const g of groups) {
  const modules = inventory.filter(g.filter);
  const totalImpl = modules.reduce((s, m) => s + m.implementation_count, 0);
  const totalTests = modules.reduce((s, m) => s + m.test_count, 0);
  mainContent += `- [${g.title}](./${g.id}) — ${modules.length} 个模块，${totalImpl} 实现文件，${totalTests} 测试文件\n`;
}

mainContent += `
---

## 统计数据

- **模块总数**: ${inventory.length}
- **实现文件总数**: ${inventory.reduce((s, m) => s + m.implementation_count, 0)}
- **测试文件总数**: ${inventory.reduce((s, m) => s + m.test_count, 0)}
- **成熟模块**: ${inventory.filter(m => m.category === 'mature').length}
- **可用模块**: ${inventory.filter(m => m.category === 'usable').length}
- **初稿模块**: ${inventory.filter(m => m.category === 'placeholder').length}

> 💡 提示：点击"源码"列可直接跳转到 GitHub 上的对应模块目录。
`;

writeFileSync(join(__dirname, 'index.md'), mainContent);

// Generate group pages
for (const g of groups) {
  const modules = inventory.filter(g.filter);
  let groupContent = `# ${g.title}

> 本分组包含 ${modules.length} 个模块，按成熟度排序。

## 模块列表

| 编号 | 模块名称 | 状态 | 实现文件 | 测试文件 | 源码 |
|------|----------|------|----------|----------|------|
`;
  // Sort: mature first, then usable, then placeholder
  const sorted = [...modules].sort((a, b) => {
    const order = { mature: 0, usable: 1, placeholder: 2 };
    return order[a.category] - order[b.category];
  });
  for (const m of sorted) {
    groupContent += formatModule(m) + '\n';
  }
  groupContent += `
---

[← 返回代码实验室首页](./)
`;
  writeFileSync(join(__dirname, `${g.id}.md`), groupContent);
}

console.log('Code lab pages generated successfully!');
