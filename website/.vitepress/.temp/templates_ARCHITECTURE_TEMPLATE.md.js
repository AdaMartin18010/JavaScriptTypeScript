import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ARCHITECTURE.md 统一模板","description":"ARCHITECTURE.md 统一模板","frontmatter":{"title":"ARCHITECTURE.md 统一模板","description":"ARCHITECTURE.md 统一模板"},"headers":[],"relativePath":"templates/ARCHITECTURE_TEMPLATE.md","filePath":"templates/ARCHITECTURE_TEMPLATE.md","lastUpdated":1776456138000}');
const _sfc_main = { name: "templates/ARCHITECTURE_TEMPLATE.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="architecture-md-统一模板" tabindex="-1">ARCHITECTURE.md 统一模板 <a class="header-anchor" href="#architecture-md-统一模板" aria-label="Permalink to &quot;ARCHITECTURE.md 统一模板&quot;">​</a></h1><p>本文档模板用于规范所有 ARCHITECTURE.md 文件的格式，确保架构文档的一致性和专业性。</p><hr><h2 id="文档结构" tabindex="-1">文档结构 <a class="header-anchor" href="#文档结构" aria-label="Permalink to &quot;文档结构&quot;">​</a></h2><div class="language-markdown vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    # [模块名称]架构设计</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    ## 1. 架构概述</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    ### 1.1 设计目标</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    - 主要目标</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    - 质量属性要求（性能、可扩展性、可用性等）</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    ### 1.2 架构风格</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    - 采用的架构模式（分层、微服务、事件驱动等）</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    - 选择的理由</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">    ### 1.3 整体结构</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>[架构图 - 使用 ASCII 或 Mermaid]</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>## 2. 核心组件</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 2.1 组件清单</span></span>
<span class="line"><span>| 组件名 | 职责 | 依赖 |</span></span>
<span class="line"><span>|--------|------|------|</span></span>
<span class="line"><span>| Comp A | ... | Comp B |</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 2.2 组件详细设计</span></span>
<span class="line"><span>#### 组件 A</span></span>
<span class="line"><span>- 职责说明</span></span>
<span class="line"><span>- 接口定义</span></span>
<span class="line"><span>- 内部结构</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 3. 数据流</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 3.1 正常流程</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>[数据流图]</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>### 3.2 异常处理</span></span>
<span class="line"><span>- 错误传播机制</span></span>
<span class="line"><span>- 恢复策略</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 4. 接口设计</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 4.1 外部接口</span></span>
<span class="line"><span>- API 定义</span></span>
<span class="line"><span>- 协议规范</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 4.2 内部接口</span></span>
<span class="line"><span>- 模块间通信方式</span></span>
<span class="line"><span>- 数据格式</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 5. 技术决策</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 5.1 决策记录 (ADR)</span></span>
<span class="line"><span>| 决策 | 选择 | 理由 | 权衡 |</span></span>
<span class="line"><span>|------|------|------|------|</span></span>
<span class="line"><span>| ... | ... | ... | ... |</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 5.2 替代方案</span></span>
<span class="line"><span>- 考虑过但放弃的方案</span></span>
<span class="line"><span>- 放弃原因</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 6. 部署架构</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 6.1 运行时视图</span></span>
<span class="line"><span>- 进程/线程模型</span></span>
<span class="line"><span>- 部署拓扑</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 6.2 基础设施需求</span></span>
<span class="line"><span>- 硬件要求</span></span>
<span class="line"><span>- 依赖服务</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 7. 质量属性</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 7.1 性能</span></span>
<span class="line"><span>- 性能指标</span></span>
<span class="line"><span>- 优化策略</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 7.2 可靠性</span></span>
<span class="line"><span>- 容错机制</span></span>
<span class="line"><span>- 监控告警</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 7.3 可维护性</span></span>
<span class="line"><span>- 扩展点设计</span></span>
<span class="line"><span>- 配置管理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 8. 安全考虑</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 8.1 威胁建模</span></span>
<span class="line"><span>- 识别的威胁</span></span>
<span class="line"><span>- 缓解措施</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 8.2 安全最佳实践</span></span>
<span class="line"><span>- 输入验证</span></span>
<span class="line"><span>- 访问控制</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 9. 演进规划</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 9.1 当前限制</span></span>
<span class="line"><span>- 已知问题</span></span>
<span class="line"><span>- 技术债务</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### 9.2 未来改进</span></span>
<span class="line"><span>- 规划中的优化</span></span>
<span class="line"><span>- 架构演进方向</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 10. 参考文档</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- 相关 THEORY.md 链接</span></span>
<span class="line"><span>- 外部参考资料</span></span>
<span class="line"><span>- 设计模式引用</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br></div></div><hr><h2 id="写作规范" tabindex="-1">写作规范 <a class="header-anchor" href="#写作规范" aria-label="Permalink to &quot;写作规范&quot;">​</a></h2><h3 id="架构图规范" tabindex="-1">架构图规范 <a class="header-anchor" href="#架构图规范" aria-label="Permalink to &quot;架构图规范&quot;">​</a></h3><ol><li><strong>组件图</strong>：展示系统主要组件及其关系</li><li><strong>时序图</strong>：展示关键交互流程</li><li><strong>部署图</strong>：展示运行时部署结构</li><li><strong>状态图</strong>：展示关键状态转换</li></ol><h3 id="决策记录格式" tabindex="-1">决策记录格式 <a class="header-anchor" href="#决策记录格式" aria-label="Permalink to &quot;决策记录格式&quot;">​</a></h3><div class="language-markdown vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-light-font-weight": "bold", "--shiki-dark": "#79B8FF", "--shiki-dark-font-weight": "bold" })}">### ADR-XXX: 决策标题</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-light-font-weight": "bold", "--shiki-dark": "#E1E4E8", "--shiki-dark-font-weight": "bold" })}">**状态**</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">: 提议/已接受/已弃用</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-light-font-weight": "bold", "--shiki-dark": "#E1E4E8", "--shiki-dark-font-weight": "bold" })}">**背景**</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">: 问题描述和约束条件</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-light-font-weight": "bold", "--shiki-dark": "#E1E4E8", "--shiki-dark-font-weight": "bold" })}">**决策**</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">: 明确说明决策内容</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-light-font-weight": "bold", "--shiki-dark": "#E1E4E8", "--shiki-dark-font-weight": "bold" })}">**后果**</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">:</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#E36209", "--shiki-dark": "#FFAB70" })}">-</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}"> 积极: ...</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#E36209", "--shiki-dark": "#FFAB70" })}">-</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}"> 消极: ...</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#E36209", "--shiki-dark": "#FFAB70" })}">-</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}"> 风险: ...</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h3 id="评审检查清单" tabindex="-1">评审检查清单 <a class="header-anchor" href="#评审检查清单" aria-label="Permalink to &quot;评审检查清单&quot;">​</a></h3><ul><li>[ ] 架构目标是否明确</li><li>[ ] 组件职责是否清晰</li><li>[ ] 接口定义是否完整</li><li>[ ] 质量属性是否可测量</li><li>[ ] 安全考虑是否充分</li><li>[ ] 技术决策是否有依据</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("templates/ARCHITECTURE_TEMPLATE.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ARCHITECTURE_TEMPLATE = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  ARCHITECTURE_TEMPLATE as default
};
