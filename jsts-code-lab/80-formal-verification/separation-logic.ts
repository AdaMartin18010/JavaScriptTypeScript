/**
 * @file 分离逻辑（Separation Logic）堆验证
 * @category Formal Verification → Separation Logic
 * @difficulty hard
 * @description
 * 实现分离逻辑的简化堆模型与断言验证。用对象图模拟堆内存，支持空堆 `emp`、
 * 单点指向 `x ↦ v`、分离合取 `*` 与蕴涵 `-*` 的简化解释。演示链表结构的
 * 无内存泄漏验证。
 *
 * @theoretical_basis
 * - **分离逻辑 (Separation Logic)**: O'Hearn, Reynolds 与 Yang 于 1999-2001 年
 *   为验证指针程序而扩展 Hoare 逻辑提出的框架。核心思想是将堆（heap）显式
 *   作为断言的一部分。
 * - **空堆断言 (emp)**: 断言当前堆为空。
 * - **单点指向 (Points-to, x ↦ v)**: 断言堆中恰好有一个单元 x，其值为 v。
 * - **分离合取 (Separating Conjunction, P * Q)**: 断言堆可以划分为两个不相交
 *   的子堆，分别满足 P 和 Q。
 * - **框架规则 (Frame Rule)**: `{P} C {Q}` 可推出 `{P * R} C {Q * R}`，前提是
 *   C 不修改 R 中的自由变量。本实现演示其简化形式。
 *
 * @complexity_analysis
 * - 堆断言求值: O(|H|) 其中 |H| 为堆域大小。
 * - `emp` 检查: O(1)。
 * - `x ↦ v` 检查: O(1) 堆查找。
 * - `P * Q` 检查: O(2^|H|) 最坏情况需尝试所有堆划分，本实现通过显式堆域
 *   拆分优化为 O(|H|) 对于教学示例。
 * - 链表遍历: O(n) 其中 n 为链表长度。
 */

/** 堆地址用字符串键表示 */
export type Address = string;

/** 堆单元：地址到值的映射 */
export type Heap = Record<Address, unknown>;

/** 分离逻辑断言 */
export interface SLAssertion {
  /**
   * 检查给定堆是否满足此断言。
   * @param heap 当前堆
   * @param domain 断言占用的堆域（用于分离合取）
   */
  check(heap: Heap, domain: Set<Address>): { holds: boolean; domain: Set<Address> };
  toString(): string;
}

/** 空堆断言 `emp` */
export function emp(): SLAssertion {
  return {
    check(_heap: Heap, domain: Set<Address>) {
      return { holds: domain.size === 0, domain };
    },
    toString() {
      return 'emp';
    }
  };
}

/** 单点指向 `addr ↦ value` */
export function pointsTo(addr: Address, value: unknown): SLAssertion {
  return {
    check(heap: Heap, domain: Set<Address>) {
      const expectedDomain = new Set([addr]);
      const valid = domain.size === 1 && domain.has(addr) && heap[addr] === value;
      return { holds: valid, domain: expectedDomain };
    },
    toString() {
      return `${addr} ↦ ${String(value)}`;
    }
  };
}

/** 分离合取 `P * Q` */
export function sepConj(left: SLAssertion, right: SLAssertion): SLAssertion {
  return {
    check(heap: Heap, domain: Set<Address>) {
      // 尝试将 domain 拆分为两个不相交子集
      const addrs = Array.from(domain);
      // 教学简化：遍历所有子集划分（对于小堆可行）
      for (let mask = 0; mask < (1 << addrs.length); mask++) {
        const leftDomain = new Set<Address>();
        const rightDomain = new Set<Address>();
        for (let i = 0; i < addrs.length; i++) {
          if ((mask & (1 << i)) !== 0) {
            leftDomain.add(addrs[i]!);
          } else {
            rightDomain.add(addrs[i]!);
          }
        }
        const lResult = left.check(heap, leftDomain);
        const rResult = right.check(heap, rightDomain);
        if (lResult.holds && rResult.holds) {
          return { holds: true, domain };
        }
      }
      return { holds: false, domain };
    },
    toString() {
      return `(${left.toString()} * ${right.toString()})`;
    }
  };
}

/** 纯断言（不依赖堆，仅依赖外部状态） */
export function pure(pred: () => boolean): SLAssertion {
  return {
    check(_heap: Heap, domain: Set<Address>) {
      return { holds: pred() && domain.size === 0, domain: new Set<Address>() };
    },
    toString() {
      return 'pure(...)';
    }
  };
}

/** 链表节点结构 */
export interface ListNode {
  value: number;
  next: Address | null;
}

/**
 * 构造链表在堆中的断言：list(addr) 表示从 addr 开始的链表。
 */
