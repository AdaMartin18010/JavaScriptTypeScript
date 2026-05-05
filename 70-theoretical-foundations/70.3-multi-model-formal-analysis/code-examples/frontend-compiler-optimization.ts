/**
 * 前端框架编译时优化的形式化分析 —— 配套可运行代码示例
 * Frontend Compiler Optimization Formal Analysis - Runnable Code Examples
 *
 * 涵盖：
 * 1. Svelte $$invalidate 位掩码调度器语义
 * 2. Vue 3 静态提升与 PatchFlag 位运算
 * 3. Vue 3 Block Tree 动态子节点追踪
 * 4. React Compiler 自动 memoization 语义模拟
 * 5. Solid 细粒度信号订阅与编译模型
 * 6. RSC Payload 流式序列化协议
 * 7. 框架更新策略复杂度基准测试框架
 */

// ============================================================================
// 示例 1: Svelte $$invalidate 的位掩码调度器语义
// ============================================================================

/**
 * 模拟 Svelte 编译器生成的状态更新调度系统。
 * 核心思想：每个响应式变量分配一个位掩码位，通过位运算判断是否需要更新。
 */
export function createInvalidateScheduler(ctxSize: number) {
  let dirty = 0; // 位掩码：第 i 位表示第 i 个状态变量是否脏
  let scheduled = false;
  const context: any[] = new Array(ctxSize);

  const flushCallbacks: ((ctx: any[], dirtyMask: number) => void)[] = [];

  function flush() {
    scheduled = false;
    const currentDirty = dirty;
    dirty = 0;
    for (const cb of flushCallbacks) {
      cb(context, currentDirty);
    }
  }

  return {
    context,
    registerFlush(cb: (ctx: any[], dirtyMask: number) => void) {
      flushCallbacks.push(cb);
    },
    invalidate(bit: number, newValue: any) {
      context[bit] = newValue;
      dirty |= (1 << bit);
      if (!scheduled) {
        scheduled = true;
        Promise.resolve().then(flush);
      }
    },
    isDirty(bit: number) {
      return (dirty & (1 << bit)) !== 0;
    },
    get dirtyMask() {
      return dirty;
    }
  };
}

// 使用演示
export function demoSvelteInvalidation() {
  const scheduler = createInvalidateScheduler(2);

  // 模拟编译器生成的更新函数
  scheduler.registerFlush((ctx, mask) => {
    if (mask & 1) console.log(`count updated: ${ctx[0]}`);
    if (mask & 2) console.log(`doubled updated: ${ctx[1]}`);
  });

  scheduler.invalidate(0, 5);   // 更新 count
  scheduler.invalidate(1, 10);  // 更新 doubled
  // 微任务批处理将在下一个 tick 执行 flush
}

// ============================================================================
// 示例 2: Vue 3 PatchFlag 位运算语义与比对投影
// ============================================================================

export const PatchFlags = {
  TEXT: 1,
  CLASS: 2,
  STYLE: 4,
  PROPS: 8,
  FULL_PROPS: 16,
  HYDRATE_EVENTS: 32,
  STABLE_FRAGMENT: 64,
  KEYED_FRAGMENT: 128,
  UNKEYED_FRAGMENT: 256,
  NEED_PATCH: 512,
  DYNAMIC_SLOTS: 1024,
} as const;

export interface VNode {
  tag: string;
  props: Record<string, any> | null;
  children: VNode[] | string | null;
  patchFlag: number;
  dynamicProps?: string[];
  dynamicChildren?: VNode[];
}

/**
 * 模拟 Vue 3 运行时基于 patchFlag 的优化比对逻辑。
 * 仅比对编译器标记为动态的属性，跳过静态内容。
 */
export function patchElementOptimized(
  oldVNode: VNode,
  newVNode: VNode
): string[] {
  const operations: string[] = [];

  if (newVNode.patchFlag === 0) {
    // 完全静态，跳过
    return operations;
  }

  if (newVNode.patchFlag & PatchFlags.TEXT) {
    if (oldVNode.children !== newVNode.children) {
      operations.push(`SET_TEXT: ${newVNode.children}`);
    }
  }

  if (newVNode.patchFlag & PatchFlags.PROPS) {
    const propsToCheck = newVNode.dynamicProps || [];
    for (const key of propsToCheck) {
      if (oldVNode.props?.[key] !== newVNode.props?.[key]) {
        operations.push(`SET_PROP(${key}): ${newVNode.props?.[key]}`);
      }
    }
  }

  if (newVNode.patchFlag & PatchFlags.FULL_PROPS) {
    const allKeys = new Set([
      ...Object.keys(oldVNode.props || {}),
      ...Object.keys(newVNode.props || {})
    ]);
    for (const key of allKeys) {
      if (oldVNode.props?.[key] !== newVNode.props?.[key]) {
        operations.push(`FULL_SET_PROP(${key}): ${newVNode.props?.[key]}`);
      }
    }
  }

  return operations;
}

