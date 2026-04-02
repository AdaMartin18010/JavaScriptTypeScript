/**
 * @file 类型安全状态机（编译时验证）
 * @category Formal Verification → Type-Level State Machine
 * @difficulty hard
 * @description
 * 使用 TypeScript 的类型系统实现编译时状态机。利用字面量类型、判别式联合、
 * 穷尽检查（exhaustiveness checking）与 branded types，确保非法状态转移在
 * 编译时被拒绝。演示 TCP 连接状态机的完整生命周期。
 *
 * @theoretical_basis
 * - **类型即证明 (Curry-Howard Correspondence)**: 在构造主义逻辑中，
 *   类型对应命题，程序对应证明。TypeScript 的类型检查器可在编译时拒绝
 *   违反规约的程序。
 * - **状态机 (Finite State Machine, FSM)**: 形式语言与自动机理论中的核心模型，
 *   由状态集合、输入字母表、转移函数、初始状态与接受状态组成。
 * - **判别式联合 (Discriminated Unions)**: 通过共享的判别字段区分不同变体，
 *   配合 switch 语句实现穷尽检查。
 * - **Branded Types / Opaque Types**: 通过交叉类型 `{ readonly __tag: unique symbol }`
 *   防止不同状态类型的值被混用。
 *
 * @complexity_analysis
 * - 类型检查：O(1) 每个状态转移在编译时由 TypeScript 类型检查器验证。
 * - 运行时开销：O(1) 仅涉及对象创建与属性访问，无额外验证逻辑。
 * - 状态空间大小：O(|S|) 状态数决定联合类型大小，不影响运行时性能。
 */

// ============================================================================
// TCP 连接状态机的类型定义
// ============================================================================

type ClosedState = { readonly tag: 'CLOSED'; readonly __brand: 'CLOSED' };
type SynSentState = { readonly tag: 'SYN_SENT'; readonly __brand: 'SYN_SENT' };
type EstablishedState = { readonly tag: 'ESTABLISHED'; readonly __brand: 'ESTABLISHED' };
type FinWait1State = { readonly tag: 'FIN_WAIT_1'; readonly __brand: 'FIN_WAIT_1' };
type FinWait2State = { readonly tag: 'FIN_WAIT_2'; readonly __brand: 'FIN_WAIT_2' };
type TimeWaitState = { readonly tag: 'TIME_WAIT'; readonly __brand: 'TIME_WAIT' };

/** TCP 连接的所有可能状态 */
export type TCPState =
  | ClosedState
  | SynSentState
  | EstablishedState
  | FinWait1State
  | FinWait2State
  | TimeWaitState;

/** TCP 事件/动作 */
export type TCPAction =
  | { type: 'ACTIVE_OPEN' }
  | { type: 'PASSIVE_OPEN' }
  | { type: 'SYN_ACK' }
  | { type: 'CLOSE' }
  | { type: 'FIN' }
  | { type: 'ACK' }
  | { type: 'TIMEOUT' };

// ============================================================================
// 状态构造器（工厂函数）
// ============================================================================

export const TCPStates = {
  closed(): ClosedState {
    return { tag: 'CLOSED', __brand: 'CLOSED' };
  },
  synSent(): SynSentState {
    return { tag: 'SYN_SENT', __brand: 'SYN_SENT' };
  },
  established(): EstablishedState {
    return { tag: 'ESTABLISHED', __brand: 'ESTABLISHED' };
  },
  finWait1(): FinWait1State {
    return { tag: 'FIN_WAIT_1', __brand: 'FIN_WAIT_1' };
  },
  finWait2(): FinWait2State {
    return { tag: 'FIN_WAIT_2', __brand: 'FIN_WAIT_2' };
  },
  timeWait(): TimeWaitState {
    return { tag: 'TIME_WAIT', __brand: 'TIME_WAIT' };
  }
};

// ============================================================================
// 类型安全的状态转移函数
// 每个函数签名显式限制输入状态与输出状态，非法转移在编译时被拒绝。
// ============================================================================

export function activeOpen(state: ClosedState): SynSentState {
  return TCPStates.synSent();
}

export function passiveOpen(state: ClosedState): ClosedState {
  // 简化：被动打开后仍等待 SYN（为教学保持状态机在有限状态内）
  return TCPStates.closed();
}

