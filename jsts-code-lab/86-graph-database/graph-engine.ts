/**
 * @file 图引擎
 * @category Graph Database → Engine
 * @difficulty hard
 * @tags graph-database, traversal, pathfinding, community-detection
 */

// 图节点
export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

// 图边
export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  properties: Record<string, unknown>;
}

// 内存图数据库
export class InMemoryGraph {
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, GraphEdge>();
  private adjacencyList = new Map<string, Set<string>>(); // node -> edges
  
  // 添加节点
  addNode(id: string, labels: string[] = [], properties: Record<string, unknown> = {}): GraphNode {
    const node: GraphNode = { id, labels, properties };
    this.nodes.set(id, node);
    this.adjacencyList.set(id, new Set());
    return node;
  }
  
  // 添加边
  addEdge(from: string, to: string, type: string, properties: Record<string, unknown> = {}): GraphEdge {
    const id = `${from}-${to}-${type}`;
    const edge: GraphEdge = { id, from, to, type, properties };
    
    this.edges.set(id, edge);
    this.adjacencyList.get(from)?.add(id);
    
    return edge;
  }
  
  // 获取节点
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }
  
  // 获取边
  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }
  
  // 获取邻居
  getNeighbors(nodeId: string, edgeType?: string): GraphNode[] {
    const edgeIds = this.adjacencyList.get(nodeId) || new Set();
    const neighbors: GraphNode[] = [];
    
    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (edge && (!edgeType || edge.type === edgeType)) {
        const neighbor = this.nodes.get(edge.to);
        if (neighbor) neighbors.push(neighbor);
      }
    }
    
    return neighbors;
  }
  
  // 按标签查询
  findNodesByLabel(label: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.labels.includes(label));
  }
  
  // Cypher风格查询（简化版）
  query(pattern: { start: string; relationship: string; end?: string }): { start: GraphNode; edge: GraphEdge; end?: GraphNode }[] {
    const results: { start: GraphNode; edge: GraphEdge; end?: GraphNode }[] = [];
    
    const startNodes = this.findNodesByLabel(pattern.start);
    
    for (const start of startNodes) {
      const edgeIds = this.adjacencyList.get(start.id) || new Set();
      
      for (const edgeId of edgeIds) {
        const edge = this.edges.get(edgeId);
        if (edge?.type === pattern.relationship) {
          if (pattern.end) {
            const end = this.nodes.get(edge.to);
            if (end?.labels.includes(pattern.end)) {
              results.push({ start, edge, end });
            }
          } else {
            results.push({ start, edge });
          }
        }
      }
    }
    
    return results;
  }
  
  getStats(): { nodes: number; edges: number } {
    return { nodes: this.nodes.size, edges: this.edges.size };
  }
}

// 图遍历
export class GraphTraversal {
  constructor(private graph: InMemoryGraph) {}
  
  // BFS遍历
  bfs(startNodeId: string, callback: (node: GraphNode, depth: number) => boolean): void {
    const visited = new Set<string>();
    const queue: { id: string; depth: number }[] = [{ id: startNodeId, depth: 0 }];
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      const node = this.graph.getNode(id);
      if (!node) continue;
      
      if (!callback(node, depth)) break;
      
      const neighbors = this.graph.getNeighbors(id);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          queue.push({ id: neighbor.id, depth: depth + 1 });
        }
      }
    }
  }
  
  // DFS遍历
  dfs(startNodeId: string, callback: (node: GraphNode, depth: number) => boolean): void {
    const visited = new Set<string>();
    
    const visit = (id: string, depth: number): boolean => {
      if (visited.has(id)) return true;
      visited.add(id);
      
      const node = this.graph.getNode(id);
      if (!node) return true;
      
      if (!callback(node, depth)) return false;
      
      const neighbors = this.graph.getNeighbors(id);
      for (const neighbor of neighbors) {
        if (!visit(neighbor.id, depth + 1)) return false;
      }
      
      return true;
    };
    
    visit(startNodeId, 0);
  }
}

