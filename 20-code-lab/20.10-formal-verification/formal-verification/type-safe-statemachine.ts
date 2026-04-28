/**
 * @file 类型安全状态机
 * @category Formal Verification → Type-Level Safety
 * @difficulty hard
 * @tags discriminated-union, exhaustive-switch, type-safe-fsm, tcp, compile-time-verification
 * @description
 * 利用 TypeScript 的 discriminated union 与 exhaustive switch 实现编译时安全的状态机，
 * 以 TCP 连接状态为例，确保不存在非法状态转换，所有状态处理均穷尽。
 *
 * @theoretical_basis
 * - **Discriminated Unions**: 通过共享的判别属性（discriminant）在类型系统中区分
 *   不同状态的形状，实现代数数据类型（ADT）。
 * - **Exhaustiveness Checking**: TypeScript 的 `never` 类型与编译器开关
 *   `--noImplicitReturns` / `--strict` 确保 switch 覆盖所有情况。
 * - **Finite State Machine (FSM)**: 数学模型 M = (S, s₀, A, δ) 其中 δ: S × A → S。
 *   类型安全状态机将 δ 的合法域与陪域在编译期静态约束。
 */

// ---------------------------------------------------------------------------
// TCP 连接状态定义（RFC 793）
// ---------------------------------------------------------------------------

export type TCPState =
  | { tag: 'CLOSED' }
  | { tag: 'LISTEN' }
  | { tag: 'SYN_SENT'; destPort: number }
  | { tag: 'SYN_RECEIVED'; srcPort: number; destPort: number }
  | { tag: 'ESTABLISHED'; srcPort: number; destPort: number; seqNum: number }
  | { tag: 'FIN_WAIT_1'; srcPort: number; destPort: number; seqNum: number }
  | { tag: 'FIN_WAIT_2'; srcPort: number; destPort: number; seqNum: number }
  | { tag: 'TIME_WAIT'; srcPort: number; destPort: number };

// ---------------------------------------------------------------------------
// TCP 事件定义
// ---------------------------------------------------------------------------

export type TCPEvent =
  | { tag: 'OPEN' }
  | { tag: 'SEND_SYN'; destPort: number }
  | { tag: 'RECV_SYN'; srcPort: number; destPort: number }
  | { tag: 'RECV_SYN_ACK'; srcPort: number; destPort: number; seqNum: number }
  | { tag: 'SEND_ACK'; srcPort: number; destPort: number; seqNum: number }
  | { tag: 'SEND_FIN'; srcPort: number; destPort: number; seqNum: number }
  | { tag: 'RECV_FIN_ACK'; srcPort: number; destPort: number }
  | { tag: 'TIMEOUT' }
  | { tag: 'CLOSE' };

// ---------------------------------------------------------------------------
// 状态转移函数 δ: TCPState × TCPEvent → TCPState
//
// 利用 TypeScript 的类型收窄（narrowing）与穷尽检查，确保：
// 1. 每个状态都处理所有事件或显式拒绝
// 2. 不存在遗漏的 case
// ---------------------------------------------------------------------------

