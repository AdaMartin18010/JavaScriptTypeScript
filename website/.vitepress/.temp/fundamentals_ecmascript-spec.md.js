import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSuspense, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ECMAScript 规范","description":"ECMA-262 规范结构与阅读指南，覆盖抽象操作、规范类型与算法表示法","frontmatter":{"title":"ECMAScript 规范","description":"ECMA-262 规范结构与阅读指南，覆盖抽象操作、规范类型与算法表示法"},"headers":[],"relativePath":"fundamentals/ecmascript-spec.md","filePath":"fundamentals/ecmascript-spec.md","lastUpdated":1777797318000}');
const _sfc_main = { name: "fundamentals/ecmascript-spec.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Mermaid = resolveComponent("Mermaid");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="ecmascript-规范导读-10-6" tabindex="-1">ECMAScript 规范导读 (10.6) <a class="header-anchor" href="#ecmascript-规范导读-10-6" aria-label="Permalink to &quot;ECMAScript 规范导读 (10.6)&quot;">​</a></h1><blockquote><p>掌握阅读 ECMA-262 规范的方法论，理解抽象操作、规范类型和算法表示法，建立从规范到实现的完整认知链路。</p></blockquote><h2 id="规范是什么-为什么读它" tabindex="-1">规范是什么？为什么读它？ <a class="header-anchor" href="#规范是什么-为什么读它" aria-label="Permalink to &quot;规范是什么？为什么读它？&quot;">​</a></h2><p>ECMA-262 是 JavaScript 语言的<strong>唯一权威定义</strong>。与教程、博客不同，规范描述的是语言应该如何工作，而非实际实现：</p><table tabindex="0"><thead><tr><th>来源</th><th>描述的是</th><th>可靠性</th><th>适用场景</th></tr></thead><tbody><tr><td>ECMA-262 规范</td><td>语言<strong>应当</strong>如何工作</td><td>⭐⭐⭐⭐⭐</td><td>边界行为、歧义消除</td></tr><tr><td>MDN</td><td>语言<strong>通常</strong>如何工作</td><td>⭐⭐⭐⭐</td><td>日常使用、快速查询</td></tr><tr><td>V8 源码</td><td>语言<strong>实际</strong>如何工作</td><td>⭐⭐⭐⭐</td><td>性能分析、实现细节</td></tr></tbody></table>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-76",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5BECMA-262%20%E8%A7%84%E8%8C%83%5D%20--%3E%7C%E5%AE%9A%E4%B9%89%7C%20B%5B%E6%8A%BD%E8%B1%A1%E8%AF%AD%E4%B9%89%5D%0A%20%20%20%20B%20--%3E%7C%E5%AE%9E%E7%8E%B0%7C%20C%5B%E5%BC%95%E6%93%8E%20V8%2FJSC%2FSpiderMonkey%5D%0A%20%20%20%20C%20--%3E%7C%E8%BF%90%E8%A1%8C%7C%20D%5BJavaScript%20%E4%BB%A3%E7%A0%81%5D%0A%20%20%20%20A%20-.-%3E%7C%E6%B5%8B%E8%AF%95%E9%AA%8C%E8%AF%81%7C%20E%5BTest262%20%E6%B5%8B%E8%AF%95%E9%9B%86%5D%0A%20%20%20%20E%20-.-%3E%7C%E5%8F%8D%E9%A6%88%7C%20A%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="规范的结构层次" tabindex="-1">规范的结构层次 <a class="header-anchor" href="#规范的结构层次" aria-label="Permalink to &quot;规范的结构层次&quot;">​</a></h2><p>ECMA-262 采用<strong>分层组织</strong>，从抽象概念到具体算法：</p>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-83",
        class: "mermaid",
        graph: "flowchart%20TB%0A%20%20%20%20subgraph%20%E6%A6%82%E5%BF%B5%E5%B1%82%0A%20%20%20%20%20%20%20%20A%5BNotational%20Conventions%3Cbr%2F%3E%E8%A1%A8%E7%A4%BA%E6%B3%95%E7%BA%A6%E5%AE%9A%5D%0A%20%20%20%20%20%20%20%20B%5BAbstract%20Operations%3Cbr%2F%3E%E6%8A%BD%E8%B1%A1%E6%93%8D%E4%BD%9C%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20%E7%B1%BB%E5%9E%8B%E5%B1%82%0A%20%20%20%20%20%20%20%20C%5BECMAScript%20Language%20Types%3Cbr%2F%3E%E8%AF%AD%E8%A8%80%E7%B1%BB%E5%9E%8B%5D%0A%20%20%20%20%20%20%20%20D%5BSpecification%20Types%3Cbr%2F%3E%E8%A7%84%E8%8C%83%E7%B1%BB%E5%9E%8B%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20%E6%89%A7%E8%A1%8C%E5%B1%82%0A%20%20%20%20%20%20%20%20E%5BExecution%20Contexts%3Cbr%2F%3E%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87%5D%0A%20%20%20%20%20%20%20%20F%5BEnvironment%20Records%3Cbr%2F%3E%E7%8E%AF%E5%A2%83%E8%AE%B0%E5%BD%95%5D%0A%20%20%20%20%20%20%20%20G%5BRealm%20%26%20Global%20Object%3Cbr%2F%3E%E9%A2%86%E5%9F%9F%E4%B8%8E%E5%85%A8%E5%B1%80%E5%AF%B9%E8%B1%A1%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20%E8%AF%AD%E6%B3%95%E5%B1%82%0A%20%20%20%20%20%20%20%20H%5BLexical%20Grammar%3Cbr%2F%3E%E8%AF%8D%E6%B3%95%E8%AF%AD%E6%B3%95%5D%0A%20%20%20%20%20%20%20%20I%5BSyntactic%20Grammar%3Cbr%2F%3E%E5%8F%A5%E6%B3%95%E8%AF%AD%E6%B3%95%5D%0A%20%20%20%20%20%20%20%20J%5BAlgorithms%3Cbr%2F%3E%E7%AE%97%E6%B3%95%E6%AD%A5%E9%AA%A4%5D%0A%20%20%20%20end%0A%20%20%20%20A%20--%3E%20B%0A%20%20%20%20B%20--%3E%20C%0A%20%20%20%20B%20--%3E%20D%0A%20%20%20%20D%20--%3E%20E%0A%20%20%20%20E%20--%3E%20F%0A%20%20%20%20F%20--%3E%20G%0A%20%20%20%20C%20--%3E%20I%0A%20%20%20%20H%20--%3E%20I%0A%20%20%20%20I%20--%3E%20J%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="核心概念速查" tabindex="-1">核心概念速查 <a class="header-anchor" href="#核心概念速查" aria-label="Permalink to &quot;核心概念速查&quot;">​</a></h2><h3 id="抽象操作-abstract-operations" tabindex="-1">抽象操作 (Abstract Operations) <a class="header-anchor" href="#抽象操作-abstract-operations" aria-label="Permalink to &quot;抽象操作 (Abstract Operations)&quot;">​</a></h3><p>规范使用<strong>伪代码风格的抽象操作</strong>描述语义，例如 <code>ToPrimitive</code>、<code>OrdinaryGetPrototypeOf</code>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ToPrimitive ( input [ , preferredType ] )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. Assert: input is an ECMAScript language value.</span></span>
<span class="line"><span>2. If Type(input) is Object, then</span></span>
<span class="line"><span>   a. Let exoticToPrim be ? GetMethod(input, @@toPrimitive).</span></span>
<span class="line"><span>   b. If exoticToPrim is not undefined, then</span></span>
<span class="line"><span>      i. Let result be ? Call(exoticToPrim, input, « hint »).</span></span>
<span class="line"><span>      ii. If Type(result) is not Object, return result.</span></span>
<span class="line"><span>      iii. Throw a TypeError exception.</span></span>
<span class="line"><span>   c. If preferredType is not present, let hint be &quot;default&quot;.</span></span>
<span class="line"><span>   d. Else if preferredType is string, let hint be &quot;string&quot;.</span></span>
<span class="line"><span>   e. Else, let hint be &quot;number&quot;.</span></span>
<span class="line"><span>   f. Return ? OrdinaryToPrimitive(input, hint).</span></span>
<span class="line"><span>3. Return input.</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p><strong>符号速查</strong>：</p><table tabindex="0"><thead><tr><th>符号</th><th>含义</th><th>示例</th></tr></thead><tbody><tr><td><code>?</code></td><td>若操作抛出异常，立即传播</td><td><code>? Call(func, arg)</code></td></tr><tr><td><code>!</code></td><td>断言操作不会抛出异常</td><td><code>! DefinePropertyOrThrow(...)</code></td></tr><tr><td><code>« »</code></td><td>列表字面量</td><td><code>« &quot;a&quot;, &quot;b&quot; »</code></td></tr><tr><td><code>ReturnIfAbrupt</code></td><td>若参数为 abrupt completion，立即返回</td><td><code>ReturnIfAbrupt(x)</code></td></tr></tbody></table><h3 id="completion-records-完成记录" tabindex="-1">Completion Records（完成记录） <a class="header-anchor" href="#completion-records-完成记录" aria-label="Permalink to &quot;Completion Records（完成记录）&quot;">​</a></h3><p>规范中所有语句的执行结果都是一个<strong>Completion Record</strong>：</p>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-164",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5BCompletion%20Record%5D%20--%3E%20B%5B%5BType%5D%5D%0A%20%20%20%20A%20--%3E%20C%5B%5BValue%5D%5D%0A%20%20%20%20A%20--%3E%20D%5B%5BTarget%5D%5D%0A%20%20%20%20B%20--%3E%7Cnormal%7C%20E%5B%E7%BB%A7%E7%BB%AD%E6%89%A7%E8%A1%8C%5D%0A%20%20%20%20B%20--%3E%7Creturn%7C%20F%5B%E5%87%BD%E6%95%B0%E8%BF%94%E5%9B%9E%5D%0A%20%20%20%20B%20--%3E%7Cthrow%7C%20G%5B%E6%8A%9B%E5%87%BA%E5%BC%82%E5%B8%B8%5D%0A%20%20%20%20B%20--%3E%7Cbreak%7C%20H%5B%E8%B7%B3%E5%87%BA%E5%BE%AA%E7%8E%AF%5D%0A%20%20%20%20B%20--%3E%7Ccontinue%7C%20I%5B%E7%BB%A7%E7%BB%AD%E5%BE%AA%E7%8E%AF%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<table tabindex="0"><thead><tr><th>Type</th><th>语义</th><th>JS 对应</th></tr></thead><tbody><tr><td><code>normal</code></td><td>正常完成</td><td>语句顺序执行</td></tr><tr><td><code>return</code></td><td>返回</td><td><code>return</code> 语句</td></tr><tr><td><code>throw</code></td><td>抛出异常</td><td><code>throw</code> 语句</td></tr><tr><td><code>break</code></td><td>中断</td><td><code>break</code> 语句</td></tr><tr><td><code>continue</code></td><td>继续</td><td><code>continue</code> 语句</td></tr></tbody></table><h3 id="environment-records-环境记录" tabindex="-1">Environment Records（环境记录） <a class="header-anchor" href="#environment-records-环境记录" aria-label="Permalink to &quot;Environment Records（环境记录）&quot;">​</a></h3>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-240",
        class: "mermaid",
        graph: "flowchart%20TB%0A%20%20%20%20A%5BEnvironment%20Record%5D%20--%3E%20B%5BDeclarative%20ER%5D%0A%20%20%20%20A%20--%3E%20C%5BObject%20ER%5D%0A%20%20%20%20A%20--%3E%20D%5BFunction%20ER%5D%0A%20%20%20%20A%20--%3E%20E%5BGlobal%20ER%5D%0A%20%20%20%20A%20--%3E%20F%5BModule%20ER%5D%0A%20%20%20%20B%20--%3E%20B1%5B%E7%BB%91%E5%AE%9A%E5%8F%98%E9%87%8F%2F%E5%B8%B8%E9%87%8F%5D%0A%20%20%20%20C%20--%3E%20C1%5B%E7%BB%91%E5%AE%9A%E5%88%B0%E5%AF%B9%E8%B1%A1%E5%B1%9E%E6%80%A7%5D%0A%20%20%20%20D%20--%3E%20D1%5B%E6%8F%90%E4%BE%9B%20this%20%E7%BB%91%E5%AE%9A%5D%0A%20%20%20%20E%20--%3E%20E1%5B%E5%85%A8%E5%B1%80%E4%BD%9C%E7%94%A8%E5%9F%9F%5D%0A%20%20%20%20F%20--%3E%20F1%5B%E6%A8%A1%E5%9D%97%E4%BD%9C%E7%94%A8%E5%9F%9F%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="阅读规范的方法论" tabindex="-1">阅读规范的方法论 <a class="header-anchor" href="#阅读规范的方法论" aria-label="Permalink to &quot;阅读规范的方法论&quot;">​</a></h2><h3 id="步骤-1-定位目标" tabindex="-1">步骤 1：定位目标 <a class="header-anchor" href="#步骤-1-定位目标" aria-label="Permalink to &quot;步骤 1：定位目标&quot;">​</a></h3>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-247",
        class: "mermaid",
        graph: "flowchart%20LR%0A%20%20%20%20A%5B%E9%81%87%E5%88%B0%E9%97%AE%E9%A2%98%5D%20--%3E%20B%5B%E7%A1%AE%E5%AE%9A%E5%85%B3%E9%94%AE%E8%AF%8D%5D%0A%20%20%20%20B%20--%3E%20C%5B%E6%90%9C%E7%B4%A2%E8%A7%84%E8%8C%83%E7%B4%A2%E5%BC%95%5D%0A%20%20%20%20C%20--%3E%20D%5B%E5%AE%9A%E4%BD%8D%E7%AB%A0%E8%8A%82%5D%0A%20%20%20%20D%20--%3E%20E%5B%E7%90%86%E8%A7%A3%E6%8A%BD%E8%B1%A1%E6%93%8D%E4%BD%9C%5D%0A%20%20%20%20E%20--%3E%20F%5B%E8%BF%BD%E8%B8%AA%E7%AE%97%E6%B3%95%E6%AD%A5%E9%AA%A4%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h3 id="步骤-2-理解算法" tabindex="-1">步骤 2：理解算法 <a class="header-anchor" href="#步骤-2-理解算法" aria-label="Permalink to &quot;步骤 2：理解算法&quot;">​</a></h3><p>以 <code>Array.prototype.map</code> 为例：</p><ol><li>在规范中搜索 <code>Array.prototype.map</code></li><li>找到算法定义，理解参数处理</li><li>追踪 <code>ToObject</code>、<code>LengthOfArrayLike</code> 等抽象操作</li><li>理解回调函数的调用方式（<code>Call(callbackfn, T, « kValue, k, O »)</code>）</li><li>注意边界情况（稀疏数组、thisArg、返回新数组）</li></ol><h3 id="步骤-3-验证理解" tabindex="-1">步骤 3：验证理解 <a class="header-anchor" href="#步骤-3-验证理解" aria-label="Permalink to &quot;步骤 3：验证理解&quot;">​</a></h3><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// 验证：map 跳过缺失元素</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}">const</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> arr</span><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}"> =</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}"> [</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">1</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">, , </span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}">3</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">]; </span><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// 稀疏数组，索引 1 缺失</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}">const</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> result</span><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}"> =</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}"> arr.</span><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">map</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">(</span><span style="${ssrRenderStyle({ "--shiki-light": "#E36209", "--shiki-dark": "#FFAB70" })}">x</span><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}"> =&gt;</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}"> x </span><span style="${ssrRenderStyle({ "--shiki-light": "#D73A49", "--shiki-dark": "#F97583" })}">*</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> 2</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">);</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">console.</span><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">log</span><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">(result); </span><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// [2, &amp;lt;1 empty item&amp;gt;, 6]</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6A737D", "--shiki-dark": "#6A737D" })}">// 注意：结果也是稀疏的！</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><h2 id="核心文档" tabindex="-1">核心文档 <a class="header-anchor" href="#核心文档" aria-label="Permalink to &quot;核心文档&quot;">​</a></h2><table tabindex="0"><thead><tr><th>文档</th><th>主题</th><th>文件</th></tr></thead><tbody><tr><td>抽象操作</td><td>规范中的核心算法</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/abstract-operations">查看</a></td></tr><tr><td>规范算法</td><td>算法表示法详解</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/spec-algorithms">查看</a></td></tr><tr><td>Completion Records</td><td>完成记录机制</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/completion-records">查看</a></td></tr><tr><td>Temporal API Stage 4</td><td>时间 API 规范</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/temporal-api-stage4">查看</a></td></tr></tbody></table><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><table tabindex="0"><thead><tr><th>示例</th><th>主题</th><th>文件</th></tr></thead><tbody><tr><td>01</td><td>抽象操作</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/code-examples/01-abstract-operations">查看</a></td></tr><tr><td>02</td><td>规范类型</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/code-examples/02-specification-types">查看</a></td></tr><tr><td>03</td><td>内部方法与槽</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/code-examples/03-internal-methods-slots">查看</a></td></tr><tr><td>04</td><td>Completion Records</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/code-examples/04-completion-records">查看</a></td></tr><tr><td>05</td><td>环境记录</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/code-examples/05-environment-records">查看</a></td></tr><tr><td>06</td><td>Realm 与全局对象</td><td><a href="./../../10-fundamentals/10.6-ecmascript-spec/code-examples/06-realm-and-global-object">查看</a></td></tr></tbody></table><h2 id="交叉引用" tabindex="-1">交叉引用 <a class="header-anchor" href="#交叉引用" aria-label="Permalink to &quot;交叉引用&quot;">​</a></h2><ul><li><strong><a href="./language-semantics">语言语义深入解析</a></strong> — 规范的语言学基础</li><li><strong><a href="./execution-model">执行模型深入解析</a></strong> — 规范的实现映射</li><li><strong><a href="/programming-principles/04-operational-semantics">编程原则 / 操作语义</a></strong> — 形式语义学的理论基础</li><li><strong><a href="/programming-principles/05-denotational-semantics">编程原则 / 指称语义</a></strong> — 规范的形式化方法</li></ul><hr><p><a href="/">← 返回首页</a></p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("fundamentals/ecmascript-spec.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ecmascriptSpec = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  ecmascriptSpec as default
};