// 路径查找
export class PathFinder {
  constructor(private graph: InMemoryGraph) {}
  
  // 最短路径 (BFS)
  shortestPath(startId: string, endId: string): GraphNode[] | null {
    if (startId === endId) {
      const node = this.graph.getNode(startId);
      return node ? [node] : null;
    }
    
    const visited = new Set<string>();
    const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      const neighbors = this.graph.getNeighbors(id);
      for (const neighbor of neighbors) {
        if (neighbor.id === endId) {
          // 构建完整路径
          const fullPath: GraphNode[] = [];
          for (const nodeId of [...path, endId]) {
            const node = this.graph.getNode(nodeId);
            if (node) fullPath.push(node);
          }
          return fullPath;
        }
        
        if (!visited.has(neighbor.id)) {
          queue.push({ id: neighbor.id, path: [...path, neighbor.id] });
        }
      }
    }
    
    return null;
  }
  
  // 所有简单路径（限制深度）
  findAllPaths(startId: string, endId: string, maxDepth = 5): GraphNode[][] {
    const paths: GraphNode[][] = [];
    
    const dfs = (current: string, path: string[], depth: number): void => {
      if (depth > maxDepth) return;
      
      if (current === endId) {
        const fullPath = path.map(id => this.graph.getNode(id)).filter(n => n !== undefined);
        paths.push(fullPath);
        return;
      }
      
      const neighbors = this.graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (!path.includes(neighbor.id)) { // 避免环
          dfs(neighbor.id, [...path, neighbor.id], depth + 1);
        }
      }
    };
    
    dfs(startId, [startId], 0);
    return paths;
  }
}

// PageRank算法
export class PageRank {
  constructor(private graph: InMemoryGraph) {}
  
  calculate(iterations = 100, dampingFactor = 0.85): Map<string, number> {
    const nodes = Array.from(this.graph.nodes.keys());
    const n = nodes.length;
    
    if (n === 0) return new Map();
    
    // 初始化
    let ranks = new Map<string, number>();
    for (const node of nodes) {
      ranks.set(node, 1 / n);
    }
    
    for (let i = 0; i < iterations; i++) {
      const newRanks = new Map<string, number>();
      
      for (const node of nodes) {
        let rank = (1 - dampingFactor) / n;
        
        // 获取入边（需要反向邻接表，这里简化处理）
        const neighbors = this.graph.getNeighbors(node);
        const outgoingCount = neighbors.length;
        
        if (outgoingCount > 0) {
          // 简化的PageRank计算
          rank += dampingFactor * (ranks.get(node) || 0) / outgoingCount;
        }
        
        newRanks.set(node, rank);
      }
      
      ranks = newRanks;
    }
    
    return ranks;
  }
}

// 社区发现（简化版Louvain算法）
export class CommunityDetection {
  constructor(private graph: InMemoryGraph) {}
  
  detect(): Map<string, number> {
    // 简化的社区检测：使用标签传播
    const communities = new Map<string, number>();
    let nextCommunityId = 0;
    
    // 初始：每个节点一个社区
    for (const nodeId of this.graph.nodes.keys()) {
      communities.set(nodeId, nextCommunityId++);
    }
    
    // 标签传播迭代
    for (let iteration = 0; iteration < 10; iteration++) {
      const newCommunities = new Map<string, number>();
      
      for (const nodeId of this.graph.nodes.keys()) {
        const neighbors = this.graph.getNeighbors(nodeId);
        
        if (neighbors.length === 0) {
          newCommunities.set(nodeId, communities.get(nodeId)!);
          continue;
        }
        
        // 选择邻居中最常见的社区
        const communityCounts = new Map<number, number>();
        for (const neighbor of neighbors) {
          const comm = communities.get(neighbor.id)!;
          communityCounts.set(comm, (communityCounts.get(comm) || 0) + 1);
        }
        
        let bestCommunity = communities.get(nodeId)!;
        let maxCount = 0;
        
        for (const [comm, count] of communityCounts) {
          if (count > maxCount) {
            maxCount = count;
            bestCommunity = comm;
          }
        }
        
        newCommunities.set(nodeId, bestCommunity);
      }
      
      // 检查收敛
      let changed = false;
      for (const [nodeId, comm] of newCommunities) {
        if (comm !== communities.get(nodeId)) {
          changed = true;
          break;
        }
      }
      
      communities.clear();
      for (const [nodeId, comm] of newCommunities) {
        communities.set(nodeId, comm);
      }
      
      if (!changed) break;
    }
    
    return communities;
  }
}