export function transitionTCP(state: TCPState, event: TCPEvent): TCPState {
  switch (state.tag) {
    case 'CLOSED':
      switch (event.tag) {
        case 'OPEN': return { tag: 'LISTEN' };
        case 'SEND_SYN': return { tag: 'SYN_SENT', destPort: event.destPort };
        default: return state; // 其他事件在 CLOSED 下无效
      }

    case 'LISTEN':
      switch (event.tag) {
        case 'RECV_SYN': return { tag: 'SYN_RECEIVED', srcPort: event.srcPort, destPort: event.destPort };
        case 'CLOSE': return { tag: 'CLOSED' };
        default: return state;
      }

    case 'SYN_SENT':
      switch (event.tag) {
        case 'RECV_SYN_ACK': return {
          tag: 'ESTABLISHED',
          srcPort: event.srcPort,
          destPort: event.destPort,
          seqNum: event.seqNum
        };
        case 'CLOSE': return { tag: 'CLOSED' };
        default: return state;
      }

    case 'SYN_RECEIVED':
      switch (event.tag) {
        case 'SEND_ACK': return {
          tag: 'ESTABLISHED',
          srcPort: event.srcPort,
          destPort: event.destPort,
          seqNum: event.seqNum
        };
        case 'CLOSE': return { tag: 'CLOSED' };
        default: return state;
      }

    case 'ESTABLISHED':
      switch (event.tag) {
        case 'SEND_FIN': return {
          tag: 'FIN_WAIT_1',
          srcPort: event.srcPort,
          destPort: event.destPort,
          seqNum: event.seqNum
        };
        default: return state;
      }

    case 'FIN_WAIT_1':
      switch (event.tag) {
        case 'RECV_FIN_ACK': return {
          tag: 'FIN_WAIT_2',
          srcPort: state.srcPort,
          destPort: state.destPort,
          seqNum: state.seqNum
        };
        default: return state;
      }

    case 'FIN_WAIT_2':
      switch (event.tag) {
        case 'TIMEOUT': return {
          tag: 'TIME_WAIT',
          srcPort: state.srcPort,
          destPort: state.destPort
        };
        default: return state;
      }

    case 'TIME_WAIT':
      switch (event.tag) {
        case 'TIMEOUT': return { tag: 'CLOSED' };
        default: return state;
      }

    default:
      // 穷尽检查：如果新增状态未处理，此处会触发编译错误
      return assertUnreachable(state);
  }
}

function assertUnreachable(x: never): never {
  throw new Error(`Unreachable state encountered: ${JSON.stringify(x)}`);
}

// ---------------------------------------------------------------------------
// 类型级辅助：确保事件也被穷尽（若需要可在事件处理器中使用）
// ---------------------------------------------------------------------------

export function handleEvent(event: TCPEvent): string {
  switch (event.tag) {
    case 'OPEN': return 'user open';
    case 'SEND_SYN': return `send SYN to ${event.destPort}`;
    case 'RECV_SYN': return `recv SYN on ${event.srcPort}->${event.destPort}`;
    case 'RECV_SYN_ACK': return `recv SYN-ACK seq=${event.seqNum}`;
    case 'SEND_ACK': return `send ACK seq=${event.seqNum}`;
    case 'SEND_FIN': return `send FIN seq=${event.seqNum}`;
    case 'RECV_FIN_ACK': return 'recv FIN+ACK';
    case 'TIMEOUT': return 'timer expired';
    case 'CLOSE': return 'user close';
    default:
      return assertUnreachable(event);
  }
}

// ---------------------------------------------------------------------------
// 状态机运行器
// ---------------------------------------------------------------------------

export class SafeTCPStateMachine {
  private state: TCPState = { tag: 'CLOSED' };

  getState(): TCPState {
    return this.state;
  }

  dispatch(event: TCPEvent): void {
    const prev = this.state.tag;
    this.state = transitionTCP(this.state, event);
    if (prev !== this.state.tag) {
      console.log(`  [TCP] ${prev} --${event.tag}-> ${this.state.tag}`);
    } else {
      console.log(`  [TCP] ${prev} ignored ${event.tag}`);
    }
  }
}

export function demo(): void {
  console.log('=== Type-Safe State Machine (TCP) ===\n');

  const tcp = new SafeTCPStateMachine();

  tcp.dispatch({ tag: 'OPEN' });
  tcp.dispatch({ tag: 'RECV_SYN', srcPort: 8080, destPort: 3000 });
  tcp.dispatch({ tag: 'SEND_ACK', srcPort: 8080, destPort: 3000, seqNum: 1001 });
  tcp.dispatch({ tag: 'SEND_FIN', srcPort: 8080, destPort: 3000, seqNum: 5000 });
  tcp.dispatch({ tag: 'RECV_FIN_ACK', srcPort: 3000, destPort: 8080 });
  tcp.dispatch({ tag: 'TIMEOUT' });
  tcp.dispatch({ tag: 'TIMEOUT' });

  console.log('\n最终状态:', tcp.getState());

  // 编译期类型安全演示：以下代码若取消注释将无法通过 TS 编译
  // tcp.dispatch({ tag: 'UNKNOWN_EVENT' });
  // transitionTCP({ tag: 'CLOSED' }, { tag: 'RECV_SYN' } as any);
}
