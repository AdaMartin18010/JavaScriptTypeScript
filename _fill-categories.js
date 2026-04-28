const fs = require('fs');
const path = require('path');
const PROJECT_ROOT = process.cwd();

// 目录名到分类描述的映射
const CATEGORY_MAP = {
  'application-development': { title: '应用开发', dimension: '应用领域', desc: '全栈应用开发实践、业务逻辑组织、领域建模、CRUD 与复杂交互实现。' },
  'compiler-design': { title: '编译器设计与语言实现', dimension: '语言核心', desc: '编译器前端/后端、AST、类型检查、代码生成、语言转换工具链。' },
  'developer-experience': { title: '开发者体验', dimension: '工程实践', desc: '工具链优化、IDE 集成、调试体验、开发者工作流效率提升。' },
  'documentation': { title: '文档工程', dimension: '工程实践', desc: '技术文档写作规范、API 文档自动生成、文档站点构建与维护。' },
  'internationalization': { title: '国际化与本地化', dimension: '应用领域', desc: 'i18n/l10n 架构、多语言资源管理、RTL 适配、时区与货币处理。' },
  'metaprogramming': { title: '元编程', dimension: '语言核心', desc: '反射、装饰器、代码生成、宏系统、编译时元数据操作。' },
  'real-world-examples': { title: '真实案例', dimension: '应用领域', desc: '生产级项目拆解、架构决策复盘、性能优化实战、故障排查案例。' },
  'web-apis-lab': { title: 'Web API 实验室', dimension: '前端基础', desc: 'DOM API、Fetch、Web Storage、Canvas、WebGL、Service Worker 等浏览器 API 实践。' },
  'web-assembly': { title: 'WebAssembly', dimension: '性能与底层', desc: 'Wasm 模块编译、宿主交互、性能临界路径、多语言集成。' },
  'ecmascript-evolution': { title: 'ECMAScript 演进', dimension: '语言核心', desc: 'ES2015-ES2026 新特性追踪、提案解读、迁移策略与兼容性处理。' },
  'js-ts-comparison': { title: 'JS/TS 对比分析', dimension: '语言核心', desc: '类型擦除、编译时差异、运行时行为、渐进式迁移策略。' },
  'language-core': { title: '语言核心', dimension: '语言核心', desc: 'JavaScript 语法、执行模型、内存管理、事件循环、引擎原理。' },
  'ecmascript-features': { title: 'ECMAScript 特性', dimension: '语言核心', desc: '各版本 ECMAScript 新增特性的深度解析与代码示例。' },
};

function getCategoryInfo(dirName) {
  if (CATEGORY_MAP[dirName]) return CATEGORY_MAP[dirName];
  // 默认生成
  const title = dirName.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\./g, ' ');
  return { title: title.charAt(0).toUpperCase() + title.slice(1), dimension: '综合', desc: '本模块聚焦 ' + title + ' 核心概念与工程实践。' };
}

function generateCategoryContent(dirPath, categoryName) {
  const info = getCategoryInfo(categoryName);
  const relPath = path.relative(PROJECT_ROOT, dirPath).replace(/\\/g, '/');

  // 列出目录中的文件
  let fileList = '';
  try {
    const files = fs.readdirSync(dirPath).filter(f => f !== 'CATEGORY.md').sort();
    if (files.length > 0) {
      fileList = '\n## 目录内容\n\n' + files.slice(0, 15).map(f => {
        const s = fs.statSync(path.join(dirPath, f));
        return `- ${s.isDirectory() ? '📁' : '📄'} ${f}`;
      }).join('\n') + (files.length > 15 ? '\n- ... 等 ' + (files.length - 15) + ' 个条目' : '') + '\n';
    }
  } catch (e) {}

  return `---
dimension: ${info.dimension}
sub-dimension: ${info.title}
created: ${new Date().toISOString().split('T')[0]}
---

# 模块归属声明

本模块归属 **「${info.dimension}」** 维度，聚焦 ${info.title} 核心概念与工程实践。

## 包含内容

- ${info.desc}

## 相关索引

- \`30-knowledge-base/30.2-categories/README.md\` — 分类总览
- \`20-code-lab/\` — 代码实验室实践${fileList}

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。
`;
}

let filled = 0;

function fillCategories(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name.startsWith('.')) continue;
      fillCategories(p);
    } else if (e.name === 'CATEGORY.md') {
      const stat = fs.statSync(p);
      if (stat.size < 500) {
        const parentDir = path.dirname(p);
        const categoryName = path.basename(parentDir);
        const content = generateCategoryContent(parentDir, categoryName);
        fs.writeFileSync(p, content, 'utf-8');
        filled++;
        console.log('  ✅ ' + path.relative(PROJECT_ROOT, p));
      }
    }
  }
}

console.log('开始批量填充 CATEGORY.md...\n');
fillCategories(PROJECT_ROOT);
console.log('\n' + '='.repeat(40));
console.log('📊 完成: ' + filled + ' 个 CATEGORY.md 已填充');
console.log('='.repeat(40));
