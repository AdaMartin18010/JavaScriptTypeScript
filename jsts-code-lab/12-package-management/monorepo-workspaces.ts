/**
 * @file Monorepo 工作区管理
 * @category Package Management → Workspaces
 * @difficulty hard
 * @tags monorepo, workspaces, pnpm, turborepo, nx
 * 
 * @description
 * Monorepo 架构下的包管理：
 * - pnpm workspaces
 * - npm/yarn workspaces
 * - 依赖共享与链接
 * - 脚本编排
 * - 变更集管理 (Changesets)
 */

// ============================================================================
// 1. 工作区配置
// ============================================================================

// pnpm-workspace.yaml 配置
export interface PnpmWorkspaceConfig {
  packages: string[];  // 工作区包路径模式
  catalog?: Record<string, string>;  // 依赖目录
  onlyBuiltDependencies?: string[];  // 仅构建的依赖
}

// package.json workspaces 配置
export interface WorkspaceConfig {
  workspaces?: string[] | {
    packages: string[];
    nohoist?: string[];  // yarn 专用
  };
}

// 工作区包信息
export interface WorkspacePackage {
  name: string;
  path: string;           // 相对根目录的路径
  version: string;
  private?: boolean;      // 是否私有（不发布）
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

// ============================================================================
// 2. 依赖图分析
// ============================================================================

export interface DependencyGraph {
  nodes: Map<string, WorkspacePackage>;
  edges: Map<string, Set<string>>;  // 包 -> 依赖它的包
}

export class WorkspaceDependencyGraph {
  private graph: DependencyGraph = {
    nodes: new Map(),
    edges: new Map()
  };

  addPackage(pkg: WorkspacePackage): void {
    this.graph.nodes.set(pkg.name, pkg);
    
    // 构建反向依赖关系
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies
    };

    for (const depName of Object.keys(allDeps)) {
      if (!this.graph.edges.has(depName)) {
        this.graph.edges.set(depName, new Set());
      }
      this.graph.edges.get(depName)!.add(pkg.name);
    }
  }

  // 拓扑排序 - 确定构建顺序
  topologicalSort(): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: string[] = [];

    const visit = (name: string) => {
      if (temp.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }
      if (visited.has(name)) return;

      temp.add(name);
      const pkg = this.graph.nodes.get(name);
      
      if (pkg) {
        const deps = [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.devDependencies || {})
        ];
        
        for (const dep of deps) {
          if (this.graph.nodes.has(dep)) {
            visit(dep);
          }
        }
      }

      temp.delete(name);
      visited.add(name);
      result.push(name);
    };

    for (const name of this.graph.nodes.keys()) {
      visit(name);
    }

    return result;
  }

  // 获取受影响的包
  getAffectedPackages(changedPackages: string[]): string[] {
    const affected = new Set<string>();
    const queue = [...changedPackages];

    while (queue.length > 0) {
      const pkg = queue.shift()!;
      if (affected.has(pkg)) continue;
      
      affected.add(pkg);
      
      // 找到所有依赖这个包的包
      const dependents = this.graph.edges.get(pkg);
      if (dependents) {
        for (const dependent of dependents) {
          queue.push(dependent);
        }
      }
    }

    return Array.from(affected);
  }

  // 查找循环依赖
  findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();

    for (const name of this.graph.nodes.keys()) {
      if (visited.has(name)) continue;
      
      const path: string[] = [];
      const pathSet = new Set<string>();
      
      const dfs = (current: string) => {
        if (pathSet.has(current)) {
          const cycleStart = path.indexOf(current);
          cycles.push(path.slice(cycleStart));
          return;
        }
        
        if (visited.has(current)) return;
        
        path.push(current);
        pathSet.add(current);
        
        const pkg = this.graph.nodes.get(current);
        if (pkg) {
          const deps = Object.keys(pkg.dependencies || {});
          for (const dep of deps) {
            if (this.graph.nodes.has(dep)) {
              dfs(dep);
            }
          }
        }
        
        path.pop();
        pathSet.delete(current);
        visited.add(current);
      };

      dfs(name);
    }

    return cycles;
  }
}

// ============================================================================
// 3. 变更集管理 (Changesets)
// ============================================================================

export type ChangeType = 'major' | 'minor' | 'patch';

export interface Changeset {
  id: string;
  summary: string;
  releases: Array<{
    name: string;
    type: ChangeType;
  }>;
}

export class ChangesetManager {
  private changesets: Changeset[] = [];

  add(changeset: Changeset): void {
    this.changesets.push(changeset);
  }

  // 汇总变更
  summarize(): Map<string, ChangeType> {
    const summary = new Map<string, ChangeType>();
    
    for (const changeset of this.changesets) {
      for (const release of changeset.releases) {
        const current = summary.get(release.name);
        if (!current || this.isBiggerChange(release.type, current)) {
          summary.set(release.name, release.type);
        }
      }
    }

    return summary;
  }

  private isBiggerChange(a: ChangeType, b: ChangeType): boolean {
    const order = { patch: 0, minor: 1, major: 2 };
    return order[a] > order[b];
  }

  // 生成版本更新计划
  generateVersionPlan(packages: Map<string, WorkspacePackage>): Array<{
    name: string;
    oldVersion: string;
    newVersion: string;
    type: ChangeType;
  }> {
    const summary = this.summarize();
    const plan: Array<{
      name: string;
      oldVersion: string;
      newVersion: string;
      type: ChangeType;
    }> = [];

    for (const [name, changeType] of summary) {
      const pkg = packages.get(name);
      if (pkg) {
        const newVersion = this.bumpVersion(pkg.version, changeType);
        plan.push({
          name,
          oldVersion: pkg.version,
          newVersion,
          type: changeType
        });
      }
    }

    return plan;
  }

