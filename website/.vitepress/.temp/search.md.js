import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate } from "vue/server-renderer";
import { useSSRContext, ref, onMounted, computed } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"搜索","description":"Awesome JS/TS Ecosystem 全站搜索","frontmatter":{"title":"搜索","description":"Awesome JS/TS Ecosystem 全站搜索"},"headers":[],"relativePath":"search.md","filePath":"search.md","lastUpdated":1777619576000}');
const __default__ = { name: "search.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    const query = ref("");
    const selectedCategory = ref("all");
    const selectedDifficulty = ref("all");
    const docsIndex = ref([]);
    onMounted(async () => {
      try {
        const res = await fetch("/search-index.json");
        if (res.ok) {
          docsIndex.value = await res.json();
        }
      } catch {
        docsIndex.value = [
          { title: "前端框架对比", path: "/comparison-matrices/frontend-frameworks-compare", category: "对比矩阵", difficulty: "medium", tags: ["frontend", "framework"] },
          { title: "AI SDK 指南", path: "/guide/ai-sdk-guide", category: "指南", difficulty: "medium", tags: ["ai", "sdk"] },
          { title: "MCP 协议指南", path: "/guide/mcp-guide", category: "指南", difficulty: "hard", tags: ["ai", "mcp", "protocol"] },
          { title: "WebAssembly 指南", path: "/guide/webassembly-guide", category: "指南", difficulty: "hard", tags: ["wasm", "performance"] },
          { title: "后端框架对比", path: "/comparison-matrices/backend-frameworks-compare", category: "对比矩阵", difficulty: "medium", tags: ["backend", "framework"] },
          { title: "AI 工具对比", path: "/comparison-matrices/ai-tools-compare", category: "对比矩阵", difficulty: "medium", tags: ["ai", "tools"] },
          { title: "代码实验室首页", path: "/code-lab/", category: "代码实验室", difficulty: "all", tags: ["lab", "code"] },
          { title: "初学者路径", path: "/learning-paths/beginners-path", category: "学习路径", difficulty: "easy", tags: ["beginner"] },
          { title: "进阶者路径", path: "/learning-paths/intermediate-path", category: "学习路径", difficulty: "medium", tags: ["intermediate"] },
          { title: "高级路径", path: "/learning-paths/advanced-path", category: "学习路径", difficulty: "hard", tags: ["advanced"] }
        ];
      }
    });
    const categories = computed(() => {
      const cats = new Set(docsIndex.value.map((d) => d.category));
      return ["all", ...Array.from(cats)];
    });
    const filteredDocs = computed(() => {
      return docsIndex.value.filter((doc) => {
        const matchQuery = !query.value || doc.title.toLowerCase().includes(query.value.toLowerCase()) || doc.tags.some((t) => t.toLowerCase().includes(query.value.toLowerCase()));
        const matchCategory = selectedCategory.value === "all" || doc.category === selectedCategory.value;
        const matchDifficulty = selectedDifficulty.value === "all" || doc.difficulty === selectedDifficulty.value;
        return matchQuery && matchCategory && matchDifficulty;
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-cadaaf4f><h1 id="🔍-增强搜索" tabindex="-1" data-v-cadaaf4f>🔍 增强搜索 <a class="header-anchor" href="#🔍-增强搜索" aria-label="Permalink to &quot;🔍 增强搜索&quot;" data-v-cadaaf4f>​</a></h1><blockquote data-v-cadaaf4f><p data-v-cadaaf4f>基于文档元数据的增强搜索中心。支持按分类、难度、模块类型筛选。</p></blockquote><div class="search-container" data-v-cadaaf4f><div class="search-filters" data-v-cadaaf4f><input${ssrRenderAttr("value", query.value)} class="search-input" placeholder="搜索文档、标签..." data-v-cadaaf4f><select class="search-select" data-v-cadaaf4f><!--[-->`);
      ssrRenderList(categories.value, (cat) => {
        _push(`<option${ssrRenderAttr("value", cat)} data-v-cadaaf4f${ssrIncludeBooleanAttr(Array.isArray(selectedCategory.value) ? ssrLooseContain(selectedCategory.value, cat) : ssrLooseEqual(selectedCategory.value, cat)) ? " selected" : ""}>${ssrInterpolate(cat === "all" ? "所有分类" : cat)}</option>`);
      });
      _push(`<!--]--></select><select class="search-select" data-v-cadaaf4f><option value="all" data-v-cadaaf4f${ssrIncludeBooleanAttr(Array.isArray(selectedDifficulty.value) ? ssrLooseContain(selectedDifficulty.value, "all") : ssrLooseEqual(selectedDifficulty.value, "all")) ? " selected" : ""}>所有难度</option><option value="easy" data-v-cadaaf4f${ssrIncludeBooleanAttr(Array.isArray(selectedDifficulty.value) ? ssrLooseContain(selectedDifficulty.value, "easy") : ssrLooseEqual(selectedDifficulty.value, "easy")) ? " selected" : ""}>入门</option><option value="medium" data-v-cadaaf4f${ssrIncludeBooleanAttr(Array.isArray(selectedDifficulty.value) ? ssrLooseContain(selectedDifficulty.value, "medium") : ssrLooseEqual(selectedDifficulty.value, "medium")) ? " selected" : ""}>进阶</option><option value="hard" data-v-cadaaf4f${ssrIncludeBooleanAttr(Array.isArray(selectedDifficulty.value) ? ssrLooseContain(selectedDifficulty.value, "hard") : ssrLooseEqual(selectedDifficulty.value, "hard")) ? " selected" : ""}>高级</option></select></div><div class="search-results" data-v-cadaaf4f>`);
      if (filteredDocs.value.length === 0) {
        _push(`<div class="search-empty" data-v-cadaaf4f> 未找到匹配的文档 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(filteredDocs.value, (doc) => {
        _push(`<a href="#" class="search-result-card" data-v-cadaaf4f><div class="result-header" data-v-cadaaf4f><span class="result-title" data-v-cadaaf4f>${ssrInterpolate(doc.title)}</span><span class="result-category" data-v-cadaaf4f>${ssrInterpolate(doc.category)}</span></div><div class="result-tags" data-v-cadaaf4f><!--[-->`);
        ssrRenderList(doc.tags, (tag) => {
          _push(`<span class="result-tag" data-v-cadaaf4f>${ssrInterpolate(tag)}</span>`);
        });
        _push(`<!--]--></div></a>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("search.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const search = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cadaaf4f"]]);
export {
  __pageData,
  search as default
};
