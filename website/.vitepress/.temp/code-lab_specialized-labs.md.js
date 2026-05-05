import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSuspense, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"专题实验室","description":"专题实验室：Svelte Signals、类型系统、异步并发、认证授权等深度实验","frontmatter":{"title":"专题实验室","description":"专题实验室：Svelte Signals、类型系统、异步并发、认证授权等深度实验"},"headers":[],"relativePath":"code-lab/specialized-labs.md","filePath":"code-lab/specialized-labs.md","lastUpdated":1777805892000}');
const _sfc_main = { name: "code-lab/specialized-labs.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Mermaid = resolveComponent("Mermaid");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="实验室专题-90-96" tabindex="-1">实验室专题 (90-96) <a class="header-anchor" href="#实验室专题-90-96" aria-label="Permalink to &quot;实验室专题 (90-96)&quot;">​</a></h1><blockquote><p>专题实验室覆盖特定技术栈或工程领域的深度实验。每个专题都聚焦于一个具体的技术方向，提供从理论到实践的完整学习路径。</p></blockquote><h2 id="专题列表" tabindex="-1">专题列表 <a class="header-anchor" href="#专题列表" aria-label="Permalink to &quot;专题列表&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-11",
        class: "mermaid",
        graph: "flowchart%20TB%0A%20%20%20%20subgraph%20%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%0A%20%20%20%20%20%20%20%20A%5BSvelte%20Signals%5D%20--%3E%20B%5B%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F%5D%0A%20%20%20%20%20%20%20%20C%5BVue%20Reactivity%5D%20--%3E%20D%5B%E4%BE%9D%E8%B5%96%E8%BF%BD%E8%B8%AA%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20%E8%AF%AD%E8%A8%80%E7%89%B9%E6%80%A7%0A%20%20%20%20%20%20%20%20E%5B%E7%B1%BB%E5%9E%8B%E7%B3%BB%E7%BB%9F%5D%20--%3E%20F%5B%E6%B3%9B%E5%9E%8B%E4%B8%8E%E6%9D%A1%E4%BB%B6%E7%B1%BB%E5%9E%8B%5D%0A%20%20%20%20%20%20%20%20G%5B%E5%BC%82%E6%AD%A5%E5%B9%B6%E5%8F%91%5D%20--%3E%20H%5BPromise%E4%B8%8EAsync%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5%0A%20%20%20%20%20%20%20%20I%5B%E8%AE%A4%E8%AF%81%E6%8E%88%E6%9D%83%5D%20--%3E%20J%5BJWT%E4%B8%8EOAuth%5D%0A%20%20%20%20%20%20%20%20K%5BServer%20Functions%5D%20--%3E%20L%5B%E5%85%A8%E6%A0%88%E7%B1%BB%E5%9E%8B%E5%AE%89%E5%85%A8%5D%0A%20%20%20%20end%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="可用实验" tabindex="-1">可用实验 <a class="header-anchor" href="#可用实验" aria-label="Permalink to &quot;可用实验&quot;">​</a></h2><table tabindex="0"><thead><tr><th>专题</th><th>实验文件</th><th>难度</th><th>预计用时</th></tr></thead><tbody><tr><td>Svelte Signals</td><td><a href="/code-lab/svelte-signals-lab">svelte-signals-lab</a></td><td>🌿 中级</td><td>45min</td></tr><tr><td>语言核心</td><td><a href="/code-lab/language-core-lab">language-core-lab</a></td><td>🌱 初级</td><td>30min</td></tr><tr><td>异步并发</td><td><a href="/code-lab/async-concurrency-lab">async-concurrency-lab</a></td><td>🌿 中级</td><td>45min</td></tr><tr><td>类型系统</td><td><a href="/code-lab/type-system-lab">type-system-lab</a></td><td>🍂 高级</td><td>60min</td></tr><tr><td>λ Lambda演算</td><td><a href="/code-lab/lab-00-lambda-calculus">lab-00-lambda-calculus</a></td><td>🍂 高级</td><td>90min</td></tr><tr><td>操作语义</td><td><a href="/code-lab/lab-00-operational-semantics">lab-00-operational-semantics</a></td><td>🍂 高级</td><td>90min</td></tr><tr><td>工程环境</td><td><a href="/code-lab/lab-01-basic-setup">lab-01-basic-setup</a></td><td>🌱 初级</td><td>30min</td></tr><tr><td>类型推断</td><td><a href="/code-lab/lab-01-type-inference">lab-01-type-inference</a></td><td>🌿 中级</td><td>45min</td></tr><tr><td>公理语义</td><td><a href="/code-lab/lab-02-axiomatic-semantics">lab-02-axiomatic-semantics</a></td><td>🍂 高级</td><td>90min</td></tr><tr><td>Server Functions</td><td><a href="/code-lab/lab-02-server-functions">lab-02-server-functions</a></td><td>🌿 中级</td><td>60min</td></tr><tr><td>子类型关系</td><td><a href="/code-lab/lab-02-subtyping">lab-02-subtyping</a></td><td>🌿 中级</td><td>45min</td></tr><tr><td>变量系统</td><td><a href="/code-lab/lab-02-variables">lab-02-variables</a></td><td>🌱 初级</td><td>30min</td></tr><tr><td>认证授权</td><td><a href="/code-lab/lab-03-auth">lab-03-auth</a></td><td>🌿 中级</td><td>60min</td></tr><tr><td>控制流</td><td><a href="/code-lab/lab-03-control-flow">lab-03-control-flow</a></td><td>🌱 初级</td><td>30min</td></tr><tr><td>Mini TS编译器</td><td><a href="/code-lab/lab-03-mini-typescript">lab-03-mini-typescript</a></td><td>🍂 高级</td><td>120min</td></tr></tbody></table><h2 id="svelte-signals-实验室-推荐" tabindex="-1">Svelte Signals 实验室（推荐） <a class="header-anchor" href="#svelte-signals-实验室-推荐" aria-label="Permalink to &quot;Svelte Signals 实验室（推荐）&quot;">​</a></h2><p>Svelte 5 引入了全新的响应式系统 Runes，彻底改变了状态管理的方式：</p><div class="language-svelte vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">svelte</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&amp;lt;script&amp;gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">  let count = $state(0);      // 响应式状态</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">  let doubled = $derived(count * 2); // 派生状态</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">  $effect(() =&gt; &amp;#123;            // 副作用</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    console.log(&#39;Count changed:&#39;, count);</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">  &amp;#125;);</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&amp;lt;/script&amp;gt;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&amp;lt;button onclick=&amp;#123;() =&gt; count++&amp;#125;&amp;gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">  &amp;#123;count&amp;#125; × 2 = &amp;#123;doubled&amp;#125;</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&amp;lt;/button&amp;gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h2 id="参考资源" tabindex="-1">参考资源 <a class="header-anchor" href="#参考资源" aria-label="Permalink to &quot;参考资源&quot;">​</a></h2><ul><li><a href="/svelte-signals-stack/">Svelte Signals 专题</a> — 完整的响应式系统理论</li><li><a href="/programming-principles/">编程原则</a> — λ演算与形式语义</li><li><a href="/typescript-type-system/">TypeScript 类型系统</a> — 类型理论深度专题</li></ul><hr><p><a href="./">← 返回代码实验室首页</a></p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("code-lab/specialized-labs.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const specializedLabs = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  specializedLabs as default
};
