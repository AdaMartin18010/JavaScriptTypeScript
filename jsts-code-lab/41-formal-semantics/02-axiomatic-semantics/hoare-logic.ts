/**
 * @file hoare-logic.ts
 * @category Formal Semantics → Axiomatic
 * @difficulty hard
 * @theoretical_basis Hoare logic, weakest precondition
 * @references
 *   1. C. A. R. Hoare. An Axiomatic Basis for Computer Programming. 1969.
 */

export interface Predicate {
  describe(): string
  implies(other: Predicate): boolean
}

export class AtomicPredicate implements Predicate {
  constructor(public text: string) {}
  describe(): string { return this.text; }
  implies(other: Predicate): boolean {
    return this.text === other.describe();
  }
}

export interface Command {
  kind: 'skip' | 'assign' | 'seq' | 'if' | 'while'
}

export interface SkipCmd extends Command { kind: 'skip' }
export interface AssignCmd extends Command { kind: 'assign'; var: string; expr: string }
export interface SeqCmd extends Command { kind: 'seq'; first: Command; second: Command }

export const skip: SkipCmd = { kind: 'skip' };
export const assign = (v: string, e: string): AssignCmd => ({ kind: 'assign', var: v, expr: e });
export const seq = (first: Command, second: Command): SeqCmd => ({ kind: 'seq', first, second });

export interface HoareTriple {
  pre: Predicate
  command: Command
  post: Predicate
}

export function hoareTriple(pre: Predicate, command: Command, post: Predicate): HoareTriple {
  return { pre, command, post };
}

// Simplified weakest precondition for assignment: wp(x := e, Q) = Q[x/e]
export function wp(command: Command, post: Predicate): Predicate {
  switch (command.kind) {
    case 'skip':
      return post;
    case 'assign':
      return new AtomicPredicate(`(${post.describe()})[${command.var}/${command.expr}]`);
    case 'seq': {
      const wpSecond = wp(command.second, post);
      return wp(command.first, wpSecond);
    }
    default:
      return new AtomicPredicate(`wp(${JSON.stringify(command)}, ${post.describe()})`);
  }
}

export function tripleToString(t: HoareTriple): string {
  return `{ ${t.pre.describe()} } ${JSON.stringify(t.command)} { ${t.post.describe()} }`;
}
