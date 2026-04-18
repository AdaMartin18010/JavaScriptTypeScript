---
title: JavaScript/TypeScript 语言核心知识图谱
---

graph TD
    %% ========== 根节点 ==========
    root["🧠 JS/TS Language Core"]

    %% ========== 第一层分支 ==========
    es["📜 ECMAScript 演进"]
    ts["🔷 TypeScript 类型系统"]
    rt["⚙️ 运行时语义"]
    cmp["🛠️ 编译与工具"]
    fmt["📐 形式化基础"]

    root --> es
    root --> ts
    root --> rt
    root --> cmp
    root --> fmt

    %% ========== ECMAScript 演进 ==========
    es2015["ES2015 ES6"]
    es2016["ES2016 ES7"]
    es2017["ES2017 ES8"]
    es2018["ES2018 ES9"]
    es2019["ES2019 ES10"]
    es2020["ES2020 ES11"]
    es2021["ES2021 ES12"]
    es2022["ES2022 ES13"]
    es2023["ES2023 ES14"]
    es2024["ES2024 ES15"]
    es2025["ES2025 ES16"]
    es2026["ES2026 ES17"]

    es --> es2015
    es --> es2016
    es --> es2017
    es --> es2018
    es --> es2019
    es --> es2020
    es --> es2021
    es --> es2022
    es --> es2023
    es --> es2024
    es --> es2025
    es --> es2026

    %% ES2015 特性
    es2015_a["let / const"]
    es2015_b["箭头函数 =>"]
    es2015_c["Class 语法"]
    es2015_d["模块 import/export"]
    es2015_e["Promise"]
    es2015_f["解构赋值"]
    es2015_g["模板字符串"]
    es2015_h["Symbol / Proxy"]
    es2015 --> es2015_a & es2015_b & es2015_c & es2015_d & es2015_e & es2015_f & es2015_g & es2015_h

    %% ES2016 特性
    es2016_a["Array.includes"]
    es2016_b["指数运算符 **"]
    es2016 --> es2016_a & es2016_b

    %% ES2017 特性
    es2017_a["async / await"]
    es2017_b["Object.entries / values"]
    es2017_c["String padding"]
    es2017_d["Trailing commas"]
    es2017 --> es2017_a & es2017_b & es2017_c & es2017_d

    %% ES2018 特性
    es2018_a["Spread / Rest ..."]
    es2018_b["Async Iterator"]
    es2018_c["Promise.finally"]
    es2018_d["RegExp Named Groups"]
    es2018 --> es2018_a & es2018_b & es2018_c & es2018_d

    %% ES2019 特性
    es2019_a["Array.flat / flatMap"]
    es2019_b["Object.fromEntries"]
    es2019_c["String.trimStart / End"]
    es2019_d["Optional catch binding"]
    es2019 --> es2019_a & es2019_b & es2019_c & es2019_d

    %% ES2020 特性
    es2020_a["BigInt"]
    es2020_b["可选链 ?."]
    es2020_c["空值合并 ??"]
    es2020_d["Dynamic import()"]
    es2020_e["globalThis"]
    es2020 --> es2020_a & es2020_b & es2020_c & es2020_d & es2020_e

    %% ES2021 特性
    es2021_a["Promise.any"]
    es2021_b["逻辑赋值 ??= &&= ||="]
    es2021_c["数值分隔符 1_000"]
    es2021_d["String.replaceAll"]
    es2021 --> es2021_a & es2021_b & es2021_c & es2021_d

    %% ES2022 特性
    es2022_a["Class Fields & Private Methods"]
    es2022_b["Class Static Block"]
    es2022_c["at() Method"]
    es2022_d["Error Cause"]
    es2022_e["Top-level await"]
    es2022 --> es2022_a & es2022_b & es2022_c & es2022_d & es2022_e

    %% ES2023 特性
    es2023_a["toSorted / toReversed / toSpliced"]
    es2023_b["findLast / findLastIndex"]
    es2023_c["Hashbang Grammar"]
    es2023 --> es2023_a & es2023_b & es2023_c

    %% ES2024 特性
    es2024_a["Object.groupBy / Map.groupBy"]
    es2024_b["Promise.withResolvers"]
    es2024_c["RegExp v Flag"]
    es2024_d["Atomics.waitAsync"]
    es2024_e["ArrayBuffer Resizing"]
    es2024 --> es2024_a & es2024_b & es2024_c & es2024_d & es2024_e

    %% ES2025 特性
    es2025_a["Iterator Helpers"]
    es2025_b["Set Mathematical Methods"]
    es2025_c["Promise.try"]
    es2025_d["RegExp.escape + Modifiers"]
    es2025_e["Float16Array"]
    es2025_f["Import Attributes"]
    es2025 --> es2025_a & es2025_b & es2025_c & es2025_d & es2025_e & es2025_f

    %% ES2026 特性
    es2026_a["Temporal API"]
    es2026_b["Array.fromAsync"]
    es2026_c["Error.isError"]
    es2026_d["Explicit Resource Management<br/>using / await using"]
    es2026_e["Atomics.pause"]
    es2026_f["Intl Era & MonthCode"]
    es2026 --> es2026_a & es2026_b & es2026_c & es2026_d & es2026_e & es2026_f

    %% ========== TypeScript 类型系统 ==========
    ts_basic["基础类型"]
    ts_generic["泛型 Generics"]
    ts_cond["条件类型 Conditional"]
    ts_map["映射类型 Mapped"]
    ts_gym["类型体操 Type Gymnastics"]
    ts_sound["类型声音性 Soundness"]

    ts --> ts_basic & ts_generic & ts_cond & ts_map & ts_gym & ts_sound

    ts_basic_a["string / number / boolean"]
    ts_basic_b["any / unknown / never"]
    ts_basic_c["tuple / enum / literal"]
    ts_basic_d["interface / type alias"]
    ts_basic --> ts_basic_a & ts_basic_b & ts_basic_c & ts_basic_d

    ts_generic_a["T / K / V 参数化"]
    ts_generic_b["extends 约束"]
    ts_generic_c["infer 推断"]
    ts_generic_d["泛型工具类型"]
    ts_generic --> ts_generic_a & ts_generic_b & ts_generic_c & ts_generic_d

    ts_cond_a["T extends U ? X : Y"]
    ts_cond_b["分布式条件类型"]
    ts_cond_c["递归条件类型"]
    ts_cond --> ts_cond_a & ts_cond_b & ts_cond_c

    ts_map_a["Partial / Required / Readonly"]
    ts_map_b["Record / Pick / Omit"]
    ts_map_c["Exclude / Extract"]
    ts_map_d["模板字面量类型"]
    ts_map --> ts_map_a & ts_map_b & ts_map_c & ts_map_d

    ts_gym_a["DeepReadonly / DeepPartial"]
    ts_gym_b["JSON 类型递归推导"]
    ts_gym_c["Brand / Nominal Typing"]
    ts_gym_d["HKT 高阶类型模拟"]
    ts_gym_e["挑战题 Type-Challenges"]
    ts_gym --> ts_gym_a & ts_gym_b & ts_gym_c & ts_gym_d & ts_gym_e

    ts_sound_a["strict 严格模式"]
    ts_sound_b["协变/逆变/双变"]
    ts_sound_c["类型断言 as 风险"]
    ts_sound_d["noImplicitAny / strictNullChecks"]
    ts_sound --> ts_sound_a & ts_sound_b & ts_sound_c & ts_sound_d

    %% ========== 运行时语义 ==========
    rt_ctx["执行上下文"]
    rt_scope["作用域链"]
    rt_closure["闭包"]
    rt_proto["原型链"]
    rt_eventloop["Event Loop"]
    rt_module["模块系统"]
    rt_mem["内存管理"]

    rt --> rt_ctx & rt_scope & rt_closure & rt_proto & rt_eventloop & rt_module & rt_mem

    rt_ctx_a["Lexical Environment"]
    rt_ctx_b["Variable Environment"]
    rt_ctx_c["Global / Function / Eval"]
    rt_ctx --> rt_ctx_a & rt_ctx_b & rt_ctx_c

    rt_scope_a["词法作用域"]
    rt_scope_b["变量提升 Hoisting"]
    rt_scope_c["TDZ 暂时性死区"]
    rt_scope_d["块级作用域"]
    rt_scope --> rt_scope_a & rt_scope_b & rt_scope_c & rt_scope_d

    rt_closure_a["自由变量捕获"]
    rt_closure_b["闭包与内存泄漏"]
    rt_closure_c["函数工厂模式"]
    rt_closure --> rt_closure_a & rt_closure_b & rt_closure_c

    rt_proto_a["__proto__ / prototype"]
    rt_proto_b["Object.create"]
    rt_proto_c["Class extends 本质"]
    rt_proto_d["instanceof 原理"]
    rt_proto --> rt_proto_a & rt_proto_b & rt_proto_c & rt_proto_d

    rt_eventloop_a["Call Stack"]
    rt_eventloop_b["Macro Task"]
    rt_eventloop_c["Micro Task"]
    rt_eventloop_d["Node.js libuv"]
    rt_eventloop_e["requestIdleCallback"]
    rt_eventloop --> rt_eventloop_a & rt_eventloop_b & rt_eventloop_c & rt_eventloop_d & rt_eventloop_e

    rt_module_a["ESM import/export"]
    rt_module_b["CJS require/module"]
    rt_module_c["Tree-shaking 原理"]
    rt_module_d["循环依赖处理"]
    rt_module_e["Import Attributes / JSON"]
    rt_module --> rt_module_a & rt_module_b & rt_module_c & rt_module_d & rt_module_e

    rt_mem_a["垃圾回收 GC"]
    rt_mem_b["标记清除 / 分代回收"]
    rt_mem_c["WeakRef / FinalizationRegistry"]
    rt_mem_d["内存泄漏排查"]
    rt_mem_e["V8 Heap 结构"]
    rt_mem --> rt_mem_a & rt_mem_b & rt_mem_c & rt_mem_d & rt_mem_e

    %% ========== 编译与工具 ==========
    cmp_tsc["tsc"]
    cmp_babel["Babel"]
    cmp_swc["SWC"]
    cmp_esbuild["esbuild"]
    cmp_tsgo["tsgo Go移植"]
    cmp_erase["类型擦除"]
    cmp_sourcemap["Source Map"]

    cmp --> cmp_tsc & cmp_babel & cmp_swc & cmp_esbuild & cmp_tsgo & cmp_erase & cmp_sourcemap

    cmp_tsc_a["类型检查"]
    cmp_tsc_b["tsc --watch"]
    cmp_tsc_c["tsconfig.json 配置"]
    cmp_tsc_d["declaration 输出 .d.ts"]
    cmp_tsc --> cmp_tsc_a & cmp_tsc_b & cmp_tsc_c & cmp_tsc_d

    cmp_babel_a["@babel/preset-env"]
    cmp_babel_b["@babel/preset-typescript"]
    cmp_babel_c["Plugin / AST 转换"]
    cmp_babel_d["Polyfill 策略"]
    cmp_babel --> cmp_babel_a & cmp_babel_b & cmp_babel_c & cmp_babel_d

    cmp_swc_a["Rust 编写超快编译"]
    cmp_swc_b["@swc/core"]
    cmp_swc_c["Next.js 内置"]
    cmp_swc_d["Jest 替代 babel-jest"]
    cmp_swc --> cmp_swc_a & cmp_swc_b & cmp_swc_c & cmp_swc_d

    cmp_esbuild_a["Go 编写零依赖"]
    cmp_esbuild_b["Bundle + Transform"]
    cmp_esbuild_c["Vite 预构建依赖"]
    cmp_esbuild_d["ESM / CJS 双输出"]
    cmp_esbuild --> cmp_esbuild_a & cmp_esbuild_b & cmp_esbuild_c & cmp_esbuild_d

    cmp_tsgo_a["Anders Hejlsberg 主导"]
    cmp_tsgo_b["Go 重写 tsc"]
    cmp_tsgo_c["10x 性能目标"]
    cmp_tsgo_d["类型保持 100% 兼容"]
    cmp_tsgo --> cmp_tsgo_a & cmp_tsgo_b & cmp_tsgo_c & cmp_tsgo_d

    cmp_erase_a["编译期类型移除"]
    cmp_erase_b["Decorator 转换"]
    cmp_erase_c["Enum 转对象"]
    cmp_erase --> cmp_erase_a & cmp_erase_b & cmp_erase_c

    cmp_sourcemap_a["mappings VLQ 编码"]
    cmp_sourcemap_b["Debug 断点映射"]
    cmp_sourcemap_c["SourceMap 链接"]
    cmp_sourcemap --> cmp_sourcemap_a & cmp_sourcemap_b & cmp_sourcemap_c

    %% ========== 形式化基础 ==========
    fmt_lambda["λ演算"]
    fmt_opsem["操作语义"]
    fmt_infer["类型推断"]
    fmt_subtype["子类型关系"]
    fmt_gradual["渐进类型 Gradual"]

    fmt --> fmt_lambda & fmt_opsem & fmt_infer & fmt_subtype & fmt_gradual

    fmt_lambda_a["α转换 / β归约"]
    fmt_lambda_b["Y 组合子"]
    fmt_lambda_c[" Church 编码"]
    fmt_lambda --> fmt_lambda_a & fmt_lambda_b & fmt_lambda_c

    fmt_opsem_a["小步操作语义"]
    fmt_opsem_b["大步操作语义"]
    fmt_opsem_c["ECMA-262 规范映射"]
    fmt_opsem --> fmt_opsem_a & fmt_opsem_b & fmt_opsem_c

    fmt_infer_a["Hindley-Milner"]
    fmt_infer_b["W 算法"]
    fmt_infer_c["双向类型检查"]
    fmt_infer_d["上下文类型推断"]
    fmt_infer --> fmt_infer_a & fmt_infer_b & fmt_infer_c & fmt_infer_d

    fmt_subtype_a["结构子类型"]
    fmt_subtype_b["名义子类型"]
    fmt_subtype_c["宽度/深度子类型"]
    fmt_subtype_d["F-bounded 多态"]
    fmt_subtype --> fmt_subtype_a & fmt_subtype_b & fmt_subtype_c & fmt_subtype_d

    fmt_gradual_a["any 的语义"]
    fmt_gradual_b["边界包装"]
    fmt_gradual_c["一致等价 Consistent"]
    fmt_gradual_d["TypeScript vs Flow"]
    fmt_gradual --> fmt_gradual_a & fmt_gradual_b & fmt_gradual_c & fmt_gradual_d

    %% ========== 依赖/演进虚线 ==========
    es2015 -.->|演进| es2016
    es2016 -.->|演进| es2017
    es2017 -.->|演进| es2018
    es2018 -.->|演进| es2019
    es2019 -.->|演进| es2020
    es2020 -.->|演进| es2021
    es2021 -.->|演进| es2022
    es2022 -.->|演进| es2023
    es2023 -.->|演进| es2024
    es2024 -.->|演进| es2025
    es2025 -.->|演进| es2026

    es2015_d -.->|依赖| rt_module_a
    es2017_a -.->|依赖| rt_eventloop
    rt_scope -.->|依赖| rt_closure
    rt_ctx -.->|依赖| rt_scope
    rt_proto -.->|依赖| rt_mem_a
    rt_eventloop -.->|依赖| rt_ctx

    fmt_lambda -.->|理论基础| fmt_opsem
    fmt_infer -.->|理论基础| ts_basic
    fmt_subtype -.->|理论基础| ts_generic
    fmt_gradual -.->|理论基础| ts_sound
    ts_basic -.->|演进| ts_generic
    ts_generic -.->|演进| ts_cond
    ts_cond -.->|演进| ts_map
    ts_map -.->|演进| ts_gym

    cmp_tsc -.->|依赖| cmp_erase
    cmp_babel -.->|竞争| cmp_swc
    cmp_swc -.->|竞争| cmp_esbuild
    cmp_tsc -.->|输出| cmp_sourcemap
    cmp_esbuild -.->|启发| cmp_tsgo
    ts_sound_a -.->|要求| cmp_tsc_c

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
