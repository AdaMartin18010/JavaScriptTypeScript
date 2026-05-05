import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"JavaScript/TypeScript 生态全景图谱","description":"","frontmatter":{"title":"JavaScript/TypeScript 生态全景图谱"},"headers":[],"relativePath":"diagrams/ecosystem-landscape-graph.md","filePath":"diagrams/ecosystem-landscape-graph.md","lastUpdated":1776545344000}');
const _sfc_main = { name: "diagrams/ecosystem-landscape-graph.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><p>graph TD %% ========== 根节点 ========== root[&quot;🌍 JS/TS Ecosystem&quot;]</p><pre><code>%% ========== 第一层分支 ==========
fe[&quot;🎨 前端框架&quot;]
ui[&quot;🧩 UI 组件库&quot;]
state[&quot;🔄 状态管理&quot;]
build[&quot;📦 构建工具&quot;]
be[&quot;🖥️ 后端框架&quot;]
orm[&quot;🗄️ ORM 与数据库&quot;]
test[&quot;🧪 测试&quot;]
deploy[&quot;🚀 部署平台&quot;]
pkg[&quot;📥 包管理器&quot;]
mono[&quot;📁 Monorepo&quot;]
obs[&quot;📊 可观测性&quot;]
ai[&quot;🤖 AI / ML&quot;]
fullstack[&quot;⚡ 全栈框架&quot;]
cross[&quot;📱 跨平台 / 移动端&quot;]

root --&gt; fe &amp; ui &amp; state &amp; build &amp; be &amp; orm &amp; test &amp; deploy &amp; pkg &amp; mono &amp; obs &amp; ai &amp; fullstack &amp; cross

%% ========== 前端框架 ==========
react[&quot;React&quot;]
vue[&quot;Vue.js&quot;]
angular[&quot;Angular&quot;]
svelte[&quot;Svelte&quot;]
solid[&quot;SolidJS&quot;]
preact[&quot;Preact&quot;]
qwik[&quot;Qwik&quot;]
alpine[&quot;Alpine.js&quot;]

fe --&gt; react &amp; vue &amp; angular &amp; svelte &amp; solid &amp; preact &amp; qwik &amp; alpine

react_a[&quot;Next.js&quot;]
react_b[&quot;Remix&quot;]
react_c[&quot;Gatsby&quot;]
react_d[&quot;React Server Components&quot;]
react --&gt; react_a &amp; react_b &amp; react_c &amp; react_d

vue_a[&quot;Nuxt&quot;]
vue_b[&quot;Quasar&quot;]
vue_c[&quot;VueUse&quot;]
vue --&gt; vue_a &amp; vue_b &amp; vue_c

angular_a[&quot;NgRx&quot;]
angular_b[&quot;Angular Material&quot;]
angular --&gt; angular_a &amp; angular_b

svelte_a[&quot;SvelteKit&quot;]
svelte --&gt; svelte_a

solid_a[&quot;SolidStart&quot;]
solid --&gt; solid_a

%% ========== UI 组件库 ==========
antd[&quot;Ant Design&quot;]
mui[&quot;Material UI&quot;]
shadcn[&quot;shadcn/ui&quot;]
chakra[&quot;Chakra UI&quot;]
element[&quot;Element Plus&quot;]
radix[&quot;Radix UI&quot;]
headless[&quot;Headless UI&quot;]
daisy[&quot;DaisyUI&quot;]

ui --&gt; antd &amp; mui &amp; shadcn &amp; chakra &amp; element &amp; radix &amp; headless &amp; daisy

%% ========== 状态管理 ==========
redux[&quot;Redux&quot;]
zustand[&quot;Zustand&quot;]
jotai[&quot;Jotai&quot;]
pinia[&quot;Pinia&quot;]
tanstack_q[&quot;TanStack Query&quot;]
mobx[&quot;MobX&quot;]
recoil[&quot;Recoil&quot;]
valtio[&quot;Valtio&quot;]

state --&gt; redux &amp; zustand &amp; jotai &amp; pinia &amp; tanstack_q &amp; mobx &amp; recoil &amp; valtio

%% ========== 构建工具 ==========
vite[&quot;Vite&quot;]
webpack[&quot;Webpack&quot;]
rollup[&quot;Rollup&quot;]
esbuild[&quot;esbuild&quot;]
turbopack[&quot;Turbopack&quot;]
rspack[&quot;Rspack&quot;]
parcel[&quot;Parcel&quot;]
farm[&quot;Farm&quot;]

build --&gt; vite &amp; webpack &amp; rollup &amp; esbuild &amp; turbopack &amp; rspack &amp; parcel &amp; farm

%% ========== 后端框架 ==========
express[&quot;Express.js&quot;]
nestjs[&quot;NestJS&quot;]
fastify[&quot;Fastify&quot;]
hono[&quot;Hono&quot;]
elysia[&quot;Elysia&quot;]
koa[&quot;Koa&quot;]
hapi[&quot;Hapi&quot;]
adonis[&quot;AdonisJS&quot;]

be --&gt; express &amp; nestjs &amp; fastify &amp; hono &amp; elysia &amp; koa &amp; hapi &amp; adonis

%% ========== ORM 与数据库 ==========
prisma[&quot;Prisma&quot;]
drizzle[&quot;Drizzle ORM&quot;]
typeorm[&quot;TypeORM&quot;]
kysely[&quot;Kysely&quot;]
mongoose[&quot;Mongoose&quot;]
sequelize[&quot;Sequelize&quot;]
mikro[&quot;MikroORM&quot;]
redis[&quot;ioredis / node-redis&quot;]

orm --&gt; prisma &amp; drizzle &amp; typeorm &amp; kysely &amp; mongoose &amp; sequelize &amp; mikro &amp; redis

%% ========== 测试 ==========
vitest[&quot;Vitest&quot;]
jest[&quot;Jest&quot;]
playwright[&quot;Playwright&quot;]
cypress[&quot;Cypress&quot;]
msw[&quot;MSW&quot;]
testinglib[&quot;Testing Library&quot;]
storybook[&quot;Storybook&quot;]
artillery[&quot;Artillery&quot;]
mocha[&quot;Mocha&quot;]
create_react_app[&quot;Create React App&quot;]

test --&gt; vitest &amp; jest &amp; playwright &amp; cypress &amp; msw &amp; testinglib &amp; storybook &amp; artillery &amp; mocha

%% ========== 部署平台 ==========
vercel[&quot;Vercel&quot;]
netlify[&quot;Netlify&quot;]
cloudflare[&quot;Cloudflare Pages / Workers&quot;]
aws[&quot;AWS Amplify&quot;]
docker[&quot;Docker&quot;]
kubernetes[&quot;Kubernetes&quot;]
flyio[&quot;Fly.io&quot;]
railway[&quot;Railway&quot;]

deploy --&gt; vercel &amp; netlify &amp; cloudflare &amp; aws &amp; docker &amp; kubernetes &amp; flyio &amp; railway

%% ========== 包管理器 ==========
npm[&quot;npm&quot;]
yarn[&quot;Yarn&quot;]
pnpm[&quot;pnpm&quot;]
bun[&quot;Bun&quot;]
corepack[&quot;Corepack&quot;]

pkg --&gt; npm &amp; yarn &amp; pnpm &amp; bun &amp; corepack

%% ========== Monorepo ==========
turbo[&quot;Turborepo&quot;]
nx[&quot;Nx&quot;]
rush[&quot;Rush&quot;]
lerna[&quot;Lerna&quot;]
changesets[&quot;Changesets&quot;]
pnpm_workspace[&quot;pnpm Workspace&quot;]

mono --&gt; turbo &amp; nx &amp; rush &amp; lerna &amp; changesets &amp; pnpm_workspace

%% ========== 可观测性 ==========
sentry[&quot;Sentry&quot;]
datadog[&quot;Datadog&quot;]
winston[&quot;Winston&quot;]
pino[&quot;Pino&quot;]
otel[&quot;OpenTelemetry&quot;]
prom[&quot;Prometheus&quot;]
grafana[&quot;Grafana&quot;]
jaeger[&quot;Jaeger&quot;]

obs --&gt; sentry &amp; datadog &amp; winston &amp; pino &amp; otel &amp; prom &amp; grafana &amp; jaeger

%% ========== AI / ML ==========
tfjs[&quot;TensorFlow.js&quot;]
langchain[&quot;LangChain.js&quot;]
openai[&quot;OpenAI SDK&quot;]
transformers[&quot;Transformers.js&quot;]
onnx[&quot;ONNX Runtime Web&quot;]
ml5[&quot;ml5.js&quot;]
brain[&quot;Brain.js&quot;]

ai --&gt; tfjs &amp; langchain &amp; openai &amp; transformers &amp; onnx &amp; ml5 &amp; brain

%% ========== 全栈框架 ==========
next[&quot;Next.js&quot;]
nuxt_full[&quot;Nuxt&quot;]
astro[&quot;Astro&quot;]
remix_full[&quot;Remix&quot;]
sveltekit_full[&quot;SvelteKit&quot;]
blitz[&quot;Blitz.js&quot;]
redwood[&quot;RedwoodJS&quot;]
t3[&quot;T3 Stack&quot;]

fullstack --&gt; next &amp; nuxt_full &amp; astro &amp; remix_full &amp; sveltekit_full &amp; blitz &amp; redwood &amp; t3

%% ========== 跨平台 / 移动端 ==========
rn[&quot;React Native&quot;]
flutter_ts[&quot;Flutter + ts&quot;]
capacitor[&quot;Capacitor&quot;]
ionic[&quot;Ionic&quot;]
tauri[&quot;Tauri&quot;]
electron[&quot;Electron&quot;]
nodegui[&quot;NodeGUI&quot;]
neutralino[&quot;Neutralinojs&quot;]

cross --&gt; rn &amp; flutter_ts &amp; capacitor &amp; ionic &amp; tauri &amp; electron &amp; nodegui &amp; neutralino

%% ========== 常用组合 实线 ==========
react --&gt;|常用组合| react_a
react --&gt;|常用组合| rn
react_a --&gt;|常用组合| next
vue --&gt;|常用组合| vue_a
vite --&gt;|常用组合| vitest
vite --&gt;|常用组合| vue
express --&gt;|常用组合| prisma
nestjs --&gt;|常用组合| typeorm
react --&gt;|常用组合| redux
react --&gt;|常用组合| tanstack_q
vue --&gt;|常用组合| pinia
next --&gt;|常用组合| vercel
nuxt_full --&gt;|常用组合| vercel
astro --&gt;|常用组合| netlify
cloudflare --&gt;|常用组合| hono
docker --&gt;|常用组合| kubernetes
pnpm --&gt;|常用组合| pnpm_workspace
turbo --&gt;|常用组合| pnpm_workspace
otel --&gt;|常用组合| prom
prom --&gt;|常用组合| grafana
playwright --&gt;|常用组合| testinglib
jest --&gt;|常用组合| testinglib
vitest --&gt;|常用组合| msw
tanstack_q --&gt;|常用组合| next
langchain --&gt;|常用组合| openai
transformers --&gt;|常用组合| onnx
shadcn --&gt;|常用组合| radix
tauri --&gt;|常用组合| vite
electron --&gt;|常用组合| vite

%% ========== 可替代关系 虚线 ==========
webpack -.-&gt;|可替代| vite
webpack -.-&gt;|可替代| rspack
redux -.-&gt;|可替代| zustand
redux -.-&gt;|可替代| jotai
mobx -.-&gt;|可替代| valtio
jest -.-&gt;|可替代| vitest
mocha -.-&gt;|可替代| vitest
express -.-&gt;|可替代| fastify
express -.-&gt;|可替代| hono
koa -.-&gt;|可替代| hono
typeorm -.-&gt;|可替代| prisma
sequelize -.-&gt;|可替代| drizzle
npm -.-&gt;|可替代| pnpm
yarn -.-&gt;|可替代| pnpm
lerna -.-&gt;|可替代| turbo
lerna -.-&gt;|可替代| changesets
cypress -.-&gt;|可替代| playwright
webpack -.-&gt;|可替代| turbopack
parcel -.-&gt;|可替代| vite
react_c -.-&gt;|可替代| astro
create_react_app -.-&gt;|可替代| vite
recoil -.-&gt;|可替代| jotai
electron -.-&gt;|可替代| tauri

class mocha,create_react_app test

%% ========== 样式定义 ==========
classDef root fill:#fff8e1,stroke:#ff6f00,stroke-width:3px,color:#e65100
classDef fe fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
classDef ui fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#880e4f
classDef state fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
classDef build fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
classDef be fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
classDef orm fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#004d40
classDef test fill:#ede7f6,stroke:#4527a0,stroke-width:2px,color:#311b92
classDef deploy fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,color:#01579b
classDef pkg fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#e65100
classDef mono fill:#d1c4e9,stroke:#4527a0,stroke-width:2px,color:#311b92
classDef obs fill:#ffccbc,stroke:#d84315,stroke-width:2px,color:#bf360c
classDef ai fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
classDef fullstack fill:#b3e5fc,stroke:#0277bd,stroke-width:2px,color:#01579b
classDef cross fill:#ffe0b2,stroke:#ef6c00,stroke-width:2px,color:#e65100

class root root
class fe,react,vue,angular,svelte,solid,preact,qwik,alpine,react_a,react_b,react_c,react_d,vue_a,vue_b,vue_c,angular_a,angular_b,svelte_a,solid_a fe
class ui,antd,mui,shadcn,chakra,element,radix,headless,daisy ui
class state,redux,zustand,jotai,pinia,tanstack_q,mobx,recoil,valtio state
class build,vite,webpack,rollup,esbuild,turbopack,rspack,parcel,farm build
class be,express,nestjs,fastify,hono,elysia,koa,hapi,adonis be
class orm,prisma,drizzle,typeorm,kysely,mongoose,sequelize,mikro,redis orm
class test,vitest,jest,playwright,cypress,msw,testinglib,storybook,artillery test
class deploy,vercel,netlify,cloudflare,aws,docker,kubernetes,flyio,railway deploy
class pkg,npm,yarn,pnpm,bun,corepack pkg
class mono,turbo,nx,rush,lerna,changesets,pnpm_workspace mono
class obs,sentry,datadog,winston,pino,otel,prom,grafana,jaeger obs
class ai,tfjs,langchain,openai,transformers,onnx,ml5,brain ai
class fullstack,next,nuxt_full,astro,remix_full,sveltekit_full,blitz,redwood,t3 fullstack
class cross,rn,flutter_ts,capacitor,ionic,tauri,electron,nodegui,neutralino cross
</code></pre></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("diagrams/ecosystem-landscape-graph.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ecosystemLandscapeGraph = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  ecosystemLandscapeGraph as default
};
