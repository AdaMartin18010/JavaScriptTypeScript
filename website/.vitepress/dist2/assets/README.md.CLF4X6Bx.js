import{_ as a,o as n,c as e,a2 as p}from"./chunks/framework.DGDNmojq.js";const m=JSON.parse('{"title":"Awesome JS/TS Ecosystem 文档站点","description":"","frontmatter":{},"headers":[],"relativePath":"README.md","filePath":"README.md","lastUpdated":1777619576000}'),i={name:"README.md"};function l(r,s,t,c,b,h){return n(),e("div",null,[...s[0]||(s[0]=[p(`<h1 id="awesome-js-ts-ecosystem-文档站点" tabindex="-1">Awesome JS/TS Ecosystem 文档站点 <a class="header-anchor" href="#awesome-js-ts-ecosystem-文档站点" aria-label="Permalink to &quot;Awesome JS/TS Ecosystem 文档站点&quot;">​</a></h1><p>基于 VitePress 构建的文档站点。</p><h2 id="本地开发" tabindex="-1">本地开发 <a class="header-anchor" href="#本地开发" aria-label="Permalink to &quot;本地开发&quot;">​</a></h2><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 安装依赖</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 启动开发服务器</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docs:dev</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 构建</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docs:build</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 预览构建结果</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docs:preview</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h2 id="目录结构" tabindex="-1">目录结构 <a class="header-anchor" href="#目录结构" aria-label="Permalink to &quot;目录结构&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>website/</span></span>
<span class="line"><span>├── .vitepress/           # VitePress 配置</span></span>
<span class="line"><span>│   ├── config.ts         # 站点配置</span></span>
<span class="line"><span>│   ├── theme/            # 主题定制</span></span>
<span class="line"><span>│   └── sidebar.ts        # 侧边栏配置</span></span>
<span class="line"><span>├── public/               # 静态资源</span></span>
<span class="line"><span>├── guide/                # 指南页面 (19)</span></span>
<span class="line"><span>├── categories/           # 分类文档 (33)</span></span>
<span class="line"><span>├── comparison-matrices/  # 对比矩阵 (19)</span></span>
<span class="line"><span>├── code-lab/             # 代码实验室导航</span></span>
<span class="line"><span>├── learning-paths/       # 学习路径</span></span>
<span class="line"><span>├── patterns/             # 设计模式</span></span>
<span class="line"><span>├── platforms/            # 跨平台开发</span></span>
<span class="line"><span>├── diagrams/             # 架构图与流程图</span></span>
<span class="line"><span>├── cheatsheets/          # 速查表</span></span>
<span class="line"><span>├── research/             # 研究报告</span></span>
<span class="line"><span>├── templates/            # 文档模板</span></span>
<span class="line"><span>├── index.md              # 首页</span></span>
<span class="line"><span>└── about.md              # 关于页面</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><h2 id="贡献指南" tabindex="-1">贡献指南 <a class="header-anchor" href="#贡献指南" aria-label="Permalink to &quot;贡献指南&quot;">​</a></h2><p>请查看 <a href="./guide/contributing">贡献指南</a> 了解如何参与文档编写。</p>`,8)])])}const o=a(i,[["render",l]]);export{m as __pageData,o as default};
