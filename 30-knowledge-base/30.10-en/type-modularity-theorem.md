# Theorem 2: Type Modularity Theorem

> **English Summary** of `10-fundamentals/10.1-language-semantics/theorems/type-modularity-theorem.md`

---

## One-Sentence Summary

When type sharing exceeds architectural health thresholds in TypeScript's structural subtyping system, the resulting high-degree nodes in the type dependency graph inevitably corrode system integrity by creating unpredictable cascade rebuilds, circular dependencies, and fear-driven development that penetrates layer boundaries.

## Key Points

- **Formal Criterion**: For a system S composed of modules {M₁, M₂, ..., Mₙ} with type dependency graph G = (V, E), if any type node v has degree deg(v) > θ_arch (architectural health threshold), Integrity(S) decreases monotonically.
- **Structural Subtyping Hazard**: Unlike nominal type systems (Java/C#) where explicit `implements` declarations make dependencies visible, TypeScript's structural subtyping allows modules to implicitly satisfy contracts, increasing dependency invisibility.
- **Monorepo Anti-Pattern**: The "@org/types" package containing all domain types is the canonical violation—creating a single high-degree node that couples frontend, backend, and shared libraries into one compilation unit.
- **Three Consequences**: Type sharing失控 produces (1) circular dependency chains, (2) unpredictable full rebuilds triggered by single-type modifications, and (3) fear-driven development where engineers avoid changing type definitions.
- **Defense in Depth**: Remediation requires domain-based package splitting, Project References for compile-time boundaries, ESLint rules against deep cross-package imports, and automated circular-dependency detection via `madge`.

## Detailed Explanation

The Type Modularity Theorem addresses a crisis that silently afflicts every large TypeScript codebase: the gradual but irreversible decay of architectural boundaries through uncontrolled type sharing. In a nominal type system such as Java or C#, a module explicitly declares its dependencies through `import` and `implements` statements; the dependency graph is therefore legible to both compilers and humans. TypeScript's structural subtyping inverts this visibility model. Module M_A can implicitly satisfy module M_B's type contract without ever importing M_B, simply by matching the required shape. This implicit compatibility is a powerful feature for rapid prototyping, but at scale it becomes an architectural liability: dependencies form invisibly, the type dependency graph grows dense and opaque, and soon a single type change in a shared package triggers compilation failures across dozens of seemingly unrelated modules.

The theorem formalizes this intuition through graph theory. Each type definition is a node; each type dependency (import, extension, or structural satisfaction) is an edge. When any node's degree exceeds the architectural health threshold θ_arch—empirically, this occurs when a shared type package is imported by more than 15-20 distinct modules—the system enters a state of **shared type失控**. The consequences follow with mechanical inevitability. First, circular dependencies emerge because high-degree nodes create dense interconnections that make acyclic packaging nearly impossible. Second, rebuild unpredictability increases: modifying one field in a shared interface triggers TypeScript's incremental compiler to re-evaluate every transitive dependent, turning what should be a localized change into a system-wide event. Third, and most culturally damaging, developers learn that type modifications are dangerous and begin treating type definitions as "read-only," effectively fossilizing the domain model and forcing workarounds that further erode type safety.

The theorem's defense strategy is architectural rather than merely technical. Splitting the monolithic `@org/types` package into domain-specific packages (`@org/orders-types`, `@org/users-types`) directly reduces node degrees. TypeScript's Project References enforce compile-time boundaries that mirror organizational boundaries. ESLint rules prohibiting deep imports (`import { foo } from '@org/users-types/internal'`) prevent implementation leakage. Automated tools like `madge --circular` provide CI-gated health checks that fail builds when new cycles are introduced. Most subtly, **brand types** (`type UserId = string & { readonly __brand: 'UserId' }`) prevent semantically distinct but structurally identical types from being silently interchangeable—a defense against the very implicit compatibility that makes structural subtyping powerful but dangerous. The theorem ultimately argues that type modularity is not an optimization to be deferred but a prerequisite for sustainable growth in any TypeScript system exceeding modest scale.

---

*English summary. Full Chinese theorem with proof tree: `../../10-fundamentals/10.1-language-semantics/theorems/type-modularity-theorem.md`*
