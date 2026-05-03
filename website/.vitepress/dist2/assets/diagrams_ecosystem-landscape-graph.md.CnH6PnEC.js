import{_ as a,o as t,c as s,j as e}from"./chunks/framework.DGDNmojq.js";const f=JSON.parse('{"title":"JavaScript/TypeScript 生态全景图谱","description":"","frontmatter":{"title":"JavaScript/TypeScript 生态全景图谱"},"headers":[],"relativePath":"diagrams/ecosystem-landscape-graph.md","filePath":"diagrams/ecosystem-landscape-graph.md","lastUpdated":1776545344000}'),r={name:"diagrams/ecosystem-landscape-graph.md"};function o(l,n,i,c,p,u){return t(),s("div",null,[...n[0]||(n[0]=[e("p",null,'graph TD %% ========== 根节点 ========== root["🌍 JS/TS Ecosystem"]',-1),e("pre",null,[e("code",null,`%% ========== 第一层分支 ==========
fe["🎨 前端框架"]
ui["🧩 UI 组件库"]
state["🔄 状态管理"]
build["📦 构建工具"]
be["🖥️ 后端框架"]
orm["🗄️ ORM 与数据库"]
test["🧪 测试"]
deploy["🚀 部署平台"]
pkg["📥 包管理器"]
mono["📁 Monorepo"]
obs["📊 可观测性"]
ai["🤖 AI / ML"]
fullstack["⚡ 全栈框架"]
cross["📱 跨平台 / 移动端"]

root --> fe & ui & state & build & be & orm & test & deploy & pkg & mono & obs & ai & fullstack & cross

%% ========== 前端框架 ==========
react["React"]
vue["Vue.js"]
angular["Angular"]
svelte["Svelte"]
solid["SolidJS"]
preact["Preact"]
qwik["Qwik"]
alpine["Alpine.js"]

fe --> react & vue & angular & svelte & solid & preact & qwik & alpine

react_a["Next.js"]
react_b["Remix"]
react_c["Gatsby"]
react_d["React Server Components"]
react --> react_a & react_b & react_c & react_d

vue_a["Nuxt"]
vue_b["Quasar"]
vue_c["VueUse"]
vue --> vue_a & vue_b & vue_c

angular_a["NgRx"]
angular_b["Angular Material"]
angular --> angular_a & angular_b

svelte_a["SvelteKit"]
svelte --> svelte_a

solid_a["SolidStart"]
solid --> solid_a

%% ========== UI 组件库 ==========
antd["Ant Design"]
mui["Material UI"]
shadcn["shadcn/ui"]
chakra["Chakra UI"]
element["Element Plus"]
radix["Radix UI"]
headless["Headless UI"]
daisy["DaisyUI"]

ui --> antd & mui & shadcn & chakra & element & radix & headless & daisy

%% ========== 状态管理 ==========
redux["Redux"]
zustand["Zustand"]
jotai["Jotai"]
pinia["Pinia"]
tanstack_q["TanStack Query"]
mobx["MobX"]
recoil["Recoil"]
valtio["Valtio"]

state --> redux & zustand & jotai & pinia & tanstack_q & mobx & recoil & valtio

%% ========== 构建工具 ==========
vite["Vite"]
webpack["Webpack"]
rollup["Rollup"]
esbuild["esbuild"]
turbopack["Turbopack"]
rspack["Rspack"]
parcel["Parcel"]
farm["Farm"]

build --> vite & webpack & rollup & esbuild & turbopack & rspack & parcel & farm

%% ========== 后端框架 ==========
express["Express.js"]
nestjs["NestJS"]
fastify["Fastify"]
hono["Hono"]
elysia["Elysia"]
koa["Koa"]
hapi["Hapi"]
adonis["AdonisJS"]

be --> express & nestjs & fastify & hono & elysia & koa & hapi & adonis

%% ========== ORM 与数据库 ==========
prisma["Prisma"]
drizzle["Drizzle ORM"]
typeorm["TypeORM"]
kysely["Kysely"]
mongoose["Mongoose"]
sequelize["Sequelize"]
mikro["MikroORM"]
redis["ioredis / node-redis"]

orm --> prisma & drizzle & typeorm & kysely & mongoose & sequelize & mikro & redis

%% ========== 测试 ==========
vitest["Vitest"]
jest["Jest"]
playwright["Playwright"]
cypress["Cypress"]
msw["MSW"]
testinglib["Testing Library"]
storybook["Storybook"]
artillery["Artillery"]
mocha["Mocha"]
create_react_app["Create React App"]

test --> vitest & jest & playwright & cypress & msw & testinglib & storybook & artillery & mocha

%% ========== 部署平台 ==========
vercel["Vercel"]
netlify["Netlify"]
cloudflare["Cloudflare Pages / Workers"]
aws["AWS Amplify"]
docker["Docker"]
kubernetes["Kubernetes"]
flyio["Fly.io"]
railway["Railway"]

deploy --> vercel & netlify & cloudflare & aws & docker & kubernetes & flyio & railway

%% ========== 包管理器 ==========
npm["npm"]
yarn["Yarn"]
pnpm["pnpm"]
bun["Bun"]
corepack["Corepack"]

pkg --> npm & yarn & pnpm & bun & corepack

%% ========== Monorepo ==========
turbo["Turborepo"]
nx["Nx"]
rush["Rush"]
lerna["Lerna"]
changesets["Changesets"]
pnpm_workspace["pnpm Workspace"]

mono --> turbo & nx & rush & lerna & changesets & pnpm_workspace

%% ========== 可观测性 ==========
sentry["Sentry"]
datadog["Datadog"]
winston["Winston"]
pino["Pino"]
otel["OpenTelemetry"]
prom["Prometheus"]
grafana["Grafana"]
jaeger["Jaeger"]

obs --> sentry & datadog & winston & pino & otel & prom & grafana & jaeger

%% ========== AI / ML ==========
tfjs["TensorFlow.js"]
langchain["LangChain.js"]
openai["OpenAI SDK"]
transformers["Transformers.js"]
onnx["ONNX Runtime Web"]
ml5["ml5.js"]
brain["Brain.js"]

ai --> tfjs & langchain & openai & transformers & onnx & ml5 & brain

%% ========== 全栈框架 ==========
next["Next.js"]
nuxt_full["Nuxt"]
astro["Astro"]
remix_full["Remix"]
sveltekit_full["SvelteKit"]
blitz["Blitz.js"]
redwood["RedwoodJS"]
t3["T3 Stack"]

fullstack --> next & nuxt_full & astro & remix_full & sveltekit_full & blitz & redwood & t3

%% ========== 跨平台 / 移动端 ==========
rn["React Native"]
flutter_ts["Flutter + ts"]
capacitor["Capacitor"]
ionic["Ionic"]
tauri["Tauri"]
electron["Electron"]
nodegui["NodeGUI"]
neutralino["Neutralinojs"]

cross --> rn & flutter_ts & capacitor & ionic & tauri & electron & nodegui & neutralino

%% ========== 常用组合 实线 ==========
react -->|常用组合| react_a
react -->|常用组合| rn
react_a -->|常用组合| next
vue -->|常用组合| vue_a
vite -->|常用组合| vitest
vite -->|常用组合| vue
express -->|常用组合| prisma
nestjs -->|常用组合| typeorm
react -->|常用组合| redux
react -->|常用组合| tanstack_q
vue -->|常用组合| pinia
next -->|常用组合| vercel
nuxt_full -->|常用组合| vercel
astro -->|常用组合| netlify
cloudflare -->|常用组合| hono
docker -->|常用组合| kubernetes
pnpm -->|常用组合| pnpm_workspace
turbo -->|常用组合| pnpm_workspace
otel -->|常用组合| prom
prom -->|常用组合| grafana
playwright -->|常用组合| testinglib
jest -->|常用组合| testinglib
vitest -->|常用组合| msw
tanstack_q -->|常用组合| next
langchain -->|常用组合| openai
transformers -->|常用组合| onnx
shadcn -->|常用组合| radix
tauri -->|常用组合| vite
electron -->|常用组合| vite

%% ========== 可替代关系 虚线 ==========
webpack -.->|可替代| vite
webpack -.->|可替代| rspack
redux -.->|可替代| zustand
redux -.->|可替代| jotai
mobx -.->|可替代| valtio
jest -.->|可替代| vitest
mocha -.->|可替代| vitest
express -.->|可替代| fastify
express -.->|可替代| hono
koa -.->|可替代| hono
typeorm -.->|可替代| prisma
sequelize -.->|可替代| drizzle
npm -.->|可替代| pnpm
yarn -.->|可替代| pnpm
lerna -.->|可替代| turbo
lerna -.->|可替代| changesets
cypress -.->|可替代| playwright
webpack -.->|可替代| turbopack
parcel -.->|可替代| vite
react_c -.->|可替代| astro
create_react_app -.->|可替代| vite
recoil -.->|可替代| jotai
electron -.->|可替代| tauri

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
`)],-1)])])}const k=a(r,[["render",o]]);export{f as __pageData,k as default};
