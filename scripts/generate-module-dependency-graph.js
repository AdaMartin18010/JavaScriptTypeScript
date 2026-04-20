const fs = require('fs');

// Read module inventory
const data = fs.readFileSync('jsts-code-lab/MODULE_INVENTORY.json', 'utf8');
const clean = data.replace(/^\uFEFF/, '');
const modules = JSON.parse(clean);

// Build module map
const modMap = new Map();
modules.forEach(m => {
  const shortName = m.name.replace(/^\d+-/, '');
  modMap.set(m.name, {
    number: m.number,
    shortName: shortName,
    category: m.category,
    impl: m.implementation_count,
    tests: m.test_count,
    hasReadme: m.has_readme,
    display: `${m.number}-${shortName}`
  });
});

// Domain clusters
const clusters = [
  {
    id: 'foundation',
    label: '语言基础层',
    modules: ['00-language-core', '01-ecmascript-evolution', '10-js-ts-comparison', '40-type-theory-formal', '41-formal-semantics']
  },
  {
    id: 'core_cs',
    label: '核心计算机科学',
    modules: ['02-design-patterns', '04-data-structures', '05-algorithms', '03-concurrency', '14-execution-flow', '15-data-flow']
  },
  {
    id: 'architecture',
    label: '架构与工程',
    modules: ['06-architecture-patterns', '53-app-architecture', '59-fullstack-patterns', '88-lowcode-platform']
  },
  {
    id: 'frontend',
    label: '前端与用户体验',
    modules: ['18-frontend-frameworks', '50-browser-runtime', '51-ui-components', '52-web-rendering', '35-accessibility-a11y', '36-web-assembly', '37-pwa', '57-design-system', '58-data-visualization', '84-webxr']
  },
  {
    id: 'backend',
    label: '后端与数据',
    modules: ['19-backend-development', '20-database-orm', '21-api-security', '24-graphql', '38-web-security', '61-api-gateway', '62-message-queue', '63-caching-strategies', '64-search-engine', '67-multi-tenancy', '66-feature-flags', '68-plugin-system']
  },
  {
    id: 'distributed',
    label: '分布式系统',
    modules: ['25-microservices', '26-event-sourcing', '30-real-time-communication', '70-distributed-systems', '71-consensus-algorithms', '72-container-orchestration', '73-service-mesh-advanced']
  },
  {
    id: 'devops',
    label: 'DevOps与基础设施',
    modules: ['22-deployment-devops', '23-toolchain-configuration', '12-package-management', '13-code-organization', '11-benchmarks', '31-serverless', '32-edge-computing', '69-cli-framework']
  },
  {
    id: 'ai',
    label: 'AI与前沿技术',
    modules: ['33-ai-integration', '54-intelligent-performance', '55-ai-testing', '56-code-generation', '76-ml-engineering', '77-quantum-computing', '82-edge-ai', '85-nlp-engineering', '89-autonomous-systems', '94-ai-agent-lab']
  },
  {
    id: 'security',
    label: '安全与合规',
    modules: ['34-blockchain-web3', '83-blockchain-advanced', '81-cybersecurity', '80-formal-verification', '78-metaprogramming', '79-compiler-design']
  },
  {
    id: 'testing',
    label: '测试与质量保障',
    modules: ['07-testing', '08-performance', '28-testing-advanced', '39-performance-monitoring', '17-debugging-monitoring', '74-observability', '75-chaos-engineering']
  },
  {
    id: 'dx',
    label: '开发者体验',
    modules: ['09-real-world-examples', '16-application-development', '27-internationalization', '29-documentation', '60-developer-experience']
  },
  {
    id: 'modern_labs',
    label: '现代实验室',
    modules: ['86-graph-database', '86-tanstack-start-cloudflare', '87-realtime-analytics', '90-web-apis-lab', '91-nodejs-core-lab', '92-observability-lab', '93-deployment-edge-lab', '95-auth-modern-lab', '96-orm-modern-lab', '65-analytics']
  }
];

// Node ID generator
function nodeId(name) {
  return 'M' + name.replace(/-/g, '_');
}

// Mermaid safe label
function safeLabel(text) {
  return text.replace(/-/g, '&#8209;');
}