// ============================================================================
// 示例 3: Vue 3 Block Tree 动态子节点追踪
// ============================================================================

/**
 * Block Tree 的核心：将动态子节点收集到扁平数组中，diff 时跳过静态子树。
 */
export function createBlock(vnode: VNode): VNode {
  return { ...vnode, dynamicChildren: [] };
}

export function trackDynamicChild(block: VNode, child: VNode) {
  if (!block.dynamicChildren) block.dynamicChildren = [];
  if (child.patchFlag > 0 || child.dynamicChildren) {
    block.dynamicChildren.push(child);
  }
}

export function patchBlockChildren(oldBlock: VNode, newBlock: VNode): string[] {
  const operations: string[] = [];
  const oldChildren = oldBlock.dynamicChildren || [];
  const newChildren = newBlock.dynamicChildren || [];

  const len = Math.min(oldChildren.length, newChildren.length);
  for (let i = 0; i < len; i++) {
    const ops = patchElementOptimized(oldChildren[i], newChildren[i]);
    operations.push(...ops);
  }

  if (newChildren.length > oldChildren.length) {
    operations.push(`INSERT ${newChildren.length - oldChildren.length} new nodes`);
  } else if (oldChildren.length > newChildren.length) {
    operations.push(`REMOVE ${oldChildren.length - newChildren.length} old nodes`);
  }

  return operations;
}

// ============================================================================
// 示例 4: React Compiler 自动 memoization 语义模拟
// ============================================================================

export type MemoCache = Map<string, { deps: any[]; value: any }>;

/**
 * 模拟 React Compiler 自动注入的记忆化机制。
 * 编译器基于值流图自动推导依赖数组，无需开发者手动维护。
 */
export function createAutoMemoizer() {
  const cache: MemoCache = new Map();

  return function autoMemo<T>(
    key: string,
    factory: () => T,
    deps: any[]
  ): T {
    const entry = cache.get(key);
    if (entry && deps.length === entry.deps.length) {
      let same = true;
      for (let i = 0; i < deps.length; i++) {
        if (!Object.is(deps[i], entry.deps[i])) {
          same = false;
          break;
        }
      }
      if (same) return entry.value;
    }
    const value = factory();
    cache.set(key, { deps, value });
    return value;
  };
}

// 编译器自动转换后的组件概念模型
export function compiledComponentAutoMemoized(props: { a: number; b: number }) {
  const memoizer = createAutoMemoizer();

  const result = memoizer('compute_result', () => props.a + props.b, [
    props.a,
    props.b,
  ]);

  const handler = memoizer('handler', () => () => console.log(props.a), [
    props.a,
  ]);

  return { result, handler };
}

// ============================================================================
// 示例 5: Solid 细粒度信号订阅编译模型
// ============================================================================

export interface Signal<T> {
  get value(): T;
  set value(v: T);
  subscribe(fn: (v: T) => void): () => void;
}

