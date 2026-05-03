import{_ as t,o as n,c as o,j as e}from"./chunks/framework.DGDNmojq.js";const b=JSON.parse('{"title":"JavaScript/TypeScript 工程实践知识图谱","description":"","frontmatter":{"title":"JavaScript/TypeScript 工程实践知识图谱"},"headers":[],"relativePath":"diagrams/engineering-practices-graph.md","filePath":"diagrams/engineering-practices-graph.md","lastUpdated":1776545344000}'),a={name:"diagrams/engineering-practices-graph.md"};function i(c,r,s,p,l,_){return n(),o("div",null,[...r[0]||(r[0]=[e("p",null,'graph TD %% ========== 根节点 ========== root["🏗️ Engineering Practices"]',-1),e("pre",null,[e("code",null,`%% ========== 第一层分支 ==========
pattern["🎨 设计模式"]
arch["🏛️ 架构模式"]
perf["⚡ 性能优化"]
sec["🔒 安全实践"]
test["🧪 测试策略"]
devops["🚀 DevOps"]
quality["✨ 代码质量"]

root --> pattern & arch & perf & sec & test & devops & quality

%% ========== 设计模式 ==========
creational["创建型 Creational"]
structural["结构型 Structural"]
behavioral["行为型 Behavioral"]

pattern --> creational & structural & behavioral

%% 创建型 - 菱形决策节点 + 矩形实践节点
singleton{"是否需要全局唯一实例?"}
singleton_impl["单例模式 Singleton<br/>确保类只有一个实例"]
factory["工厂模式 Factory<br/>封装对象创建逻辑"]
abs_factory["抽象工厂 AbstractFactory<br/>创建相关对象家族"]
builder["建造者模式 Builder<br/>分步构建复杂对象"]
prototype["原型模式 Prototype<br/>通过克隆创建对象"]

creational --> singleton & factory & abs_factory & builder & prototype

%% 结构型
adapter["适配器模式 Adapter<br/>接口兼容性转换"]
decorator["装饰器模式 Decorator<br/>动态扩展功能"]
proxy["代理模式 Proxy<br/>控制对象访问"]
facade["外观模式 Facade<br/>简化复杂接口"]
bridge["桥接模式 Bridge<br/>抽象与实现分离"]
composite["组合模式 Composite<br/>树形结构统一处理"]
flyweight["享元模式 Flyweight<br/>共享细粒度对象"]

structural --> adapter & decorator & proxy & facade & bridge & composite & flyweight

%% 行为型
observer["观察者模式 Observer<br/>发布-订阅通知机制"]
strategy["策略模式 Strategy<br/>算法族可互换"]
command["命令模式 Command<br/>请求封装为对象"]
iterator["迭代器模式 Iterator<br/>顺序访问聚合元素"]
template["模板方法 Template Method<br/>算法骨架固定"]
state["状态模式 State<br/>状态驱动行为变化"]
chain["职责链模式 Chain of Resp.<br/>请求沿链传递"]
visitor["访问者模式 Visitor<br/>分离算法与数据结构"]
mediator["中介者模式 Mediator<br/>集中管理对象交互"]
memento["备忘录模式 Memento<br/>捕获与恢复状态"]
interpreter["解释器模式 Interpreter<br/>定义文法表示"]

behavioral --> observer & strategy & command & iterator & template & state & chain & visitor & mediator & memento & interpreter

%% ========== 架构模式 ==========
layered["分层架构 Layered<br/>表现/业务/数据分离"]
hexagonal["六边形架构 Hexagonal<br/>端口与适配器"]
onion["洋葱架构 Onion<br/>依赖向内指向核心"]
cqrs["CQRS<br/>命令查询职责分离"]
eventsource["事件溯源 Event Sourcing<br/>状态由事件重建"]
mfe["微前端 Micro-Frontends<br/>独立部署子应用"]
bff["BFF Backend for Frontend<br/>专属后端适配层"]
microsvc["微服务 Microservices<br/>服务化拆分架构"]
ddd["领域驱动设计 DDD<br/>业务模型驱动开发"]

arch --> layered & hexagonal & onion & cqrs & eventsource & mfe & bff & microsvc & ddd

%% ========== 性能优化 ==========
load_opt["加载优化"]
runtime_opt["运行时优化"]
build_opt["构建优化"]
network_opt["网络优化"]

perf --> load_opt & runtime_opt & build_opt & network_opt

load_opt_a["Code Splitting<br/>按需加载代码块"]
load_opt_b["Lazy Loading<br/>路由/组件懒加载"]
load_opt_c["Preload / Prefetch<br/>资源优先级提示"]
load_opt_d["Service Worker 缓存<br/>离线优先策略"]
load_opt --> load_opt_a & load_opt_b & load_opt_c & load_opt_d

runtime_opt_a["Virtual DOM Diff<br/>最小化真实 DOM 操作"]
runtime_opt_b["Memoization<br/>useMemo / useCallback"]
runtime_opt_c["Web Workers<br/>主线程外执行计算"]
runtime_opt_d["RAF 动画调度<br/>requestAnimationFrame"]
runtime_opt_e["列表虚拟化<br/>Windowing / Virtual List"]
runtime_opt --> runtime_opt_a & runtime_opt_b & runtime_opt_c & runtime_opt_d & runtime_opt_e

build_opt_a["Tree Shaking<br/>消除死代码"]
build_opt_b["Minification<br/>Terser / SWC 压缩"]
build_opt_c["Scope Hoisting<br/>模块合并优化"]
build_opt_d["Module Federation<br/>模块联邦共享"]
build_opt --> build_opt_a & build_opt_b & build_opt_c & build_opt_d

network_opt_a["HTTP/2 Server Push<br/>多路复用优化"]
network_opt_b["CDN 边缘缓存<br/>就近分发静态资源"]
network_opt_c["Brotli / Gzip 压缩<br/>减少传输体积"]
network_opt_d["GraphQL 查询合并<br/>减少往返请求"]
network_opt --> network_opt_a & network_opt_b & network_opt_c & network_opt_d

%% ========== 安全实践 ==========
xss{"是否存在用户输入渲染?"}
xss_impl["XSS 防护<br/>转义 / CSP / DOMPurify"]
csrf["CSRF 防护<br/>Token / SameSite Cookie"]
csp["CSP 内容安全策略<br/>限制资源加载源"]
sqli["SQL / NoSQL 注入防护<br/>参数化查询 / ORM"]
supply["供应链安全<br/>依赖审计 / SLSA"]
secrets["密钥管理<br/>Vault / 环境变量隔离"]
cors["CORS 配置<br/>白名单 / 预检请求"]

sec --> xss & csrf & csp & sqli & supply & secrets & cors

%% ========== 测试策略 ==========
unit["单元测试 Unit<br/>函数/组件级隔离测试"]
integration["集成测试 Integration<br/>多模块协作验证"]
e2e["E2E 端到端测试<br/>用户场景全流程模拟"]
contract["契约测试 Contract<br/>API 消费者驱动契约"]
chaos["混沌测试 Chaos<br/>故意注入故障验证韧性"]
visual["视觉回归测试 Visual<br/>UI 像素级对比"]
fuzz["模糊测试 Fuzzing<br/>随机输入发现边界"]
mutation["变异测试 Mutation<br/>故意改代码测用例质量"]
perf_test["性能测试 Performance<br/>基准/负载/压力测试"]

test --> unit & integration & e2e & contract & chaos & visual & fuzz & mutation & perf_test

%% ========== DevOps ==========
cicd["CI/CD<br/>持续集成与持续交付"]
gitops["GitOps<br/>Git 为唯一事实源"]
bluegreen["蓝绿部署 Blue-Green<br/>零停机版本切换"]
canary["金丝雀发布 Canary<br/>小流量灰度验证"]
monitor["监控告警 Monitoring<br/>Metrics / Logs / Traces"]
iac["IaC 基础设施即代码<br/>Terraform / Pulumi"]
sre["SRE 站点可靠性工程<br/>SLO / Error Budget"]
feature_flag["特性开关 Feature Flags<br/>动态功能发布控制"]

devops --> cicd & gitops & bluegreen & canary & monitor & iac & sre & feature_flag

%% ========== 代码质量 ==========
lint["Lint 静态检查<br/>ESLint / Oxlint"]
format["Format 格式化<br/>Prettier / Biome"]
typecheck["TypeCheck 类型检查<br/>tsc --noEmit"]
review["Code Review 代码评审<br/>PR Review / 结对编程"]
refactor["Refactoring 重构<br/>代码坏味道消除"]
complexity["复杂度分析<br/>Cyclomatic / 认知复杂度"]
coverage["覆盖率 Coverage<br/>语句/分支/路径覆盖"]
precommit["Git Hooks<br/>husky / lint-staged"]

quality --> lint & format & typecheck & review & refactor & complexity & coverage & precommit

%% ========== 原则节点 圆形 ==========
solid(("SOLID 原则<br/>单一职责/开闭/里氏替换/接口隔离/依赖倒置"))
dry(("DRY 原则<br/>Don't Repeat Yourself"))
kiss(("KISS 原则<br/>Keep It Simple, Stupid"))
yagni(("YAGNI 原则<br/>You Ain't Gonna Need It"))
soc(("SoC 关注点分离<br/>Separation of Concerns"))

solid -.->|指导| pattern
dry -.->|指导| quality
kiss -.->|指导| arch
yagni -.->|指导| perf
soc -.->|指导| layered

%% ========== 实践关联 ==========
observer -.->|应用于| mfe
cqrs -.->|常与| eventsource
proxy -.->|应用于| sec
singleton -.->|反模式警示| root
xss -.->|前置决策| xss_impl

unit -.->|前置| integration
integration -.->|前置| e2e
e2e -.->|补充| visual
contract -.->|保障| microsvc

cicd -.->|包含| monitor
bluegreen -.->|属于| cicd
canary -.->|属于| cicd
iac -.->|支撑| cicd

lint -.->|配合| format
typecheck -.->|配合| lint
precommit -.->|触发| lint
coverage -.->|衡量| unit
complexity -.->|发现| refactor

load_opt_a -.->|实现工具| build_opt_a
build_opt_a -.->|影响| runtime_opt
network_opt_a -.->|影响| load_opt_c

%% ========== 样式定义 ==========
classDef root fill:#fff8e1,stroke:#ff6f00,stroke-width:3px,color:#e65100
classDef practice fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#bf360c
classDef principle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
classDef category fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c

class root root
class pattern,arch,perf,sec,test,devops,quality,creational,structural,behavioral category
class singleton,xss decision
class solid,dry,kiss,yagni,soc principle
class singleton_impl,factory,abs_factory,builder,prototype practice
class adapter,decorator,proxy,facade,bridge,composite,flyweight practice
class observer,strategy,command,iterator,template,state,chain,visitor,mediator,memento,interpreter practice
class layered,hexagonal,onion,cqrs,eventsource,mfe,bff,microsvc,ddd practice
class load_opt,load_opt_a,load_opt_b,load_opt_c,load_opt_d practice
class runtime_opt,runtime_opt_a,runtime_opt_b,runtime_opt_c,runtime_opt_d,runtime_opt_e practice
class build_opt,build_opt_a,build_opt_b,build_opt_c,build_opt_d practice
class network_opt,network_opt_a,network_opt_b,network_opt_c,network_opt_d practice
class xss_impl,csrf,csp,sqli,supply,secrets,cors practice
class unit,integration,e2e,contract,chaos,visual,fuzz,mutation,perf_test practice
class cicd,gitops,bluegreen,canary,monitor,iac,sre,feature_flag practice
class lint,format,typecheck,review,refactor,complexity,coverage,precommit practice
`)],-1)])])}const u=t(a,[["render",i]]);export{b as __pageData,u as default};
