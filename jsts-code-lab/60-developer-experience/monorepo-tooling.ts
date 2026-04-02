/**
 * @file Monorepo 工具链
 * @category Developer Experience → Monorepo Tooling
 * @difficulty hard
 * @tags monorepo, topology, workspace, nx, pnpm
 *
 * @description
 * 模拟现代 Monorepo 工具链的核心能力：
 * - 工作区解析（pnpm workspace / nx project graph）
 * - 包依赖拓扑排序
 * - 循环依赖检测
 * - 受影响项目分析（affected projects）
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 工作区包元数据 */
export interface WorkspacePackage {
  name: string;
  path: string;
  version: string;
  /** 内部依赖（指向工作区中其他包的名字） */
  internalDependencies: string[];
}

/** 项目图节点 */
export interface ProjectNode {
  id: string;
  packageInfo: WorkspacePackage;
  /** 该节点直接依赖的节点 ID 列表 */
  dependencies: string[];
  /** 依赖该节点的节点 ID 列表（反向边） */
  dependents: string[];
}

/** 拓扑排序结果 */
export interface TopologicalResult {
  /** 可行的构建顺序 */
  order: string[];
  /** 是否存在循环依赖 */
  hasCycle: boolean;
  /** 检测到的循环（若有） */
  cycles: string[][];
}

/** 受影响分析模式 */
export type AffectedMode = 'direct' | 'transitive' | 'all';

// ============================================================================
// 项目图（Project Graph）
// ============================================================================

export class ProjectGraph {
  private nodes = new Map<string, ProjectNode>();

  addPackage(pkg: WorkspacePackage): void {
    // 若节点已存在则复用，保证多次 add 不会丢失依赖信息
    const existing = this.nodes.get(pkg.name);
    const node: ProjectNode = existing ?? {
      id: pkg.name,
      packageInfo: pkg,
      dependencies: [],
      dependents: []
    };

    if (!existing) {
      this.nodes.set(pkg.name, node);
    }

    // 建立正向边（依赖）与反向边（被依赖）
    for (const depName of pkg.internalDependencies) {
      if (!node.dependencies.includes(depName)) {
        node.dependencies.push(depName);
      }

      const depNode = this.nodes.get(depName);
      if (depNode && !depNode.dependents.includes(pkg.name)) {
        depNode.dependents.push(pkg.name);
      }
    }
  }

  getNode(name: string): ProjectNode | undefined {
    return this.nodes.get(name);
  }

  getAllNodes(): ProjectNode[] {
    return Array.from(this.nodes.values());
  }

  // ============================================================================
  // 拓扑排序（Kahn 算法）
  // ============================================================================

  /**
   * 拓扑排序用于保证 monorepo 构建顺序：
   * 被依赖的包必须先构建，因此入度为 0 的节点优先出队。
   */
  topologicalSort(): TopologicalResult {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const node of this.nodes.values()) {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    }

    for (const node of this.nodes.values()) {
      for (const dep of node.dependencies) {
        if (this.nodes.has(dep)) {
          adj.get(dep)!.push(node.id);
          inDegree.set(node.id, (inDegree.get(node.id) ?? 0) + 1);
        }
      }
    }

    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);
      for (const neighbor of adj.get(current)!) {
        const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    const hasCycle = order.length !== this.nodes.size;
    const cycles = hasCycle ? this.findCycles() : [];

    return { order, hasCycle, cycles };
  }

  // ============================================================================
  // 循环依赖检测（DFS）
  // ============================================================================

  /**
   * 循环依赖会导致构建死锁或无限递归，必须在构建前检测并中断。
   */
  findCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();

    for (const startNode of this.nodes.keys()) {
      if (visited.has(startNode)) continue;

      const path: string[] = [];
      const pathSet = new Set<string>();

      const dfs = (current: string) => {
        if (pathSet.has(current)) {
          const idx = path.indexOf(current);
          cycles.push(path.slice(idx));
          return;
        }
        if (visited.has(current)) return;

        path.push(current);
        pathSet.add(current);

        const node = this.nodes.get(current);
        if (node) {
          for (const dep of node.dependencies) {
            if (this.nodes.has(dep)) dfs(dep);
          }
        }

        path.pop();
        pathSet.delete(current);
        visited.add(current);
      };

      dfs(startNode);
    }

    // 去重：以最小字典序环为键
    const unique = new Set<string>();
    const result: string[][] = [];
    for (const cycle of cycles) {
      const key = cycle.join('→');
      if (!unique.has(key)) {
        unique.add(key);
        result.push(cycle);
      }
    }
    return result;
  }

  // ============================================================================
  // 受影响项目分析（Affected Projects）
  // ============================================================================

  /**
   * 基于变更文件推断受影响的项目，模拟 nx affected 的逻辑：
   * 直接变更的包 + 所有依赖这些包的下游项目都需要重新构建/测试。
   */
  getAffectedProjects(changedPackageNames: string[], mode: AffectedMode = 'transitive'): string[] {
    const affected = new Set<string>();

    for (const name of changedPackageNames) {
      affected.add(name);

      if (mode === 'direct') {
        const node = this.nodes.get(name);
        if (node) {
          for (const dependent of node.dependents) {
            affected.add(dependent);
          }
        }
      }

      if (mode === 'transitive' || mode === 'all') {
        // BFS 向上游传播：所有依赖变更包的项目都受影响
        const queue = [name];
        while (queue.length > 0) {
          const current = queue.shift()!;
          const node = this.nodes.get(current);
          if (!node) continue;
          for (const dependent of node.dependents) {
            if (!affected.has(dependent)) {
              affected.add(dependent);
              queue.push(dependent);
            }
          }
        }
      }

      if (mode === 'all') {
        // 同时把上游依赖也纳入（用于全量回归）
        const queue = [name];
        while (queue.length > 0) {
          const current = queue.shift()!;
          const node = this.nodes.get(current);
          if (!node) continue;
          for (const dep of node.dependencies) {
            if (!affected.has(dep)) {
              affected.add(dep);
              queue.push(dep);
            }
          }
        }
      }
    }

    return Array.from(affected);
  }
}

