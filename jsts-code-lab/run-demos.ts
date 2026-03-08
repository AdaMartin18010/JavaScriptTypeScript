/**
 * @file 运行所有 Demo 脚本
 * @description 统一运行项目中的所有演示函数
 * 
 * 使用方法:
 *   tsx run-demos.ts              # 运行所有 demo
 *   tsx run-demos.ts <module>     # 运行指定模块的 demo
 * 
 * 示例:
 *   tsx run-demos.ts design-patterns
 *   tsx run-demos.ts architecture-patterns
 */

import * as readline from 'readline';

// 定义可运行的 demo 模块
const DEMO_MODULES = {
  'language-core': async () => {
    console.log('\n📝 语言核心模块\n');
    // 该模块的 demo 在各自文件中
    console.log('请查看 00-language-core/ 下的具体文件运行 demo()');
  },

  'ecmascript-evolution': async () => {
    console.log('\n🚀 ECMAScript 演进\n');
    const { demo: bigintDemo } = await import('./01-ecmascript-evolution/es2020/bigint.js');
    bigintDemo?.();
  },

  'design-patterns': async () => {
    console.log('\n🎨 设计模式\n');
    const singleton = await import('./02-design-patterns/creational/singleton.js');
    singleton.demo?.();
    
    const factory = await import('./02-design-patterns/creational/factory.js');
    factory.demo?.();
    
    const observer = await import('./02-design-patterns/behavioral/observer.js');
    observer.demo?.();
  },

  'concurrency': async () => {
    console.log('\n⚡ 并发编程\n');
    // 异步 demo 需要 await
    const asyncPatterns = await import('./03-concurrency/async-await/async-patterns.js');
    await asyncPatterns.demo?.();
  },

  'data-structures': async () => {
    console.log('\n📊 数据结构\n');
    const linkedList = await import('./04-data-structures/custom/linked-list.js');
    linkedList.demo?.();
    
    const stackQueue = await import('./04-data-structures/custom/stack-queue.js');
    stackQueue.demo?.();
  },

  'algorithms': async () => {
    console.log('\n🔍 算法\n');
    const sorting = await import('./05-algorithms/sorting/sort-algorithms.js');
    sorting.demo?.();
    
    const searching = await import('./05-algorithms/searching/search-algorithms.js');
    searching.demo?.();
  },

  'architecture-patterns': async () => {
    console.log('\n🏗️ 架构模式\n');
    const mvc = await import('./06-architecture-patterns/mvc/mvc-architecture.js');
    mvc.demo?.();
    
    const mvvm = await import('./06-architecture-patterns/mvvm/mvvm-architecture.js');
    mvvm.demo?.();
    
    const microservices = await import('./06-architecture-patterns/microservices/microservices-patterns.js');
    microservices.demo?.();
    
    const cqrs = await import('./06-architecture-patterns/cqrs/cqrs-pattern.js');
    cqrs.demo?.();
  },

  'testing': async () => {
    console.log('\n🧪 测试\n');
    const unitTest = await import('./07-testing/unit-test-patterns.js');
    unitTest.demo?.();
    
    const mockStub = await import('./07-testing/mock-stub.js');
    await mockStub.demo?.();
    
    const tddBdd = await import('./07-testing/tdd-bdd.js');
    await tddBdd.demo?.();
  },

  'performance': async () => {
    console.log('\n⚡ 性能优化\n');
    const optimization = await import('./08-performance/optimization-patterns.js');
    optimization.demo?.();
    
    const memory = await import('./08-performance/memory-management.js');
    memory.demo?.();
  },

  'real-world-examples': async () => {
    console.log('\n🌍 实战案例\n');
    const stateManager = await import('./09-real-world-examples/state-management/state-manager.js');
    stateManager.demo?.();
    
    const auth = await import('./09-real-world-examples/auth-system/auth-manager.js');
    auth.demo?.();
    
    const eventBus = await import('./09-real-world-examples/event-bus/event-bus.js');
    await eventBus.demo?.();
    
    const validation = await import('./09-real-world-examples/validation/validator.js');
    await validation.demo?.();
  },

  'js-ts-comparison': async () => {
    console.log('\n🔄 JS/TS 对比\n');
    const typeTheory = await import('./10-js-ts-comparison/type-theory/formal-type-system.js');
    typeTheory.demo?.();
    
    const singletonJS = await import('./10-js-ts-comparison/js-implementations/singleton-js.js');
    singletonJS.demo?.();
    
    const factoryJS = await import('./10-js-ts-comparison/js-implementations/factory-js.js');
    factoryJS.demo?.();
    
    const observerJS = await import('./10-js-ts-comparison/js-implementations/observer-js.js');
    observerJS.demo?.();
    
    const interop = await import('./10-js-ts-comparison/interoperability/js-ts-interop.js');
    interop.demo?.();
  },

  'frontend-frameworks': async () => {
    console.log('\n⚛️ 前端框架\n');
    const react = await import('./18-frontend-frameworks/react-patterns.tsx');
    react.demo?.();
    
    const router = await import('./18-frontend-frameworks/router-implementation.ts');
    router.demo?.();
    
    const state = await import('./18-frontend-frameworks/state-management.ts');
    await state.demo?.();
  },

  'backend-development': async () => {
    console.log('\n🖥️ 后端开发\n');
    const express = await import('./19-backend-development/express-patterns.ts');
    express.demo?.();
    
    const api = await import('./19-backend-development/api-design.ts');
    api.demo?.();
    
    const ws = await import('./19-backend-development/websocket-patterns.ts');
    ws.demo?.();
  },

  'database-orm': async () => {
    console.log('\n💾 数据库 ORM\n');
    const prisma = await import('./20-database-orm/prisma-patterns.ts');
    await prisma.demo?.();
    
    const queryBuilder = await import('./20-database-orm/sql-query-builder.ts');
    queryBuilder.demo?.();
    
    const migration = await import('./20-database-orm/migration-system.ts');
    await migration.demo?.();
    
    const pool = await import('./20-database-orm/connection-pool.ts');
    await pool.demo?.();
  },

  'api-security': async () => {
    console.log('\n🔒 API 安全\n');
    const jwt = await import('./21-api-security/jwt-auth.ts');
    jwt.demo?.();
    
    const rateLimiter = await import('./21-api-security/rate-limiter.ts');
    rateLimiter.demo?.();
    
    const corsCsrf = await import('./21-api-security/cors-csrf.ts');
    corsCsrf.demo?.();
  },

  'deployment-devops': async () => {
    console.log('\n🐳 部署与 DevOps\n');
    const docker = await import('./22-deployment-devops/docker-config.ts');
    docker.demo?.();
    
    const cicd = await import('./22-deployment-devops/cicd-pipeline.ts');
    cicd.demo?.();
  },

  'toolchain-configuration': async () => {
    console.log('\n⚙️ 工具链配置\n');
    const vite = await import('./23-toolchain-configuration/vite-config.ts');
    vite.demo?.();
    
    const linting = await import('./23-toolchain-configuration/eslint-prettier.ts');
    linting.demo?.();
  },

  'graphql': async () => {
    console.log('\n🔍 GraphQL\n');
    const graphql = await import('./24-graphql/schema-builder.ts');
    await graphql.demo?.();
  },

  'microservices': async () => {
    console.log('\n🔗 微服务\n');
    const microservices = await import('./25-microservices/service-mesh.ts');
    microservices.demo?.();
  },

  'event-sourcing': async () => {
    console.log('\n📜 事件溯源\n');
    const eventSourcing = await import('./26-event-sourcing/event-store.ts');
    await eventSourcing.demo?.();
  },

  'internationalization': async () => {
    console.log('\n🌍 国际化\n');
    const i18n = await import('./27-internationalization/i18n-system.ts');
    i18n.demo?.();
  },

  'advanced-testing': async () => {
    console.log('\n🧪 高级测试\n');
    const e2e = await import('./28-testing-advanced/e2e-testing.ts');
    await e2e.demo?.();
  },

  'documentation': async () => {
    console.log('\n📚 文档生成\n');
    const docs = await import('./29-documentation/api-docs-generator.ts');
    docs.demo?.();
  },

  'real-time-communication': async () => {
    console.log('\n📡 实时通信\n');
    const rtc = await import('./30-real-time-communication/sse-webrtc.ts');
    rtc.demo?.();
  },

  'serverless': async () => {
    console.log('\n⚡ 无服务器架构\n');
    const serverless = await import('./31-serverless/serverless-patterns.ts');
    await serverless.demo?.();
  },

  'edge-computing': async () => {
    console.log('\n🌐 边缘计算\n');
    const edge = await import('./32-edge-computing/edge-runtime.ts');
    await edge.demo?.();
  },

  'ai-integration': async () => {
    console.log('\n🤖 AI 集成\n');
    const ai = await import('./33-ai-integration/ai-sdk-patterns.ts');
    await ai.demo?.();
  },

  'blockchain-web3': async () => {
    console.log('\n⛓️ Web3/区块链\n');
    const web3 = await import('./34-blockchain-web3/web3-patterns.ts');
    await web3.demo?.();
  },

  'accessibility': async () => {
    console.log('\n♿ 无障碍访问\n');
    const a11y = await import('./35-accessibility-a11y/a11y-utils.ts');
    a11y.demo?.();
  },

  'web-assembly': async () => {
    console.log('\n⚙️ WebAssembly\n');
    const wasm = await import('./36-web-assembly/wasm-integration.ts');
    wasm.demo?.();
  },

  'pwa': async () => {
    console.log('\n📱 PWA\n');
    const pwa = await import('./37-pwa/pwa-patterns.ts');
    await pwa.demo?.();
  },

  'web-security': async () => {
    console.log('\n🔐 Web 安全\n');
    const security = await import('./38-web-security/xss-csp.ts');
    security.demo?.();
  },

  'performance-monitoring': async () => {
    console.log('\n📊 性能监控\n');
    const perf = await import('./39-performance-monitoring/core-web-vitals.ts');
    perf.demo?.();
  },

  'browser-runtime': async () => {
    console.log('\n🖥️ 浏览器运行时\n');
    const rendering = await import('./50-browser-runtime/rendering-pipeline.ts');
    rendering.demo?.();
    const eventLoop = await import('./50-browser-runtime/event-loop-architecture.ts');
    eventLoop.demo?.();
  },

  'ui-components': async () => {
    console.log('\n🧩 AI驱动UI组件\n');
    const ui = await import('./51-ui-components/ai-component-system.ts');
    await ui.demo?.();
  },

  'intelligent-performance': async () => {
    console.log('\n⚡ 智能性能优化\n');
    const perf = await import('./54-intelligent-performance/ai-performance-optimizer.ts');
    perf.demo?.();
  },

  'ai-testing': async () => {
    console.log('\n🤖 AI测试\n');
    const ai = await import('./55-ai-testing/ai-test-generator.js');
    ai.demo?.();
  },

  'code-generation': async () => {
    console.log('\n✨ 代码生成\n');
    const gen = await import('./56-code-generation/ai-code-generator.js');
    gen.demo?.();
  },

  'design-system': async () => {
    console.log('\n🎨 设计系统\n');
    const ds = await import('./57-design-system/design-tokens.js');
    ds.demo?.();
  },

  'data-visualization': async () => {
    console.log('\n📈 数据可视化\n');
    const viz = await import('./58-data-visualization/chart-architecture.js');
    viz.demo?.();
  },

  'fullstack-patterns': async () => {
    console.log('\n🌐 全栈模式\n');
    const patterns = await import('./59-fullstack-patterns/end-to-end-types.js');
    patterns.demo?.();
  },

  'developer-experience': async () => {
    console.log('\n🔧 开发者体验\n');
    const dx = await import('./60-developer-experience/dev-server.js');
    dx.demo?.();
  },

  'api-gateway': async () => {
    console.log('\n🚪 API网关\n');
    const gw = await import('./61-api-gateway/gateway-implementation.js');
    gw.demo?.();
  },

  'message-queue': async () => {
    console.log('\n📮 消息队列\n');
    const mq = await import('./62-message-queue/queue-implementation.js');
    mq.demo?.();
  },

  'caching-strategies': async () => {
    console.log('\n💾 缓存策略\n');
    const cache = await import('./63-caching-strategies/cache-patterns.js');
    cache.demo?.();
  },

  'search-engine': async () => {
    console.log('\n🔍 搜索引擎\n');
    const search = await import('./64-search-engine/search-implementation.js');
    search.demo?.();
  },

  'analytics': async () => {
    console.log('\n📊 数据分析\n');
    const analytics = await import('./65-analytics/analytics-engine.js');
    analytics.demo?.();
  },

  'feature-flags': async () => {
    console.log('\n🎛️ 功能开关\n');
    const ff = await import('./66-feature-flags/feature-flag-system.js');
    ff.demo?.();
  },

  'multi-tenancy': async () => {
    console.log('\n🏢 多租户\n');
    const mt = await import('./67-multi-tenancy/tenant-architecture.js');
    mt.demo?.();
  },

  'plugin-system': async () => {
    console.log('\n🔌 插件系统\n');
    const plugin = await import('./68-plugin-system/plugin-architecture.js');
    plugin.demo?.();
  },

  'cli-framework': async () => {
    console.log('\n⌨️ CLI框架\n');
    const cli = await import('./69-cli-framework/cli-builder.js');
    cli.demo?.();
  }
};

