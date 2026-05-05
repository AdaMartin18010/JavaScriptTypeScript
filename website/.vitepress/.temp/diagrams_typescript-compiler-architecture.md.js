import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSuspense, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"TypeScript 编译器架构","description":"TypeScript 编译器的内部架构：扫描器、解析器、绑定器、检查器与发射器的完整流程","frontmatter":{"title":"TypeScript 编译器架构","description":"TypeScript 编译器的内部架构：扫描器、解析器、绑定器、检查器与发射器的完整流程"},"headers":[],"relativePath":"diagrams/typescript-compiler-architecture.md","filePath":"diagrams/typescript-compiler-architecture.md","lastUpdated":1777805892000}');
const _sfc_main = { name: "diagrams/typescript-compiler-architecture.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Mermaid = resolveComponent("Mermaid");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="typescript-编译器架构" tabindex="-1">TypeScript 编译器架构 <a class="header-anchor" href="#typescript-编译器架构" aria-label="Permalink to &quot;TypeScript 编译器架构&quot;">​</a></h1><blockquote><p>TypeScript 编译器（tsc）是一个功能丰富的转译器和类型检查器。理解其内部架构有助于诊断复杂的类型问题和优化编译性能。</p></blockquote><h2 id="编译器管线" tabindex="-1">编译器管线 <a class="header-anchor" href="#编译器管线" aria-label="Permalink to &quot;编译器管线&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-11",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5B%E6%BA%90%E7%A0%81%20.ts%5D%20--%3E%20B%5BScanner%3Cbr%2F%3E%E6%89%AB%E6%8F%8F%E5%99%A8%5D%0A%20%20%20%20B%20--%3E%20C%5BToken%20Stream%5D%0A%20%20%20%20C%20--%3E%20D%5BParser%3Cbr%2F%3E%E8%A7%A3%E6%9E%90%E5%99%A8%5D%0A%20%20%20%20D%20--%3E%20E%5BAST%5D%0A%20%20%20%20E%20--%3E%20F%5BBinder%3Cbr%2F%3E%E7%BB%91%E5%AE%9A%E5%99%A8%5D%0A%20%20%20%20F%20--%3E%20G%5BSymbol%20Table%5D%0A%20%20%20%20E%20--%3E%20H%5BChecker%3Cbr%2F%3E%E7%B1%BB%E5%9E%8B%E6%A3%80%E6%9F%A5%E5%99%A8%5D%0A%20%20%20%20H%20--%3E%20I%5BType%20Information%5D%0A%20%20%20%20E%20--%3E%20J%5BEmitter%3Cbr%2F%3E%E5%8F%91%E5%B0%84%E5%99%A8%5D%0A%20%20%20%20J%20--%3E%20K%5B.js%20%E8%BE%93%E5%87%BA%5D%0A%20%20%20%20J%20--%3E%20L%5B.d.ts%20%E8%BE%93%E5%87%BA%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="各阶段详解" tabindex="-1">各阶段详解 <a class="header-anchor" href="#各阶段详解" aria-label="Permalink to &quot;各阶段详解&quot;">​</a></h2><h3 id="_1-scanner-扫描器" tabindex="-1">1. Scanner（扫描器） <a class="header-anchor" href="#_1-scanner-扫描器" aria-label="Permalink to &quot;1. Scanner（扫描器）&quot;">​</a></h3><p>将源代码字符流转换为 Token 序列：</p><div class="language-typescript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// 源码</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}">const</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> x</span><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}">:</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> number</span><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}"> =</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> 42</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// Token 序列</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// [ConstKeyword, Identifier, Colon, NumberKeyword, Equals, NumericLiteral(42), Semicolon]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><h3 id="_2-parser-解析器" tabindex="-1">2. Parser（解析器） <a class="header-anchor" href="#_2-parser-解析器" aria-label="Permalink to &quot;2. Parser（解析器）&quot;">​</a></h3><p>将 Token 序列构建为抽象语法树（AST）：</p>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-28",
        class: "mermaid",
        graph: "flowchart%20TD%0A%20%20%20%20A%5BSourceFile%5D%20--%3E%20B%5BVariableStatement%5D%0A%20%20%20%20B%20--%3E%20C%5BVariableDeclarationList%5D%0A%20%20%20%20C%20--%3E%20D%5BVariableDeclaration%5D%0A%20%20%20%20D%20--%3E%20E%5BIdentifier%20'x'%5D%0A%20%20%20%20D%20--%3E%20F%5BTypeAnnotation%5D%0A%20%20%20%20F%20--%3E%20G%5BNumberKeyword%5D%0A%20%20%20%20D%20--%3E%20H%5BNumericLiteral%2042%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h3 id="_3-binder-绑定器" tabindex="-1">3. Binder（绑定器） <a class="header-anchor" href="#_3-binder-绑定器" aria-label="Permalink to &quot;3. Binder（绑定器）&quot;">​</a></h3><p>建立标识符与声明之间的符号表：</p><div class="language-typescript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// 创建 Symbol</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}">const</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> symbol</span><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}"> =</span><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}"> createSymbol</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">(</span><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">/*flags*/</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}"> SymbolFlags.Variable, </span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}">&#39;x&#39;</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">);</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// 建立作用域链</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// 全局作用域 → 模块作用域 → 函数作用域 → 块级作用域</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><h3 id="_4-checker-类型检查器" tabindex="-1">4. Checker（类型检查器） <a class="header-anchor" href="#_4-checker-类型检查器" aria-label="Permalink to &quot;4. Checker（类型检查器）&quot;">​</a></h3><p>核心类型检查逻辑：</p>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-42",
        class: "mermaid",
        graph: "flowchart%20TD%0A%20%20%20%20A%5B%E7%B1%BB%E5%9E%8B%E6%A3%80%E6%9F%A5%5D%20--%3E%20B%5B%E7%B1%BB%E5%9E%8B%E6%8E%A8%E6%96%AD%5D%0A%20%20%20%20A%20--%3E%20C%5B%E7%B1%BB%E5%9E%8B%E5%85%BC%E5%AE%B9%E6%80%A7%E6%A3%80%E6%9F%A5%5D%0A%20%20%20%20A%20--%3E%20D%5B%E6%8E%A7%E5%88%B6%E6%B5%81%E5%88%86%E6%9E%90%5D%0A%20%20%20%20B%20--%3E%20E%5B%E5%8F%98%E9%87%8F%E5%88%9D%E5%A7%8B%E5%8C%96%E6%8E%A8%E6%96%AD%5D%0A%20%20%20%20B%20--%3E%20F%5B%E5%87%BD%E6%95%B0%E8%BF%94%E5%9B%9E%E7%B1%BB%E5%9E%8B%E6%8E%A8%E6%96%AD%5D%0A%20%20%20%20C%20--%3E%20G%5B%E7%BB%93%E6%9E%84%E5%AD%90%E7%B1%BB%E5%9E%8B%E6%A3%80%E6%9F%A5%5D%0A%20%20%20%20D%20--%3E%20H%5B%E7%B1%BB%E5%9E%8B%E6%94%B6%E7%AA%84%5D%0A%20%20%20%20D%20--%3E%20I%5B%E5%8F%AF%E8%BE%BE%E6%80%A7%E5%88%86%E6%9E%90%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h3 id="_5-emitter-发射器" tabindex="-1">5. Emitter（发射器） <a class="header-anchor" href="#_5-emitter-发射器" aria-label="Permalink to &quot;5. Emitter（发射器）&quot;">​</a></h3><p>生成输出文件：</p>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-49",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5BAST%5D%20--%3E%20B%5BTransformer%5D%0A%20%20%20%20B%20--%3E%20C%5B%E9%99%8D%E7%BA%A7ES5%2FES6%5D%0A%20%20%20%20C%20--%3E%20D%5BPrinter%5D%0A%20%20%20%20D%20--%3E%20E%5B.js%20%E6%96%87%E4%BB%B6%5D%0A%20%20%20%20D%20--%3E%20F%5B.d.ts%20%E6%96%87%E4%BB%B6%5D%0A%20%20%20%20D%20--%3E%20G%5BSource%20Map%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="tsconfig-配置对编译器的影响" tabindex="-1">TSConfig 配置对编译器的影响 <a class="header-anchor" href="#tsconfig-配置对编译器的影响" aria-label="Permalink to &quot;TSConfig 配置对编译器的影响&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-53",
        class: "mermaid",
        graph: "flowchart%20TB%0A%20%20%20%20A%5Btsconfig.json%5D%20--%3E%20B%5BcompilerOptions%5D%0A%20%20%20%20B%20--%3E%20C%5Btarget%5D%0A%20%20%20%20B%20--%3E%20D%5Bmodule%5D%0A%20%20%20%20B%20--%3E%20E%5Bstrict%5D%0A%20%20%20%20C%20--%3E%20F%5B%E9%99%8D%E7%BA%A7%E7%BA%A7%E5%88%AB%5D%0A%20%20%20%20D%20--%3E%20G%5B%E6%A8%A1%E5%9D%97%E6%A0%BC%E5%BC%8F%5D%0A%20%20%20%20E%20--%3E%20H%5B%E4%B8%A5%E6%A0%BC%E6%A3%80%E6%9F%A5%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<table tabindex="0"><thead><tr><th>配置项</th><th>影响阶段</th><th>说明</th></tr></thead><tbody><tr><td><code>target</code></td><td>Emitter</td><td>输出 JavaScript 版本</td></tr><tr><td><code>module</code></td><td>Emitter</td><td>模块系统格式</td></tr><tr><td><code>strict</code></td><td>Checker</td><td>启用所有严格类型检查</td></tr><tr><td><code>noEmit</code></td><td>Emitter</td><td>跳过文件生成</td></tr><tr><td><code>declaration</code></td><td>Emitter</td><td>生成 .d.ts 文件</td></tr></tbody></table><h2 id="编译性能优化" tabindex="-1">编译性能优化 <a class="header-anchor" href="#编译性能优化" aria-label="Permalink to &quot;编译性能优化&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-129",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5B%E5%A4%A7%E9%A1%B9%E7%9B%AE%E7%BC%96%E8%AF%91%E6%85%A2%5D%20--%3E%20B%5B%E5%A2%9E%E9%87%8F%E7%BC%96%E8%AF%91%5D%0A%20%20%20%20A%20--%3E%20C%5B%E9%A1%B9%E7%9B%AE%E5%BC%95%E7%94%A8%5D%0A%20%20%20%20A%20--%3E%20D%5BskipLibCheck%5D%0A%20%20%20%20B%20--%3E%20E%5B%E4%BB%85%E7%BC%96%E8%AF%91%E4%BF%AE%E6%94%B9%E7%9A%84%E6%96%87%E4%BB%B6%5D%0A%20%20%20%20C%20--%3E%20F%5B%E5%B9%B6%E8%A1%8C%E7%BC%96%E8%AF%91%E5%AD%90%E9%A1%B9%E7%9B%AE%5D%0A%20%20%20%20D%20--%3E%20G%5B%E8%B7%B3%E8%BF%87node_modules%E6%A3%80%E6%9F%A5%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<div class="language-json vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// tsconfig.json 性能优化</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&amp;#</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">123</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}">  &quot;compilerOptions&quot;</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">: &amp;#</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">123</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}">    &quot;incremental&quot;</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">: </span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">true</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}">    &quot;tsBuildInfoFile&quot;</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">: </span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}">&quot;./.tsbuildinfo&quot;</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}">    &quot;skipLibCheck&quot;</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">: </span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">true</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}">    &quot;composite&quot;</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">: </span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">true</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">  &amp;#</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">125</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&amp;#</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">125</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h2 id="参考资源" tabindex="-1">参考资源 <a class="header-anchor" href="#参考资源" aria-label="Permalink to &quot;参考资源&quot;">​</a></h2><ul><li><a href="/fundamentals/type-system">类型系统导读</a> — TypeScript 类型理论基础</li><li><a href="/fundamentals/academic-frontiers">TSGo 原生编译器</a> — TypeScript 编译器重写计划</li></ul><hr><p><a href="./">← 返回架构图首页</a></p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("diagrams/typescript-compiler-architecture.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const typescriptCompilerArchitecture = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  typescriptCompilerArchitecture as default
};
