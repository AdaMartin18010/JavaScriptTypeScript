---
title: "Vue 响应式系统的认知模型"
description: "Proxy 透明性、Ref vs Reactive、Composition vs Options API 的认知心理学深度分析"
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P2
actual-length: ~9000 words
references:
  - Vue RFCs
  - Vue Documentation
  - Green & Petre, Usability Analysis of Visual Programming Environments (1996)
english-abstract: 'A comprehensive technical analysis of Vue 响应式系统的认知模型, exploring theoretical foundations and practical implications for software engineering.'
---

# Vue 响应式系统的认知模型

> **理论深度**: 跨学科
> **前置阅读**: [01-cognitive-science-primer-for-developers.md](01-cognitive-science-primer-for-developers.md), [04-conceptual-models-of-ui-frameworks.md](04-conceptual-models-of-ui-frameworks.md)
> **目标读者**: Vue 开发者、前端架构师

---

## 目录

- [Vue 响应式系统的认知模型](#vue-响应式系统的认知模型)
  - [目录](#目录)
  - [0. 工程故事：从 Vue 2 到 Vue 3 的迁移冲击](#0-工程故事从-vue-2-到-vue-3-的迁移冲击)
  - [1. Proxy 代理的"透明性"幻觉](#1-proxy-代理的透明性幻觉)
    - [1.1 自动依赖追踪的认知优势](#11-自动依赖追踪的认知优势)
    - [1.2 认知心理学视角：为什么透明性让人"感觉自然"](#12-认知心理学视角为什么透明性让人感觉自然)
    - [1.3 正例：Proxy 透明性的正确利用](#13-正例proxy-透明性的正确利用)
    - [1.4 反例：透明性的边界与陷阱](#14-反例透明性的边界与陷阱)
    - [1.5 修正方案：当透明性失效时如何应对](#15-修正方案当透明性失效时如何应对)
    - [1.6 与 React useState 的认知对比](#16-与-react-usestate-的认知对比)
  - [2. Ref vs Reactive 的心智模型冲突](#2-ref-vs-reactive-的心智模型冲突)
    - [2.1 包装器的心智模型："盒子里的值"](#21-包装器的心智模型盒子里的值)
    - [2.2 解构丢失响应性：最常见的反例](#22-解构丢失响应性最常见的反例)
    - [2.3 反例：将 Reactive 对象传递给外部函数](#23-反例将-reactive-对象传递给外部函数)
    - [2.4 正例：使用 toRefs 和 readonly 建立安全边界](#24-正例使用-torefs-和-readonly-建立安全边界)
    - [2.5 修正方案：何时用 Ref，何时用 Reactive？](#25-修正方案何时用-ref何时用-reactive)
  - [3. Computed 的缓存语义与预期一致性](#3-computed-的缓存语义与预期一致性)
    - [3.1 缓存的直觉匹配与惰性求值](#31-缓存的直觉匹配与惰性求值)
    - [3.2 正例：Computed 处理派生状态的最佳实践](#32-正例computed-处理派生状态的最佳实践)
    - [3.3 反例：副作用导致的预期违背](#33-反例副作用导致的预期违背)
    - [3.4 反例：Computed 返回可变对象](#34-反例computed-返回可变对象)
    - [3.5 修正方案：watch、watchEffect 与 computed 的职责分离](#35-修正方案watchwatcheffect-与-computed-的职责分离)
  - [4. Composition API vs Options API 的认知维度对比](#4-composition-api-vs-options-api-的认知维度对比)
    - [4.1 认知维度分析框架](#41-认知维度分析框架)
    - [4.2 对称差：两种 API 的能力差异](#42-对称差两种-api-的能力差异)
    - [4.3 正例：Composable 模式的逻辑复用](#43-正例composable-模式的逻辑复用)
    - [4.4 反例：混用 Options 与 Composition 的陷阱](#44-反例混用-options-与-composition-的陷阱)
    - [4.5 迁移的认知成本与增量策略](#45-迁移的认知成本与增量策略)
  - [5. 设计低认知负荷的 Vue 代码](#5-设计低认知负荷的-vue-代码)
    - [5.5 Vue 响应式 vs React 响应式的对称差分析](#55-vue-响应式-vs-react-响应式的对称差分析)
  - [参考文献](#参考文献)
  - [反例与局限性](#反例与局限性)
    - [1. 形式化模型的简化假设](#1-形式化模型的简化假设)
    - [2. TypeScript 类型的不完备性](#2-typescript-类型的不完备性)
    - [3. 认知模型的个体差异](#3-认知模型的个体差异)
    - [4. 工程实践中的折衷](#4-工程实践中的折衷)
    - [5. 跨学科整合的挑战](#5-跨学科整合的挑战)
  - [工程决策矩阵](#工程决策矩阵)

---

## 0. 工程故事：从 Vue 2 到 Vue 3 的迁移冲击

2020 年，某中型电商团队决定将核心交易平台从 Vue 2 迁移到 Vue 3。迁移的理由很充分：TypeScript 支持更好、性能更优、Composition API 带来更灵活的逻辑复用。团队负责人预估需要 3 周完成核心模块迁移。

实际执行中，第一个障碍出现在第 3 天。一名资深开发者编写了这样的代码：

```typescript
import { reactive } from 'vue';

const state = reactive({ count: 0, name: 'Alice' });

function useStateLogic() {
  const { count, name } = state;
  // 开发者预期：count 和 name 仍然是响应式的
  const increment = () => {
    count++;  // ❌ 视图没有更新！
  };
  return { count, name, increment };
}
```

这段代码在 Vue 2 中曾经是"危险但可行"的——因为 Vue 2 的 `reactive` 基于 `Object.defineProperty`，解构出的值在某些场景下仍能通过闭包间接触发更新。但在 Vue 3 中，解构出的 `count` 是一个普通数字，修改它不会触发任何依赖追踪。

这个 bug 花了团队 4 小时才定位。根本原因在于：开发者的心智模型仍然停留在"数据修改自动更新"的抽象层面，没有理解 Proxy 与 `Object.defineProperty` 在引用语义上的本质差异。

类似的问题在接下来的两周内不断出现：

- 开发者在 `computed` 中调用 `fetch`，困惑于为什么 API 请求没有按预期触发
- 团队试图用 `reactive` 包装整个应用状态树，发现深层嵌套对象的替换行为与直觉不符
- 习惯于 Options API 的开发者面对 `setup` 函数时，感到"代码组织失去了方向感"

这些问题的共同特征是：它们不是语法错误，而是**心智模型与系统实际行为之间的错位**。Vue 3 的响应式系统在设计上追求"透明性"——让开发者感觉自己在直接操作普通 JavaScript 对象——但这种透明性是有边界、有代价的。当开发者的心智模型忽略了这些边界时，就会遇到认知冲突。

本章的目标不是罗列 Vue 3 响应式 API 的使用手册，而是从认知科学的角度分析：这个系统如何与人类的心智模型交互？透明性在哪些场景下是优势，在哪些场景下是陷阱？Ref 与 Reactive 两种 API 分别激活了什么样的心智表征？Composition API 与 Options API 的认知负荷差异在哪里？

---

## 1. Proxy 代理的"透明性"幻觉

### 1.1 自动依赖追踪的认知优势

Vue 3 使用 JavaScript Proxy 实现响应式系统。Proxy 的核心认知优势是**透明性**：开发者像操作普通对象一样操作响应式数据，框架在后台自动追踪依赖。

```vue
<script setup lang="ts">
import { ref } from 'vue';

const count = ref<number>(0);

// 像操作普通数字一样操作 count
function increment(): void {
  count.value++;  // Vue 自动追踪这个变化
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
  <!-- 自动更新：count 变化时，视图自动重新渲染 -->
</template>
```

**认知分析**：

- 外在负荷：低（无需理解依赖追踪机制）
- 相关负荷：中（需要理解 `.value` 解包）
- 心智模型匹配：高（符合"修改数据 → 视图更新"的直觉）

**精确类比：自动驾驶汽车**

| 概念 | 自动驾驶 | Vue Proxy |
|------|---------|-----------|
| 开发者操作 | 转动方向盘 | 修改数据 |
| 系统自动处理 | 引擎控制、刹车、转向 | 依赖追踪、更新调度、DOM 操作 |
| 感知 | "我在直接控制车" | "我在直接修改数据" |
| 实际 | 系统在后台做大量工作 | Proxy 在后台拦截读写 |

**类比的边界**：

- ✅ 像自动驾驶一样，透明性降低了操作复杂度。驾驶者不需要理解内燃机的工作原理就能开车；开发者不需要理解依赖图的结构就能编写响应式代码。
- ❌ 不像自动驾驶，Proxy 的"透明性"在某些场景下会失效。自动驾驶不会在特定道路上突然失效，但 Proxy 对 `Date`、`Map`、`Set` 等内置对象的拦截能力有限。
- ❌ 不像自动驾驶有明确的安全边界告警，Proxy 的失效是静默的——代码看起来在运行，但响应性已经丢失，开发者可能在很长时间内都不会察觉。

### 1.2 认知心理学视角：为什么透明性让人"感觉自然"

人类心智中有一个根深蒂固的因果直觉系统。发展心理学家 Alison Gopnik 的研究表明，儿童在 3 岁左右就能建立"如果 A 改变，B 应该随之改变"的因果模型。这种直觉在成人阶段发展为**心智化理论**（Theory of Mind）——我们倾向于给对象赋予内在状态，并预期状态变化会产生可预测的行为。

Vue 的响应式系统恰好映射了这种直觉：

```typescript
// 心智模型："cart.total 依赖于 items"
const cart = reactive({
  items: [] as { price: number; quantity: number }[],
  discount: 0.1
});

// 当 items 变化时，total "应该"自动更新
const total = computed(() => {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return subtotal * (1 - cart.discount);
});
```

这个映射的精确性体现在：开发者不需要在心智中维护一个"哪些视图依赖于哪些数据"的显式列表。 Proxy 在后台构建的依赖图，替代了人类工作记忆本需要承担的部分负荷。

认知心理学家 John Sweller 的**认知负荷理论**区分了三种负荷：

1. **内在负荷**（Intrinsic Load）：任务本身的复杂度。响应式数据流的内在复杂度不会因为框架选择而消失。
2. **外在负荷**（Extraneous Load）：信息呈现方式带来的额外负担。Vue 的 Proxy 透明性大幅降低了外在负荷——你不需要写 `setState`、`dispatch`、`subscribe`。
3. **相关负荷**（Germane Load）：建立心智模型和图式所需的投入。`.value` 的解包、响应式对象的引用语义，都属于相关负荷。

Vue 3 的设计权衡是：用中等的相关负荷（学习 `.value` 和 Proxy 边界）换取低外在负荷（简洁的代码）和低内在负荷（直觉式的数据驱动）。

### 1.3 正例：Proxy 透明性的正确利用

```typescript
import { ref, computed, watch } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
}

// 正例：利用 Proxy 透明性构建清晰的依赖链
function useUserSearch(users: Ref<User[]>) {
  const searchQuery = ref<string>('');

  // 依赖自动追踪：filteredUsers 隐式依赖于 searchQuery 和 users
  const filteredUsers = computed(() => {
    const query = searchQuery.value.toLowerCase();
    if (!query) return users.value;
    return users.value.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  // 自动追踪 filteredUsers 的变化
  const resultCount = computed(() => filteredUsers.value.length);

  // watch 只会在 resultCount 变化时触发
  watch(resultCount, (newCount, oldCount) => {
    console.log(`Results changed from ${oldCount} to ${newCount}`);
  });

  return {
    searchQuery,
    filteredUsers,
    resultCount
  };
}
```

这个正例展示了 Proxy 透明性的最佳实践场景：

- 数据依赖链清晰：searchQuery → filteredUsers → resultCount
- 没有手动订阅/取消订阅的负担
- TypeScript 类型标注完整，编译器能在开发时捕获类型错误
- 每个 computed 都是纯函数，符合透明性的认知预期

### 1.4 反例：透明性的边界与陷阱

**反例 1：数组索引的响应性限制**

```typescript
const arr = reactive<number[]>([1, 2, 3]);

arr[0] = 10;      // ✅ 响应式（Proxy 拦截索引赋值）
arr.length = 0;   // ✅ Vue 3 中响应式（Vue 2 中不是）
arr.push(4);      // ✅ 响应式（Array.prototype 方法被重载）

// 但：
const state = reactive<{ items: number[] }>({ items: [1, 2, 3] });
state.items[5] = 6;  // ⚠️ 可能不触发更新（超出数组长度的索引赋值）
```

**反例 2：对象属性的添加与删除**

```typescript
const state = reactive<{ name: string; age?: number }>({ name: 'Alice' });

state.age = 30;        // ✅ Vue 3 中响应式（Proxy 拦截）
delete state.name;     // ✅ Vue 3 中响应式

// 但在 Vue 2 中：
// state.age = 30;     // ❌ 不响应！需要 Vue.set(state, 'age', 30)
// delete state.name;  // ❌ 不响应！需要 Vue.delete(state, 'name')
```

**反例 3：内置对象的拦截限制**

```typescript
// ❌ 错误：Date 对象无法被 Proxy 完全拦截
const date = reactive(new Date());
date.setFullYear(2026);  // ⚠️ 不会触发依赖更新！

// ❌ 错误：Map/Set 的某些操作在 Vue 3.0 之前有限制
const map = reactive(new Map<string, number>());
map.set('key', 1);  // Vue 3.0+ 支持，但早期版本需要特殊处理
```

**认知陷阱**：开发者可能假设"所有操作都是透明的"，但实际上 Proxy 只能拦截**已知的属性访问模式**。`Date.prototype.setFullYear` 等方法不会触发 Proxy 的 `set` trap，因为它们是调用内部槽（internal slots）而非属性赋值。

### 1.5 修正方案：当透明性失效时如何应对

当透明性失效时，开发者需要显式介入，将"自动追踪"降级为"显式通知"。

```typescript
import { ref, watch } from 'vue';

// 修正方案 1：对无法被 Proxy 拦截的对象，使用 ref + 替换
function useDate() {
  const date = ref<Date>(new Date());

  const setYear = (year: number): void => {
    const newDate = new Date(date.value);
    newDate.setFullYear(year);
    date.value = newDate;  // 替换整个对象，触发响应
  };

  return { date, setYear };
}

// 修正方案 2：对集合类型，使用 Vue 3 内置的集合响应式支持
// 或显式触发更新
import { triggerRef } from 'vue';

function useCollection() {
  const items = ref<Set<string>>(new Set());

  const addItem = (item: string): void => {
    items.value.add(item);
    triggerRef(items);  // 强制通知依赖更新
  };

  return { items, addItem };
}

// 修正方案 3：使用 shallowRef/shallowReactive 明确控制深度
const shallowState = shallowRef({ deep: { nested: 'value' } });
// 只有 .value 的替换会触发更新，内部属性修改不会
// 这在处理大型不可变数据（如从 API 返回的 JSON）时非常有用
```

**关键认知转变**：从"所有操作都透明"转向"默认透明，边界显式"。这类似于驾驶汽车时的认知模式——自动驾驶在高速公路有效，但在停车场你需要手动接管。

### 1.6 与 React useState 的认知对比

| 维度 | Vue ref/reactive | React useState |
|------|-----------------|----------------|
| 修改方式 | `count.value++` | `setCount(count + 1)` |
| 心智模型 | "修改数据" | "请求更新" |
| 批量更新 | 自动 | 自动（React 18+）|
| 认知负荷 | 中（需要 .value）| 中（需要 setXxx）|
| 函数组件中的感觉 | "数据驱动" | "状态机" |
| 依赖追踪 | 自动（运行时追踪）| 手动（useMemo/useCallback 依赖数组）|

**关键差异**：Vue 强调"数据是响应式的"，React 强调"状态是显式管理的"。两种哲学没有绝对的优劣，但匹配不同开发者的心智模型。

**精确类比**：

- Vue 的响应式像**自动门**：你走向它，门自动打开。你不需要按下按钮，但你需要知道传感器的位置（Proxy 的边界）。
- React 的 useState 像**手动门**：你需要按下按钮，门才会打开。这给了你明确的控制感，但每次进出都需要额外动作。

边界标注：

- ✅ 自动门在双手提满东西时更方便（复杂依赖场景）
- ❌ 自动门在传感器故障时让人困惑（Proxy 边界失效）
- ✅ 手动门给你明确的反馈（每次 setState 都是显式意图）
- ❌ 手动门在频繁进出时疲劳（大量 useMemo 依赖数组维护）

---

## 2. Ref vs Reactive 的心智模型冲突

### 2.1 包装器的心智模型："盒子里的值"

Vue 3 提供了两种创建响应式数据的方式：

```typescript
import { ref, reactive } from 'vue';

// ref：原始值的包装器
const count = ref<number>(0);
console.log(count.value);  // 需要 .value

// reactive：对象的代理
const user = reactive<{ name: string; age: number }>({ name: 'Alice', age: 30 });
console.log(user.name);    // 无需 .value
```

**为什么需要两种不同的 API？**

从认知科学的角度，这反映了**两种不同的心智模型**：

- **ref** = "盒子里的值"（需要打开盒子才能看到）
- **reactive** = "透明的容器"（直接看到内容）

**精确类比：银行保险箱 vs 玻璃展示柜**

| 概念 | 银行保险箱（Ref） | 玻璃展示柜（Reactive） |
|------|----------------|---------------------|
| 访问方式 | 需要钥匙（.value） | 直接看到内容（.property） |
| 适用对象 | 单个贵重物品（原始值） | 成套藏品（对象） |
| 替换成本 | 换一把保险箱即可（替换 .value） | 需要重新布置整个展柜（替换对象引用丢失响应性） |
| 认知负担 | 高：每次访问都需要"开锁" | 低：直觉式访问 |

边界标注：

- ✅ 保险箱适合存放零散物品（原始值）
- ❌ 保险箱不适合频繁展示的场景（需要反复 .value）
- ✅ 展示柜适合成套展示（对象的多个属性）
- ❌ 展示柜不适合替换整个展品（替换对象引用失去响应性）

### 2.2 解构丢失响应性：最常见的反例

这是 Vue 开发者遇到的最常见陷阱之一：

```typescript
const state = reactive<{ count: number; name: string }>({ count: 0, name: 'Alice' });

// 错误：解构会丢失响应性！
const { count, name } = state;
count++;  // ❌ 不会触发更新！count 是普通数字

// 正确：使用 toRefs
import { toRefs } from 'vue';
const { count: reactiveCount, name: reactiveName } = toRefs(state);
reactiveCount.value++;  // ✅ 响应式
```

**为什么这个陷阱如此常见？**

因为 ES6 解构是 JavaScript 的核心语法，开发者本能地会使用它。但解构创建的是**普通变量**的引用，而不是 Proxy 的引用——响应性在解构时丢失了。

**认知负荷分析**：

- 新手：高（不理解为什么解构会丢失响应性）
- 专家：低（已建立"解构 = 复制"的心智模型）

**深层原因**：人类心智倾向于"传递性直觉"——如果 A 是响应式的，A 的组成部分也应该是响应式的。但这种直觉在 JavaScript 的引用语义中不成立。`reactive` 返回的 Proxy 对象本身是响应式的，但解构出的属性值只是原始值的快照。

### 2.3 反例：将 Reactive 对象传递给外部函数

另一个常见陷阱是假设 reactive 对象在任何上下文中都能保持响应性：

```typescript
// ❌ 反例：将 reactive 对象传递给不使用 Vue 的外部函数
const state = reactive({ items: [] as string[] });

function externalProcess(data: { items: string[] }): void {
  // 这个函数不知道 data 是 Proxy
  // 它可能使用 Object.assign、JSON.stringify 或其他非 Proxy 感知操作
  const copy = JSON.parse(JSON.stringify(data));
  copy.items.push('new item');
  // state.items 不会更新，因为 externalProcess 没有修改原对象
}

externalProcess(state);
```

**问题分析**：外部函数将 reactive 对象当作普通对象处理。JSON.stringify 会忽略 Proxy 的元数据，导致响应性在序列化边界丢失。这类似于把一张磁卡交给一个只认纸质文件的机构——物理介质不兼容。

**修正方案**：

```typescript
// ✅ 修正：在外部边界处转换为普通对象或 ref
import { toRaw, isProxy } from 'vue';

function safeExternalProcess(data: { items: string[] }): string[] {
  // 如果是 Proxy，获取原始对象进行只读操作
  const rawData = isProxy(data) ? toRaw(data) : data;
  return rawData.items.map(item => item.toUpperCase());
}

// 或者使用 ref 包装，明确替换语义
const stateRef = ref({ items: [] as string[] });

function updateItems(newItems: string[]): void {
  stateRef.value = { items: newItems };  // 显式替换，响应性保证
}
```

### 2.4 正例：使用 toRefs 和 readonly 建立安全边界

```typescript
import { reactive, toRefs, readonly } from 'vue';

interface AppState {
  user: { name: string; id: number };
  settings: { theme: 'light' | 'dark' };
}

function useAppState(): {
  user: Ref<{ name: string; id: number }>;
  settings: Readonly<Ref<{ theme: 'light' | 'dark' }>>;
  updateTheme: (theme: 'light' | 'dark') => void;
} {
  const state = reactive<AppState>({
    user: { name: 'Alice', id: 1 },
    settings: { theme: 'light' }
  });

  // 使用 toRefs 保持响应性的同时支持解构
  const refs = toRefs(state);

  // 使用 readonly 防止外部直接修改
  const readonlySettings = readonly(refs.settings);

  const updateTheme = (theme: 'light' | 'dark'): void => {
    state.settings.theme = theme;  // 内部仍然可以修改
  };

  return {
    user: refs.user,
    settings: readonlySettings,
    updateTheme
  };
}

// 使用方：
const { user, settings, updateTheme } = useAppState();
// settings.value.theme = 'dark';  // ❌ TypeScript 编译错误：readonly
updateTheme('dark');  // ✅ 通过受控接口修改
```

这个正例展示了如何建立**防御性响应式边界**：

1. `toRefs` 解决了解构丢失响应性的问题
2. `readonly` 防止了外部对状态的随意修改
3. 通过函数接口暴露受控的修改操作

### 2.5 修正方案：何时用 Ref，何时用 Reactive？

| 场景 | 推荐 | 理由 | 反例风险 |
|------|------|------|---------|
| 原始值（string, number, boolean）| ref | reactive 只能用于对象 | 用 reactive 包装原始值会导致类型错误 |
| 需要解构 | ref + toRefs | 避免丢失响应性 | 直接解构 reactive 对象丢失响应性 |
| 复杂对象（多个相关属性）| reactive | 更符合"对象"的心智模型 | 替换整个对象会失去响应性 |
| 需要替换整个对象 | ref | reactive 替换对象会失去响应性 | 直接赋值给 reactive 变量创建新引用 |
| 跨组件传递状态 | ref | 引用语义清晰，避免意外解包 | reactive 对象在传递中可能被解构 |
| 需要 readonly 暴露 | ref + readonly | 可以精确控制粒度 | reactive 的 readonly 转换更复杂 |

**决策流程**：

```typescript
// 认知决策树（按优先级）：
// 1. 是原始值？→ ref
// 2. 需要解构或展开？→ ref / toRefs
// 3. 是对象且属性高度内聚？→ reactive
// 4. 需要替换整个对象？→ ref
// 5. 不确定？→ ref（默认更安全）
```

---

## 3. Computed 的缓存语义与预期一致性

### 3.1 缓存的直觉匹配与惰性求值

`computed` 属性是 Vue 中计算值的缓存机制：

```typescript
import { ref, computed } from 'vue';

const firstName = ref<string>('Alice');
const lastName = ref<string>('Smith');

const fullName = computed<string>(() => {
  console.log('computing...');  // 只在依赖变化时执行
  return `${firstName.value} ${lastName.value}`;
});

console.log(fullName.value);  // "Alice Smith" —— 执行计算
console.log(fullName.value);  // "Alice Smith" —— 直接返回缓存

firstName.value = 'Bob';
console.log(fullName.value);  // "Bob Smith" —— 重新计算
```

**认知优势**：

- 符合"惰性求值"的直觉——只在需要时计算
- 符合"缓存"的直觉——结果不变时直接返回缓存

**精确类比：图书馆的索引卡片系统**

想象一个图书馆，每本书有作者、标题、出版年份。读者经常问"这本书的作者是谁"。

- **没有 computed**：每次有人询问，图书管理员都要走到书架前查找（重复计算）。
- **有 computed**：管理员第一次查找后，把结果写在索引卡片上。之后只要书没有更换（依赖没变），就直接读卡片（缓存）。

边界标注：

- ✅ 索引卡片减少了重复劳动（缓存有效）
- ❌ 如果有人在卡片上写笔记（副作用），其他读者会看到（意外共享）
- ❌ 索引卡片只记录"查询结果"，不应该触发其他动作（副作用）

### 3.2 正例：Computed 处理派生状态的最佳实践

```typescript
import { ref, computed } from 'vue';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function useShoppingCart(items: Ref<CartItem[]>) {
  // 派生状态 1：小计
  const subtotal = computed<number>(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // 派生状态 2：商品总数
  const totalItems = computed<number>(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  // 派生状态 3：运费（基于小计）
  const shippingCost = computed<number>(() => {
    if (subtotal.value > 100) return 0;
    return 10;
  });

  // 派生状态 4：总价
  const total = computed<number>(() => subtotal.value + shippingCost.value);

  // 派生状态 5：格式化后的摘要
  const summary = computed<string>(() => {
    return `Items: ${totalItems.value}, Subtotal: $${subtotal.value.toFixed(2)}, ` +
           `Shipping: $${shippingCost.value.toFixed(2)}, Total: $${total.value.toFixed(2)}`;
  });

  return {
    subtotal,
    totalItems,
    shippingCost,
    total,
    summary
  };
}
```

这个正例的价值在于展示了**纯派生状态链**：每个 computed 只依赖于原始状态或其他 computed，没有副作用，没有外部 IO。这使得心智模型极其清晰：给定相同的原始状态，派生状态总是确定性的。

### 3.3 反例：副作用导致的预期违背

```typescript
// ❌ 错误：在 computed 中使用副作用
import { ref, computed } from 'vue';

const items = ref<string[]>(['a', 'b', 'c']);

const counter = computed<number>(() => {
  console.log('Counter computed');           // 副作用 1：日志
  fetch('/api/log').catch(() => {});         // 副作用 2：网络请求！
  localStorage.setItem('count', Date.now().toString());  // 副作用 3：存储
  return items.value.length;
});
```

**问题**：computed 的缓存语义意味着副作用不会按预期执行。如果 `items.value.length` 没有变化，`fetch` 不会被调用。这违背了开发者的直觉——"每次我读取这个值，日志都应该打印"。

**认知冲突分析**：开发者将 computed 理解为"带缓存的函数"，但 Vue 的 computed 实际上是"带缓存的纯派生关系"。函数可以包含副作用；派生关系不行。

### 3.4 反例：Computed 返回可变对象

```typescript
// ❌ 反例：computed 返回可变对象并在外部修改
import { ref, computed } from 'vue';

const names = ref<string[]>(['Alice', 'Bob']);

const nameObjects = computed(() =>
  names.value.map(name => ({ name, length: name.length }))
);

// 开发者可能尝试：
nameObjects.value[0].name = 'Charlie';  // ⚠️ 能修改，但不会触发任何更新！
// 而且下次访问 nameObjects 时，这个修改会丢失（因为会重新计算）
```

**问题**：computed 返回的是临时计算结果。修改这个结果是"写入沙盒"——修改存在，但不会被追踪，也不会持久化。

### 3.5 修正方案：watch、watchEffect 与 computed 的职责分离

```typescript
import { ref, computed, watch, watchEffect } from 'vue';

const items = ref<string[]>(['a', 'b', 'c']);

// ✅ computed：纯派生，无副作用
const count = computed<number>(() => items.value.length);

// ✅ watch：监听变化，执行副作用
watch(count, (newCount: number, oldCount: number | undefined) => {
  console.log(`Count changed from ${oldCount} to ${newCount}`);
  fetch('/api/log', {
    method: 'POST',
    body: JSON.stringify({ count: newCount })
  }).catch(() => {});
});

// ✅ watchEffect：自动追踪依赖，执行副作用
watchEffect(() => {
  // 自动追踪 items.value 的访问
  document.title = `Items (${items.value.length})`;
});

// ✅ 修正方案：如果确实需要返回可变派生状态，使用 ref + watch
const mutableSummary = ref<{ total: number; names: string }>({ total: 0, names: '' });

watch(items, (newItems: string[]) => {
  mutableSummary.value = {
    total: newItems.length,
    names: newItems.join(', ')
  };
}, { deep: true });
```

**职责矩阵**：

| 工具 | 职责 | 返回值 | 副作用 | 缓存 |
|------|------|--------|--------|------|
| computed | 纯派生 | 有 | ❌ 禁止 | ✅ 缓存 |
| watch | 监听 + 副作用 | 无 | ✅ 适合 | N/A |
| watchEffect | 自动追踪 + 副作用 | 无 | ✅ 适合 | N/A |
| ref + watch | 可变派生状态 | 有 | ✅ 可接受 | 手动管理 |

---

## 4. Composition API vs Options API 的认知维度对比

### 4.1 认知维度分析框架

使用 Green & Petre 的认知维度框架（Cognitive Dimensions Framework）分析两种 API：

| 认知维度 | Options API | Composition API | 影响 |
|---------|-------------|-----------------|------|
| **抽象梯度** | 固定（data, methods, computed）| 自由（按功能组合）| Composition 更灵活但门槛更高 |
| **隐藏依赖** | 高（this 隐式依赖）| 低（显式导入和调用）| Composition 更易追踪 |
| **渐进评估** | 中 | 高 | Composition 支持增量开发 |
| **粘度** | 高（逻辑分散在选项中）| 低（逻辑内聚）| Composition 更易重构 |
| **一致性** | 高（固定结构）| 中（自由组合）| Options 更易上手 |
| **错误倾向性** | 中（this 指向问题）| 低（显式依赖）| Composition 更类型安全 |
| **premature commitment** | 高（必须在编写时选择选项类别）| 低（运行时组织逻辑）| Composition 减少前期决策负担 |
| **可见性** | 中（相关逻辑分散在不同选项）| 高（相关逻辑集中）| Composition 更易理解上下文 |
| **硬心理操作** | 中（需要在选项间跳转理解逻辑）| 低（线性阅读即可）| Composition 降低阅读负担 |

**认知维度逐项解析**：

**隐藏依赖（Hidden Dependencies）**：

Options API 的最大认知陷阱是 `this`。在 Options API 中，`this.count` 可能来自 `data`、`computed`、`props` 或 Vuex store。开发者需要在多个选项块之间跳转，才能确定 `count` 的来源。

```typescript
// Options API：this.count 的来源不明确
export default {
  data() {
    return { count: 0 };  // 来源 1
  },
  computed: {
    count() { return this.$store.state.count; }  // 如果存在，会覆盖 data
  },
  props: {
    count: Number  // 如果存在，优先级又不同
  }
};
```

Composition API 通过显式导入消除了这种歧义：

```typescript
// Composition API：来源完全显式
import { ref } from 'vue';
import { useStore } from 'vuex';

const localCount = ref(0);           // 明确：本地响应式
const store = useStore();
const storeCount = computed(() => store.state.count);  // 明确：来自 store
const props = defineProps<{ count: number }>();  // 明确：来自 props
```

### 4.2 对称差：两种 API 的能力差异

```
Options API 能力集合 ∩ Composition API 能力集合 = 基础功能（响应式、生命周期、模板语法）

Options API \ Composition API = {
  "this 的隐式上下文",
  "固定选项结构带来的一致性",
  "对 Vue 2 开发者的熟悉感",
  "mixins 的继承式复用（尽管有缺陷）"
}

Composition API \ Options API = {
  "逻辑复用（Composables）",
  "更好的 TypeScript 类型推断",
  "按功能组织代码",
  "更细粒度的逻辑拆分",
  "逻辑的状态封装（封装内部状态，暴露受控接口）"
}
```

**对称差分析**：

Options API 独有的能力中，"固定选项结构"既是优势也是劣势。优势在于：任何 Vue 开发者看到 `data()`、`methods`、`computed` 都知道去哪里找什么。劣势在于：这种固定结构强迫开发者按"技术维度"（数据、方法、计算属性）而非"业务维度"（用户认证、购物车、表单验证）组织代码。

当一个组件同时处理用户认证和购物车时，Options API 会将认证的数据和购物车数据都放在 `data()` 中，认证的方法和购物车的方法都放在 `methods` 中。开发者需要在 `data()` 和 `methods` 之间反复跳转，才能在心智中重建"认证逻辑"的完整图景。

Composition API 允许：

```typescript
// 按业务功能组织，而非技术类型
function useAuth() { /* 所有认证逻辑 */ }
function useCart() { /* 所有购物车逻辑 */ }

export default defineComponent({
  setup() {
    const auth = useAuth();  // 认证逻辑内聚
    const cart = useCart();  // 购物车逻辑内聚
    return { ...auth, ...cart };
  }
});
```

### 4.3 正例：Composable 模式的逻辑复用

```typescript
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Ref, ComputedRef } from 'vue';

// Composable：可复用的鼠标追踪逻辑
interface MousePosition {
  x: Ref<number>;
  y: Ref<number>;
}

export function useMouse(): MousePosition {
  const x = ref<number>(0);
  const y = ref<number>(0);

  const update = (e: MouseEvent): void => {
    x.value = e.pageX;
    y.value = e.pageY;
  };

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}

// Composable：可复用的异步数据获取
interface UseAsyncReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
  execute: () => Promise<void>;
}

export function useAsync<T>(
  fn: () => Promise<T>
): UseAsyncReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<Error | null>(null);
  const loading = ref<boolean>(false);

  const execute = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await fn();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
    } finally {
      loading.value = false;
    }
  };

  return { data, error, loading, execute };
}

// 组合使用：
// const { x, y } = useMouse();
// const { data: users, loading, execute: fetchUsers } = useAsync(() => fetch('/api/users').then(r => r.json()));
```

这个正例展示了 Composition API 的核心价值：**逻辑复用不以牺牲封装性为代价**。每个 composable 可以维护自己的内部状态，只暴露必要的接口。

### 4.4 反例：混用 Options 与 Composition 的陷阱

```typescript
// ❌ 反例：在 Options API 中混用 setup，导致 this 指向混乱
export default {
  data() {
    return {
      count: 0
    };
  },
  setup() {
    const setupCount = ref(0);

    // 错误：试图在 setup 中访问 Options API 的数据
    // console.log(this.count);  // ❌ undefined！setup 中 this 不可用

    return {
      setupCount
    };
  },
  methods: {
    increment() {
      this.count++;
      // this.setupCount++  // ❌ 需要 .value，且类型推断困难
    }
  }
};
```

**问题分析**：Vue 3 允许在同一个组件中混用 Options API 和 Composition API，但这引入了认知混乱。开发者需要同时维护两套心智模型：`this` 的隐式上下文和显式变量引用。更糟糕的是，`setup` 返回的 ref 在模板中会自动解包，但在 Options API 的 `methods` 中需要 `.value`。

**修正方案**：

```typescript
// ✅ 修正：完全使用 Composition API
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  setup() {
    const count = ref<number>(0);
    const doubled = computed<number>(() => count.value * 2);

    const increment = (): void => {
      count.value++;
    };

    return {
      count,
      doubled,
      increment
    };
  }
});
```

### 4.5 迁移的认知成本与增量策略

从 Options API 迁移到 Composition API 的认知成本：

1. **解构旧心智模型**：放弃 "data/methods/computed" 的固定结构（1-2 周）
2. **建立新心智模型**：学习 "按功能组合" 的组织方式（2-3 周）
3. **重新认识生命周期**：从 `mounted()` 到 `onMounted()`（1 周）
4. **处理 this 的消失**：从隐式上下文到显式变量（2-3 周）

**估计迁移时间**：

- 熟练 Vue 2 开发者：4-6 周完全适应 Composition API
- 新手开发者：直接学习 Composition API 反而更快（无需解构旧习惯）

**增量迁移策略**：

```typescript
// 策略 1：新功能用 Composition API，旧代码保持 Options
// 策略 2：提取可复用逻辑为 Composables，在 Options API 中调用
import { useMouse } from './composables/useMouse';

export default {
  data() {
    return {
      ...useMouse()  // 在 Options API 中复用 Composable
    };
  }
};

// 策略 3：逐步将 Options API 组件重写为 setup script
// <script setup lang="ts">
// 这是最终形态，最简洁，认知负荷最低
// </script>
```

---

## 5. 设计低认知负荷的 Vue 代码

**原则 1：优先使用 ref 处理原始值和不确定场景**

```typescript
// ✅ 好的实践
const count = ref<number>(0);
const name = ref<string>('Alice');
const isActive = ref<boolean>(false);

// ❌ 避免：用 reactive 包装简单对象
const state = reactive({ count: 0, name: 'Alice' });  // 过度设计，增加解构风险
```

**原则 2：使用 toRefs 避免解构陷阱**

```typescript
const state = reactive<{ count: number; name: string }>({ count: 0, name: 'Alice' });
const { count, name } = toRefs(state);  // ✅ 保持响应性
```

**原则 3：将复杂逻辑提取为 Composables**

```typescript
// useCounter.ts
import { ref, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';

interface UseCounterReturn {
  count: Ref<number>;
  doubled: ComputedRef<number>;
  increment: () => void;
  decrement: () => void;
}

export function useCounter(initial = 0): UseCounterReturn {
  const count = ref<number>(initial);
  const doubled = computed<number>(() => count.value * 2);
  const increment = (): void => { count.value++; };
  const decrement = (): void => { count.value--; };
  return { count, doubled, increment, decrement };
}

// 使用
const { count, doubled, increment } = useCounter(10);
```

**原则 4：避免在 computed 中使用副作用**

```typescript
// ✅ 好的实践
const doubled = computed<number>(() => count.value * 2);

// ❌ 避免
const bad = computed<number>(() => {
  console.log('side effect!');  // 副作用
  return count.value * 2;
});
```

**原则 5：使用 customRef 实现自定义响应式行为**

```typescript
import { customRef } from 'vue';
import type { Ref } from 'vue';

// 正例：带防抖的 ref
function useDebouncedRef<T>(value: T, delay = 300): Ref<T> {
  let timeout: ReturnType<typeof setTimeout>;

  return customRef<T>((track, trigger) => ({
    get() {
      track();
      return value;
    },
    set(newValue) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        value = newValue;
        trigger();
      }, delay);
    }
  }));
}

const searchQuery = useDebouncedRef<string>('', 500);
// searchQuery.value = 'new query';  // 500ms 后才会触发更新
```

**原则 6：使用 shallowRef/shallowReactive 优化大型不可变数据**

```typescript
import { shallowRef, triggerRef } from 'vue';

// 正例：处理大型 API 响应数据
const tableData = shallowRef<Record<string, unknown>[]>([]);

async function fetchData(): Promise<void> {
  const response = await fetch('/api/large-dataset');
  const data = await response.json();
  tableData.value = data;  // 只有替换时触发更新
  // 不需要追踪 data 内部每个属性的变化
}
```

### 5.5 Vue 响应式 vs React 响应式的对称差分析

```
Vue 响应式 \\ React 响应式 = {
  "自动依赖追踪（无需手动声明）",
  "细粒度更新（属性级别）",
  "Proxy 透明拦截",
  "Mutable 状态模型"
}

React 响应式 \\ Vue 响应式 = {
  "显式状态更新（setState）",
  "不可变数据流",
  "时间切片（Time Slicing）",
  "Suspense 集成"
}

交集 = {
  "组件化",
  "虚拟 DOM（概念上）",
  "单向数据流（默认）"
}
```

**认知影响**：

- Vue 的自动追踪减少了**外在认知负荷**（不需要写依赖数组），但增加了**意外性风险**（你不知道什么会触发更新）
- React 的显式更新增加了**外在认知负荷**，但提供了**确定性保证**（更新路径明确）

---

## 参考文献

1. Vue Team. "Vue 3 Composition API RFC." (2020)
2. Vue Team. "Reactivity in Depth." Vue Documentation.
3. Green, T. R. G., & Petre, M. (1996). "Usability Analysis of Visual Programming Environments." *Journal of Visual Languages and Computing*, 7(2), 131-174.
4. Norman, D. A. (2013). *The Design of Everyday Things* (Revised ed.). Basic Books.
5. Sweller, J. (1988). "Cognitive Load During Problem Solving: Effects on Learning." *Cognitive Science*, 12(2), 257-285.
6. Gopnik, A., & Meltzoff, A. N. (1997). *Words, Thoughts, and Theories*. MIT Press.
7. ECMAScript Committee. "ECMAScript 2015 Language Specification: Proxy Objects."


---

## 反例与局限性

尽管本文从理论和工程角度对 **Vue 响应式系统的认知模型** 进行了深入分析，但仍存在以下反例与局限性，值得读者在实践中保持批判性思维：

### 1. 形式化模型的简化假设

本文采用的范畴论与形式化语义模型建立在若干理想化假设之上：

- **无限内存假设**：范畴论中的对象和态射不直接考虑内存约束，而实际 JavaScript/TypeScript 运行环境受 V8 堆大小和垃圾回收策略严格限制。
- **终止性假设**：形式语义通常预设程序会终止，但现实世界中的事件循环、WebSocket 连接和 Service Worker 可能无限运行。
- **确定性假设**：范畴论中的函子变换是确定性的，而实际前端系统大量依赖非确定性输入（用户行为、网络延迟、传感器数据）。

### 2. TypeScript 类型的不完备性

TypeScript 的结构类型系统虽然强大，但无法完整表达某些范畴构造：

- **高阶类型（Higher-Kinded Types）**：TypeScript 缺乏原生的 HKT 支持，使得 Monad、Functor 等概念的编码需要技巧性的模拟（如 `Kind` 技巧）。
- **依赖类型（Dependent Types）**：无法将运行时值精确地反映到类型层面，限制了形式化验证的完备性。
- **递归类型的不动点**：`Fix` 类型在 TypeScript 中可能触发编译器深度限制错误（ts(2589)）。

### 3. 认知模型的个体差异

本文引用的认知科学结论多基于西方大学生样本，存在以下局限：

- **文化偏差**：不同文化背景的开发者在心智模型、工作记忆容量和问题表征方式上存在系统性差异。
- **经验水平混淆**：专家与新手的差异不仅是知识量，还包括神经可塑性层面的长期适应，难以通过短期训练复制。
- **多模态交互的语境依赖**：语音、手势、眼动追踪等交互方式的认知负荷高度依赖具体任务语境，难以泛化。

### 4. 工程实践中的折衷

理论最优解往往与工程约束冲突：

- **范畴论纯函数的理想 vs 副作用的现实**：I/O、状态变更、DOM 操作是前端开发不可避免的副作用，完全纯函数式编程在实际项目中可能引入过高的抽象成本。
- **形式化验证的成本**：对大型代码库进行完全的形式化验证在时间和人力上通常不可行，业界更依赖测试和类型检查的组合策略。
- **向后兼容性负担**：Web 平台的核心优势之一是长期向后兼容，这使得某些理论上的"更好设计"无法被采用。

### 5. 跨学科整合的挑战

范畴论、认知科学和形式语义学使用不同的术语体系和证明方法：

- **术语映射的不精确**：认知科学中的"图式（Schema）"与范畴论中的"范畴（Category）"虽有直觉相似性，但严格对应关系尚未建立。
- **实验复现难度**：认知实验的结果受实验设计、被试招募和测量工具影响，跨研究比较需谨慎。
- **动态演化**：前端技术栈以极快速度迭代，本文的某些结论可能在 2-3 年后因语言特性或运行时更新而失效。

> **建议**：读者应将本文作为理论 lens（透镜）而非教条，在具体项目中结合实际约束进行裁剪和适配。


## 工程决策矩阵

基于本文的理论分析，以下决策矩阵为实际工程选择提供参考框架：

| 场景 | 推荐方案 | 核心理由 | 风险与权衡 |
|------|---------|---------|-----------|
| 需要强类型保证 | 优先使用 TypeScript 严格模式 + branded types | 在结构类型系统中获得名义类型的安全性 | 编译时间增加，类型体操可能降低可读性 |
| 高并发/实时性要求 | 考虑 Web Workers + SharedArrayBuffer | 绕过主线程事件循环瓶颈 | 共享内存的线程安全问题，Spectre 后的跨域隔离限制 |
| 复杂状态管理 | 有限状态机（FSM）或状态图（Statecharts） | 可预测的状态转换，便于形式化验证 | 状态爆炸问题，小型项目可能过度工程化 |
| 频繁 DOM 更新 | 虚拟 DOM diff（React/Vue）或细粒度响应式（Solid/Svelte） | 批量更新减少重排重绘 | 内存开销（虚拟 DOM）或编译复杂度（细粒度） |
| 跨平台代码复用 | 抽象接口 + 依赖注入，而非条件编译 | 保持类型安全的同时实现平台隔离 | 接口设计成本，运行时多态的微性能损耗 |
| 长期维护的大型项目 | 静态分析（ESLint/TypeScript）+ 架构约束（lint rules） | 将架构决策编码为可自动检查的规则 | 规则维护成本，团队学习曲线 |
| 性能敏感路径 | 手写优化 > 编译器优化 > 通用抽象 | 范畴论抽象在热路径上可能引入间接层 | 可读性下降，优化代码更容易过时 |
| 需要形式化验证 | 轻量级模型检查（TLA+/Alloy）+ 类型系统 | 在工程成本可接受范围内获得可靠性增益 | 形式化规格编写需要专门技能，与代码不同步风险 |

> **使用指南**：本矩阵并非绝对标准，而是提供了一个将理论洞察映射到工程实践的起点。团队应根据具体项目约束（团队规模、交付压力、质量要求、技术债务水平）进行动态调整。
