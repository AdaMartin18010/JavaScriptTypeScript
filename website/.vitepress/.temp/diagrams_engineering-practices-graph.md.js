import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"JavaScript/TypeScript 工程实践知识图谱","description":"","frontmatter":{"title":"JavaScript/TypeScript 工程实践知识图谱"},"headers":[],"relativePath":"diagrams/engineering-practices-graph.md","filePath":"diagrams/engineering-practices-graph.md","lastUpdated":1776545344000}');
const _sfc_main = { name: "diagrams/engineering-practices-graph.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><p>graph TD %% ========== 根节点 ========== root[&quot;🏗️ Engineering Practices&quot;]</p><pre><code>%% ========== 第一层分支 ==========
pattern[&quot;🎨 设计模式&quot;]
arch[&quot;🏛️ 架构模式&quot;]
perf[&quot;⚡ 性能优化&quot;]
sec[&quot;🔒 安全实践&quot;]
test[&quot;🧪 测试策略&quot;]
devops[&quot;🚀 DevOps&quot;]
quality[&quot;✨ 代码质量&quot;]

root --&gt; pattern &amp; arch &amp; perf &amp; sec &amp; test &amp; devops &amp; quality

%% ========== 设计模式 ==========
creational[&quot;创建型 Creational&quot;]
structural[&quot;结构型 Structural&quot;]
behavioral[&quot;行为型 Behavioral&quot;]

pattern --&gt; creational &amp; structural &amp; behavioral

%% 创建型 - 菱形决策节点 + 矩形实践节点
singleton{&quot;是否需要全局唯一实例?&quot;}
singleton_impl[&quot;单例模式 Singleton&lt;br/&gt;确保类只有一个实例&quot;]
factory[&quot;工厂模式 Factory&lt;br/&gt;封装对象创建逻辑&quot;]
abs_factory[&quot;抽象工厂 AbstractFactory&lt;br/&gt;创建相关对象家族&quot;]
builder[&quot;建造者模式 Builder&lt;br/&gt;分步构建复杂对象&quot;]
prototype[&quot;原型模式 Prototype&lt;br/&gt;通过克隆创建对象&quot;]

creational --&gt; singleton &amp; factory &amp; abs_factory &amp; builder &amp; prototype

%% 结构型
adapter[&quot;适配器模式 Adapter&lt;br/&gt;接口兼容性转换&quot;]
decorator[&quot;装饰器模式 Decorator&lt;br/&gt;动态扩展功能&quot;]
proxy[&quot;代理模式 Proxy&lt;br/&gt;控制对象访问&quot;]
facade[&quot;外观模式 Facade&lt;br/&gt;简化复杂接口&quot;]
bridge[&quot;桥接模式 Bridge&lt;br/&gt;抽象与实现分离&quot;]
composite[&quot;组合模式 Composite&lt;br/&gt;树形结构统一处理&quot;]
flyweight[&quot;享元模式 Flyweight&lt;br/&gt;共享细粒度对象&quot;]

structural --&gt; adapter &amp; decorator &amp; proxy &amp; facade &amp; bridge &amp; composite &amp; flyweight

%% 行为型
observer[&quot;观察者模式 Observer&lt;br/&gt;发布-订阅通知机制&quot;]
strategy[&quot;策略模式 Strategy&lt;br/&gt;算法族可互换&quot;]
command[&quot;命令模式 Command&lt;br/&gt;请求封装为对象&quot;]
iterator[&quot;迭代器模式 Iterator&lt;br/&gt;顺序访问聚合元素&quot;]
template[&quot;模板方法 Template Method&lt;br/&gt;算法骨架固定&quot;]
state[&quot;状态模式 State&lt;br/&gt;状态驱动行为变化&quot;]
chain[&quot;职责链模式 Chain of Resp.&lt;br/&gt;请求沿链传递&quot;]
visitor[&quot;访问者模式 Visitor&lt;br/&gt;分离算法与数据结构&quot;]
mediator[&quot;中介者模式 Mediator&lt;br/&gt;集中管理对象交互&quot;]
memento[&quot;备忘录模式 Memento&lt;br/&gt;捕获与恢复状态&quot;]
interpreter[&quot;解释器模式 Interpreter&lt;br/&gt;定义文法表示&quot;]

behavioral --&gt; observer &amp; strategy &amp; command &amp; iterator &amp; template &amp; state &amp; chain &amp; visitor &amp; mediator &amp; memento &amp; interpreter

%% ========== 架构模式 ==========
layered[&quot;分层架构 Layered&lt;br/&gt;表现/业务/数据分离&quot;]
hexagonal[&quot;六边形架构 Hexagonal&lt;br/&gt;端口与适配器&quot;]
onion[&quot;洋葱架构 Onion&lt;br/&gt;依赖向内指向核心&quot;]
cqrs[&quot;CQRS&lt;br/&gt;命令查询职责分离&quot;]
eventsource[&quot;事件溯源 Event Sourcing&lt;br/&gt;状态由事件重建&quot;]
mfe[&quot;微前端 Micro-Frontends&lt;br/&gt;独立部署子应用&quot;]
bff[&quot;BFF Backend for Frontend&lt;br/&gt;专属后端适配层&quot;]
microsvc[&quot;微服务 Microservices&lt;br/&gt;服务化拆分架构&quot;]
ddd[&quot;领域驱动设计 DDD&lt;br/&gt;业务模型驱动开发&quot;]

arch --&gt; layered &amp; hexagonal &amp; onion &amp; cqrs &amp; eventsource &amp; mfe &amp; bff &amp; microsvc &amp; ddd

%% ========== 性能优化 ==========
load_opt[&quot;加载优化&quot;]
runtime_opt[&quot;运行时优化&quot;]
build_opt[&quot;构建优化&quot;]
network_opt[&quot;网络优化&quot;]

perf --&gt; load_opt &amp; runtime_opt &amp; build_opt &amp; network_opt

load_opt_a[&quot;Code Splitting&lt;br/&gt;按需加载代码块&quot;]
load_opt_b[&quot;Lazy Loading&lt;br/&gt;路由/组件懒加载&quot;]
load_opt_c[&quot;Preload / Prefetch&lt;br/&gt;资源优先级提示&quot;]
load_opt_d[&quot;Service Worker 缓存&lt;br/&gt;离线优先策略&quot;]
load_opt --&gt; load_opt_a &amp; load_opt_b &amp; load_opt_c &amp; load_opt_d

runtime_opt_a[&quot;Virtual DOM Diff&lt;br/&gt;最小化真实 DOM 操作&quot;]
runtime_opt_b[&quot;Memoization&lt;br/&gt;useMemo / useCallback&quot;]
runtime_opt_c[&quot;Web Workers&lt;br/&gt;主线程外执行计算&quot;]
runtime_opt_d[&quot;RAF 动画调度&lt;br/&gt;requestAnimationFrame&quot;]
runtime_opt_e[&quot;列表虚拟化&lt;br/&gt;Windowing / Virtual List&quot;]
runtime_opt --&gt; runtime_opt_a &amp; runtime_opt_b &amp; runtime_opt_c &amp; runtime_opt_d &amp; runtime_opt_e

build_opt_a[&quot;Tree Shaking&lt;br/&gt;消除死代码&quot;]
build_opt_b[&quot;Minification&lt;br/&gt;Terser / SWC 压缩&quot;]
build_opt_c[&quot;Scope Hoisting&lt;br/&gt;模块合并优化&quot;]
build_opt_d[&quot;Module Federation&lt;br/&gt;模块联邦共享&quot;]
build_opt --&gt; build_opt_a &amp; build_opt_b &amp; build_opt_c &amp; build_opt_d

network_opt_a[&quot;HTTP/2 Server Push&lt;br/&gt;多路复用优化&quot;]
network_opt_b[&quot;CDN 边缘缓存&lt;br/&gt;就近分发静态资源&quot;]
network_opt_c[&quot;Brotli / Gzip 压缩&lt;br/&gt;减少传输体积&quot;]
network_opt_d[&quot;GraphQL 查询合并&lt;br/&gt;减少往返请求&quot;]
network_opt --&gt; network_opt_a &amp; network_opt_b &amp; network_opt_c &amp; network_opt_d

%% ========== 安全实践 ==========
xss{&quot;是否存在用户输入渲染?&quot;}
xss_impl[&quot;XSS 防护&lt;br/&gt;转义 / CSP / DOMPurify&quot;]
csrf[&quot;CSRF 防护&lt;br/&gt;Token / SameSite Cookie&quot;]
csp[&quot;CSP 内容安全策略&lt;br/&gt;限制资源加载源&quot;]
sqli[&quot;SQL / NoSQL 注入防护&lt;br/&gt;参数化查询 / ORM&quot;]
supply[&quot;供应链安全&lt;br/&gt;依赖审计 / SLSA&quot;]
secrets[&quot;密钥管理&lt;br/&gt;Vault / 环境变量隔离&quot;]
cors[&quot;CORS 配置&lt;br/&gt;白名单 / 预检请求&quot;]

sec --&gt; xss &amp; csrf &amp; csp &amp; sqli &amp; supply &amp; secrets &amp; cors

%% ========== 测试策略 ==========
unit[&quot;单元测试 Unit&lt;br/&gt;函数/组件级隔离测试&quot;]
integration[&quot;集成测试 Integration&lt;br/&gt;多模块协作验证&quot;]
e2e[&quot;E2E 端到端测试&lt;br/&gt;用户场景全流程模拟&quot;]
contract[&quot;契约测试 Contract&lt;br/&gt;API 消费者驱动契约&quot;]
chaos[&quot;混沌测试 Chaos&lt;br/&gt;故意注入故障验证韧性&quot;]
visual[&quot;视觉回归测试 Visual&lt;br/&gt;UI 像素级对比&quot;]
fuzz[&quot;模糊测试 Fuzzing&lt;br/&gt;随机输入发现边界&quot;]
mutation[&quot;变异测试 Mutation&lt;br/&gt;故意改代码测用例质量&quot;]
perf_test[&quot;性能测试 Performance&lt;br/&gt;基准/负载/压力测试&quot;]

test --&gt; unit &amp; integration &amp; e2e &amp; contract &amp; chaos &amp; visual &amp; fuzz &amp; mutation &amp; perf_test

%% ========== DevOps ==========
cicd[&quot;CI/CD&lt;br/&gt;持续集成与持续交付&quot;]
gitops[&quot;GitOps&lt;br/&gt;Git 为唯一事实源&quot;]
bluegreen[&quot;蓝绿部署 Blue-Green&lt;br/&gt;零停机版本切换&quot;]
canary[&quot;金丝雀发布 Canary&lt;br/&gt;小流量灰度验证&quot;]
monitor[&quot;监控告警 Monitoring&lt;br/&gt;Metrics / Logs / Traces&quot;]
iac[&quot;IaC 基础设施即代码&lt;br/&gt;Terraform / Pulumi&quot;]
sre[&quot;SRE 站点可靠性工程&lt;br/&gt;SLO / Error Budget&quot;]
feature_flag[&quot;特性开关 Feature Flags&lt;br/&gt;动态功能发布控制&quot;]

devops --&gt; cicd &amp; gitops &amp; bluegreen &amp; canary &amp; monitor &amp; iac &amp; sre &amp; feature_flag

%% ========== 代码质量 ==========
lint[&quot;Lint 静态检查&lt;br/&gt;ESLint / Oxlint&quot;]
format[&quot;Format 格式化&lt;br/&gt;Prettier / Biome&quot;]
typecheck[&quot;TypeCheck 类型检查&lt;br/&gt;tsc --noEmit&quot;]
review[&quot;Code Review 代码评审&lt;br/&gt;PR Review / 结对编程&quot;]
refactor[&quot;Refactoring 重构&lt;br/&gt;代码坏味道消除&quot;]
complexity[&quot;复杂度分析&lt;br/&gt;Cyclomatic / 认知复杂度&quot;]
coverage[&quot;覆盖率 Coverage&lt;br/&gt;语句/分支/路径覆盖&quot;]
precommit[&quot;Git Hooks&lt;br/&gt;husky / lint-staged&quot;]

quality --&gt; lint &amp; format &amp; typecheck &amp; review &amp; refactor &amp; complexity &amp; coverage &amp; precommit

%% ========== 原则节点 圆形 ==========
solid((&quot;SOLID 原则&lt;br/&gt;单一职责/开闭/里氏替换/接口隔离/依赖倒置&quot;))
dry((&quot;DRY 原则&lt;br/&gt;Don&#39;t Repeat Yourself&quot;))
kiss((&quot;KISS 原则&lt;br/&gt;Keep It Simple, Stupid&quot;))
yagni((&quot;YAGNI 原则&lt;br/&gt;You Ain&#39;t Gonna Need It&quot;))
soc((&quot;SoC 关注点分离&lt;br/&gt;Separation of Concerns&quot;))

solid -.-&gt;|指导| pattern
dry -.-&gt;|指导| quality
kiss -.-&gt;|指导| arch
yagni -.-&gt;|指导| perf
soc -.-&gt;|指导| layered

%% ========== 实践关联 ==========
observer -.-&gt;|应用于| mfe
cqrs -.-&gt;|常与| eventsource
proxy -.-&gt;|应用于| sec
singleton -.-&gt;|反模式警示| root
xss -.-&gt;|前置决策| xss_impl

unit -.-&gt;|前置| integration
integration -.-&gt;|前置| e2e
e2e -.-&gt;|补充| visual
contract -.-&gt;|保障| microsvc

cicd -.-&gt;|包含| monitor
bluegreen -.-&gt;|属于| cicd
canary -.-&gt;|属于| cicd
iac -.-&gt;|支撑| cicd

lint -.-&gt;|配合| format
typecheck -.-&gt;|配合| lint
precommit -.-&gt;|触发| lint
coverage -.-&gt;|衡量| unit
complexity -.-&gt;|发现| refactor

load_opt_a -.-&gt;|实现工具| build_opt_a
build_opt_a -.-&gt;|影响| runtime_opt
network_opt_a -.-&gt;|影响| load_opt_c

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
</code></pre></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("diagrams/engineering-practices-graph.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const engineeringPracticesGraph = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  engineeringPracticesGraph as default
};
