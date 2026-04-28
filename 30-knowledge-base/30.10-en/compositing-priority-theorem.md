# Theorem 4: Compositing Priority Theorem

> **English Summary** of `10-fundamentals/10.1-language-semantics/theorems/compositing-priority-theorem.md`

---

## One-Sentence Summary

CSS properties that trigger only the Compositing phase—specifically `transform` and `opacity`—achieve visually equivalent animations to geometry-changing properties while bypassing Layout and Paint, enabling smooth 60fps motion even when the main thread is fully occupied by JavaScript execution.

## Key Points

- **Pipeline Skipping**: `transform: translate()` skips both Layout and Paint phases, executing entirely on the Compositor Thread with GPU acceleration, whereas `top`/`left` animations force the full five-stage pipeline.
- **Main Thread Independence**: Because Compositor Thread operates independently of the main thread, transform-based animations survive main-thread blocking events such as long-running JavaScript tasks, DOM mutations, and garbage collection pauses.
- **Frame Budget Reality**: At 60fps, each frame has a 16.6ms budget; after accounting for browser overhead, only ~10ms remains for JavaScript and rendering. Full-pipeline animations consume 8-12ms, leaving no margin; compositor-only animations consume <2ms.
- **Visual Equivalence**: From the user's perceptual perspective, `translateX(100px)` and `left: 100px` produce identical displacement; the difference is entirely in implementation efficiency.
- **Strategic Generalization**: The theorem extends beyond animation to all rendering strategy decisions—`content-visibility: auto` for off-screen content, virtual scrolling for large lists, and debounced input handling all derive from the same pipeline-minimization principle.

## Detailed Explanation

The Compositing Priority Theorem formalizes an insight that every frontend engineer intuitively practices but rarely explicitly states: the browser's rendering pipeline is not a monolithic process but a cascade of discrete stages with dramatically different computational costs, and smart rendering strategy consists of pushing work to the cheapest eligible stage. The five-stage pipeline—JavaScript → Style → Layout → Paint → Composite—operates under a strict frame budget of 16.6ms at 60fps. In practice, browser bookkeeping consumes 4-6ms, leaving approximately 10ms for application code and rendering. A geometry-changing animation that triggers Layout (Reflow) can consume 8-12ms of this budget by itself, leaving zero headroom for JavaScript execution and guaranteeing frame drops under any realistic workload.

The theorem's proof rests on two axioms. The **Five-Stage Pipeline Axiom** establishes that different CSS properties mutate different stages: geometric properties (`width`, `height`, `top`, `left`) force Layout recalculation; visual properties (`color`, `background`, `box-shadow`) force Paint recomputation; compositing properties (`transform`, `opacity`) mutate only the final Composite stage. The **Independent Compositor Thread Axiom** establishes that the Composite stage runs on a separate thread with its own GPU context, making it immune to main-thread saturation. From these axioms, the theorem derives its central inequality: the computational cost of a compositing-only animation is strictly less than the cost of an equivalent geometry-changing animation, with the additional property that the former's cost is isolated from main-thread contention.

The engineering significance extends far beyond individual animation choices. The theorem justifies a complete taxonomy of interaction strategies: high-frequency animations (scrolling, dragging) must use only `transform` and `opacity`; content changes should leverage `content-visibility: auto` to defer Layout and Paint for off-screen elements; complex lists require virtualization to minimize the DOM node count subject to Style calculation; and user input should be handled with debouncing and CSS transitions to prevent main-thread blocking. These strategies are not independent optimizations but corollaries of a single principle—**minimize the number and scope of pipeline stages triggered per frame**—that the Compositing Priority Theorem elevates from folklore to formal reasoning.

---

*English summary. Full Chinese theorem with proof tree: `../../10-fundamentals/10.1-language-semantics/theorems/compositing-priority-theorem.md`*
