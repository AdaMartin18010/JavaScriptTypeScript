import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSuspense, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"跨平台移动开发专题","description":"全面解析现代跨平台移动开发技术栈，涵盖 React Native、Expo、Tauri、Capacitor 等主流方案，提供选型决策树与性能优化指南。","frontmatter":{"title":"跨平台移动开发专题","description":"全面解析现代跨平台移动开发技术栈，涵盖 React Native、Expo、Tauri、Capacitor 等主流方案，提供选型决策树与性能优化指南。","tags":["Mobile","Cross-Platform","React Native","Expo","Tauri","Capacitor","Ionic"],"author":"JSTS Knowledge Base","date":"2026-05-02T00:00:00.000Z"},"headers":[],"relativePath":"mobile-development/index.md","filePath":"mobile-development/index.md","lastUpdated":1777789647000}');
const _sfc_main = { name: "mobile-development/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Mermaid = resolveComponent("Mermaid");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="跨平台移动开发专题" tabindex="-1">跨平台移动开发专题 <a class="header-anchor" href="#跨平台移动开发专题" aria-label="Permalink to &quot;跨平台移动开发专题&quot;">​</a></h1><blockquote><p>一次编写，多端运行——但每一次选择都有代价。本专题深入剖析现代跨平台移动开发的核心技术、架构演进与工程实践。</p></blockquote><h2 id="跨平台方案全景" tabindex="-1">跨平台方案全景 <a class="header-anchor" href="#跨平台方案全景" aria-label="Permalink to &quot;跨平台方案全景&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-11",
        class: "mermaid",
        graph: "graph%20TD%0A%20%20%20%20A%5B%E8%B7%A8%E5%B9%B3%E5%8F%B0%E7%A7%BB%E5%8A%A8%E5%BC%80%E5%8F%91%5D%20--%3E%20B%5B%E5%8E%9F%E7%94%9F%E5%BC%80%E5%8F%91%20Native%5D%0A%20%20%20%20A%20--%3E%20C%5B%E6%B7%B7%E5%90%88%E5%BC%80%E5%8F%91%20Hybrid%5D%0A%20%20%20%20A%20--%3E%20D%5B%E8%B7%A8%E6%A1%86%E6%9E%B6%E7%BC%96%E8%AF%91%20Cross-Framework%5D%0A%0A%20%20%20%20B%20--%3E%20B1%5BiOS%20Swift%2FObj-C%5D%0A%20%20%20%20B%20--%3E%20B2%5BAndroid%20Kotlin%2FJava%5D%0A%20%20%20%20B%20--%3E%20B3%5B%E5%8E%9F%E7%94%9F%E6%80%A7%E8%83%BD%E6%9C%80%E4%BC%98%5D%0A%20%20%20%20B%20--%3E%20B4%5B%E7%BB%B4%E6%8A%A4%E6%88%90%E6%9C%AC%E6%9C%80%E9%AB%98%5D%0A%0A%20%20%20%20C%20--%3E%20C1%5BWebView%20%E5%AE%B9%E5%99%A8%5D%0A%20%20%20%20C%20--%3E%20C2%5BIonic%20%2B%20Capacitor%5D%0A%20%20%20%20C%20--%3E%20C3%5B%20Cordova%20%5D%0A%20%20%20%20C%20--%3E%20C4%5B%E5%BC%80%E5%8F%91%E6%95%88%E7%8E%87%E9%AB%98%5D%0A%20%20%20%20C%20--%3E%20C5%5B%E6%80%A7%E8%83%BD%E5%8F%97%E9%99%90%5D%0A%0A%20%20%20%20D%20--%3E%20D1%5BReact%20Native%5D%0A%20%20%20%20D%20--%3E%20D2%5BFlutter%5D%0A%20%20%20%20D%20--%3E%20D3%5BTauri%20v2%5D%0A%20%20%20%20D%20--%3E%20D4%5B%E5%8E%9F%E7%94%9F%E6%B8%B2%E6%9F%93%20%2F%20%E5%8E%9F%E7%94%9F%E9%9B%86%E6%88%90%5D%0A%20%20%20%20D%20--%3E%20D5%5B%E5%B9%B3%E8%A1%A1%E6%80%A7%E8%83%BD%E4%B8%8E%E6%95%88%E7%8E%87%5D%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="框架选型对比矩阵" tabindex="-1">框架选型对比矩阵 <a class="header-anchor" href="#框架选型对比矩阵" aria-label="Permalink to &quot;框架选型对比矩阵&quot;">​</a></h2><table tabindex="0"><thead><tr><th>维度</th><th>React Native</th><th>Expo</th><th>Tauri v2</th><th>Capacitor + Ionic</th><th>Flutter</th><th>原生 Native</th></tr></thead><tbody><tr><td><strong>渲染机制</strong></td><td>原生组件映射</td><td>原生组件映射</td><td>WebView + 原生桥接</td><td>WebView + 原生插件</td><td>Skia 自绘</td><td>完全原生</td></tr><tr><td><strong>开发语言</strong></td><td>JavaScript/TypeScript</td><td>JavaScript/TypeScript</td><td>Rust + TS/JS</td><td>TypeScript + Web</td><td>Dart</td><td>Swift/Kotlin</td></tr><tr><td><strong>热更新/OTA</strong></td><td>CodePush（替代方案）</td><td>EAS Update</td><td>自定义机制</td><td>Capacitor Live Updates</td><td>官方不支持</td><td>无</td></tr><tr><td><strong>包体积（空项目）</strong></td><td>~8-12 MB</td><td>~10-15 MB</td><td>~3-5 MB</td><td>~5-8 MB</td><td>~4-5 MB</td><td>~1-2 MB</td></tr><tr><td><strong>启动时间</strong></td><td>中等</td><td>中等</td><td>较快</td><td>较快</td><td>快</td><td>最快</td></tr><tr><td><strong>原生模块扩展</strong></td><td>TurboModules / 手动桥接</td><td>Expo Modules</td><td>Tauri Plugins</td><td>Capacitor Plugins</td><td>Platform Channels</td><td>原生 SDK</td></tr><tr><td><strong>Web 代码复用</strong></td><td>低</td><td>中（Expo Web）</td><td>高</td><td>极高</td><td>低</td><td>无</td></tr><tr><td><strong>典型适用场景</strong></td><td>社交/内容类 App</td><td>快速原型/MVP</td><td>桌面+移动统一</td><td>企业级 Web 迁移</td><td>高保真 UI 应用</td><td>极致性能需求</td></tr><tr><td><strong>生态成熟度</strong></td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td><strong>学习曲线</strong></td><td>中等</td><td>低</td><td>中等（需 Rust）</td><td>低</td><td>中等</td><td>高</td></tr></tbody></table><h2 id="选型决策树" tabindex="-1">选型决策树 <a class="header-anchor" href="#选型决策树" aria-label="Permalink to &quot;选型决策树&quot;">​</a></h2>`);
  ssrRenderSuspense(_push, {
    default: () => {
      _push(ssrRenderComponent(_component_Mermaid, {
        id: "mermaid-277",
        class: "mermaid",
        graph: "flowchart%20TD%0A%20%20%20%20Start(%5B%E5%BC%80%E5%A7%8B%E9%80%89%E5%9E%8B%5D)%20--%3E%20Q1%7B%E5%9B%A2%E9%98%9F%E6%8A%80%E6%9C%AF%E6%A0%88%EF%BC%9F%7D%0A%0A%20%20%20%20Q1%20--%3E%7CWeb%20%E5%89%8D%E7%AB%AF%E4%B8%BA%E4%B8%BB%7C%20Q2%7B%E9%9C%80%E8%A6%81%E6%9E%81%E8%87%B4%E6%80%A7%E8%83%BD%EF%BC%9F%7D%0A%20%20%20%20Q1%20--%3E%7C%E5%8E%9F%E7%94%9F%E5%BC%80%E5%8F%91%E8%83%8C%E6%99%AF%7C%20B1%5B%E9%80%89%E6%8B%A9%E5%8E%9F%E7%94%9F%20Native%5D%0A%20%20%20%20Q1%20--%3E%7CRust%20%E8%83%8C%E6%99%AF%7C%20Q3%7B%E6%98%AF%E5%90%A6%E9%9C%80%E8%A6%81%20Web%20%E5%A4%8D%E7%94%A8%EF%BC%9F%7D%0A%0A%20%20%20%20Q2%20--%3E%7C%E6%98%AF%7C%20Q4%7BUI%20%E5%A4%8D%E6%9D%82%E5%BA%A6%EF%BC%9F%7D%0A%20%20%20%20Q2%20--%3E%7C%E5%90%A6%7C%20Q5%7B%E6%98%AF%E5%90%A6%E9%9C%80%E8%A6%81%E5%BF%AB%E9%80%9F%E4%B8%8A%E7%BA%BF%EF%BC%9F%7D%0A%0A%20%20%20%20Q4%20--%3E%7C%E9%AB%98%E4%BF%9D%E7%9C%9F%E8%87%AA%E5%AE%9A%E4%B9%89%20UI%7C%20D1%5B%E9%80%89%E6%8B%A9%20Flutter%5D%0A%20%20%20%20Q4%20--%3E%7C%E6%A0%87%E5%87%86%E5%B9%B3%E5%8F%B0%20UI%7C%20D2%5B%E9%80%89%E6%8B%A9%20React%20Native%20%2F%20Expo%5D%0A%0A%20%20%20%20Q5%20--%3E%7C%E6%98%AF%7C%20D3%5B%E9%80%89%E6%8B%A9%20Expo%5D%0A%20%20%20%20Q5%20--%3E%7C%E5%90%A6%EF%BC%8C%E6%9C%89%E7%8E%B0%E6%9C%89%20Web%20%E9%A1%B9%E7%9B%AE%7C%20D4%5B%E9%80%89%E6%8B%A9%20Capacitor%20%2B%20Ionic%5D%0A%20%20%20%20Q5%20--%3E%7C%E5%90%A6%EF%BC%8C%E8%BF%BD%E6%B1%82%E8%BD%BB%E9%87%8F%7C%20D5%5B%E9%80%89%E6%8B%A9%20Tauri%20v2%5D%0A%0A%20%20%20%20Q3%20--%3E%7C%E6%98%AF%7C%20D5%0A%20%20%20%20Q3%20--%3E%7C%E5%90%A6%7C%20B1%0A%0A%20%20%20%20B1%20--%3E%20End1(%5B%E5%8E%9F%E7%94%9F%E5%BC%80%E5%8F%91%5D)%0A%20%20%20%20D1%20--%3E%20End2(%5BFlutter%20%E6%96%B9%E6%A1%88%5D)%0A%20%20%20%20D2%20--%3E%20End3(%5BReact%20Native%20%E6%96%B9%E6%A1%88%5D)%0A%20%20%20%20D3%20--%3E%20End4(%5BExpo%20%E6%96%B9%E6%A1%88%5D)%0A%20%20%20%20D4%20--%3E%20End5(%5BCapacitor%20%E6%96%B9%E6%A1%88%5D)%0A%20%20%20%20D5%20--%3E%20End6(%5BTauri%20v2%20%E6%96%B9%E6%A1%88%5D)%0A"
      }, null, _parent));
    },
    fallback: () => {
      _push(` Loading... `);
    },
    _: 1
  });
  _push(`<h2 id="专题章节导航" tabindex="-1">专题章节导航 <a class="header-anchor" href="#专题章节导航" aria-label="Permalink to &quot;专题章节导航&quot;">​</a></h2><table tabindex="0"><thead><tr><th>章节</th><th>标题</th><th>核心内容</th></tr></thead><tbody><tr><td><a href="./01-react-native-new-arch">01</a></td><td>React Native New Architecture</td><td>Fabric、TurboModules、JSI 架构解析</td></tr><tr><td><a href="./02-expo-ecosystem">02</a></td><td>Expo 生态系统</td><td>Expo Router、EAS Build、Expo Modules</td></tr><tr><td><a href="./03-tauri-v2-mobile">03</a></td><td>Tauri v2 移动端支持</td><td>Rust 后端、iOS/Android 原生集成</td></tr><tr><td>04</td><td>Capacitor + Ionic</td><td>Web-to-Mobile 桥接方案</td></tr><tr><td>05</td><td>移动端性能优化</td><td>启动时间、包体积、内存管理</td></tr><tr><td>06</td><td>部署策略</td><td>App Store、OTA 更新、CodePush 替代方案</td></tr></tbody></table><h2 id="典型项目结构示例" tabindex="-1">典型项目结构示例 <a class="header-anchor" href="#典型项目结构示例" aria-label="Permalink to &quot;典型项目结构示例&quot;">​</a></h2><h3 id="react-native-new-architecture-项目结构" tabindex="-1">React Native（New Architecture）项目结构 <a class="header-anchor" href="#react-native-new-architecture-项目结构" aria-label="Permalink to &quot;React Native（New Architecture）项目结构&quot;">​</a></h3><div class="language-text vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mobile-rn-app/</span></span>
<span class="line"><span>├── android/                          # Android 原生工程</span></span>
<span class="line"><span>│   ├── app/src/main/jni/             # C++ TurboModules</span></span>
<span class="line"><span>│   └── build.gradle</span></span>
<span class="line"><span>├── ios/                              # iOS 原生工程</span></span>
<span class="line"><span>│   ├── Pods/</span></span>
<span class="line"><span>│   └── AppDelegate.mm</span></span>
<span class="line"><span>├── src/</span></span>
<span class="line"><span>│   ├── components/                   # 共享 UI 组件</span></span>
<span class="line"><span>│   ├── screens/                      # 页面级组件</span></span>
<span class="line"><span>│   ├── modules/                      # TurboModules JS 接口</span></span>
<span class="line"><span>│   │   └── NativeCalculator.ts       # codegen 规范文件</span></span>
<span class="line"><span>│   ├── navigation/                   # 导航配置</span></span>
<span class="line"><span>│   └── utils/</span></span>
<span class="line"><span>├── specs/                            # New Architecture 接口规范</span></span>
<span class="line"><span>│   └── NativeCalculator.spec.js      # TurboModule Spec</span></span>
<span class="line"><span>├── App.tsx</span></span>
<span class="line"><span>├── babel.config.js</span></span>
<span class="line"><span>├── metro.config.js</span></span>
<span class="line"><span>├── package.json</span></span>
<span class="line"><span>└── react-native.config.js</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><h3 id="expo-项目结构" tabindex="-1">Expo 项目结构 <a class="header-anchor" href="#expo-项目结构" aria-label="Permalink to &quot;Expo 项目结构&quot;">​</a></h3><div class="language-text vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mobile-expo-app/</span></span>
<span class="line"><span>├── app/                              # Expo Router 文件系统路由</span></span>
<span class="line"><span>│   ├── (tabs)/                       # 路由分组（底部导航）</span></span>
<span class="line"><span>│   │   ├── _layout.tsx</span></span>
<span class="line"><span>│   │   ├── index.tsx                 # /tabs 首页</span></span>
<span class="line"><span>│   │   └── settings.tsx              # /tabs/settings</span></span>
<span class="line"><span>│   ├── _layout.tsx                   # 根布局</span></span>
<span class="line"><span>│   └── index.tsx                     # 根路由</span></span>
<span class="line"><span>├── components/                       # 共享组件</span></span>
<span class="line"><span>├── constants/</span></span>
<span class="line"><span>├── hooks/</span></span>
<span class="line"><span>├── modules/                          # Expo Modules 本地模块</span></span>
<span class="line"><span>│   └── my-module/</span></span>
<span class="line"><span>│       ├── android/</span></span>
<span class="line"><span>│       ├── ios/</span></span>
<span class="line"><span>│       └── src/index.ts</span></span>
<span class="line"><span>├── assets/</span></span>
<span class="line"><span>├── app.json                          # Expo 配置</span></span>
<span class="line"><span>├── eas.json                          # EAS 构建配置</span></span>
<span class="line"><span>├── metro.config.js</span></span>
<span class="line"><span>└── package.json</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><h3 id="tauri-v2-移动端项目结构" tabindex="-1">Tauri v2 移动端项目结构 <a class="header-anchor" href="#tauri-v2-移动端项目结构" aria-label="Permalink to &quot;Tauri v2 移动端项目结构&quot;">​</a></h3><div class="language-text vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mobile-tauri-app/</span></span>
<span class="line"><span>├── src-tauri/                        # Rust 后端</span></span>
<span class="line"><span>│   ├── src/</span></span>
<span class="line"><span>│   │   ├── lib.rs                    # Tauri 初始化</span></span>
<span class="line"><span>│   │   └── commands/                 # 自定义命令</span></span>
<span class="line"><span>│   ├── capabilities/                 # 权限配置（v2 新特性）</span></span>
<span class="line"><span>│   ├── gen/                          # 生成的移动端代码</span></span>
<span class="line"><span>│   ├── Cargo.toml</span></span>
<span class="line"><span>│   └── tauri.conf.json</span></span>
<span class="line"><span>├── src/                              # 前端代码（React/Vue/Svelte）</span></span>
<span class="line"><span>│   ├── App.tsx</span></span>
<span class="line"><span>│   └── main.tsx</span></span>
<span class="line"><span>├── index.html</span></span>
<span class="line"><span>├── vite.config.ts</span></span>
<span class="line"><span>├── package.json</span></span>
<span class="line"><span>└── Cargo.lock</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h2 id="关键趋势与建议" tabindex="-1">关键趋势与建议 <a class="header-anchor" href="#关键趋势与建议" aria-label="Permalink to &quot;关键趋势与建议&quot;">​</a></h2><ol><li><strong>React Native New Architecture</strong> 已逐步成为默认选项（0.73+），旧架构将在未来版本移除，迁移窗口期正在收窄。</li><li><strong>Expo</strong> 已成为 React Native 生态的事实标准开发层，EAS 构建服务显著降低了 CI/CD 复杂度。</li><li><strong>Tauri v2</strong> 的移动端支持为已有 Web/桌面应用提供了最低成本的移动扩展路径，尤其适合 Rust 技术栈团队。</li><li><strong>Capacitor</strong> 是已有 Web 应用（Vue/React/Angular）迁移到移动端的最高效方案，但不适合高性能需求场景。</li><li><strong>包体积与启动速度</strong> 仍是跨平台方案的普遍瓶颈，需结合本专题 05 性能优化章节 进行针对性调优。</li></ol><hr><h2 id="延伸阅读" tabindex="-1">延伸阅读 <a class="header-anchor" href="#延伸阅读" aria-label="Permalink to &quot;延伸阅读&quot;">​</a></h2><ul><li><strong><a href="./../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/CROSS_PLATFORM_MOBILE_THEORY">跨平台移动开发理论研究</a></strong> — 渲染管线、原生桥接与性能优化的形式化推导，为专题中的 <a href="./01-react-native-new-arch">01 React Native新架构</a>、<a href="./03-tauri-v2-mobile">03 Tauri v2移动端</a> 和 <a href="./05-performance-optimization">05 性能优化</a> 提供数学基础。</li><li><strong><a href="./../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/FRONTEND_FRAMEWORK_THEORY">前端框架理论深度研究</a></strong> — 组件模型、响应式系统与渲染策略的形式化对比，直接支撑移动端框架选型的决策框架。</li></ul><blockquote><p>📌 <strong>下一步</strong>：根据你的技术栈和性能需求，通过上方决策树确定方向，深入阅读对应章节。</p></blockquote></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("mobile-development/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
