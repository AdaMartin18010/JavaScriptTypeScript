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
    const reactivity = await import('./18-frontend-frameworks/reactivity-system.js');
    reactivity.demo?.();
  },

  'backend-development': async () => {
    console.log('\n🖥️ 后端开发\n');
    const express = await import('./19-backend-development/express-patterns.js');
    express.demo?.();
  },

  'database-orm': async () => {
    console.log('\n💾 数据库 ORM\n');
    const prisma = await import('./20-database-orm/prisma-patterns.js');
    await prisma.demo?.();
    
    const queryBuilder = await import('./20-database-orm/sql-query-builder.js');
    queryBuilder.demo?.();
  },

  'api-security': async () => {
    console.log('\n🔒 API 安全\n');
    const jwt = await import('./21-api-security/jwt-auth.js');
    jwt.demo?.();
    
    const rateLimiter = await import('./21-api-security/rate-limiter.js');
    rateLimiter.demo?.();
  },

  'deployment-devops': async () => {
    console.log('\n🐳 部署与 DevOps\n');
    const docker = await import('./22-deployment-devops/docker-config.js');
    docker.demo?.();
  },

  'toolchain-configuration': async () => {
    console.log('\n⚙️ 工具链配置\n');
    const vite = await import('./23-toolchain-configuration/vite-config.js');
    vite.demo?.();
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
