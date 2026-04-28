# Rust Unified Toolchain Migration

> **English Summary** of `20-code-lab/20.11-rust-toolchain/README.md` and `30-knowledge-base/30.3-comparison-matrices/build-tools-compare.md`

---

## One-Sentence Summary

The Rust-rewritten JavaScript toolchain—encompassing Oxc, Rspack, Rolldown, and Biome—delivers order-of-magnitude performance improvements over legacy JavaScript-based tools while maintaining configuration compatibility, making 2026 the inflection point for enterprise-scale migration.

## Key Points

- **Complete Stack Coverage**: Rust tools now cover every layer of the JS build pipeline—parsing (Oxc), bundling (Rspack/Rolldown), linting (oxlint/Biome), formatting (Biome/dprint), and CSS processing (Lightning CSS).
- **Performance Gains**: Empirical benchmarks show 20-50x speedup for TypeScript transpilation (Oxc vs tsc), 5-10x for bundling (Rspack vs Webpack), and 10-100x for linting (oxlint vs ESLint).
- **Compatibility-First Design**: Rspack maintains Webpack configuration parity; Rolldown targets Rollup API compatibility; Biome provides ESLint and Prettier migration commands—minimizing switching cost.
- **Vite 8 Default**: Rolldown becoming the default bundler in Vite 8 signals mainstream validation of Rust tools, with ecosystem plugin compatibility approaching parity.
- **Risk-Managed Migration**: The primary risks—rule incompatibility for complex ESLint configurations and immature plugin ecosystems—are mitigated through incremental adoption and hybrid toolchains.

## Detailed Explanation

The migration from JavaScript-based build tools to Rust-rewritten equivalents represents the most significant infrastructure transition in the frontend ecosystem since Webpack displaced Grunt and Gulp in 2015. Unlike previous toolchain shifts that required philosophical commitment to new paradigms, the 2026 Rust migration is characterized by **drop-in compatibility**: teams can switch tools without rewriting configurations or abandoning existing plugin investments. This compatibility is strategic, not accidental—tool authors recognize that migration friction is the primary barrier to adoption in enterprise environments where build pipelines represent millions of dollars in sunk engineering cost.

The performance case is mathematically unambiguous. Oxc parses and transforms TypeScript at 20-50x the throughput of tsc because Rust's zero-cost abstractions and deterministic memory management eliminate the garbage-collection pauses that plague long-running Node.js build processes. Rspack achieves 5-10x bundling speedup over Webpack by parallelizing module graph construction across CPU cores—something JavaScript's single-threaded event loop cannot natively accomplish. These are not micro-benchmark artifacts; they translate directly into faster CI pipelines, shorter feedback loops for developers, and reduced cloud compute bills for organizations running thousands of builds per day.

The recommended migration strategy for 2026 follows a **progressive replacement** pattern rather than a big-bang rewrite. Phase 1 replaces formatting (Prettier → Biome) and linting (ESLint → oxlint/Biome) because these tools have the narrowest integration surface and the highest invocation frequency. Phase 2 replaces the bundler (Webpack → Rspack, or Vite → Vite 8 with Rolldown) after verifying plugin compatibility against the project's critical path. Phase 3 replaces transpilation (tsc/Babel → Oxc/SWC) as the final layer. This staged approach contains risk: if a Rust tool fails on an edge case, the team can fall back to the legacy tool for that specific job while continuing to benefit from Rust performance elsewhere. By the end of 2026, the default toolchain for new TypeScript projects will be entirely Rust-native, while legacy projects will exist in productive hybrid states.

---

*English summary. Full Chinese documentation: `../../20-code-lab/20.11-rust-toolchain/README.md`*
