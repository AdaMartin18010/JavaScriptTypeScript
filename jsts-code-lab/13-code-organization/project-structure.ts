/**
 * @file 项目代码组织结构
 * @category Code Organization → Project Structure
 * @difficulty medium
 * @tags architecture, folder-structure, code-organization, scalability
 * 
 * @description
 * 可扩展的项目代码组织结构：
 * - 分层架构目录设计
 * - 按功能/类型组织代码
 * - 模块边界与依赖规则
 * - 代码拆分策略
 */

// ============================================================================
// 1. 项目结构定义
// ============================================================================

export interface ProjectStructure {
  name: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'library';
  structure: DirectoryStructure;
}

export interface DirectoryStructure {
  name: string;
  description: string;
  children?: DirectoryStructure[];
  files?: FileTemplate[];
}

export interface FileTemplate {
  name: string;
  description: string;
  template?: string;
}

// ============================================================================
// 2. 前端项目结构 (React/Vue)
// ============================================================================

export const frontendStructure: ProjectStructure = {
  name: 'frontend-react',
  type: 'frontend',
  structure: {
    name: 'src',
    description: '源代码目录',
    children: [
      {
        name: 'components',
        description: '可复用组件',
        children: [
          { name: 'common', description: '通用组件 (Button, Input等)' },
          { name: 'layout', description: '布局组件 (Header, Sidebar等)' },
          { name: 'forms', description: '表单组件' }
        ]
      },
      {
        name: 'features',
        description: '按功能组织的模块',
        children: [
          {
            name: 'user',
            description: '用户功能模块',
            children: [
              { name: 'components', description: '用户相关组件' },
              { name: 'hooks', description: '用户相关 Hooks' },
              { name: 'services', description: '用户 API 服务' },
              { name: 'types', description: '用户类型定义' },
              { name: 'utils', description: '用户工具函数' }
            ]
          }
        ]
      },
      {
        name: 'pages',
        description: '页面组件',
        children: [
          { name: 'Home', description: '首页' },
          { name: 'About', description: '关于页' },
          { name: 'Dashboard', description: '仪表盘' }
        ]
      },
      {
        name: 'hooks',
        description: '全局共享 Hooks'
      },
      {
        name: 'services',
        description: 'API 服务层',
        children: [
          { name: 'api', description: 'API 客户端配置' },
          { name: 'auth', description: '认证服务' },
          { name: 'cache', description: '缓存服务' }
        ]
      },
      {
        name: 'store',
        description: '状态管理',
        children: [
          { name: 'slices', description: 'Redux slices / Store modules' },
          { name: 'middleware', description: '中间件' }
        ]
      },
      {
        name: 'utils',
        description: '工具函数'
      },
      {
        name: 'types',
        description: '全局类型定义'
      },
      {
        name: 'styles',
        description: '全局样式'
      },
      {
        name: 'assets',
        description: '静态资源'
      }
    ]
  }
};

// ============================================================================
// 3. 后端项目结构 (Node.js/Express)
// ============================================================================

export const backendStructure: ProjectStructure = {
  name: 'backend-node',
  type: 'backend',
  structure: {
    name: 'src',
    description: '源代码目录',
    children: [
      {
        name: 'config',
        description: '配置文件',
        children: [
          { name: 'database', description: '数据库配置' },
          { name: 'server', description: '服务器配置' },
          { name: 'security', description: '安全配置' }
        ]
      },
      {
        name: 'api',
        description: 'API 层',
        children: [
          {
            name: 'routes',
            description: '路由定义',
            children: [
              { name: 'user.routes.ts', description: '用户路由' },
              { name: 'auth.routes.ts', description: '认证路由' }
            ]
          },
          {
            name: 'controllers',
            description: '控制器'
          },
          {
            name: 'middleware',
            description: '中间件 (auth, validation, error-handling)'
          },
          {
            name: 'validators',
            description: '请求验证'
          }
        ]
      },
      {
        name: 'services',
        description: '业务逻辑层',
        children: [
          { name: 'user.service.ts', description: '用户服务' },
          { name: 'auth.service.ts', description: '认证服务' }
        ]
      },
      {
        name: 'models',
        description: '数据模型层',
        children: [
          { name: 'user.model.ts', description: '用户模型' },
          { name: 'index.ts', description: '模型导出' }
        ]
      },
      {
        name: 'repositories',
        description: '数据访问层 (Repository 模式)'
      },
      {
        name: 'utils',
        description: '工具函数'
      },
      {
        name: 'types',
        description: '类型定义'
      },
      {
        name: 'jobs',
        description: '定时任务'
      },
      {
        name: 'events',
        description: '事件处理器'
      }
    ]
  }
};

// ============================================================================
// 4. 代码组织原则
// ============================================================================

/**
 * 代码组织最佳实践：
 * 
 * 1. 关注点分离 (Separation of Concerns)
 *    - UI 组件、业务逻辑、数据访问分离
 *    - 每个模块只负责单一职责
 * 
 * 2. 按功能组织 (Organize by Feature)
 *    - 相关文件放在一起
 *    - 避免按类型分散 (避免 components/, services/ 大目录)
 * 
 * 3. 依赖规则 (Dependency Rules)
 *    - 上层可以依赖下层
 *    - 下层不能依赖上层
 *    - 同层之间避免循环依赖
 * 
 * 4. 公共提取 (DRY Principle)
 *    - 提取共享组件到 common/
 *    - 提取工具函数到 utils/
 *    - 避免重复代码
 */