// Generate node definition line
function nodeDef(name, info) {
  const id = nodeId(name);
  const label = safeLabel(info.display);
  const maturityIcon = info.category === 'mature' ? '●' : (info.category === 'usable' ? '○' : '◌');
  if (info.category === 'mature') {
    return `    ${id}["${maturityIcon} ${label}"]`;
  } else if (info.category === 'usable') {
    return `    ${id}(("${maturityIcon} ${label}"))`;
  } else {
    return `    ${id}{"${maturityIcon} ${label}"}`;
  }
}

// Define dependency edges
const dependencies = [
  // Foundation → everything
  ['00-language-core', '01-ecmascript-evolution'],
  ['00-language-core', '02-design-patterns'],
  ['00-language-core', '03-concurrency'],
  ['00-language-core', '04-data-structures'],
  ['00-language-core', '05-algorithms'],
  ['00-language-core', '06-architecture-patterns'],
  ['00-language-core', '07-testing'],
  ['00-language-core', '08-performance'],
  ['00-language-core', '09-real-world-examples'],
  ['00-language-core', '10-js-ts-comparison'],
  ['00-language-core', '14-execution-flow'],
  ['00-language-core', '15-data-flow'],
  ['00-language-core', '18-frontend-frameworks'],
  ['00-language-core', '19-backend-development'],
  ['00-language-core', '40-type-theory-formal'],
  ['00-language-core', '41-formal-semantics'],
  ['00-language-core', '50-browser-runtime'],
  ['00-language-core', '78-metaprogramming'],

  // Core CS dependencies
  ['01-ecmascript-evolution', '03-concurrency'],
  ['01-ecmascript-evolution', '14-execution-flow'],
  ['01-ecmascript-evolution', '18-frontend-frameworks'],
  ['01-ecmascript-evolution', '36-web-assembly'],
  ['02-design-patterns', '06-architecture-patterns'],
  ['02-design-patterns', '53-app-architecture'],
  ['02-design-patterns', '68-plugin-system'],
  ['04-data-structures', '05-algorithms'],
  ['04-data-structures', '86-graph-database'],
  ['04-data-structures', '64-search-engine'],
  ['05-algorithms', '64-search-engine'],
  ['05-algorithms', '76-ml-engineering'],
  ['05-algorithms', '85-nlp-engineering'],
  ['05-algorithms', '77-quantum-computing'],
  ['03-concurrency', '30-real-time-communication'],
  ['03-concurrency', '70-distributed-systems'],
  ['03-concurrency', '62-message-queue'],
  ['03-concurrency', '32-edge-computing'],
  ['14-execution-flow', '50-browser-runtime'],
  ['15-data-flow', '16-application-development'],

  // Architecture
  ['06-architecture-patterns', '19-backend-development'],
  ['06-architecture-patterns', '53-app-architecture'],
  ['06-architecture-patterns', '59-fullstack-patterns'],
  ['06-architecture-patterns', '25-microservices'],
  ['53-app-architecture', '59-fullstack-patterns'],
  ['53-app-architecture', '18-frontend-frameworks'],
  ['53-app-architecture', '88-lowcode-platform'],

  // Frontend
  ['50-browser-runtime', '18-frontend-frameworks'],
  ['50-browser-runtime', '52-web-rendering'],
  ['50-browser-runtime', '37-pwa'],
  ['18-frontend-frameworks', '51-ui-components'],
  ['18-frontend-frameworks', '52-web-rendering'],
  ['18-frontend-frameworks', '53-app-architecture'],
  ['51-ui-components', '52-web-rendering'],
  ['51-ui-components', '57-design-system'],
  ['51-ui-components', '58-data-visualization'],
  ['52-web-rendering', '53-app-architecture'],
  ['52-web-rendering', '54-intelligent-performance'],
  ['35-accessibility-a11y', '57-design-system'],
  ['35-accessibility-a11y', '37-pwa'],
  ['36-web-assembly', '77-quantum-computing'],
  ['36-web-assembly', '84-webxr'],
  ['37-pwa', '90-web-apis-lab'],
  ['57-design-system', '58-data-visualization'],

  // Backend
  ['19-backend-development', '20-database-orm'],
  ['19-backend-development', '21-api-security'],
  ['19-backend-development', '24-graphql'],
  ['19-backend-development', '61-api-gateway'],
  ['19-backend-development', '38-web-security'],
  ['20-database-orm', '67-multi-tenancy'],
  ['20-database-orm', '96-orm-modern-lab'],
  ['20-database-orm', '86-tanstack-start-cloudflare'],
  ['21-api-security', '38-web-security'],
  ['21-api-security', '81-cybersecurity'],
  ['21-api-security', '95-auth-modern-lab'],
  ['21-api-security', '61-api-gateway'],
  ['38-web-security', '81-cybersecurity'],
  ['61-api-gateway', '63-caching-strategies'],
  ['61-api-gateway', '66-feature-flags'],
  ['61-api-gateway', '62-message-queue'],
  ['62-message-queue', '70-distributed-systems'],
  ['62-message-queue', '26-event-sourcing'],
  ['63-caching-strategies', '64-search-engine'],
  ['64-search-engine', '65-analytics'],
  ['64-search-engine', '87-realtime-analytics'],
  ['67-multi-tenancy', '66-feature-flags'],
  ['68-plugin-system', '69-cli-framework'],

  // Distributed
  ['25-microservices', '70-distributed-systems'],
  ['25-microservices', '73-service-mesh-advanced'],
  ['25-microservices', '72-container-orchestration'],
  ['26-event-sourcing', '62-message-queue'],
  ['30-real-time-communication', '87-realtime-analytics'],
  ['70-distributed-systems', '71-consensus-algorithms'],
  ['70-distributed-systems', '74-observability'],
  ['70-distributed-systems', '75-chaos-engineering'],
  ['70-distributed-systems', '61-api-gateway'],
  ['71-consensus-algorithms', '72-container-orchestration'],

  // DevOps
  ['23-toolchain-configuration', '60-developer-experience'],
  ['23-toolchain-configuration', '11-benchmarks'],
  ['12-package-management', '13-code-organization'],
  ['22-deployment-devops', '31-serverless'],
  ['22-deployment-devops', '72-container-orchestration'],
  ['22-deployment-devops', '93-deployment-edge-lab'],
  ['31-serverless', '32-edge-computing'],
  ['31-serverless', '93-deployment-edge-lab'],
  ['69-cli-framework', '60-developer-experience'],
  ['11-benchmarks', '08-performance'],
  ['11-benchmarks', '54-intelligent-performance'],

  // AI
  ['33-ai-integration', '55-ai-testing'],
  ['33-ai-integration', '56-code-generation'],
  ['33-ai-integration', '76-ml-engineering'],
  ['33-ai-integration', '82-edge-ai'],
  ['33-ai-integration', '89-autonomous-systems'],
  ['33-ai-integration', '94-ai-agent-lab'],
  ['33-ai-integration', '85-nlp-engineering'],
  ['76-ml-engineering', '77-quantum-computing'],
  ['76-ml-engineering', '82-edge-ai'],
  ['76-ml-engineering', '85-nlp-engineering'],
  ['76-ml-engineering', '54-intelligent-performance'],
  ['85-nlp-engineering', '89-autonomous-systems'],
  ['89-autonomous-systems', '94-ai-agent-lab'],
  ['56-code-generation', '60-developer-experience'],
  ['56-code-generation', '78-metaprogramming'],
  ['54-intelligent-performance', '08-performance'],
  ['55-ai-testing', '07-testing'],

  // Security
  ['34-blockchain-web3', '83-blockchain-advanced'],
  ['40-type-theory-formal', '41-formal-semantics'],
  ['40-type-theory-formal', '79-compiler-design'],
  ['40-type-theory-formal', '80-formal-verification'],
  ['41-formal-semantics', '80-formal-verification'],
  ['78-metaprogramming', '56-code-generation'],
  ['78-metaprogramming', '79-compiler-design'],
  ['79-compiler-design', '80-formal-verification'],
  ['81-cybersecurity', '21-api-security'],
  ['80-formal-verification', '07-testing'],

  // Testing
  ['07-testing', '28-testing-advanced'],
  ['07-testing', '55-ai-testing'],
  ['08-performance', '54-intelligent-performance'],
  ['08-performance', '39-performance-monitoring'],
  ['28-testing-advanced', '55-ai-testing'],
  ['39-performance-monitoring', '74-observability'],
  ['39-performance-monitoring', '92-observability-lab'],
  ['17-debugging-monitoring', '74-observability'],
  ['74-observability', '75-chaos-engineering'],
  ['74-observability', '92-observability-lab'],

  // DX
  ['09-real-world-examples', '16-application-development'],
  ['09-real-world-examples', '59-fullstack-patterns'],
  ['16-application-development', '59-fullstack-patterns'],
  ['60-developer-experience', '29-documentation'],
  ['27-internationalization', '16-application-development'],

  // Modern Labs
  ['86-graph-database', '64-search-engine'],
  ['86-tanstack-start-cloudflare', '59-fullstack-patterns'],
  ['65-analytics', '87-realtime-analytics'],
  ['90-web-apis-lab', '91-nodejs-core-lab'],
  ['91-nodejs-core-lab', '93-deployment-edge-lab'],
  ['92-observability-lab', '93-deployment-edge-lab'],
  ['94-ai-agent-lab', '95-auth-modern-lab'],
  ['95-auth-modern-lab', '96-orm-modern-lab'],
  ['93-deployment-edge-lab', '32-edge-computing'],
];