type ModuleName = keyof typeof DEMO_MODULES;

// 运行单个模块
async function runModule(moduleName: ModuleName): Promise<void> {
  const runner = DEMO_MODULES[moduleName];
  if (runner) {
    try {
      await runner();
    } catch (error) {
      console.error(`运行 ${moduleName} 时出错:`, error);
    }
  } else {
    console.log(`未知的模块: ${moduleName}`);
    console.log(`可用的模块: ${Object.keys(DEMO_MODULES).join(', ')}`);
  }
}

// 运行所有模块
async function runAll(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           JavaScript TypeScript 代码实验室               ║');
  console.log('║                  运行所有 Demo 脚本                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  for (const [name, runner] of Object.entries(DEMO_MODULES)) {
    console.log('\n' + '='.repeat(60));
    await runner();
    
    // 等待用户按键继续
    await waitForKey(`\n按 Enter 继续下一个模块 (${name})...`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('所有 Demo 运行完成!');
}

// 等待用户按键
function waitForKey(prompt: string): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

// 显示帮助信息
function showHelp(): void {
  console.log(`
使用方法:
  tsx run-demos.ts [模块名]

可用的模块:
${Object.keys(DEMO_MODULES).map(m => `  - ${m}`).join('\n')}

示例:
  tsx run-demos.ts                    # 运行所有 demo
  tsx run-demos.ts design-patterns    # 仅运行设计模式 demo
  tsx run-demos.ts architecture-patterns  # 仅运行架构模式 demo
`);
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.length === 0) {
    // 运行所有模块
    await runAll();
  } else {
    // 运行指定模块
    const moduleName = args[0] as ModuleName;
    if (moduleName in DEMO_MODULES) {
      await runModule(moduleName);
    } else {
      console.log(`未知模块: ${moduleName}`);
      showHelp();
    }
  }
}

// 运行主函数
main().catch(console.error);