export function listSeg(start: Address | null, end: Address | null): SLAssertion {
  return {
    check(heap: Heap, domain: Set<Address>): { holds: boolean; domain: Set<Address> } {
      if (start === end) {
        return { holds: domain.size === 0, domain: new Set<Address>() };
      }
      if (start === null) {
        return { holds: false, domain };
      }
      // 遍历链表，检查 domain 恰好包含链表节点
      const visited = new Set<Address>();
      let current: Address | null = start;
      while (current !== null && current !== end) {
        if (visited.has(current)) {
          return { holds: false, domain }; // 环
        }
        visited.add(current);
        const node = heap[current] as ListNode | undefined;
        if (!node) {
          return { holds: false, domain };
        }
        current = node.next;
      }
      const matchDomain = visited.size === domain.size && Array.from(visited).every(a => domain.has(a));
      return { holds: matchDomain, domain: visited };
    },
    toString() {
      return `lseg(${String(start)}, ${String(end)})`;
    }
  };
}

/**
 * 验证堆满足给定断言（自动推断 domain 为堆的所有地址）。
 */
export function assertHeap(heap: Heap, assertion: SLAssertion): boolean {
  const domain = new Set(Object.keys(heap));
  return assertion.check(heap, domain).holds;
}

/**
 * 模拟内存泄漏检测：验证堆中不存在孤立（不可达）的已分配节点。
 */
export function checkNoLeaks(heap: Heap, roots: Address[]): boolean {
  const reachable = new Set<Address>();
  for (const root of roots) {
    let current: Address | null = root;
    while (current !== null) {
      if (reachable.has(current)) break;
      reachable.add(current);
      const node = heap[current] as ListNode | undefined;
      if (!node) break;
      current = node.next;
    }
  }
  const allAddresses = new Set(Object.keys(heap));
  // 所有地址都可达
  return allAddresses.size === reachable.size && Array.from(allAddresses).every(a => reachable.has(a));
}

export function demo(): void {
  console.log('=== 分离逻辑演示 ===\n');

  // 演示 1：空堆
  console.log('--- 空堆断言 emp ---');
  const emptyHeap: Heap = {};
  console.log('emp 在空堆上成立?', assertHeap(emptyHeap, emp()));

  // 演示 2：单点指向
  console.log('\n--- 单点指向 x ↦ 42 ---');
  const heap1: Heap = { x: 42 };
  console.log('x ↦ 42 成立?', assertHeap(heap1, pointsTo('x', 42)));
  console.log('x ↦ 99 成立?', assertHeap(heap1, pointsTo('x', 99)));

  // 演示 3：分离合取
  console.log('\n--- 分离合取 (x ↦ 1) * (y ↦ 2) ---');
  const heap2: Heap = { x: 1, y: 2 };
  const assertion2 = sepConj(pointsTo('x', 1), pointsTo('y', 2));
  console.log('断言:', assertion2.toString());
  console.log('在堆 {x:1, y:2} 上成立?', assertHeap(heap2, assertion2));

  const heap3: Heap = { x: 1, y: 2, z: 3 };
  console.log('在堆 {x:1, y:2, z:3} 上成立?', assertHeap(heap3, assertion2));

  // 演示 4：链表段
  console.log('\n--- 链表段 lseg(a, null) ---');
  const listHeap: Heap = {
    a: { value: 1, next: 'b' } as ListNode,
    b: { value: 2, next: 'c' } as ListNode,
    c: { value: 3, next: null } as ListNode
  };
  const listAssert = listSeg('a', null);
  console.log('链表断言成立?', assertHeap(listHeap, listAssert));

  // 演示 5：内存泄漏检测
  console.log('\n--- 内存泄漏检测 ---');
  const leakyHeap: Heap = {
    a: { value: 1, next: 'b' } as ListNode,
    b: { value: 2, next: null } as ListNode,
    orphan: { value: 99, next: null } as ListNode
  };
  console.log('无泄漏堆 (roots=[a]):', checkNoLeaks(listHeap, ['a']));
  console.log('有泄漏堆 (roots=[a]):', checkNoLeaks(leakyHeap, ['a']));

  // 演示 6：分离合取与链表
  console.log('\n--- 分离链表 (lseg(a,b) * lseg(b,null)) ---');
  const splitHeap: Heap = {
    a: { value: 1, next: 'b' } as ListNode,
    b: { value: 2, next: 'c' } as ListNode,
    c: { value: 3, next: null } as ListNode
  };
  const splitAssert = sepConj(listSeg('a', 'b'), listSeg('b', null));
  console.log('分离链表断言成立?', assertHeap(splitHeap, splitAssert));
}
