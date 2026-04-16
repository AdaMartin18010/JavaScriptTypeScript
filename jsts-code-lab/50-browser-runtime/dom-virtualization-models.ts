/**
 * @file DOM虚拟化对比模型
 * @category Browser Runtime → DOM Virtualization
 * @model DOM Virtualization Models
 * 
 * @model_overview
 * ## 模型概述
 * 对比前端框架中不同的DOM更新策略，分析各自的抽象成本与适用场景。
 * 核心抽象: Virtual DOM (全量差异对比)、Incremental DOM (指令级更新)、
 * No Virtual DOM (编译时优化) 三类模型，以及原生DOM操作的成本基准。
 * 
 * @model_components
 * - Virtual DOM Model (React): 内存中维护JS对象树，通过diff算法找出最小变更集
 * - Incremental DOM Model (Angular/Ivy): 编译模板为创建/更新指令，运行时执行指令直接操作DOM
 * - No Virtual DOM Model (Svelte): 编译阶段分析依赖关系，生成细粒度订阅和原生DOM更新代码
 * - Native DOM Cost Analyzer: 量化DOM创建、属性修改、插入、删除的真实耗时模型
 * 
 * @interaction_flow
 * 1. 状态变更触发更新
 * 2. Virtual DOM: 生成新VDOM树 -> Diff -> 生成Patch -> 应用Patch到真实DOM
 * 3. Incremental DOM: 执行编译生成的更新指令 -> 条件/循环内部进行脏检查 -> 直接修改DOM
 * 4. Svelte: 触发细粒度订阅回调 -> 编译生成的更新函数直接修改对应DOM节点
 * 5. 原生DOM: 开发者手动调用DOM API，无框架开销但需自行维护一致性
 * 
 * @performance_characteristics
 * - Virtual DOM Diff: O(n) 时间复杂度，但存在内存分配与对比开销
 * - Incremental DOM: 内存占用低，但指令解释有轻微运行时开销
 * - Svelte: 运行时开销最低，无diff成本，但编译产物体积与组件复杂度相关
 * - 原生DOM: 理论最优，但开发成本高，一致性难以保证
 * - 瓶颈分析: 大量节点创建/销毁时，任何框架都无法避免原生DOM的昂贵调用
 * 
 * @optimization_strategies
 * ## 策略1: 列表使用key标识稳定节点 (Virtual DOM)
 * 帮助diff算法复用已有DOM节点，避免不必要的创建和销毁。
 * 
 * ## 策略2: 减少组件状态触发的更新范围 (Svelte/Incremental)
 * 利用编译时静态分析，将状态变更的影响限制在最小DOM子树内。
 * 
 * ## 策略3: 文档片段批量插入 (Native DOM)
 * 使用DocumentFragment减少重排次数，将多次插入合并为一次布局计算。
 * 
 * @implementation_examples
 * ## 实现示例
 * 实际代码演示
 * 
 * @anti_patterns
 * ## 反模式与陷阱
 * - 反模式1: 在Virtual DOM中动态生成大量无key列表 → diff失效，全量重建
 * - 反模式2: 在Svelte中过度拆分组件 → 编译产物订阅器过多，代码体积膨胀
 * - 反模式3: 在循环中频繁读写DOM几何属性 → 强制同步布局，性能崩溃
 */

export interface VNode {
  tag: string;
  props: Record<string, unknown>;
  children: (VNode | string)[];
  key?: string | number;
}

export type PatchOp =
  | { type: 'CREATE'; vnode: VNode }
  | { type: 'REMOVE' }
  | { type: 'REPLACE'; vnode: VNode }
  | { type: 'UPDATE'; props: Record<string, unknown> };

export function diff(oldVNode: VNode | string | null, newVNode: VNode | string | null): PatchOp | null {
  if (oldVNode === null && newVNode === null) return null;
  if (oldVNode === null) {
    return { type: 'CREATE', vnode: newVNode as VNode };
  }
  if (newVNode === null) {
    return { type: 'REMOVE' };
  }
  if (typeof oldVNode === 'string' || typeof newVNode === 'string') {
    if (oldVNode !== newVNode) {
      return { type: 'REPLACE', vnode: newVNode as VNode };
    }
    return null;
  }
  if (oldVNode.tag !== (newVNode as VNode).tag) {
    return { type: 'REPLACE', vnode: newVNode as VNode };
  }
  return { type: 'UPDATE', props: (newVNode as VNode).props };
}

export interface IncrementalDOMInstruction {
  type: 'elementOpen' | 'elementClose' | 'text' | 'attr' | 'skip';
  tag?: string;
  key?: string;
  value?: string;
  name?: string;
}

export class IncrementalDOMCompiler {
  compile(vnode: VNode): IncrementalDOMInstruction[] {
    const instructions: IncrementalDOMInstruction[] = [];

    function walk(node: VNode | string): void {
      if (typeof node === 'string') {
        instructions.push({ type: 'text', value: node });
        return;
      }
      instructions.push({ type: 'elementOpen', tag: node.tag, key: node.key == null ? undefined : String(node.key) });
      for (const [k, v] of Object.entries(node.props)) {
        instructions.push({ type: 'attr', name: k, value: String(v) });
      }
      for (const child of node.children) {
        walk(child);
      }
      instructions.push({ type: 'elementClose', tag: node.tag });
    }

    walk(vnode);
    return instructions;
  }
}

export interface NativeDOMCost {
  createCost: number;
  insertCost: number;
  updateCost: number;
  removeCost: number;
}

export class NativeDOMCostAnalyzer {
  private cost: NativeDOMCost;

  constructor(cost?: Partial<NativeDOMCost>) {
    this.cost = {
      createCost: 0.5,
      insertCost: 0.3,
      updateCost: 0.2,
      removeCost: 0.4,
      ...cost
    };
  }

  estimateTotal(creations: number, inserts: number, updates: number, removals: number): number {
    return (
      creations * this.cost.createCost +
      inserts * this.cost.insertCost +
      updates * this.cost.updateCost +
      removals * this.cost.removeCost
    );
  }

  getCost(): NativeDOMCost {
    return { ...this.cost };
  }
}

export function demo(): void {
  console.log('=== DOM Virtualization Models Demo ===');

  const oldNode: VNode = { tag: 'div', props: { className: 'a' }, children: ['hello'] };
  const newNode: VNode = { tag: 'div', props: { className: 'b' }, children: ['world'] };
  console.log('VDOM diff result:', diff(oldNode, newNode));

  const compiler = new IncrementalDOMCompiler();
  console.log('Incremental DOM instructions:', compiler.compile(newNode));

  const analyzer = new NativeDOMCostAnalyzer();
  console.log('Estimated DOM cost:', analyzer.estimateTotal(10, 10, 5, 2));
}