// 依赖方向规则
export interface DependencyRule {
  from: string;
  to: string;
  allowed: boolean;
  reason: string;
}

export const commonDependencyRules: DependencyRule[] = [
  { from: 'pages', to: 'features', allowed: true, reason: '页面可以使用功能模块' },
  { from: 'pages', to: 'components', allowed: true, reason: '页面可以使用组件' },
  { from: 'features', to: 'components', allowed: true, reason: '功能模块可以使用通用组件' },
  { from: 'features', to: 'features', allowed: false, reason: '功能模块之间应避免直接依赖' },
  { from: 'components', to: 'features', allowed: false, reason: '通用组件不应依赖功能模块' },
  { from: 'utils', to: 'features', allowed: false, reason: '工具函数不应依赖业务逻辑' }
];

// ============================================================================
// 5. 模块边界检查器
// ============================================================================

export interface ImportCheck {
  importer: string;
  importee: string;
  valid: boolean;
  message?: string;
}

export class ModuleBoundaryChecker {
  private rules: DependencyRule[];

  constructor(rules: DependencyRule[]) {
    this.rules = rules;
  }

  checkImport(importer: string, importee: string): ImportCheck {
    // 找到匹配的规则
    const rule = this.rules.find(r => {
      const fromMatch = importer.includes(r.from);
      const toMatch = importee.includes(r.to);
      return fromMatch && toMatch;
    });

    if (rule) {
      return {
        importer,
        importee,
        valid: rule.allowed,
        message: rule.allowed ? undefined : rule.reason
      };
    }

    // 默认允许
    return { importer, importee, valid: true };
  }

  // 检查整个项目
  checkProject(imports: Array<{ from: string; to: string }>): ImportCheck[] {
    return imports.map(({ from, to }) => this.checkImport(from, to));
  }
}

// ============================================================================
// 6. 代码拆分策略
// ============================================================================

export interface CodeSplitStrategy {
  name: string;
  description: string;
  when: string;
  how: string;
}

export const codeSplitStrategies: CodeSplitStrategy[] = [
  {
    name: 'Route-based Splitting',
    description: '按路由拆分代码',
    when: '大型单页应用，不同页面功能独立',
    how: '使用 React.lazy() 或 Vue 的异步组件'
  },
  {
    name: 'Component-level Splitting',
    description: '组件级别懒加载',
    when: '某些组件只在特定条件下渲染',
    how: '将大组件拆分为独立 chunk'
  },
  {
    name: 'Library Splitting',
    description: '第三方库单独打包',
    when: '使用大型第三方库 (lodash, moment)',
    how: '配置 webpack/vite 的 splitChunks'
  },
  {
    name: 'Worker Splitting',
    description: 'Web Worker 分离',
    when: 'CPU 密集型计算任务',
    how: '将计算逻辑放入 Worker 文件'
  }
];

// ============================================================================
// 7. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 项目代码组织结构 ===\n');

  // 打印前端结构
  console.log('--- 前端项目结构 (React) ---');
  const printStructure = (structure: DirectoryStructure, indent: string = '') => {
    console.log(`${indent}📁 ${structure.name} - ${structure.description}`);
    if (structure.children) {
      structure.children.forEach(child => {
        printStructure(child, indent + '  ');
      });
    }
  };
  printStructure(frontendStructure.structure);

  // 依赖规则检查示例
  console.log('\n--- 依赖规则检查 ---');
  const checker = new ModuleBoundaryChecker(commonDependencyRules);
  
  const checks = [
    { from: 'src/pages/Home.tsx', to: 'src/features/user' },
    { from: 'src/components/Button.tsx', to: 'src/features/user' },
    { from: 'src/utils/helpers.ts', to: 'src/features/user' }
  ];

  checks.forEach(({ from, to }) => {
    const result = checker.checkImport(from, to);
    const icon = result.valid ? '✅' : '❌';
    console.log(`${icon} ${from} → ${to}`);
    if (result.message) {
      console.log(`   ${result.message}`);
    }
  });

  // 代码拆分策略
  console.log('\n--- 代码拆分策略 ---');
  codeSplitStrategies.forEach((strategy, i) => {
    console.log(`${i + 1}. ${strategy.name}`);
    console.log(`   ${strategy.description}`);
    console.log(`   适用: ${strategy.when}`);
  });

  console.log('\n代码组织原则:');
  console.log('1. 按功能组织，而非按类型');
  console.log('2. 保持模块边界清晰');
  console.log('3. 避免循环依赖');
  console.log('4. 公共代码提取到共享目录');
}

// ============================================================================
// 导出
// ============================================================================

export {
  frontendStructure,
  backendStructure,
  ModuleBoundaryChecker,
  codeSplitStrategies
};

export type {
  ProjectStructure,
  DirectoryStructure,
  FileTemplate,
  DependencyRule,
  ImportCheck,
  CodeSplitStrategy
};