// ============================================================================
// 工作区解析器
// ============================================================================

export class WorkspaceParser {
  /**
   * 从 packages 目录模拟解析 pnpm workspace 包列表。
   * 真实场景中通常会读取 pnpm-workspace.yaml 与各个 package.json。
   */
  parse(packages: WorkspacePackage[]): ProjectGraph {
    const graph = new ProjectGraph();
    for (const pkg of packages) {
      graph.addPackage(pkg);
    }
    // 第二遍补充反向依赖（针对先 add 的节点可能尚未注册后续节点的情况）
    for (const pkg of packages) {
      for (const dep of pkg.internalDependencies) {
        const depNode = graph.getNode(dep);
        const pkgNode = graph.getNode(pkg.name);
        if (depNode && pkgNode && !depNode.dependents.includes(pkg.name)) {
          depNode.dependents.push(pkg.name);
        }
      }
    }
    return graph;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Monorepo 工具链演示 ===\n');

  const packages: WorkspacePackage[] = [
    { name: 'shared-utils', path: 'packages/shared-utils', version: '1.0.0', internalDependencies: [] },
    { name: 'core-api', path: 'packages/core-api', version: '1.0.0', internalDependencies: ['shared-utils'] },
    { name: 'web-ui', path: 'packages/web-ui', version: '1.0.0', internalDependencies: ['shared-utils'] },
    { name: 'admin-app', path: 'apps/admin-app', version: '1.0.0', internalDependencies: ['core-api', 'web-ui'] },
    { name: 'mobile-app', path: 'apps/mobile-app', version: '1.0.0', internalDependencies: ['core-api'] }
  ];

  const parser = new WorkspaceParser();
  const graph = parser.parse(packages);

  console.log('--- 拓扑排序 ---');
  const topo = graph.topologicalSort();
  console.log('构建顺序:', topo.order.join(' → '));
  console.log('存在循环:', topo.hasCycle);

  console.log('\n--- 受影响项目分析 ---');
  const affected = graph.getAffectedProjects(['shared-utils'], 'transitive');
  console.log('shared-utils 变更影响:', affected.join(', '));

  console.log('\n--- 循环依赖检测（正常无环） ---');
  console.log('检测到的循环:', graph.findCycles().length === 0 ? '无' : '有');

  // 构造一个带环的场景
  const cyclicPackages: WorkspacePackage[] = [
    { name: 'a', path: 'packages/a', version: '1.0.0', internalDependencies: ['b'] },
    { name: 'b', path: 'packages/b', version: '1.0.0', internalDependencies: ['c'] },
    { name: 'c', path: 'packages/c', version: '1.0.0', internalDependencies: ['a'] }
  ];
  const cyclicGraph = parser.parse(cyclicPackages);
  console.log('\n--- 循环依赖检测（异常有环） ---');
  const cycles = cyclicGraph.findCycles();
  console.log('检测到的循环数:', cycles.length);
  cycles.forEach((c, i) => console.log(`  环 ${i + 1}:`, c.join(' → ')));
}
