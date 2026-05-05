import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSuspense, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"JavaScript/TypeScript 全景知识库","description":"Awesome JS/TS Ecosystem 项目的知识图谱，展示各专题间的关联关系与学习路径","frontmatter":{"title":"JavaScript/TypeScript 全景知识库","description":"Awesome JS/TS Ecosystem 项目的知识图谱，展示各专题间的关联关系与学习路径"},"headers":[],"relativePath":"diagrams/project-knowledge-graph.md","filePath":"diagrams/project-knowledge-graph.md","lastUpdated":1777808049000}');
const _sfc_main = { name: "diagrams/project-knowledge-graph.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Mermaid = resolveComponent("Mermaid");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="javascript-typescript-全景知识库-项目知识图谱" tabindex="-1">JavaScript/TypeScript 全景知识库 - 项目知识图谱 <a class="header-anchor" href="#javascript-typescript-全景知识库-项目知识图谱" aria-label="Permalink to &quot;JavaScript/TypeScript 全景知识库 - 项目知识图谱&quot;">​</a></h1><blockquote><p>本项目构建了一个完整的 JavaScript/TypeScript 学习与知识体系。本图谱展示了各专题间的关联关系，帮助学习者规划最优学习路径。</p></blockquote><h2 id="知识图谱总览" tabindex="-1">知识图谱总览 <a class="header-anchor" href="#知识图谱总览" aria-label="Permalink to &quot;知识图谱总览&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-11",
        class: "mermaid",
        graph: "mindmap%0A%20%20root((JS%2FTS%3Cbr%2F%3E%E7%9F%A5%E8%AF%86%E4%BD%93%E7%B3%BB))%0A%20%20%20%20%E8%AF%AD%E8%A8%80%E5%9F%BA%E7%A1%80%0A%20%20%20%20%20%20%E8%AF%AD%E8%A8%80%E8%AF%AD%E4%B9%89%0A%20%20%20%20%20%20%E7%B1%BB%E5%9E%8B%E7%B3%BB%E7%BB%9F%0A%20%20%20%20%20%20%E6%89%A7%E8%A1%8C%E6%A8%A1%E5%9E%8B%0A%20%20%20%20%20%20%E6%A8%A1%E5%9D%97%E7%B3%BB%E7%BB%9F%0A%20%20%20%20%20%20%E5%AF%B9%E8%B1%A1%E6%A8%A1%E5%9E%8B%0A%20%20%20%20%20%20ECMAScript%E8%A7%84%E8%8C%83%0A%20%20%20%20%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5%0A%20%20%20%20%20%20%E6%9E%84%E5%BB%BA%E5%B7%A5%E5%85%B7%0A%20%20%20%20%20%20%E6%B5%8B%E8%AF%95%E5%B7%A5%E7%A8%8B%0A%20%20%20%20%20%20%E6%80%A7%E8%83%BD%E5%B7%A5%E7%A8%8B%0A%20%20%20%20%20%20%E5%AE%89%E5%85%A8%E5%90%88%E8%A7%84%0A%20%20%20%20%20%20DevOps%0A%20%20%20%20%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%0A%20%20%20%20%20%20React%E7%94%9F%E6%80%81%0A%20%20%20%20%20%20Vue%E7%94%9F%E6%80%81%0A%20%20%20%20%20%20Svelte%2FSolid%0A%20%20%20%20%20%20%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%0A%20%20%20%20%E5%90%8E%E7%AB%AF%E4%B8%8EAPI%0A%20%20%20%20%20%20Node.js%0A%20%20%20%20%20%20API%E8%AE%BE%E8%AE%A1%0A%20%20%20%20%20%20%E6%95%B0%E6%8D%AE%E5%BA%93ORM%0A%20%20%20%20%20%20%E5%BE%AE%E6%9C%8D%E5%8A%A1%0A%20%20%20%20%E5%89%8D%E6%B2%BF%E6%8A%80%E6%9C%AF%0A%20%20%20%20%20%20WebAssembly%0A%20%20%20%20%20%20AI%2FML%E6%8E%A8%E7%90%86%0A%20%20%20%20%20%20%E8%BE%B9%E7%BC%98%E8%AE%A1%E7%AE%97%0A%20%20%20%20%20%20Rust%E5%B7%A5%E5%85%B7%E9%93%BE%0A%20%20%20%20%E7%90%86%E8%AE%BA%E5%9F%BA%E7%A1%80%0A%20%20%20%20%20%20%E8%8C%83%E7%95%B4%E8%AE%BA%0A%20%20%20%20%20%20%E7%B1%BB%E5%9E%8B%E8%AE%BA%0A%20%20%20%20%20%20%E8%AE%A4%E7%9F%A5%E7%A7%91%E5%AD%A6%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="核心学习路径" tabindex="-1">核心学习路径 <a class="header-anchor" href="#核心学习路径" aria-label="Permalink to &quot;核心学习路径&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-15",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20subgraph%20%E5%9F%BA%E7%A1%80%E8%B7%AF%E5%BE%84%0A%20%20%20%20%20%20%20%20A%5B%E8%AF%AD%E8%A8%80%E8%AF%AD%E4%B9%89%5D%20--%3E%20B%5B%E7%B1%BB%E5%9E%8B%E7%B3%BB%E7%BB%9F%5D%0A%20%20%20%20%20%20%20%20B%20--%3E%20C%5B%E6%89%A7%E8%A1%8C%E6%A8%A1%E5%9E%8B%5D%0A%20%20%20%20%20%20%20%20C%20--%3E%20D%5B%E6%A8%A1%E5%9D%97%E7%B3%BB%E7%BB%9F%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20%E5%B7%A5%E7%A8%8B%E8%B7%AF%E5%BE%84%0A%20%20%20%20%20%20%20%20E%5B%E6%9E%84%E5%BB%BA%E5%B7%A5%E5%85%B7%5D%20--%3E%20F%5B%E6%B5%8B%E8%AF%95%E5%B7%A5%E7%A8%8B%5D%0A%20%20%20%20%20%20%20%20F%20--%3E%20G%5B%E6%80%A7%E8%83%BD%E5%B7%A5%E7%A8%8B%5D%0A%20%20%20%20%20%20%20%20G%20--%3E%20H%5BDevOps%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20%E8%BF%9B%E9%98%B6%E8%B7%AF%E5%BE%84%0A%20%20%20%20%20%20%20%20I%5B%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F%5D%20--%3E%20J%5B%E6%9E%B6%E6%9E%84%E6%A8%A1%E5%BC%8F%5D%0A%20%20%20%20%20%20%20%20J%20--%3E%20K%5B%E5%BE%AE%E6%9C%8D%E5%8A%A1%5D%0A%20%20%20%20%20%20%20%20K%20--%3E%20L%5B%E8%BE%B9%E7%BC%98%E8%AE%A1%E7%AE%97%5D%0A%20%20%20%20end%0A%20%20%20%20D%20--%3E%20E%0A%20%20%20%20H%20--%3E%20I%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="专题关联矩阵" tabindex="-1">专题关联矩阵 <a class="header-anchor" href="#专题关联矩阵" aria-label="Permalink to &quot;专题关联矩阵&quot;">​</a></h2><table tabindex="0"><thead><tr><th>专题</th><th>前置知识</th><th>关联专题</th><th>难度</th></tr></thead><tbody><tr><td>语言语义</td><td>无</td><td>类型系统、执行模型</td><td>🌱 初级</td></tr><tr><td>类型系统</td><td>语言语义</td><td>执行模型、对象模型</td><td>🌿 中级</td></tr><tr><td>执行模型</td><td>语言语义</td><td>性能工程、内存模型</td><td>🌿 中级</td></tr><tr><td>模块系统</td><td>语言语义</td><td>DevOps、微服务</td><td>🌿 中级</td></tr><tr><td>状态管理</td><td>前端框架</td><td>设计模式、性能工程</td><td>🌿 中级</td></tr><tr><td>微服务</td><td>模块系统、API设计</td><td>DevOps、数据库</td><td>🍂 高级</td></tr><tr><td>WebAssembly</td><td>执行模型、性能工程</td><td>边缘计算、Rust</td><td>🍂 高级</td></tr><tr><td>范畴论</td><td>类型系统</td><td>函数式编程</td><td>🍁 专家</td></tr></tbody></table><h2 id="项目结构导航" tabindex="-1">项目结构导航 <a class="header-anchor" href="#项目结构导航" aria-label="Permalink to &quot;项目结构导航&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-154",
        class: "mermaid",
        graph: "flowchart%20TB%0A%20%20%20%20subgraph%20%E6%BA%90%E7%A0%81%E7%9B%AE%E5%BD%95%0A%20%20%20%20%20%20%20%20A%5B10-fundamentals%5D%20--%3E%20B%5B%E8%AF%AD%E8%A8%80%E6%A0%B8%E5%BF%83%E6%96%87%E6%A1%A3%5D%0A%20%20%20%20%20%20%20%20C%5B20-code-lab%5D%20--%3E%20D%5B%E5%8A%A8%E6%89%8B%E5%AE%9E%E9%AA%8C%5D%0A%20%20%20%20%20%20%20%20E%5B30-knowledge-base%5D%20--%3E%20F%5B%E7%9F%A5%E8%AF%86%E4%BD%93%E7%B3%BB%5D%0A%20%20%20%20%20%20%20%20G%5B50-examples%5D%20--%3E%20H%5B%E5%AE%9E%E6%88%98%E7%A4%BA%E4%BE%8B%5D%0A%20%20%20%20%20%20%20%20I%5B70-theoretical-foundations%5D%20--%3E%20J%5B%E7%90%86%E8%AE%BA%E5%89%8D%E6%B2%BF%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20%E7%BD%91%E7%AB%99%0A%20%20%20%20%20%20%20%20K%5Bwebsite%2F%5D%20--%3E%20L%5BVitePress%E7%AB%99%E7%82%B9%5D%0A%20%20%20%20%20%20%20%20L%20--%3E%20M%5B%E6%8C%87%E5%8D%97%E4%B8%8E%E7%A4%BA%E4%BE%8B%5D%0A%20%20%20%20end%0A%20%20%20%20B%20--%3E%20L%0A%20%20%20%20D%20--%3E%20L%0A%20%20%20%20F%20--%3E%20L%0A%20%20%20%20H%20--%3E%20L%0A%20%20%20%20J%20--%3E%20L%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="推荐学习路径" tabindex="-1">推荐学习路径 <a class="header-anchor" href="#推荐学习路径" aria-label="Permalink to &quot;推荐学习路径&quot;">​</a></h2><h3 id="路径一-前端工程师进阶" tabindex="-1">路径一：前端工程师进阶 <a class="header-anchor" href="#路径一-前端工程师进阶" aria-label="Permalink to &quot;路径一：前端工程师进阶&quot;">​</a></h3>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-161",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5B%E8%AF%AD%E8%A8%80%E5%9F%BA%E7%A1%80%5D%20--%3E%20B%5B%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%5D%0A%20%20%20%20B%20--%3E%20C%5B%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%5D%0A%20%20%20%20C%20--%3E%20D%5B%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%5D%0A%20%20%20%20D%20--%3E%20E%5B%E6%B5%8B%E8%AF%95%E5%B7%A5%E7%A8%8B%5D%0A%20%20%20%20E%20--%3E%20F%5BDevOps%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h3 id="路径二-全栈工程师" tabindex="-1">路径二：全栈工程师 <a class="header-anchor" href="#路径二-全栈工程师" aria-label="Permalink to &quot;路径二：全栈工程师&quot;">​</a></h3>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-165",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5B%E8%AF%AD%E8%A8%80%E5%9F%BA%E7%A1%80%5D%20--%3E%20B%5BNode.js%5D%0A%20%20%20%20B%20--%3E%20C%5B%E6%95%B0%E6%8D%AE%E5%BA%93ORM%5D%0A%20%20%20%20C%20--%3E%20D%5BAPI%E8%AE%BE%E8%AE%A1%5D%0A%20%20%20%20D%20--%3E%20E%5B%E5%BE%AE%E6%9C%8D%E5%8A%A1%5D%0A%20%20%20%20E%20--%3E%20F%5BDevOps%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h3 id="路径三-前沿技术探索" tabindex="-1">路径三：前沿技术探索 <a class="header-anchor" href="#路径三-前沿技术探索" aria-label="Permalink to &quot;路径三：前沿技术探索&quot;">​</a></h3>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-169",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5B%E7%B1%BB%E5%9E%8B%E7%B3%BB%E7%BB%9F%5D%20--%3E%20B%5BWebAssembly%5D%0A%20%20%20%20B%20--%3E%20C%5BRust%E5%B7%A5%E5%85%B7%E9%93%BE%5D%0A%20%20%20%20C%20--%3E%20D%5BAI%E6%8E%A8%E7%90%86%5D%0A%20%20%20%20D%20--%3E%20E%5B%E8%BE%B9%E7%BC%98%E8%AE%A1%E7%AE%97%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="参考资源" tabindex="-1">参考资源 <a class="header-anchor" href="#参考资源" aria-label="Permalink to &quot;参考资源&quot;">​</a></h2><ul><li><a href="/">项目首页</a> — 完整知识体系列表</li><li><a href="/theoretical-foundations/">理论前沿</a> — 36篇理论摘要</li><li><a href="/code-lab/">代码实验室</a> — 动手实验集合</li></ul><hr><p><a href="./">← 返回架构图首页</a></p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("diagrams/project-knowledge-graph.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const projectKnowledgeGraph = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  projectKnowledgeGraph as default
};
