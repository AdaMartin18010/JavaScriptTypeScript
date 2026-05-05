import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"架构图与流程图","description":"JavaScript/TypeScript 生态系统相关的架构图、流程图和知识图谱合集","frontmatter":{"title":"架构图与流程图","description":"JavaScript/TypeScript 生态系统相关的架构图、流程图和知识图谱合集"},"headers":[],"relativePath":"diagrams/index.md","filePath":"diagrams/index.md","lastUpdated":1776726957000}');
const _sfc_main = { name: "diagrams/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="架构图与流程图" tabindex="-1">架构图与流程图 <a class="header-anchor" href="#架构图与流程图" aria-label="Permalink to &quot;架构图与流程图&quot;">​</a></h1><p>本页面汇总了 JavaScript/TypeScript 生态相关的核心架构图、流程图和知识图谱，帮助开发者直观理解底层机制与架构设计。</p><h2 id="目录" tabindex="-1">目录 <a class="header-anchor" href="#目录" aria-label="Permalink to &quot;目录&quot;">​</a></h2><ul><li><a href="./ci-cd-pipeline">CI/CD 流水线架构流程图</a></li><li><a href="./database-transaction-flow">数据库事务执行流程</a></li><li><a href="./ecmascript-timeline">ECMAScript 标准演进时间线 (ES2020 - ES2026)</a></li><li><a href="./event-loop-comparison">Event Loop 架构对比 - Browser vs Node.js vs Worker</a></li><li><a href="./event-loop-detailed">Event Loop 详细执行流程（时序图）</a></li><li><a href="./gradual-typing-lattice">渐进类型系统精度格 (Gradual Typing Lattice)</a></li><li><a href="./js-execution-model">JavaScript 执行模型与 ECMA-262 规范对应</a></li><li><a href="./jwt-authentication-flow">JWT 认证流程时序图</a></li><li><a href="./microservices-patterns">微服务架构常用模式</a></li><li><a href="./module-resolution-flow">ESM/CJS 模块解析与互操作流程</a></li><li><a href="./module-dependency-graph">JSTS Code Lab 模块依赖关系图谱</a></li><li><a href="./node-js-require-flow">Node.js require() 解析流程</a></li><li><a href="./project-knowledge-graph">JavaScript/TypeScript 全景知识库 - 项目知识图谱</a></li><li><a href="./promise-state-machine">Promise 状态机转换图</a></li><li><a href="./react-fiber-architecture">React Fiber 架构详解</a></li><li><a href="./type-system-hierarchy">TypeScript 类型系统层次结构</a></li><li><a href="./typescript-compiler-architecture">TypeScript 编译器架构</a></li><li><a href="./webpack-build-flow">Webpack 构建流程</a></li><li><a href="./language-core-knowledge-graph">语言核心知识图谱</a></li><li><a href="./ecosystem-landscape-graph">生态全景图谱</a></li><li><a href="./engineering-practices-graph">工程实践图谱</a></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("diagrams/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