  private bumpVersion(version: string, type: ChangeType): string {
    const parts = version.split('.').map(Number);
    switch (type) {
      case 'major':
        return `${parts[0] + 1}.0.0`;
      case 'minor':
        return `${parts[0]}.${parts[1] + 1}.0`;
      case 'patch':
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    }
  }
}

// ============================================================================
// 4. 脚本编排
// ============================================================================

export interface Task {
  name: string;
  command: string;
  dependencies?: string[];  // 依赖的任务
  outputs?: string[];       // 输出文件/目录
  cache?: boolean;          // 是否启用缓存
}

export class TaskRunner {
  private tasks: Map<string, Task> = new Map();

  register(task: Task): void {
    this.tasks.set(task.name, task);
  }

  // 并行执行（考虑依赖关系）
  async runParallel(taskNames: string[]): Promise<void> {
    const completed = new Set<string>();
    const running = new Set<string>();

    const canRun = (task: Task): boolean => {
      if (!task.dependencies) return true;
      return task.dependencies.every(dep => completed.has(dep));
    };

    const runTask = async (name: string): Promise<void> => {
      if (completed.has(name) || running.has(name)) return;
      
      const task = this.tasks.get(name);
      if (!task) throw new Error(`Task not found: ${name}`);

      if (!canRun(task)) {
        throw new Error(`Dependencies not met for task: ${name}`);
      }

      running.add(name);
      console.log(`[Task] Starting: ${name}`);
      
      // 模拟执行
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`[Task] Completed: ${name}`);
      running.delete(name);
      completed.add(name);
    };

    // 按拓扑顺序执行
    const sorted = this.topologicalSort(taskNames);
    
    for (const batch of sorted) {
      await Promise.all(batch.map(name => runTask(name)));
    }
  }

  // 分层拓扑排序
  private topologicalSort(taskNames: string[]): string[][] {
    const batches: string[][] = [];
    const completed = new Set<string>();
    const remaining = new Set(taskNames);

    while (remaining.size > 0) {
      const batch: string[] = [];
      
      for (const name of remaining) {
        const task = this.tasks.get(name);
        if (!task) continue;
        
        const deps = task.dependencies || [];
        if (deps.every(dep => completed.has(dep))) {
          batch.push(name);
        }
      }

      if (batch.length === 0) {
        throw new Error('Circular dependency detected');
      }

      for (const name of batch) {
        remaining.delete(name);
        completed.add(name);
      }

      batches.push(batch);
    }

    return batches;
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Monorepo 工作区管理 ===\n');

  // 工作区依赖图示例
  console.log('--- 工作区依赖图 ---');
  const graph = new WorkspaceDependencyGraph();
  
  graph.addPackage({
    name: 'core',
    path: 'packages/core',
    version: '1.0.0',
    dependencies: {},
    devDependencies: {}
  });
  
  graph.addPackage({
    name: 'utils',
    path: 'packages/utils',
    version: '1.0.0',
    dependencies: { core: '^1.0.0' },
    devDependencies: {}
  });
  
  graph.addPackage({
    name: 'app',
    path: 'packages/app',
    version: '1.0.0',
    dependencies: { core: '^1.0.0', utils: '^1.0.0' },
    devDependencies: {}
  });

  console.log('拓扑排序:', graph.topologicalSort().join(' → '));
  
  const affected = graph.getAffectedPackages(['core']);
  console.log('core 变更影响:', affected.join(', '));

  // 变更集示例
  console.log('\n--- 变更集管理 ---');
  const changesetManager = new ChangesetManager();
  
  changesetManager.add({
    id: 'curly-moose-42',
    summary: '修复 core 模块的 bug',
    releases: [{ name: 'core', type: 'patch' }]
  });
  
  changesetManager.add({
    id: 'swift-fox-99',
    summary: '新增 utils 功能',
    releases: [
      { name: 'utils', type: 'minor' },
      { name: 'app', type: 'patch' }
    ]
  });

  const packages = new Map([
    ['core', { name: 'core', path: '', version: '1.0.0', dependencies: {}, devDependencies: {} }],
    ['utils', { name: 'utils', path: '', version: '1.0.0', dependencies: {}, devDependencies: {} }],
    ['app', { name: 'app', path: '', version: '1.0.0', dependencies: {}, devDependencies: {} }]
  ]);

  const plan = changesetManager.generateVersionPlan(packages);
  console.log('版本更新计划:');
  plan.forEach(p => {
    console.log(`  ${p.name}: ${p.oldVersion} → ${p.newVersion} (${p.type})`);
  });

  // 任务编排示例
  console.log('\n--- 任务编排 ---');
  const runner = new TaskRunner();
  
  runner.register({ name: 'clean', command: 'rm -rf dist' });
  runner.register({ name: 'lint', command: 'eslint .' });
  runner.register({ name: 'build:core', command: 'tsc -p core', dependencies: ['clean'] });
  runner.register({ name: 'build:utils', command: 'tsc -p utils', dependencies: ['build:core'] });
  runner.register({ name: 'build:app', command: 'tsc -p app', dependencies: ['build:utils'] });
  runner.register({ name: 'test', command: 'vitest', dependencies: ['build:app'] });

  console.log('任务注册完成:');
  console.log('  clean → lint');
  console.log('  clean → build:core → build:utils → build:app → test');

  console.log('\nMonorepo 管理要点:');
  console.log('1. 使用工作区统一管理多个包');
  console.log('2. 通过依赖图分析确定构建顺序');
  console.log('3. 使用变更集管理版本发布');
  console.log('4. 任务编排实现并行构建');
}

// ============================================================================
// 导出
// ============================================================================

;

;
