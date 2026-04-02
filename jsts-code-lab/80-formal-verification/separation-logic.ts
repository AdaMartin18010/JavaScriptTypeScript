/**
 * @file 分离逻辑
 * @category Formal Verification → Separation Logic
 * @difficulty hard
 * @tags separation-logic, separating-conjunction, heap, pointer, frame-rule, hoare-triple
 * @description
 * 分离逻辑（Separation Logic）基础教学实现，演示 separating conjunction (*)、
 * empty heap (emp) 以及 Frame Rule 在堆操作验证中的应用。
 *
 * @theoretical_basis
 * - **Separation Logic**: Reynolds, O'Hearn 与 Ishtiaq 于 2000 年左右独立提出，
 *   扩展 Hoare 逻辑以支持对可变堆（mutable heap）的局部推理。
 * - **Separating Conjunction (P * Q)**: 断言堆可以划分为两个不相交的部分，
 *   分别满足 P 和 Q。关键性质是 * 的交换律、结合律以及 emp 的幺元性。
 * - **Frame Rule**: {P} C {Q} ⊢ {P * R} C {Q * R}，前提是 C 不修改 R 涉及的地址。
 *   该规则使得局部验证可以在更大上下文中复用，是分离逻辑的核心优势。
 */

// ---------------------------------------------------------------------------
// 极简堆模型
// ---------------------------------------------------------------------------

export type Heap = Map<number, number>;

export interface HeapAssertion {
  /**
   * 检查给定的堆子集（domain）是否满足该断言
   */
  holds(heap: Heap): boolean;

  /**
   * 返回该断言所需的堆地址集合（近似）
   */
  footprint(): Set<number>;

  toString(): string;
}

// ---------------------------------------------------------------------------
// 原子断言：指向断言 x ↦ v
// ---------------------------------------------------------------------------

export function pointsTo(address: number, value: number): HeapAssertion {
  return {
    holds(heap) {
      return heap.get(address) === value;
    },
    footprint() {
      return new Set([address]);
    },
    toString() {
      return `${address} ↦ ${value}`;
    }
  };
}

// ---------------------------------------------------------------------------
// emp：空堆断言
// ---------------------------------------------------------------------------

export const emp: HeapAssertion = {
  holds(heap) {
    return heap.size === 0;
  },
  footprint() {
    return new Set();
  },
  toString() {
    return 'emp';
  }
};

// ---------------------------------------------------------------------------
// 分离合取 P * Q
// ---------------------------------------------------------------------------

export function sepConj(left: HeapAssertion, right: HeapAssertion): HeapAssertion {
  return {
    holds(heap) {
      // 尝试将 heap 划分为两部分，分别满足 left 和 right
      const leftFoot = left.footprint();
      const rightFoot = right.footprint();
      // 快速检查：地址不交叠
      for (const addr of leftFoot) {
        if (rightFoot.has(addr)) return false;
      }
      // 构造子堆
      const leftHeap = new Map<number, number>();
      const rightHeap = new Map<number, number>();
      for (const [k, v] of heap.entries()) {
        if (leftFoot.has(k)) leftHeap.set(k, v);
        if (rightFoot.has(k)) rightHeap.set(k, v);
      }
      return left.holds(leftHeap) && right.holds(rightHeap);
    },
    footprint() {
      const result = new Set(left.footprint());
      for (const addr of right.footprint()) {
        result.add(addr);
      }
      return result;
    },
    toString() {
      return `(${left.toString()} * ${right.toString()})`;
    }
  };
}

// ---------------------------------------------------------------------------
// 纯断言（pure assertion）：不依赖堆，仅依赖变量值
// ---------------------------------------------------------------------------

export function pure(predicate: () => boolean, label: string): HeapAssertion {
  return {
    holds() {
      return predicate();
    },
    footprint() {
      return new Set();
    },
    toString() {
      return label;
    }
  };
}

// ---------------------------------------------------------------------------
// 堆操作与验证
// ---------------------------------------------------------------------------

export function readHeap(heap: Heap, address: number): number {
  const value = heap.get(address);
  if (value === undefined) {
    throw new Error(`Heap read error: address ${address} not allocated`);
  }
  return value;
}

export function writeHeap(heap: Heap, address: number, value: number): Heap {
  if (!heap.has(address)) {
    throw new Error(`Heap write error: address ${address} not allocated`);
  }
  const newHeap = new Map(heap);
  newHeap.set(address, value);
  return newHeap;
}

export function allocateHeap(heap: Heap, address: number, value: number): Heap {
  const newHeap = new Map(heap);
  newHeap.set(address, value);
  return newHeap;
}

// ---------------------------------------------------------------------------
// 分离逻辑的 Hoare 三元组（运行时模拟）
// ---------------------------------------------------------------------------

export interface SepHoareTriple {
  pre: HeapAssertion;
  command: (heap: Heap) => Heap;
  post: HeapAssertion;
}

export function verifySeparation(triple: SepHoareTriple, initialHeap: Heap): boolean {
  if (!triple.pre.holds(initialHeap)) {
    throw new Error('Separation logic precondition failed');
  }
  const finalHeap = triple.command(initialHeap);
  if (!triple.post.holds(finalHeap)) {
    throw new Error('Separation logic postcondition failed');
  }
  return true;
}

// ---------------------------------------------------------------------------
// 演示：链表节点的局部修改（Frame Rule 思想）
// ---------------------------------------------------------------------------

export function demo(): void {
  console.log('=== Separation Logic ===\n');

  // 初始堆：地址 10 ↦ 100, 地址 20 ↦ 200
  let heap = new Map<number, number>();
  heap = allocateHeap(heap, 10, 100);
  heap = allocateHeap(heap, 20, 200);

  // 断言：10 ↦ 100 * 20 ↦ 200
  const assertion = sepConj(pointsTo(10, 100), pointsTo(20, 200));
  console.log('Assertion:', assertion.toString());
  console.log('Holds on initial heap:', assertion.holds(heap));

  // 命令：将地址 10 的值改为 150
  // 局部规范：{10 ↦ 100} write(10, 150) {10 ↦ 150}
  const localTriple: SepHoareTriple = {
    pre: pointsTo(10, 100),
    command: h => writeHeap(h, 10, 150),
    post: pointsTo(10, 150)
  };

  // Frame Rule：在局部规范上叠加不变部分 20 ↦ 200
  const framedTriple: SepHoareTriple = {
    pre: sepConj(pointsTo(10, 100), pointsTo(20, 200)),
    command: h => writeHeap(h, 10, 150),
    post: sepConj(pointsTo(10, 150), pointsTo(20, 200))
  };

  console.log('\nLocal triple verified:', verifySeparation(localTriple, new Map([[10, 100]])));
  console.log('Framed triple verified:', verifySeparation(framedTriple, heap));

  // emp 演示
  console.log('\nemp holds on empty heap:', emp.holds(new Map()));
  console.log('emp does not hold on non-empty heap:', !emp.holds(new Map([[1, 2]])));

  // 纯断言演示
  const pureAssert = pure(() => 2 + 2 === 4, '2+2=4');
  console.log('Pure assertion holds:', pureAssert.holds(new Map()));
}