export function receiveSynAck(state: SynSentState): EstablishedState {
  return TCPStates.established();
}

export function closeFromEstablished(state: EstablishedState): FinWait1State {
  return TCPStates.finWait1();
}

export function receiveFin(state: FinWait1State): FinWait2State {
  return TCPStates.finWait2();
}

export function receiveAck(state: FinWait1State): FinWait2State {
  return TCPStates.finWait2();
}

export function timeout(state: FinWait2State): TimeWaitState {
  return TCPStates.timeWait();
}

export function finalTimeout(state: TimeWaitState): ClosedState {
  return TCPStates.closed();
}

// ============================================================================
// 穷尽检查的 reducer（运行时演示）
// ============================================================================

/**
 * 编译时安全的状态机 reducer。
 * 由于 TypeScript 的穷尽检查，若遗漏任何状态分支，编译将报错。
 */
export function tcpReducer(state: TCPState, action: TCPAction): TCPState {
  switch (state.tag) {
    case 'CLOSED': {
      if (action.type === 'ACTIVE_OPEN') return activeOpen(state);
      if (action.type === 'PASSIVE_OPEN') return passiveOpen(state);
      throw new Error(`Invalid action ${action.type} for CLOSED`);
    }
    case 'SYN_SENT': {
      if (action.type === 'SYN_ACK') return receiveSynAck(state);
      throw new Error(`Invalid action ${action.type} for SYN_SENT`);
    }
    case 'ESTABLISHED': {
      if (action.type === 'CLOSE') return closeFromEstablished(state);
      throw new Error(`Invalid action ${action.type} for ESTABLISHED`);
    }
    case 'FIN_WAIT_1': {
      if (action.type === 'FIN') return receiveFin(state);
      if (action.type === 'ACK') return receiveAck(state);
      throw new Error(`Invalid action ${action.type} for FIN_WAIT_1`);
    }
    case 'FIN_WAIT_2': {
      if (action.type === 'TIMEOUT') return timeout(state);
      throw new Error(`Invalid action ${action.type} for FIN_WAIT_2`);
    }
    case 'TIME_WAIT': {
      if (action.type === 'TIMEOUT') return finalTimeout(state);
      throw new Error(`Invalid action ${action.type} for TIME_WAIT`);
    }
    default:
      // 穷尽检查保障：若新增状态而未处理，此处将产生编译错误
      return assertNever(state);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

// ============================================================================
// 非法转移将在编译时被拒绝的示例（注释掉的代码用于教学说明）
// ============================================================================

// @ts-expect-error 非法转移：不能从 CLOSED 直接 CLOSE
const _illegal1 = closeFromEstablished(TCPStates.closed());

// @ts-expect-error 非法转移：不能从 ESTABLISHED 直接 TIMEOUT
const _illegal2 = timeout(TCPStates.established());

// ============================================================================
// 演示
// ============================================================================

export function demo(): void {
  console.log('=== 类型安全状态机（TCP）演示 ===\n');

  // 合法的状态转移序列
  console.log('--- 合法的 TCP 握手与挥手序列 ---');
  let state: TCPState = TCPStates.closed();
  console.log('初始状态:', state.tag);

  state = tcpReducer(state, { type: 'ACTIVE_OPEN' });
  console.log('ACTIVE_OPEN ->', state.tag);

  state = tcpReducer(state, { type: 'SYN_ACK' });
  console.log('SYN_ACK ->', state.tag);

  state = tcpReducer(state, { type: 'CLOSE' });
  console.log('CLOSE ->', state.tag);

  state = tcpReducer(state, { type: 'ACK' });
  console.log('ACK ->', state.tag);

  state = tcpReducer(state, { type: 'TIMEOUT' });
  console.log('TIMEOUT ->', state.tag);

  state = tcpReducer(state, { type: 'TIMEOUT' });
  console.log('TIMEOUT ->', state.tag);

  console.log('\n--- 编译时非法转移检测 ---');
  console.log('以下代码在编译时会被拒绝（查看源码中的 @ts-expect-error 注释）：');
  console.log('- closeFromEstablished(ClosedState) → 编译错误');
  console.log('- timeout(EstablishedState) → 编译错误');
}
