import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"JavaScript/TypeScript 语言核心知识图谱","description":"","frontmatter":{"title":"JavaScript/TypeScript 语言核心知识图谱"},"headers":[],"relativePath":"diagrams/language-core-knowledge-graph.md","filePath":"diagrams/language-core-knowledge-graph.md","lastUpdated":1776545344000}');
const _sfc_main = { name: "diagrams/language-core-knowledge-graph.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><p>graph TD %% ========== 根节点 ========== root[&quot;🧠 JS/TS Language Core&quot;]</p><pre><code>%% ========== 第一层分支 ==========
es[&quot;📜 ECMAScript 演进&quot;]
ts[&quot;🔷 TypeScript 类型系统&quot;]
rt[&quot;⚙️ 运行时语义&quot;]
cmp[&quot;🛠️ 编译与工具&quot;]
fmt[&quot;📐 形式化基础&quot;]

root --&gt; es
root --&gt; ts
root --&gt; rt
root --&gt; cmp
root --&gt; fmt

%% ========== ECMAScript 演进 ==========
es2015[&quot;ES2015 ES6&quot;]
es2016[&quot;ES2016 ES7&quot;]
es2017[&quot;ES2017 ES8&quot;]
es2018[&quot;ES2018 ES9&quot;]
es2019[&quot;ES2019 ES10&quot;]
es2020[&quot;ES2020 ES11&quot;]
es2021[&quot;ES2021 ES12&quot;]
es2022[&quot;ES2022 ES13&quot;]
es2023[&quot;ES2023 ES14&quot;]
es2024[&quot;ES2024 ES15&quot;]
es2025[&quot;ES2025 ES16&quot;]
es2026[&quot;ES2026 ES17&quot;]

es --&gt; es2015
es --&gt; es2016
es --&gt; es2017
es --&gt; es2018
es --&gt; es2019
es --&gt; es2020
es --&gt; es2021
es --&gt; es2022
es --&gt; es2023
es --&gt; es2024
es --&gt; es2025
es --&gt; es2026

%% ES2015 特性
es2015_a[&quot;let / const&quot;]
es2015_b[&quot;箭头函数 =&gt;&quot;]
es2015_c[&quot;Class 语法&quot;]
es2015_d[&quot;模块 import/export&quot;]
es2015_e[&quot;Promise&quot;]
es2015_f[&quot;解构赋值&quot;]
es2015_g[&quot;模板字符串&quot;]
es2015_h[&quot;Symbol / Proxy&quot;]
es2015 --&gt; es2015_a &amp; es2015_b &amp; es2015_c &amp; es2015_d &amp; es2015_e &amp; es2015_f &amp; es2015_g &amp; es2015_h

%% ES2016 特性
es2016_a[&quot;Array.includes&quot;]
es2016_b[&quot;指数运算符 **&quot;]
es2016 --&gt; es2016_a &amp; es2016_b

%% ES2017 特性
es2017_a[&quot;async / await&quot;]
es2017_b[&quot;Object.entries / values&quot;]
es2017_c[&quot;String padding&quot;]
es2017_d[&quot;Trailing commas&quot;]
es2017 --&gt; es2017_a &amp; es2017_b &amp; es2017_c &amp; es2017_d

%% ES2018 特性
es2018_a[&quot;Spread / Rest ...&quot;]
es2018_b[&quot;Async Iterator&quot;]
es2018_c[&quot;Promise.finally&quot;]
es2018_d[&quot;RegExp Named Groups&quot;]
es2018 --&gt; es2018_a &amp; es2018_b &amp; es2018_c &amp; es2018_d

%% ES2019 特性
es2019_a[&quot;Array.flat / flatMap&quot;]
es2019_b[&quot;Object.fromEntries&quot;]
es2019_c[&quot;String.trimStart / End&quot;]
es2019_d[&quot;Optional catch binding&quot;]
es2019 --&gt; es2019_a &amp; es2019_b &amp; es2019_c &amp; es2019_d

%% ES2020 特性
es2020_a[&quot;BigInt&quot;]
es2020_b[&quot;可选链 ?.&quot;]
es2020_c[&quot;空值合并 ??&quot;]
es2020_d[&quot;Dynamic import()&quot;]
es2020_e[&quot;globalThis&quot;]
es2020 --&gt; es2020_a &amp; es2020_b &amp; es2020_c &amp; es2020_d &amp; es2020_e

%% ES2021 特性
es2021_a[&quot;Promise.any&quot;]
es2021_b[&quot;逻辑赋值 ??= &amp;&amp;= ||=&quot;]
es2021_c[&quot;数值分隔符 1_000&quot;]
es2021_d[&quot;String.replaceAll&quot;]
es2021 --&gt; es2021_a &amp; es2021_b &amp; es2021_c &amp; es2021_d

%% ES2022 特性
es2022_a[&quot;Class Fields &amp; Private Methods&quot;]
es2022_b[&quot;Class Static Block&quot;]
es2022_c[&quot;at() Method&quot;]
es2022_d[&quot;Error Cause&quot;]
es2022_e[&quot;Top-level await&quot;]
es2022 --&gt; es2022_a &amp; es2022_b &amp; es2022_c &amp; es2022_d &amp; es2022_e

%% ES2023 特性
es2023_a[&quot;toSorted / toReversed / toSpliced&quot;]
es2023_b[&quot;findLast / findLastIndex&quot;]
es2023_c[&quot;Hashbang Grammar&quot;]
es2023 --&gt; es2023_a &amp; es2023_b &amp; es2023_c

%% ES2024 特性
es2024_a[&quot;Object.groupBy / Map.groupBy&quot;]
es2024_b[&quot;Promise.withResolvers&quot;]
es2024_c[&quot;RegExp v Flag&quot;]
es2024_d[&quot;Atomics.waitAsync&quot;]
es2024_e[&quot;ArrayBuffer Resizing&quot;]
es2024 --&gt; es2024_a &amp; es2024_b &amp; es2024_c &amp; es2024_d &amp; es2024_e

%% ES2025 特性
es2025_a[&quot;Iterator Helpers&quot;]
es2025_b[&quot;Set Mathematical Methods&quot;]
es2025_c[&quot;Promise.try&quot;]
es2025_d[&quot;RegExp.escape + Modifiers&quot;]
es2025_e[&quot;Float16Array&quot;]
es2025_f[&quot;Import Attributes&quot;]
es2025 --&gt; es2025_a &amp; es2025_b &amp; es2025_c &amp; es2025_d &amp; es2025_e &amp; es2025_f

%% ES2026 特性
es2026_a[&quot;Temporal API&quot;]
es2026_b[&quot;Array.fromAsync&quot;]
es2026_c[&quot;Error.isError&quot;]
es2026_d[&quot;Explicit Resource Management&lt;br/&gt;using / await using&quot;]
es2026_e[&quot;Atomics.pause&quot;]
es2026_f[&quot;Intl Era &amp; MonthCode&quot;]
es2026 --&gt; es2026_a &amp; es2026_b &amp; es2026_c &amp; es2026_d &amp; es2026_e &amp; es2026_f

%% ========== TypeScript 类型系统 ==========
ts_basic[&quot;基础类型&quot;]
ts_generic[&quot;泛型 Generics&quot;]
ts_cond[&quot;条件类型 Conditional&quot;]
ts_map[&quot;映射类型 Mapped&quot;]
ts_gym[&quot;类型体操 Type Gymnastics&quot;]
ts_sound[&quot;类型声音性 Soundness&quot;]

ts --&gt; ts_basic &amp; ts_generic &amp; ts_cond &amp; ts_map &amp; ts_gym &amp; ts_sound

ts_basic_a[&quot;string / number / boolean&quot;]
ts_basic_b[&quot;any / unknown / never&quot;]
ts_basic_c[&quot;tuple / enum / literal&quot;]
ts_basic_d[&quot;interface / type alias&quot;]
ts_basic --&gt; ts_basic_a &amp; ts_basic_b &amp; ts_basic_c &amp; ts_basic_d

ts_generic_a[&quot;T / K / V 参数化&quot;]
ts_generic_b[&quot;extends 约束&quot;]
ts_generic_c[&quot;infer 推断&quot;]
ts_generic_d[&quot;泛型工具类型&quot;]
ts_generic --&gt; ts_generic_a &amp; ts_generic_b &amp; ts_generic_c &amp; ts_generic_d

ts_cond_a[&quot;T extends U ? X : Y&quot;]
ts_cond_b[&quot;分布式条件类型&quot;]
ts_cond_c[&quot;递归条件类型&quot;]
ts_cond --&gt; ts_cond_a &amp; ts_cond_b &amp; ts_cond_c

ts_map_a[&quot;Partial / Required / Readonly&quot;]
ts_map_b[&quot;Record / Pick / Omit&quot;]
ts_map_c[&quot;Exclude / Extract&quot;]
ts_map_d[&quot;模板字面量类型&quot;]
ts_map --&gt; ts_map_a &amp; ts_map_b &amp; ts_map_c &amp; ts_map_d

ts_gym_a[&quot;DeepReadonly / DeepPartial&quot;]
ts_gym_b[&quot;JSON 类型递归推导&quot;]
ts_gym_c[&quot;Brand / Nominal Typing&quot;]
ts_gym_d[&quot;HKT 高阶类型模拟&quot;]
ts_gym_e[&quot;挑战题 Type-Challenges&quot;]
ts_gym --&gt; ts_gym_a &amp; ts_gym_b &amp; ts_gym_c &amp; ts_gym_d &amp; ts_gym_e

ts_sound_a[&quot;strict 严格模式&quot;]
ts_sound_b[&quot;协变/逆变/双变&quot;]
ts_sound_c[&quot;类型断言 as 风险&quot;]
ts_sound_d[&quot;noImplicitAny / strictNullChecks&quot;]
ts_sound --&gt; ts_sound_a &amp; ts_sound_b &amp; ts_sound_c &amp; ts_sound_d

%% ========== 运行时语义 ==========
rt_ctx[&quot;执行上下文&quot;]
rt_scope[&quot;作用域链&quot;]
rt_closure[&quot;闭包&quot;]
rt_proto[&quot;原型链&quot;]
rt_eventloop[&quot;Event Loop&quot;]
rt_module[&quot;模块系统&quot;]
rt_mem[&quot;内存管理&quot;]

rt --&gt; rt_ctx &amp; rt_scope &amp; rt_closure &amp; rt_proto &amp; rt_eventloop &amp; rt_module &amp; rt_mem

rt_ctx_a[&quot;Lexical Environment&quot;]
rt_ctx_b[&quot;Variable Environment&quot;]
rt_ctx_c[&quot;Global / Function / Eval&quot;]
rt_ctx --&gt; rt_ctx_a &amp; rt_ctx_b &amp; rt_ctx_c

rt_scope_a[&quot;词法作用域&quot;]
rt_scope_b[&quot;变量提升 Hoisting&quot;]
rt_scope_c[&quot;TDZ 暂时性死区&quot;]
rt_scope_d[&quot;块级作用域&quot;]
rt_scope --&gt; rt_scope_a &amp; rt_scope_b &amp; rt_scope_c &amp; rt_scope_d

rt_closure_a[&quot;自由变量捕获&quot;]
rt_closure_b[&quot;闭包与内存泄漏&quot;]
rt_closure_c[&quot;函数工厂模式&quot;]
rt_closure --&gt; rt_closure_a &amp; rt_closure_b &amp; rt_closure_c

rt_proto_a[&quot;__proto__ / prototype&quot;]
rt_proto_b[&quot;Object.create&quot;]
rt_proto_c[&quot;Class extends 本质&quot;]
rt_proto_d[&quot;instanceof 原理&quot;]
rt_proto --&gt; rt_proto_a &amp; rt_proto_b &amp; rt_proto_c &amp; rt_proto_d

rt_eventloop_a[&quot;Call Stack&quot;]
rt_eventloop_b[&quot;Macro Task&quot;]
rt_eventloop_c[&quot;Micro Task&quot;]
rt_eventloop_d[&quot;Node.js libuv&quot;]
rt_eventloop_e[&quot;requestIdleCallback&quot;]
rt_eventloop --&gt; rt_eventloop_a &amp; rt_eventloop_b &amp; rt_eventloop_c &amp; rt_eventloop_d &amp; rt_eventloop_e

rt_module_a[&quot;ESM import/export&quot;]
rt_module_b[&quot;CJS require/module&quot;]
rt_module_c[&quot;Tree-shaking 原理&quot;]
rt_module_d[&quot;循环依赖处理&quot;]
rt_module_e[&quot;Import Attributes / JSON&quot;]
rt_module --&gt; rt_module_a &amp; rt_module_b &amp; rt_module_c &amp; rt_module_d &amp; rt_module_e

rt_mem_a[&quot;垃圾回收 GC&quot;]
rt_mem_b[&quot;标记清除 / 分代回收&quot;]
rt_mem_c[&quot;WeakRef / FinalizationRegistry&quot;]
rt_mem_d[&quot;内存泄漏排查&quot;]
rt_mem_e[&quot;V8 Heap 结构&quot;]
rt_mem --&gt; rt_mem_a &amp; rt_mem_b &amp; rt_mem_c &amp; rt_mem_d &amp; rt_mem_e

%% ========== 编译与工具 ==========
cmp_tsc[&quot;tsc&quot;]
cmp_babel[&quot;Babel&quot;]
cmp_swc[&quot;SWC&quot;]
cmp_esbuild[&quot;esbuild&quot;]
cmp_tsgo[&quot;tsgo Go移植&quot;]
cmp_erase[&quot;类型擦除&quot;]
cmp_sourcemap[&quot;Source Map&quot;]

cmp --&gt; cmp_tsc &amp; cmp_babel &amp; cmp_swc &amp; cmp_esbuild &amp; cmp_tsgo &amp; cmp_erase &amp; cmp_sourcemap

cmp_tsc_a[&quot;类型检查&quot;]
cmp_tsc_b[&quot;tsc --watch&quot;]
cmp_tsc_c[&quot;tsconfig.json 配置&quot;]
cmp_tsc_d[&quot;declaration 输出 .d.ts&quot;]
cmp_tsc --&gt; cmp_tsc_a &amp; cmp_tsc_b &amp; cmp_tsc_c &amp; cmp_tsc_d

cmp_babel_a[&quot;@babel/preset-env&quot;]
cmp_babel_b[&quot;@babel/preset-typescript&quot;]
cmp_babel_c[&quot;Plugin / AST 转换&quot;]
cmp_babel_d[&quot;Polyfill 策略&quot;]
cmp_babel --&gt; cmp_babel_a &amp; cmp_babel_b &amp; cmp_babel_c &amp; cmp_babel_d

cmp_swc_a[&quot;Rust 编写超快编译&quot;]
cmp_swc_b[&quot;@swc/core&quot;]
cmp_swc_c[&quot;Next.js 内置&quot;]
cmp_swc_d[&quot;Jest 替代 babel-jest&quot;]
cmp_swc --&gt; cmp_swc_a &amp; cmp_swc_b &amp; cmp_swc_c &amp; cmp_swc_d

cmp_esbuild_a[&quot;Go 编写零依赖&quot;]
cmp_esbuild_b[&quot;Bundle + Transform&quot;]
cmp_esbuild_c[&quot;Vite 预构建依赖&quot;]
cmp_esbuild_d[&quot;ESM / CJS 双输出&quot;]
cmp_esbuild --&gt; cmp_esbuild_a &amp; cmp_esbuild_b &amp; cmp_esbuild_c &amp; cmp_esbuild_d

cmp_tsgo_a[&quot;Anders Hejlsberg 主导&quot;]
cmp_tsgo_b[&quot;Go 重写 tsc&quot;]
cmp_tsgo_c[&quot;10x 性能目标&quot;]
cmp_tsgo_d[&quot;类型保持 100% 兼容&quot;]
cmp_tsgo --&gt; cmp_tsgo_a &amp; cmp_tsgo_b &amp; cmp_tsgo_c &amp; cmp_tsgo_d

cmp_erase_a[&quot;编译期类型移除&quot;]
cmp_erase_b[&quot;Decorator 转换&quot;]
cmp_erase_c[&quot;Enum 转对象&quot;]
cmp_erase --&gt; cmp_erase_a &amp; cmp_erase_b &amp; cmp_erase_c

cmp_sourcemap_a[&quot;mappings VLQ 编码&quot;]
cmp_sourcemap_b[&quot;Debug 断点映射&quot;]
cmp_sourcemap_c[&quot;SourceMap 链接&quot;]
cmp_sourcemap --&gt; cmp_sourcemap_a &amp; cmp_sourcemap_b &amp; cmp_sourcemap_c

%% ========== 形式化基础 ==========
fmt_lambda[&quot;λ演算&quot;]
fmt_opsem[&quot;操作语义&quot;]
fmt_infer[&quot;类型推断&quot;]
fmt_subtype[&quot;子类型关系&quot;]
fmt_gradual[&quot;渐进类型 Gradual&quot;]

fmt --&gt; fmt_lambda &amp; fmt_opsem &amp; fmt_infer &amp; fmt_subtype &amp; fmt_gradual

fmt_lambda_a[&quot;α转换 / β归约&quot;]
fmt_lambda_b[&quot;Y 组合子&quot;]
fmt_lambda_c[&quot; Church 编码&quot;]
fmt_lambda --&gt; fmt_lambda_a &amp; fmt_lambda_b &amp; fmt_lambda_c

fmt_opsem_a[&quot;小步操作语义&quot;]
fmt_opsem_b[&quot;大步操作语义&quot;]
fmt_opsem_c[&quot;ECMA-262 规范映射&quot;]
fmt_opsem --&gt; fmt_opsem_a &amp; fmt_opsem_b &amp; fmt_opsem_c

fmt_infer_a[&quot;Hindley-Milner&quot;]
fmt_infer_b[&quot;W 算法&quot;]
fmt_infer_c[&quot;双向类型检查&quot;]
fmt_infer_d[&quot;上下文类型推断&quot;]
fmt_infer --&gt; fmt_infer_a &amp; fmt_infer_b &amp; fmt_infer_c &amp; fmt_infer_d

fmt_subtype_a[&quot;结构子类型&quot;]
fmt_subtype_b[&quot;名义子类型&quot;]
fmt_subtype_c[&quot;宽度/深度子类型&quot;]
fmt_subtype_d[&quot;F-bounded 多态&quot;]
fmt_subtype --&gt; fmt_subtype_a &amp; fmt_subtype_b &amp; fmt_subtype_c &amp; fmt_subtype_d

fmt_gradual_a[&quot;any 的语义&quot;]
fmt_gradual_b[&quot;边界包装&quot;]
fmt_gradual_c[&quot;一致等价 Consistent&quot;]
fmt_gradual_d[&quot;TypeScript vs Flow&quot;]
fmt_gradual --&gt; fmt_gradual_a &amp; fmt_gradual_b &amp; fmt_gradual_c &amp; fmt_gradual_d

%% ========== 依赖/演进虚线 ==========
es2015 -.-&gt;|演进| es2016
es2016 -.-&gt;|演进| es2017
es2017 -.-&gt;|演进| es2018
es2018 -.-&gt;|演进| es2019
es2019 -.-&gt;|演进| es2020
es2020 -.-&gt;|演进| es2021
es2021 -.-&gt;|演进| es2022
es2022 -.-&gt;|演进| es2023
es2023 -.-&gt;|演进| es2024
es2024 -.-&gt;|演进| es2025
es2025 -.-&gt;|演进| es2026

es2015_d -.-&gt;|依赖| rt_module_a
es2017_a -.-&gt;|依赖| rt_eventloop
rt_scope -.-&gt;|依赖| rt_closure
rt_ctx -.-&gt;|依赖| rt_scope
rt_proto -.-&gt;|依赖| rt_mem_a
rt_eventloop -.-&gt;|依赖| rt_ctx

fmt_lambda -.-&gt;|理论基础| fmt_opsem
fmt_infer -.-&gt;|理论基础| ts_basic
fmt_subtype -.-&gt;|理论基础| ts_generic
fmt_gradual -.-&gt;|理论基础| ts_sound
ts_basic -.-&gt;|演进| ts_generic
ts_generic -.-&gt;|演进| ts_cond
ts_cond -.-&gt;|演进| ts_map
ts_map -.-&gt;|演进| ts_gym

cmp_tsc -.-&gt;|依赖| cmp_erase
cmp_babel -.-&gt;|竞争| cmp_swc
cmp_swc -.-&gt;|竞争| cmp_esbuild
cmp_tsc -.-&gt;|输出| cmp_sourcemap
cmp_esbuild -.-&gt;|启发| cmp_tsgo
ts_sound_a -.-&gt;|要求| cmp_tsc_c

%% ========== 样式定义 ==========
classDef syntax fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
classDef types fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
classDef runtime fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
classDef tools fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
classDef theory fill:#eceff1,stroke:#455a64,stroke-width:2px,color:#263238
classDef root fill:#fff8e1,stroke:#ff6f00,stroke-width:3px,color:#e65100

class root root
class es,es2015,es2016,es2017,es2018,es2019,es2020,es2021,es2022,es2023,es2024,es2025,es2026 syntax
class es2015_a,es2015_b,es2015_c,es2015_d,es2015_e,es2015_f,es2015_g,es2015_h syntax
class es2016_a,es2016_b,es2017_a,es2017_b,es2017_c,es2017_d syntax
class es2018_a,es2018_b,es2018_c,es2018_d,es2019_a,es2019_b,es2019_c,es2019_d syntax
class es2020_a,es2020_b,es2020_c,es2020_d,es2020_e,es2021_a,es2021_b,es2021_c,es2021_d syntax
class es2022_a,es2022_b,es2022_c,es2022_d,es2022_e syntax
class es2023_a,es2023_b,es2023_c,es2024_a,es2024_b,es2024_c,es2024_d,es2024_e syntax
class es2025_a,es2025_b,es2025_c,es2025_d,es2025_e,es2025_f syntax
class es2026_a,es2026_b,es2026_c,es2026_d,es2026_e,es2026_f syntax

class ts,ts_basic,ts_generic,ts_cond,ts_map,ts_gym,ts_sound types
class ts_basic_a,ts_basic_b,ts_basic_c,ts_basic_d types
class ts_generic_a,ts_generic_b,ts_generic_c,ts_generic_d types
class ts_cond_a,ts_cond_b,ts_cond_c types
class ts_map_a,ts_map_b,ts_map_c,ts_map_d types
class ts_gym_a,ts_gym_b,ts_gym_c,ts_gym_d,ts_gym_e types
class ts_sound_a,ts_sound_b,ts_sound_c,ts_sound_d types

class rt,rt_ctx,rt_scope,rt_closure,rt_proto,rt_eventloop,rt_module,rt_mem runtime
class rt_ctx_a,rt_ctx_b,rt_ctx_c,rt_scope_a,rt_scope_b,rt_scope_c,rt_scope_d runtime
class rt_closure_a,rt_closure_b,rt_closure_c,rt_proto_a,rt_proto_b,rt_proto_c,rt_proto_d runtime
class rt_eventloop_a,rt_eventloop_b,rt_eventloop_c,rt_eventloop_d,rt_eventloop_e runtime
class rt_module_a,rt_module_b,rt_module_c,rt_module_d,rt_module_e runtime
class rt_mem_a,rt_mem_b,rt_mem_c,rt_mem_d,rt_mem_e runtime

class cmp,cmp_tsc,cmp_babel,cmp_swc,cmp_esbuild,cmp_tsgo,cmp_erase,cmp_sourcemap tools
class cmp_tsc_a,cmp_tsc_b,cmp_tsc_c,cmp_tsc_d tools
class cmp_babel_a,cmp_babel_b,cmp_babel_c,cmp_babel_d tools
class cmp_swc_a,cmp_swc_b,cmp_swc_c,cmp_swc_d tools
class cmp_esbuild_a,cmp_esbuild_b,cmp_esbuild_c,cmp_esbuild_d tools
class cmp_tsgo_a,cmp_tsgo_b,cmp_tsgo_c,cmp_tsgo_d tools
class cmp_erase_a,cmp_erase_b,cmp_erase_c tools
class cmp_sourcemap_a,cmp_sourcemap_b,cmp_sourcemap_c tools

class fmt,fmt_lambda,fmt_opsem,fmt_infer,fmt_subtype,fmt_gradual theory
class fmt_lambda_a,fmt_lambda_b,fmt_lambda_c,fmt_opsem_a,fmt_opsem_b,fmt_opsem_c theory
class fmt_infer_a,fmt_infer_b,fmt_infer_c,fmt_infer_d theory
class fmt_subtype_a,fmt_subtype_b,fmt_subtype_c,fmt_subtype_d theory
class fmt_gradual_a,fmt_gradual_b,fmt_gradual_c,fmt_gradual_d theory
</code></pre></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("diagrams/language-core-knowledge-graph.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const languageCoreKnowledgeGraph = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  languageCoreKnowledgeGraph as default
};
