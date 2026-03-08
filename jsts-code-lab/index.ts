/**
 * @file JavaScript TypeScript 代码实验室 - 主入口
 * @description 全面技术分析与可运行代码实现
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * // 使用设计模式
 * import { Singleton, Factory, Observer } from 'jsts-code-lab/02-design-patterns';
 * 
 * // 使用并发工具
 * import { AsyncQueue, WorkerPool } from 'jsts-code-lab/03-concurrency';
 * 
 * // 使用数据结构
 * import { LinkedList, Stack, Queue } from 'jsts-code-lab/04-data-structures';
 * 
 * // 使用架构模式
 * import { createStore, EventStore } from 'jsts-code-lab/06-architecture-patterns';
 * 
 * // 使用测试工具
 * import { MockObject, createSpy } from 'jsts-code-lab/07-testing';
 * 
 * // 使用性能优化
 * import { memoize, debounce } from 'jsts-code-lab/08-performance';
 * ```
 */

// 语言核心
export * as LanguageCore from './00-language-core/index';

// ECMAScript 演进
export * as ECMAScriptEvolution from './01-ecmascript-evolution/index';

// 设计模式
export * as DesignPatterns from './02-design-patterns/index';

// 并发编程
export * as Concurrency from './03-concurrency/index';

// 数据结构
export * as DataStructures from './04-data-structures/index';

// 算法
export * as Algorithms from './05-algorithms/index';

// 架构模式
export * as ArchitecturePatterns from './06-architecture-patterns/index';

// 测试
export * as Testing from './07-testing/index';

// 性能优化
export * as Performance from './08-performance/index';

// 实战案例
export * as RealWorldExamples from './09-real-world-examples/index';

// JS/TS 对比分析
export * as JSTSComparison from './10-js-ts-comparison/index';

// 性能基准测试
export * as Benchmarks from './11-benchmarks/index';

// 包管理
export * as PackageManagement from './12-package-management/index';

// 代码组织
export * as CodeOrganization from './13-code-organization/index';

// 执行流
export * as ExecutionFlow from './14-execution-flow/index';

// 数据流
export * as DataFlow from './15-data-flow/index';

// 应用开发
export * as AppDevelopment from './16-application-development/index';

// 调试与监控
export * as DebuggingMonitoring from './17-debugging-monitoring/index';

// 前端框架
export * as FrontendFrameworks from './18-frontend-frameworks/index';

// 后端开发
export * as BackendDevelopment from './19-backend-development/index';

// 数据库 ORM
export * as DatabaseORM from './20-database-orm/index';

// API 安全
export * as APISecurity from './21-api-security/index';

// 部署与 DevOps
export * as DeploymentDevOps from './22-deployment-devops/index';

// 工具链配置
export * as ToolchainConfiguration from './23-toolchain-configuration/index';

// 共享模块
export * as Shared from './shared/index';

// 版本信息
export const VERSION = '1.0.0';

// 模块统计
export const MODULES = {
  languageCore: { name: '语言核心', files: 16 },
  ecmascriptEvolution: { name: 'ECMAScript演进', files: 11 },
  designPatterns: { name: '设计模式', files: 23 },
  concurrency: { name: '并发编程', files: 6 },
  dataStructures: { name: '数据结构', files: 6 },
  algorithms: { name: '算法', files: 6 },
  architecturePatterns: { name: '架构模式', files: 6 },
  testing: { name: '测试', files: 5 },
  performance: { name: '性能优化', files: 5 },
  realWorldExamples: { name: '实战案例', files: 8 },
  jsTsComparison: { name: 'JS/TS对比', files: 6 },
  benchmarks: { name: '性能测试', files: 2 },
  packageManagement: { name: '包管理', files: 2 },
  codeOrganization: { name: '代码组织', files: 1 },
  executionFlow: { name: '执行流', files: 1 },
  dataFlow: { name: '数据流', files: 1 },
  appDevelopment: { name: '应用开发', files: 1 },
  debuggingMonitoring: { name: '调试监控', files: 1 },
  frontendFrameworks: { name: '前端框架', files: 1 },
  backendDevelopment: { name: '后端开发', files: 1 },
  databaseORM: { name: '数据库ORM', files: 2 },
  apiSecurity: { name: 'API安全', files: 2 },
  deploymentDevOps: { name: '部署DevOps', files: 1 },
  toolchainConfiguration: { name: '工具链配置', files: 1 },
};

// 总览信息
export const OVERVIEW = {
  version: VERSION,
  totalModules: Object.keys(MODULES).length,
  totalSourceFiles: Object.values(MODULES).reduce((sum, m) => sum + m.files, 0),
  designPatterns: 23, // GoF 23种
  esVersions: ['ES2020', 'ES2021', 'ES2022', 'ES2023', 'ES2024'],
  architecturePatterns: ['分层架构', '六边形架构', 'MVC', 'MVVM', '微服务', 'CQRS'],
  testTypes: ['单元测试', '集成测试', 'E2E测试', 'Mock/Stub', 'TDD/BDD'],
  optimizationAreas: ['内存管理', '构建优化', '渲染优化', '网络优化'],
  jsTsComparison: ['类型理论', '形式化证明', 'JS实现对比', '互操作性'],
  frontendFrameworks: ['响应式系统', '组件模式', '路由管理', '状态管理'],
  backendPatterns: ['Express中间件', '路由组织', '认证授权'],
  databasePatterns: ['Repository模式', '查询构建器', '关联查询'],
  securityPatterns: ['JWT认证', '速率限制', '权限检查'],
  deployment: ['Docker', '多阶段构建', 'CI/CD'],
  toolchain: ['Vite', '构建优化', '开发服务器'],
};

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 JavaScript TypeScript 代码实验室 v${VERSION}            ║
║                                                          ║
║   📚 全面技术分析与可运行代码实现                          ║
║                                                          ║
║   📊 模块数: ${OVERVIEW.totalModules.toString().padEnd(2)}   📁 源文件: ${OVERVIEW.totalSourceFiles.toString().padEnd(3)}               ║
║   🎨 设计模式: 23种  🏗️ 架构模式: 6种                      ║
║   🧪 测试类型: 5种   ⚡ 性能优化: 5大方向                  ║
║   🔄 JS/TS对比: 完整                                    ║
║                                                          ║
║   运行所有示例: tsx run-demos.ts                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);