// Generate the overview graph
let overviewGraph = `flowchart TB\n`;
overviewGraph += `    direction TB\n`;

// Create cluster nodes for overview
clusters.forEach(c => {
  overviewGraph += `    ${c.id}["${c.label}"]\n`;
});

// Style cluster nodes
clusters.forEach(c => {
  overviewGraph += `    style ${c.id} fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n`;
});

// Inter-cluster edges (simplified)
const clusterEdges = [
  ['foundation', 'core_cs'],
  ['foundation', 'security'],
  ['core_cs', 'architecture'],
  ['core_cs', 'backend'],
  ['core_cs', 'ai'],
  ['architecture', 'frontend'],
  ['architecture', 'backend'],
  ['architecture', 'distributed'],
  ['frontend', 'backend'],
  ['backend', 'distributed'],
  ['backend', 'devops'],
  ['distributed', 'devops'],
  ['distributed', 'security'],
  ['security', 'backend'],
  ['ai', 'frontend'],
  ['ai', 'backend'],
  ['testing', 'frontend'],
  ['testing', 'backend'],
  ['testing', 'distributed'],
  ['dx', 'frontend'],
  ['dx', 'backend'],
  ['devops', 'modern_labs'],
  ['ai', 'modern_labs'],
  ['backend', 'modern_labs'],
];