export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;
  const subscribers = new Set<(v: T) => void>();
  return {
    get value() {
      return value;
    },
    set value(v) {
      if (value !== v) {
        value = v;
        subscribers.forEach((fn) => fn(v));
      }
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}

/**
 * 模拟 Solid JSX 编译后的细粒度 DOM 更新。
 * 每个信号读取点编译为独立的订阅，更新时直接修改目标节点。
 */
export function createSolidTextBinding(
  parent: Node,
  accessor: () => any,
  marker: Node | null = null
): { textNode: Text; unsubscribe: () => void } {
  const textNode = document.createTextNode('');
  parent.insertBefore(textNode, marker);

  // 在真实 Solid 中，依赖追踪是自动的（通过读取时的上下文捕获）
  // 此处为教学演示的简化模型
  textNode.textContent = String(accessor());

  return {
    textNode,
    unsubscribe: () => {
      /* 清理逻辑 */
    },
  };
}

export function demoSolidGranularUpdate() {
  const count = createSignal(0);
  const div = document.createElement('div');

  const binding = createSolidTextBinding(div, () => count.value);

  // 模拟外部更新：直接触发 DOM 修改，无 VDOM 无 diff
  const interval = setInterval(() => {
    count.value += 1;
    binding.textNode.textContent = String(count.value);
    if (count.value >= 5) clearInterval(interval);
  }, 100);

  return div;
}

// ============================================================================
// 示例 6: RSC Payload 流式序列化协议
// ============================================================================

export type RSCNode =
  | { type: 'html'; value: string }
  | { type: 'component'; id: string; props: Record<string, any> }
  | {
      type: 'client-reference';
      moduleId: string;
      exportName: string;
      props: Record<string, any>;
    }
  | { type: 'suspense'; fallback: RSCNode; children: RSCNode[] }
  | { type: 'text'; value: string };

/**
 * 服务器：将组件树序列化为行协议。
 * 服务器组件被内联；客户端组件转为模块引用。
 */
export function serializeRSCStream(tree: RSCNode[]): string {
  const lines: string[] = [];
  for (const node of tree) {
    switch (node.type) {
      case 'component':
        lines.push(`M:${JSON.stringify([node.id, node.props])}`);
        break;
      case 'client-reference':
        lines.push(
          `C:${JSON.stringify([
            node.moduleId,
            node.exportName,
            node.props,
          ])}`
        );
        break;
      case 'suspense':
        lines.push(`S:${JSON.stringify(node.fallback)}`);
        lines.push(...serializeRSCStream(node.children).split('\n'));
        lines.push('E:SUSPENSE');
        break;
      case 'text':
        lines.push(`T:${JSON.stringify(node.value)}`);
        break;
      case 'html':
        lines.push(`H:${JSON.stringify(node.value)}`);
        break;
    }
  }
  return lines.join('\n');
}

/**
 * 客户端：解析 RSC Payload 并重建组件树。
 */
export function parseRSCStream(stream: string): RSCNode[] {
  const nodes: RSCNode[] = [];
  const lines = stream.split('\n');
  for (const line of lines) {
    if (line.startsWith('M:')) {
      const [, payload] = line.split(':', 2);
      const [id, props] = JSON.parse(payload);
      nodes.push({ type: 'component', id, props });
    } else if (line.startsWith('C:')) {
      const [, payload] = line.split(':', 2);
      const [moduleId, exportName, props] = JSON.parse(payload);
      nodes.push({ type: 'client-reference', moduleId, exportName, props });
    } else if (line.startsWith('T:')) {
      const [, payload] = line.split(':', 2);
      nodes.push({ type: 'text', value: JSON.parse(payload) });
    } else if (line.startsWith('H:')) {
      const [, payload] = line.split(':', 2);
      nodes.push({ type: 'html', value: JSON.parse(payload) });
    }
  }
  return nodes;
}

// ============================================================================
// 示例 7: 框架更新策略复杂度基准测试框架
// ============================================================================

export interface FrameworkBenchmark {
  name: string;
  setup(nodeCount: number): void;
  update(targetIndex: number): number; // 返回耗时 ms
  teardown(): void;
}

/**
 * 运行复杂度基准测试，验证理论预测：
 * - React 传统: time ∝ n（全树 diff）
 * - Vue 3 Block: time ∝ |dynamic|（跳过静态子树）
 * - Solid/Svelte: time ∝ 1（直接更新，与 n 无关）
 */
export function runComplexityBenchmark(
  frameworks: FrameworkBenchmark[],
  nodeCounts: number[]
): Record<string, { n: number; time: number }[]> {
  const results: Record<string, { n: number; time: number }[]> = {};

  for (const fw of frameworks) {
    results[fw.name] = [];
    for (const n of nodeCounts) {
      fw.setup(n);
      const t0 = performance.now();
      fw.update(0); // 仅更新第 0 个节点
      const t1 = performance.now();
      results[fw.name].push({ n, time: t1 - t0 });
      fw.teardown();
    }
  }

  return results;
}

// 概念性基准实现（用于教学演示，非真实框架实现）
export function createMockBenchmarks(): FrameworkBenchmark[] {
  let nodes: any[] = [];

  return [
    {
      name: 'Mock-React-VDOM',
      setup(n) {
        nodes = new Array(n).fill(null).map((_, i) => ({ id: i, text: `node-${i}` }));
      },
      update(targetIndex) {
        // 模拟全树 diff：遍历所有节点
        for (let i = 0; i < nodes.length; i++) {
          if (i === targetIndex) nodes[i].text = 'updated';
        }
        return nodes.length; // 工作量与 n 成正比
      },
      teardown() {
        nodes = [];
      },
    },
    {
      name: 'Mock-Svelte-Direct',
      setup(n) {
        nodes = new Array(n).fill(null).map((_, i) => ({ id: i, text: `node-${i}` }));
      },
      update(targetIndex) {
        // 直接更新目标节点，工作量与 n 无关
        nodes[targetIndex].text = 'updated';
        return 1; // 常数工作量
      },
      teardown() {
        nodes = [];
      },
    },
  ];
}
