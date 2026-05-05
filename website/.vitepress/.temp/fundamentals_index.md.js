import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSuspense, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"JavaScript/TypeScript 语言基础","description":"语言基础导读首页，覆盖语义、类型、执行、模块、对象、规范与学术前沿","frontmatter":{"title":"JavaScript/TypeScript 语言基础","description":"语言基础导读首页，覆盖语义、类型、执行、模块、对象、规范与学术前沿"},"headers":[],"relativePath":"fundamentals/index.md","filePath":"fundamentals/index.md","lastUpdated":1777797318000}');
const _sfc_main = { name: "fundamentals/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Mermaid = resolveComponent("Mermaid");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="javascript-typescript-语言基础" tabindex="-1">JavaScript/TypeScript 语言基础 <a class="header-anchor" href="#javascript-typescript-语言基础" aria-label="Permalink to &quot;JavaScript/TypeScript 语言基础&quot;">​</a></h1><blockquote><p>从 ECMAScript 规范到工程实践，系统理解 JavaScript/TypeScript 语言的核心机制。</p></blockquote><h2 id="导读导航" tabindex="-1">导读导航 <a class="header-anchor" href="#导读导航" aria-label="Permalink to &quot;导读导航&quot;">​</a></h2><table tabindex="0"><thead><tr><th>章节</th><th>主题</th><th>描述</th></tr></thead><tbody><tr><td><a href="./language-semantics">语言语义 (10.1)</a></td><td>核心特性演进</td><td>ES2020–ES2025 关键特性与语法语义</td></tr><tr><td><a href="./type-system">类型系统 (10.2)</a></td><td>类型理论基础</td><td>结构类型、泛型、条件类型与变型</td></tr><tr><td><a href="./execution-model">执行模型 (10.3)</a></td><td>运行时机制</td><td>调用栈、事件循环、V8 编译管线与 GC</td></tr><tr><td><a href="./module-system">模块系统 (10.4)</a></td><td>模块化机制</td><td>ESM、CommonJS、循环依赖与互操作</td></tr><tr><td><a href="./object-model">对象模型 (10.5)</a></td><td>对象与原型</td><td>原型链、Proxy/Reflect、私有字段</td></tr><tr><td><a href="./ecmascript-spec">ECMAScript 规范 (10.6)</a></td><td>规范阅读指南</td><td>抽象操作、Completion Records、环境记录</td></tr><tr><td><a href="./academic-frontiers">学术前沿 (10.7)</a></td><td>研究前沿</td><td>守卫域理论、TSGo 原生编译器、形式化验证</td></tr></tbody></table><h2 id="知识结构" tabindex="-1">知识结构 <a class="header-anchor" href="#知识结构" aria-label="Permalink to &quot;知识结构&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-108",
        class: "mermaid",
        graph: "mindmap%0A%20%20root((%E8%AF%AD%E8%A8%80%E5%9F%BA%E7%A1%80))%0A%20%20%20%20%E8%AF%AD%E6%B3%95%E5%B1%82%0A%20%20%20%20%20%20%E8%AF%8D%E6%B3%95%E8%AF%AD%E6%B3%95%0A%20%20%20%20%20%20%E5%8F%A5%E6%B3%95%E8%AF%AD%E6%B3%95%0A%20%20%20%20%20%20%E8%AF%AD%E4%B9%89%E8%A7%84%E5%88%99%0A%20%20%20%20%E7%B1%BB%E5%9E%8B%E5%B1%82%0A%20%20%20%20%20%20%E8%AF%AD%E8%A8%80%E7%B1%BB%E5%9E%8B%0A%20%20%20%20%20%20%E8%A7%84%E8%8C%83%E7%B1%BB%E5%9E%8B%0A%20%20%20%20%20%20%E7%B1%BB%E5%9E%8B%E6%93%8D%E4%BD%9C%0A%20%20%20%20%E6%89%A7%E8%A1%8C%E5%B1%82%0A%20%20%20%20%20%20%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87%0A%20%20%20%20%20%20%E7%8E%AF%E5%A2%83%E8%AE%B0%E5%BD%95%0A%20%20%20%20%20%20Realm%0A%20%20%20%20%E8%BF%90%E8%A1%8C%E6%97%B6%0A%20%20%20%20%20%20%E8%B0%83%E7%94%A8%E6%A0%88%0A%20%20%20%20%20%20%E5%A0%86%E5%86%85%E5%AD%98%0A%20%20%20%20%20%20%E4%BA%8B%E4%BB%B6%E5%BE%AA%E7%8E%AF%0A%20%20%20%20%E8%A7%84%E8%8C%83%0A%20%20%20%20%20%20%E6%8A%BD%E8%B1%A1%E6%93%8D%E4%BD%9C%0A%20%20%20%20%20%20%E7%AE%97%E6%B3%95%E6%AD%A5%E9%AA%A4%0A%20%20%20%20%20%20%E5%AE%8C%E6%88%90%E8%AE%B0%E5%BD%95%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="核心资源" tabindex="-1">核心资源 <a class="header-anchor" href="#核心资源" aria-label="Permalink to &quot;核心资源&quot;">​</a></h2><ul><li><strong>10-fundamentals 根目录</strong> — 完整的语言核心文档与代码示例</li><li><strong>TypeScript 类型系统专题</strong> — 19篇类型系统深度文档</li><li><strong>编程原则专题</strong> — 类型论、语义学与形式方法</li></ul><hr><p><a href="/">← 返回首页</a></p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fundamentals/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