clusterEdges.forEach(([from, to]) => {
  overviewGraph += `    ${from} --> ${to}\n`;
});

// Generate detailed graph
let detailedGraph = `flowchart TB\n`;
detailedGraph += `    direction TB\n`;

// Node definitions by cluster
clusters.forEach(c => {
  detailedGraph += `    subgraph ${c.id}["${c.label}"]\n`;
  detailedGraph += `        direction TB\n`;
  c.modules.forEach(name => {
    if (modMap.has(name)) {
      detailedGraph += nodeDef(name, modMap.get(name)) + '\n';
    }
  });
  detailedGraph += `    end\n`;
});

// Style definitions
let styleDefs = '';
modules.forEach(m => {
  const id = nodeId(m.name);
  if (m.category === 'mature') {
    styleDefs += `    style ${id} fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px\n`;
  } else if (m.category === 'usable') {
    styleDefs += `    style ${id} fill:#fff9c4,stroke:#f57f17,stroke-width:2px\n`;
  } else {
    styleDefs += `    style ${id} fill:#ffcdd2,stroke:#c62828,stroke-width:2px\n`;
  }
});
detailedGraph += styleDefs;

// Add dependency edges
dependencies.forEach(([from, to]) => {
  if (modMap.has(from) && modMap.has(to)) {
    detailedGraph += `    ${nodeId(from)} --> ${nodeId(to)}\n`;
  }
});

// Generate maturity subgraph view
let maturityGraph = `flowchart TB\n`;
maturityGraph += `    direction TB\n`;

const matureModules = modules.filter(m => m.category === 'mature').map(m => m.name);
const usableModules = modules.filter(m => m.category === 'usable').map(m => m.name);
const placeholderModules = modules.filter(m => m.category === 'placeholder').map(m => m.name);

maturityGraph += `    subgraph mature["成熟模块 (Mature) — ${matureModules.length}个"]\n`;
maturityGraph += `        direction TB\n`;
matureModules.forEach(name => {
  maturityGraph += `        ${nodeId(name)}["${safeLabel(modMap.get(name).display)}"]\n`;
});
maturityGraph += `    end\n`;