export function demo(): void {
  console.log('=== 图数据库 ===\n');
  
  // 创建社交网络图
  const graph = new InMemoryGraph();
  
  // 添加用户节点
  const alice = graph.addNode('alice', ['Person'], { name: 'Alice', age: 30 });
  const bob = graph.addNode('bob', ['Person'], { name: 'Bob', age: 25 });
  const charlie = graph.addNode('charlie', ['Person'], { name: 'Charlie', age: 35 });
  const dave = graph.addNode('dave', ['Person'], { name: 'Dave', age: 28 });
  const eve = graph.addNode('eve', ['Person'], { name: 'Eve', age: 32 });
  
  // 添加关系边
  graph.addEdge('alice', 'bob', 'FRIENDS_WITH', { since: '2020' });
  graph.addEdge('bob', 'alice', 'FRIENDS_WITH', { since: '2020' });
  graph.addEdge('alice', 'charlie', 'FRIENDS_WITH', { since: '2019' });
  graph.addEdge('charlie', 'dave', 'FRIENDS_WITH', { since: '2021' });
  graph.addEdge('bob', 'dave', 'FRIENDS_WITH', { since: '2022' });
  graph.addEdge('eve', 'alice', 'FRIENDS_WITH', { since: '2023' });
  
  console.log('图统计:', graph.getStats());
  
  // 图遍历
  console.log('\n--- BFS遍历 ---');
  const traversal = new GraphTraversal(graph);
  console.log('从Alice开始的BFS:');
  traversal.bfs('alice', (node, depth) => {
    console.log(`  ${'  '.repeat(depth)}${node.properties.name} (深度${depth})`);
    return true;
  });
  
  // 路径查找
  console.log('\n--- 最短路径 ---');
  const pathFinder = new PathFinder(graph);
  
  const path = pathFinder.shortestPath('eve', 'dave');
  if (path) {
    console.log('Eve到Dave的最短路径:', path.map(n => n.properties.name).join(' -> '));
  }
  
  // 所有路径
  const allPaths = pathFinder.findAllPaths('alice', 'dave', 4);
  console.log(`\nAlice到Dave的所有路径 (${allPaths.length}条):`);
  for (const p of allPaths) {
    console.log('  ' + p.map(n => n.properties.name).join(' -> '));
  }
  
  // 社区发现
  console.log('\n--- 社区发现 ---');
  const community = new CommunityDetection(graph);
  const communities = community.detect();
  
  const communityGroups = new Map<number, string[]>();
  for (const [nodeId, commId] of communities) {
    if (!communityGroups.has(commId)) {
      communityGroups.set(commId, []);
    }
    communityGroups.get(commId)!.push(nodeId);
  }
  
  console.log('发现的社区:');
  for (const [commId, members] of communityGroups) {
    console.log(`  社区 ${commId}: ${members.join(', ')}`);
  }
  
  // Cypher风格查询
  console.log('\n--- 图查询 ---');
  const results = graph.query({ start: 'Person', relationship: 'FRIENDS_WITH' });
  console.log('所有人的朋友关系:');
  for (const r of results) {
    console.log(`  ${r.start.properties.name} -> ${r.end?.properties.name}`);
  }
}
