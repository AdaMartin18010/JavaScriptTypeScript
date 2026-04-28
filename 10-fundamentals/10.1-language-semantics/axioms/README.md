# 公理化基础（Axioms）

> **定位**：`10-fundamentals/10.1-language-semantics/axioms/`
> **关联**：`theorems/` | `proofs/` | `ontology/`

---

## 三大公理

### A1 动态性公理（Axiom of Dynamicity）

JavaScript 对象的语义结构在运行时具备可变性。任何属性可在任意时刻被添加、删除或修改其描述符。

> 形式化表述：∀obj ∈ JSObject, ∀prop ∈ Identifier, ∃t ∈ Runtime: obj[prop]@t ≠ obj[prop]@(t+Δ)

### A2 超集公理（Axiom of Superset）

TypeScript 类型系统是 JavaScript 值集合的保守超集近似。任何有效的 JS 值至少映射到一个 TS 类型，但 TS 类型可表达 JS 运行时不存在的空集合。

> 形式化表述：V_JS ⊂ V_TS_typeable，且 ∃τ ∈ TS_Type: [[τ]] = ∅

### A3 宿主依赖公理（Axiom of Host Dependency）

语言核心语义的完整实现依赖于宿主环境（浏览器引擎 / Node.js / Deno）提供的绑定和事件循环机制。

> 形式化表述：L_JS = Core(262) ∪ Host(host-defined) ∪ Bindings(embedder)

---

*公理化基础为 5 大定理提供了形式化起点。详细证明参见 `proofs/` 目录。*