maturityGraph += `    subgraph usable["可用模块 (Usable) — ${usableModules.length}个"]\n`;
maturityGraph += `        direction TB\n`;
usableModules.forEach(name => {
  maturityGraph += `        ${nodeId(name)}["${safeLabel(modMap.get(name).display)}"]\n`;
});
maturityGraph += `    end\n`;

if (placeholderModules.length > 0) {
  maturityGraph += `    subgraph placeholder["占位模块 (Placeholder) — ${placeholderModules.length}个"]\n`;
  maturityGraph += `        direction TB\n`;
  placeholderModules.forEach(name => {
    maturityGraph += `        ${nodeId(name)}["${safeLabel(modMap.get(name).display)}"]\n`;
  });
  maturityGraph += `    end\n`;
}

maturityGraph += `    style mature fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px\n`;
maturityGraph += `    style usable fill:#fff9c4,stroke:#f57f17,stroke-width:2px\n`;
if (placeholderModules.length > 0) {
  maturityGraph += `    style placeholder fill:#ffcdd2,stroke:#c62828,stroke-width:2px\n`;
}

// Build the full markdown content
const md = `---
title: JSTS Code Lab 模块依赖关系图谱
description: 基于 Mermaid 的交互式知识图谱，展示 jsts-code-lab 90+ 模块之间的依赖关系与成熟度分层
---

# JSTS Code Lab 模块依赖关系图谱

> 本图谱基于 \`MODULE_INVENTORY.json\` 自动生成，展示所有模块的依赖关系、领域分组与成熟度状态。

## 概览

JSTS Code Lab 目前包含 **${modules.length} 个学习模块**，覆盖从语言基础到前沿技术的完整知识体系。模块按成熟度分为：

- **成熟 (Mature)**：内容完善、测试覆盖充分 — ${matureModules.length} 个
- **可用 (Usable)**：核心功能已实现，持续优化中 — ${usableModules.length} 个
- **占位 (Placeholder)**：已规划待实现 — ${placeholderModules.length} 个

## 图例

| 符号 | 形状 | 含义 |
|------|------|------|
| ● | 矩形 | 成熟模块 (Mature) |
| ○ | 圆形 | 可用模块 (Usable) |
| ◌ | 菱形 | 占位模块 (Placeholder) |

## 领域集群总览

以下高阶视图展示 12 个领域集群之间的依赖关系：

\`\`\`mermaid
${overviewGraph}\`\`\`

---

## 完整模块依赖图

下图展示所有 ${modules.length} 个模块的详细依赖关系，按领域分组：

\`\`\`mermaid
${detailedGraph}\`\`\`

---

## 按成熟度分层的模块视图

\`\`\`mermaid
${maturityGraph}\`\`\`

---

## 模块清单

| 编号 | 模块名称 | 成熟度 | 实现文件 | 测试文件 | README |
|------|---------|--------|---------|---------|--------|
${modules.map(m => {
  const info = modMap.get(m.name);
  const maturityBadge = m.category === 'mature' ? '成熟' : (m.category === 'usable' ? '可用' : '占位');
  const readmeBadge = m.has_readme ? '✅' : '—';
  return `| ${m.number} | ${m.name} | ${maturityBadge} | ${m.implementation_count} | ${m.test_count} | ${readmeBadge} |`;
}).join('\n')}

---

## 关键依赖路径说明

1. **语言基础层** (00-language-core) 是所有其他模块的根基，向几乎所有领域输出依赖。
2. **核心 CS** 模块 (设计模式、数据结构、算法、并发) 向上支撑架构、前端、后端和分布式系统。
3. **设计模式 → 架构模式 → 全栈模式** 构成架构能力的主干路径。
4. **并发 → 分布式系统 → 共识算法** 构成分布式能力演进路径。
5. **AI 集成 → ML 工程 → 边缘 AI / NLP** 构成 AI 技术栈。
6. **现代实验室** 模块 (90-96) 作为最新技术实践的集成验证场。

---

*本图谱由脚本自动生成，最后更新于 ${new Date().toISOString().split('T')[0]}*
`;

fs.mkdirSync('website/diagrams', { recursive: true });
fs.writeFileSync('website/diagrams/module-dependency-graph.md', md, 'utf8');
console.log('Generated website/diagrams/module-dependency-graph.md');
console.log(`Total modules: ${modules.length}`);
console.log(`Mature: ${matureModules.length}, Usable: ${usableModules.length}, Placeholder: ${placeholderModules.length}`);
