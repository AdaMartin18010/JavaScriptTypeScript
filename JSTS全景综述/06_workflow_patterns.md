# 工作流设计模式全面梳理

## 概述

工作流设计模式（Workflow Patterns）是业务流程管理（BPM）领域的核心概念，由van der Aalst等人在2000年代初系统性地提出和分类。
这些模式描述了业务流程中常见的控制流结构，为工作流建模提供了标准化的语言。

本文档涵盖**43种工作流设计模式**，其中**23种是可判断的**（Decidable Patterns），即可以通过形式化方法进行验证的模式。

---

## 目录

- [工作流设计模式全面梳理](#工作流设计模式全面梳理)
  - [概述](#概述)
  - [目录](#目录)
  - [1. 基本控制模式](#1-基本控制模式)
    - [模式 1: 顺序 (Sequence)](#模式-1-顺序-sequence)
      - [定义](#定义)
      - [BPMN 表示](#bpmn-表示)
      - [TypeScript 实现](#typescript-实现)
      - [适用场景](#适用场景)
      - [反例（错误实现）](#反例错误实现)
      - [可判断性分析](#可判断性分析)
    - [模式 2: 并行分支 (Parallel Split)](#模式-2-并行分支-parallel-split)
      - [定义](#定义-1)
      - [BPMN 表示](#bpmn-表示-1)
      - [TypeScript 实现](#typescript-实现-1)
      - [适用场景](#适用场景-1)
      - [反例（错误实现）](#反例错误实现-1)
      - [可判断性分析](#可判断性分析-1)
    - [模式 3: 同步 (Synchronization)](#模式-3-同步-synchronization)
      - [定义](#定义-2)
      - [BPMN 表示](#bpmn-表示-2)
      - [TypeScript 实现](#typescript-实现-2)
      - [适用场景](#适用场景-2)
      - [反例（错误实现）](#反例错误实现-2)
      - [可判断性分析](#可判断性分析-2)
    - [模式 4: 排他选择 (Exclusive Choice)](#模式-4-排他选择-exclusive-choice)
      - [定义](#定义-3)
      - [BPMN 表示](#bpmn-表示-3)
      - [TypeScript 实现](#typescript-实现-3)
      - [适用场景](#适用场景-3)
      - [反例（错误实现）](#反例错误实现-3)
      - [可判断性分析](#可判断性分析-3)
    - [模式 5: 简单合并 (Simple Merge)](#模式-5-简单合并-simple-merge)
      - [定义](#定义-4)
      - [BPMN 表示](#bpmn-表示-4)
      - [TypeScript 实现](#typescript-实现-4)
      - [适用场景](#适用场景-4)
      - [反例（错误实现）](#反例错误实现-4)
      - [可判断性分析](#可判断性分析-4)
    - [模式 6: 多选 (Multi-Choice)](#模式-6-多选-multi-choice)
      - [定义](#定义-5)
      - [BPMN 表示](#bpmn-表示-5)
      - [TypeScript 实现](#typescript-实现-5)
      - [适用场景](#适用场景-5)
      - [反例（错误实现）](#反例错误实现-5)
      - [可判断性分析](#可判断性分析-5)
    - [模式 7: 同步合并 (Synchronizing Merge)](#模式-7-同步合并-synchronizing-merge)
      - [定义](#定义-6)
      - [BPMN 表示](#bpmn-表示-6)
      - [TypeScript 实现](#typescript-实现-6)
      - [适用场景](#适用场景-6)
      - [反例（错误实现）](#反例错误实现-6)
      - [可判断性分析](#可判断性分析-6)
    - [模式 8: 多合并 (Multi-Merge)](#模式-8-多合并-multi-merge)
      - [定义](#定义-7)
      - [BPMN 表示](#bpmn-表示-7)
      - [TypeScript 实现](#typescript-实现-7)
      - [适用场景](#适用场景-7)
      - [反例（错误实现）](#反例错误实现-7)
      - [可判断性分析](#可判断性分析-7)
    - [模式 9: 鉴别器 (Discriminator)](#模式-9-鉴别器-discriminator)
      - [定义](#定义-8)
      - [BPMN 表示](#bpmn-表示-8)
      - [TypeScript 实现](#typescript-实现-8)
      - [适用场景](#适用场景-8)
      - [反例（错误实现）](#反例错误实现-8)
      - [可判断性分析](#可判断性分析-8)
  - [2. 高级分支同步模式](#2-高级分支同步模式)
    - [模式 10: 任意循环 (Arbitrary Cycles)](#模式-10-任意循环-arbitrary-cycles)
      - [定义](#定义-9)
      - [BPMN 表示](#bpmn-表示-9)
      - [TypeScript 实现](#typescript-实现-9)
      - [适用场景](#适用场景-9)
      - [反例（错误实现）](#反例错误实现-9)
      - [可判断性分析](#可判断性分析-9)
    - [模式 11: 结构化循环 (Structured Loop)](#模式-11-结构化循环-structured-loop)
      - [定义](#定义-10)
      - [BPMN 表示](#bpmn-表示-10)
      - [TypeScript 实现](#typescript-实现-10)
      - [适用场景](#适用场景-10)
      - [反例（错误实现）](#反例错误实现-10)
      - [可判断性分析](#可判断性分析-10)
    - [模式 12: 递归 (Recursion)](#模式-12-递归-recursion)
      - [定义](#定义-11)
      - [BPMN 表示](#bpmn-表示-11)
      - [TypeScript 实现](#typescript-实现-11)
      - [适用场景](#适用场景-11)
      - [反例（错误实现）](#反例错误实现-11)
      - [可判断性分析](#可判断性分析-11)
    - [模式 13: 临时触发 (Transient Trigger)](#模式-13-临时触发-transient-trigger)
      - [定义](#定义-12)
      - [BPMN 表示](#bpmn-表示-12)
      - [TypeScript 实现](#typescript-实现-12)
      - [适用场景](#适用场景-12)
      - [反例（错误实现）](#反例错误实现-12)
      - [可判断性分析](#可判断性分析-12)
    - [模式 14: 永久触发 (Persistent Trigger)](#模式-14-永久触发-persistent-trigger)
      - [定义](#定义-13)
      - [BPMN 表示](#bpmn-表示-13)
      - [TypeScript 实现](#typescript-实现-13)
      - [适用场景](#适用场景-13)
      - [反例（错误实现）](#反例错误实现-13)
      - [可判断性分析](#可判断性分析-13)
  - [3. 多实例模式](#3-多实例模式)
    - [模式 15: 多实例无同步 (Multiple Instances Without Synchronization)](#模式-15-多实例无同步-multiple-instances-without-synchronization)
      - [定义](#定义-14)
      - [BPMN 表示](#bpmn-表示-14)
      - [TypeScript 实现](#typescript-实现-14)
      - [适用场景](#适用场景-14)
      - [反例（错误实现）](#反例错误实现-14)
      - [可判断性分析](#可判断性分析-14)
    - [模式 16: 多实例与先决条件同步 (Multiple Instances With a Priori Design-Time Knowledge)](#模式-16-多实例与先决条件同步-multiple-instances-with-a-priori-design-time-knowledge)
      - [定义](#定义-15)
      - [BPMN 表示](#bpmn-表示-15)
      - [TypeScript 实现](#typescript-实现-15)
      - [适用场景](#适用场景-15)
      - [反例（错误实现）](#反例错误实现-15)
      - [可判断性分析](#可判断性分析-15)
    - [模式 17: 多实例与后决条件同步 (Multiple Instances With a Priori Run-Time Knowledge)](#模式-17-多实例与后决条件同步-multiple-instances-with-a-priori-run-time-knowledge)
      - [定义](#定义-16)
      - [BPMN 表示](#bpmn-表示-16)
      - [TypeScript 实现](#typescript-实现-16)
      - [适用场景](#适用场景-16)
      - [反例（错误实现）](#反例错误实现-16)
      - [可判断性分析](#可判断性分析-16)
    - [模式 18: 多实例与指定条件同步 (Multiple Instances Without a Priori Run-Time Knowledge)](#模式-18-多实例与指定条件同步-multiple-instances-without-a-priori-run-time-knowledge)
      - [定义](#定义-17)
      - [BPMN 表示](#bpmn-表示-17)
      - [TypeScript 实现](#typescript-实现-17)
      - [适用场景](#适用场景-17)
      - [反例（错误实现）](#反例错误实现-17)
      - [可判断性分析](#可判断性分析-17)
  - [4. 状态模式](#4-状态模式)
    - [模式 19: 隐式终止 (Implicit Termination)](#模式-19-隐式终止-implicit-termination)
      - [定义](#定义-18)
      - [BPMN 表示](#bpmn-表示-18)
      - [TypeScript 实现](#typescript-实现-18)
      - [适用场景](#适用场景-18)
      - [反例（错误实现）](#反例错误实现-18)
      - [可判断性分析](#可判断性分析-18)
    - [模式 20: 显式终止 (Explicit Termination)](#模式-20-显式终止-explicit-termination)
      - [定义](#定义-19)
      - [BPMN 表示](#bpmn-表示-19)
      - [TypeScript 实现](#typescript-实现-19)
      - [适用场景](#适用场景-19)
      - [反例（错误实现）](#反例错误实现-19)
      - [可判断性分析](#可判断性分析-19)
    - [模式 21: 取消任务 (Cancel Task)](#模式-21-取消任务-cancel-task)
      - [定义](#定义-20)
      - [BPMN 表示](#bpmn-表示-20)
      - [TypeScript 实现](#typescript-实现-20)
      - [适用场景](#适用场景-20)
      - [反例（错误实现）](#反例错误实现-20)
      - [可判断性分析](#可判断性分析-20)
    - [模式 22: 取消案例 (Cancel Case)](#模式-22-取消案例-cancel-case)
      - [定义](#定义-21)
      - [BPMN 表示](#bpmn-表示-21)
      - [TypeScript 实现](#typescript-实现-21)
      - [适用场景](#适用场景-21)
      - [反例（错误实现）](#反例错误实现-21)
      - [可判断性分析](#可判断性分析-21)
    - [模式 23: 取消区域 (Cancel Region)](#模式-23-取消区域-cancel-region)
      - [定义](#定义-22)
      - [BPMN 表示](#bpmn-表示-22)
      - [TypeScript 实现](#typescript-实现-22)
      - [适用场景](#适用场景-22)
      - [反例（错误实现）](#反例错误实现-22)
      - [可判断性分析](#可判断性分析-22)
  - [5. 其他模式](#5-其他模式)
    - [模式 24: 结构化 (Structured)](#模式-24-结构化-structured)
      - [定义](#定义-23)
      - [TypeScript 实现](#typescript-实现-23)
      - [可判断性分析](#可判断性分析-23)
    - [模式 25: 隔离 (Isolation)](#模式-25-隔离-isolation)
      - [定义](#定义-24)
      - [TypeScript 实现](#typescript-实现-24)
      - [可判断性分析](#可判断性分析-24)
    - [模式 26: 里程碑 (Milestone)](#模式-26-里程碑-milestone)
      - [定义](#定义-25)
      - [TypeScript 实现](#typescript-实现-25)
      - [可判断性分析](#可判断性分析-25)
    - [模式 27: 关键区域 (Critical Section)](#模式-27-关键区域-critical-section)
      - [定义](#定义-26)
      - [TypeScript 实现](#typescript-实现-26)
      - [可判断性分析](#可判断性分析-26)
    - [模式 28: 交错并行路由 (Interleaved Parallel Routing)](#模式-28-交错并行路由-interleaved-parallel-routing)
      - [定义](#定义-27)
      - [TypeScript 实现](#typescript-实现-27)
      - [可判断性分析](#可判断性分析-27)
  - [6. 23种可判断模式详细分析](#6-23种可判断模式详细分析)
    - [6.1 可判断模式列表](#61-可判断模式列表)
    - [6.2 不可判断模式列表](#62-不可判断模式列表)
    - [6.3 可判断性判定标准](#63-可判断性判定标准)
      - [6.3.1 可判断的条件](#631-可判断的条件)
      - [6.3.2 不可判断的原因](#632-不可判断的原因)
    - [6.4 形式化验证方法](#64-形式化验证方法)
      - [6.4.1 Petri网分析](#641-petri网分析)
      - [6.4.2 有限状态机分析](#642-有限状态机分析)
      - [6.4.3 时序逻辑验证](#643-时序逻辑验证)
    - [6.5 可判断模式的验证算法](#65-可判断模式的验证算法)
      - [6.5.1 可达性分析算法](#651-可达性分析算法)
      - [6.5.2 死锁检测算法](#652-死锁检测算法)
      - [6.5.3 有界性分析算法](#653-有界性分析算法)
    - [模式 29-43: 其他重要模式](#模式-29-43-其他重要模式)
      - [模式 29: 延迟选择 (Deferred Choice)](#模式-29-延迟选择-deferred-choice)
      - [定义](#定义-28)
      - [TypeScript 实现](#typescript-实现-28)
      - [可判断性分析](#可判断性分析-28)
      - [模式 30: 静态部分合并 (Static Partial Join)](#模式-30-静态部分合并-static-partial-join)
      - [定义](#定义-29)
      - [TypeScript 实现](#typescript-实现-29)
      - [可判断性分析](#可判断性分析-29)
      - [模式 31: 动态部分合并 (Dynamic Partial Join)](#模式-31-动态部分合并-dynamic-partial-join)
      - [定义](#定义-30)
      - [TypeScript 实现](#typescript-实现-30)
      - [可判断性分析](#可判断性分析-30)
      - [模式 32: 取消部分合并 (Canceling Partial Join)](#模式-32-取消部分合并-canceling-partial-join)
      - [定义](#定义-31)
      - [TypeScript 实现](#typescript-实现-31)
      - [可判断性分析](#可判断性分析-31)
      - [模式 33: 结构化部分合并 (Structured Partial Join)](#模式-33-结构化部分合并-structured-partial-join)
      - [定义](#定义-32)
      - [TypeScript 实现](#typescript-实现-32)
      - [可判断性分析](#可判断性分析-32)
      - [模式 34: 多实例循环 (Multi-Instance Loop)](#模式-34-多实例循环-multi-instance-loop)
      - [定义](#定义-33)
      - [TypeScript 实现](#typescript-实现-33)
      - [可判断性分析](#可判断性分析-33)
      - [模式 35: 子流程 (Subprocess)](#模式-35-子流程-subprocess)
      - [定义](#定义-34)
      - [TypeScript 实现](#typescript-实现-34)
      - [可判断性分析](#可判断性分析-34)
      - [模式 36: 事务 (Transaction)](#模式-36-事务-transaction)
      - [定义](#定义-35)
      - [TypeScript 实现](#typescript-实现-35)
      - [可判断性分析](#可判断性分析-35)
      - [模式 37: 补偿 (Compensation)](#模式-37-补偿-compensation)
      - [定义](#定义-36)
      - [TypeScript 实现](#typescript-实现-36)
      - [可判断性分析](#可判断性分析-36)
      - [模式 38: 调用活动 (Call Activity)](#模式-38-调用活动-call-activity)
      - [定义](#定义-37)
      - [TypeScript 实现](#typescript-实现-37)
      - [可判断性分析](#可判断性分析-37)
      - [模式 39: 事件子流程 (Event Subprocess)](#模式-39-事件子流程-event-subprocess)
      - [定义](#定义-38)
      - [TypeScript 实现](#typescript-实现-38)
      - [可判断性分析](#可判断性分析-38)
      - [模式 40: 边界事件 (Boundary Event)](#模式-40-边界事件-boundary-event)
      - [定义](#定义-39)
      - [TypeScript 实现](#typescript-实现-39)
      - [可判断性分析](#可判断性分析-39)
      - [模式 41: 消息事件 (Message Event)](#模式-41-消息事件-message-event)
      - [定义](#定义-40)
      - [TypeScript 实现](#typescript-实现-40)
      - [可判断性分析](#可判断性分析-40)
      - [模式 42: 信号事件 (Signal Event)](#模式-42-信号事件-signal-event)
      - [定义](#定义-41)
      - [TypeScript 实现](#typescript-实现-41)
      - [可判断性分析](#可判断性分析-41)
      - [模式 43: 定时器事件 (Timer Event)](#模式-43-定时器事件-timer-event)
      - [定义](#定义-42)
      - [TypeScript 实现](#typescript-实现-42)
      - [可判断性分析](#可判断性分析-42)
  - [7. 总结与最佳实践](#7-总结与最佳实践)
    - [7.1 模式选择指南](#71-模式选择指南)
    - [7.2 可判断性设计原则](#72-可判断性设计原则)
    - [7.3 形式化验证建议](#73-形式化验证建议)
    - [7.4 43种模式完整列表](#74-43种模式完整列表)
      - [基本控制模式 (9种)](#基本控制模式-9种)
      - [高级分支同步模式 (5种)](#高级分支同步模式-5种)
      - [多实例模式 (4种)](#多实例模式-4种)
      - [状态模式 (5种)](#状态模式-5种)
      - [其他模式 (20种)](#其他模式-20种)
    - [7.5 可判断模式统计](#75-可判断模式统计)
  - [附录: 工具函数](#附录-工具函数)

---

## 1. 基本控制模式

基本控制模式是工作流建模中最基础、最常用的模式，涵盖了顺序执行、分支、合并等基本控制结构。

---

### 模式 1: 顺序 (Sequence)

#### 定义

顺序模式描述活动按线性顺序依次执行的场景。一个活动完成后，下一个活动才能开始。

#### BPMN 表示

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="sequence_pattern">
    <startEvent id="start" />
    <sequenceFlow id="flow1" sourceRef="start" targetRef="taskA" />

    <task id="taskA" name="任务A" />
    <sequenceFlow id="flow2" sourceRef="taskA" targetRef="taskB" />

    <task id="taskB" name="任务B" />
    <sequenceFlow id="flow3" sourceRef="taskB" targetRef="end" />

    <endEvent id="end" />
  </process>
</definitions>
```

#### TypeScript 实现

```typescript
interface Task {
  id: string;
  name: string;
  execute(): Promise<void>;
}

class SequencePattern {
  private tasks: Task[] = [];

  addTask(task: Task): void {
    this.tasks.push(task);
  }

  async execute(): Promise<void> {
    for (const task of this.tasks) {
      console.log(`Executing: ${task.name}`);
      await task.execute();
    }
  }
}

// 使用示例
const sequence = new SequencePattern();
sequence.addTask({
  id: '1',
  name: '填写申请表',
  execute: async () => { /* ... */ }
});
sequence.addTask({
  id: '2',
  name: '审核申请',
  execute: async () => { /* ... */ }
});
sequence.addTask({
  id: '3',
  name: '批准申请',
  execute: async () => { /* ... */ }
});
await sequence.execute();
```

#### 适用场景

- 审批流程的线性步骤
- 数据处理的流水线
- 订单处理的标准流程

#### 反例（错误实现）

```typescript
// 错误：并行执行而非顺序执行
async executeWrong(): Promise<void> {
  // 所有任务同时开始，违反顺序语义
  await Promise.all(this.tasks.map(t => t.execute()));
}
```

#### 可判断性分析

**可判断** ✅

顺序模式是最简单的可判断模式。可以通过有限状态机（FSM）进行建模和验证。

**形式化论证：**

```
设任务序列为 T = [t₁, t₂, ..., tₙ]
状态转换: S₀ →(t₁) S₁ →(t₂) S₂ → ... →(tₙ) Sₙ

正确性条件:
1. ∀i ∈ [1,n]: tᵢ 在 Sᵢ₋₁ 状态下可执行
2. ∀i ∈ [1,n-1]: tᵢ 完成后必须进入 Sᵢ 状态
3. 无死锁: 每个状态都有后续转换
4. 无活锁: 流程必然到达终止状态 Sₙ

时间复杂度: O(n)
空间复杂度: O(1)
```

---

### 模式 2: 并行分支 (Parallel Split)

#### 定义

并行分支模式允许流程在特定点后分成多个并行执行的路径，所有分支同时开始执行。

#### BPMN 表示

```xml
<process id="parallel_split">
  <startEvent id="start" />
  <sequenceFlow sourceRef="start" targetRef="fork" />

  <parallelGateway id="fork" gatewayDirection="Diverging" />
  <sequenceFlow sourceRef="fork" targetRef="taskA" />
  <sequenceFlow sourceRef="fork" targetRef="taskB" />
  <sequenceFlow sourceRef="fork" targetRef="taskC" />

  <task id="taskA" name="分支A" />
  <task id="taskB" name="分支B" />
  <task id="taskC" name="分支C" />
</process>
```

#### TypeScript 实现

```typescript
class ParallelSplitPattern {
  private branches: (() => Promise<void>)[] = [];

  addBranch(task: () => Promise<void>): void {
    this.branches.push(task);
  }

  async execute(): Promise<void> {
    console.log('Forking into parallel branches...');
    // 所有分支同时启动
    const promises = this.branches.map(branch => branch());
    await Promise.all(promises);
  }
}

// 使用示例
const parallel = new ParallelSplitPattern();
parallel.addBranch(async () => {
  console.log('发送邮件通知');
});
parallel.addBranch(async () => {
  console.log('更新数据库');
});
parallel.addBranch(async () => {
  console.log('记录日志');
});
await parallel.execute();
```

#### 适用场景

- 订单处理时同时更新库存、发送通知、记录日志
- 员工入职时并行处理多个部门的手续
- 审批流程中需要多个部门同时审核

#### 反例（错误实现）

```typescript
// 错误：顺序执行而非并行
async executeWrong(): Promise<void> {
  for (const branch of this.branches) {
    await branch(); // 顺序等待，不是并行
  }
}
```

#### 可判断性分析

**可判断** ✅

并行分支模式可以通过Petri网进行建模和验证。

**形式化论证：**

```
设并行分支为 Fork(P) = {b₁, b₂, ..., bₙ}
其中 P 是前驱节点，每个 bᵢ 是一个并行分支

正确性条件:
1. 同步性: ∀bᵢ, bⱼ ∈ Fork(P): start(bᵢ) = start(bⱼ)
2. 独立性: ∀bᵢ, bⱼ: i≠j → bᵢ 与 bⱼ 无数据依赖
3. 完整性: ∪ post(bᵢ) = 所有必要的后续操作

Petri网表示:
   P
   ↓
  [AND-Split]
   ↓ ↓ ↓
  b₁ b₂ bₙ

可验证属性:
- 无死锁: 所有分支都能被激活
- 有界性: 令牌数量有界
- 可达性: 所有终止状态可达
```

---

### 模式 3: 同步 (Synchronization)

#### 定义

同步模式（也称为AND-Join）等待所有并行分支都完成后，才继续执行后续活动。

#### BPMN 表示

```xml
<process id="synchronization">
  <!-- 前面的并行分支 -->
  <task id="taskA" name="分支A" />
  <task id="taskB" name="分支B" />
  <task id="taskC" name="分支C" />

  <parallelGateway id="join" gatewayDirection="Converging">
    <incoming>fromA</incoming>
    <incoming>fromB</incoming>
    <incoming>fromC</incoming>
  </parallelGateway>

  <sequenceFlow id="fromA" sourceRef="taskA" targetRef="join" />
  <sequenceFlow id="fromB" sourceRef="taskB" targetRef="join" />
  <sequenceFlow id="fromC" sourceRef="taskC" targetRef="join" />

  <sequenceFlow sourceRef="join" targetRef="nextTask" />
  <task id="nextTask" name="后续任务" />
</process>
```

#### TypeScript 实现

```typescript
class SynchronizationPattern {
  private branchResults: Map<string, any> = new Map();
  private pendingBranches: Set<string> = new Set();

  registerBranch(branchId: string): void {
    this.pendingBranches.add(branchId);
  }

  completeBranch(branchId: string, result: any): void {
    if (!this.pendingBranches.has(branchId)) {
      throw new Error(`Unknown branch: ${branchId}`);
    }
    this.branchResults.set(branchId, result);
    this.pendingBranches.delete(branchId);
  }

  async waitForAll(): Promise<Map<string, any>> {
    // 轮询等待所有分支完成
    while (this.pendingBranches.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return this.branchResults;
  }
}

// 使用示例
const sync = new SynchronizationPattern();
const branches = ['email', 'database', 'log'];

branches.forEach(id => sync.registerBranch(id));

// 各分支完成后调用
sync.completeBranch('email', { sent: true });
sync.completeBranch('database', { updated: true });
sync.completeBranch('log', { recorded: true });

const results = await sync.waitForAll();
console.log('All branches completed:', results);
```

#### 适用场景

- 等待所有部门审批完成后才进入下一步
- 并行数据处理完成后进行汇总
- 多线程任务完成后进行结果合并

#### 反例（错误实现）

```typescript
// 错误：只等待第一个分支
async waitForFirst(): Promise<any> {
  // Promise.race 只返回最快完成的
  return Promise.race(this.branchPromises);
}

// 错误：使用错误的计数
async waitForWrongCount(): Promise<void> {
  // 假设有3个分支，但只等待2个
  await Promise.all(this.branchPromises.slice(0, 2));
}
```

#### 可判断性分析

**可判断** ✅

同步模式可以通过Petri网的AND-Join结构进行形式化验证。

**形式化论证：**

```
设同步点为 Join(B) 其中 B = {b₁, b₂, ..., bₙ}

正确性条件:
1. 完整性: Join(B) 触发 ⟺ ∀bᵢ ∈ B: bᵢ 已完成
2. 原子性: Join(B) 触发后，所有输入令牌被消耗
3. 唯一性: Join(B) 在每次流程实例中只触发一次

Petri网语义:
  b₁ ──┐
  b₂ ──┼──[AND-Join]──→ P'
  bₙ ──┘

触发条件: m(b₁) ≥ 1 ∧ m(b₂) ≥ 1 ∧ ... ∧ m(bₙ) ≥ 1
触发效果: m' = m - {b₁, b₂, ..., bₙ} + {P'}

可验证问题:
- 死锁检测: 是否存在分支永远无法完成？
- 同步正确性: 是否所有分支都被正确同步？
- 性能分析: 同步点的平均等待时间
```

---

### 模式 4: 排他选择 (Exclusive Choice)

#### 定义

排他选择模式（XOR-Split）基于条件选择一条且仅一条执行路径。

#### BPMN 表示

```xml
<process id="exclusive_choice">
  <task id="evaluate" name="评估申请" />

  <exclusiveGateway id="decision" gatewayDirection="Diverging">
    <conditionExpression xsi:type="tFormalExpression">
      ${amount &lt; 1000}
    </conditionExpression>
  </exclusiveGateway>

  <sequenceFlow id="toLow" sourceRef="decision" targetRef="lowAmount">
    <conditionExpression>${amount &lt; 1000}</conditionExpression>
  </sequenceFlow>

  <sequenceFlow id="toHigh" sourceRef="decision" targetRef="highAmount">
    <conditionExpression>${amount &gt;= 1000}</conditionExpression>
  </sequenceFlow>

  <task id="lowAmount" name="小额处理" />
  <task id="highAmount" name="大额审批" />
</process>
```

#### TypeScript 实现

```typescript
interface Condition {
  predicate: (context: any) => boolean;
  action: () => Promise<void>;
  name: string;
}

class ExclusiveChoicePattern {
  private conditions: Condition[] = [];
  private defaultAction?: () => Promise<void>;

  addCondition(condition: Condition): void {
    this.conditions.push(condition);
  }

  setDefault(action: () => Promise<void>): void {
    this.defaultAction = action;
  }

  async execute(context: any): Promise<void> {
    for (const condition of this.conditions) {
      if (condition.predicate(context)) {
        console.log(`Condition met: ${condition.name}`);
        await condition.action();
        return; // 只执行一个分支
      }
    }

    if (this.defaultAction) {
      await this.defaultAction();
    } else {
      throw new Error('No condition matched and no default action');
    }
  }
}

// 使用示例
const choice = new ExclusiveChoicePattern();

choice.addCondition({
  name: '小额订单',
  predicate: (ctx) => ctx.amount < 1000,
  action: async () => console.log('自动审批')
});

choice.addCondition({
  name: '中额订单',
  predicate: (ctx) => ctx.amount >= 1000 && ctx.amount < 10000,
  action: async () => console.log('经理审批')
});

choice.addCondition({
  name: '大额订单',
  predicate: (ctx) => ctx.amount >= 10000,
  action: async () => console.log('总监审批')
});

await choice.execute({ amount: 5000 }); // 经理审批
```

#### 适用场景

- 根据订单金额选择不同的审批流程
- 根据用户类型提供不同的服务
- 根据条件选择不同的处理策略

#### 反例（错误实现）

```typescript
// 错误：可能执行多个分支
async executeWrong(context: any): Promise<void> {
  for (const condition of this.conditions) {
    if (condition.predicate(context)) {
      await condition.action();
      // 缺少 return，可能继续执行其他分支
    }
  }
}

// 错误：条件不互斥
choice.addCondition({
  predicate: (ctx) => ctx.amount < 5000,  // 与下一个条件重叠
  action: async () => {}
});
choice.addCondition({
  predicate: (ctx) => ctx.amount < 10000, // 条件重叠
  action: async () => {}
});
```

#### 可判断性分析

**可判断** ✅

排他选择模式可以通过条件分析和可达性分析进行验证。

**形式化论证：**

```
设排他选择为 XOR(C) 其中 C = {(c₁, a₁), (c₂, a₂), ..., (cₙ, aₙ)}
每个 cᵢ 是一个谓词，aᵢ 是对应的动作

正确性条件:
1. 完备性: ∀x ∈ Domain: ∃i: cᵢ(x) = true ∨ default exists
2. 互斥性: ∀i≠j: cᵢ ∧ cⱼ = false （可选，但推荐）
3. 确定性: 相同的输入总是选择相同的分支

形式化验证:
- 条件覆盖: 检查所有可能的输入是否都有对应分支
- 死代码检测: 识别永远不会被选中的分支
- 条件冲突: 检测非互斥的条件

可判定问题:
给定条件集合 C，判断:
1. 是否存在输入使多个条件同时为真？
2. 是否存在输入使所有条件都为假？
3. 每个分支是否可达？

复杂度: 取决于条件表达式的复杂度
- 线性条件: PTIME
- 一般条件: 可能不可判定
```

---

### 模式 5: 简单合并 (Simple Merge)

#### 定义

简单合并模式（XOR-Join）将多个可选路径合并，不等待所有路径，只要有一个路径到达就继续执行。

#### BPMN 表示

```xml
<process id="simple_merge">
  <!-- 排他选择产生的分支 -->
  <task id="pathA" name="路径A" />
  <task id="pathB" name="路径B" />
  <task id="pathC" name="路径C" />

  <exclusiveGateway id="merge" gatewayDirection="Converging" />

  <sequenceFlow sourceRef="pathA" targetRef="merge" />
  <sequenceFlow sourceRef="pathB" targetRef="merge" />
  <sequenceFlow sourceRef="pathC" targetRef="merge" />

  <sequenceFlow sourceRef="merge" targetRef="next" />
  <task id="next" name="后续任务" />
</process>
```

#### TypeScript 实现

```typescript
class SimpleMergePattern {
  private completedPaths: Set<string> = new Set();
  private resolveNext?: (value: string) => void;

  registerPath(pathId: string): void {
    this.completedPaths.delete(pathId);
  }

  completePath(pathId: string): void {
    if (this.resolveNext) {
      this.resolveNext(pathId);
      this.resolveNext = undefined;
    }
    this.completedPaths.add(pathId);
  }

  waitForAny(): Promise<string> {
    return new Promise((resolve) => {
      if (this.completedPaths.size > 0) {
        resolve(Array.from(this.completedPaths)[0]);
      } else {
        this.resolveNext = resolve;
      }
    });
  }
}

// 使用示例
const merge = new SimpleMergePattern();

// 模拟排他选择后的路径
const selectedPath = 'B'; // 假设选择了路径B
merge.registerPath(selectedPath);

// 完成选中的路径
merge.completePath(selectedPath);

const completedPath = await merge.waitForAny();
console.log(`Path ${completedPath} completed, continuing...`);
```

#### 适用场景

- 排他选择后的路径汇合
- 多个可选处理路径的汇聚
- 不需要等待所有路径的场景

#### 反例（错误实现）

```typescript
// 错误：使用AND-Join代替XOR-Join
class WrongMerge {
  // 等待所有路径完成，但排他选择只走一条路径
  async waitForAll(): Promise<void> {
    await Promise.all(pathPromises); // 会永远等待
  }
}
```

#### 可判断性分析

**可判断** ✅

简单合并模式可以通过分析前置节点的排他性进行验证。

**形式化论证：**

```
设简单合并为 XOR-Join(P) 其中 P = {p₁, p₂, ..., pₙ}

正确性条件:
1. 前置条件: 在每次流程实例中，只有一个 pᵢ 会被执行
2. 触发条件: 任意一个 pᵢ 完成即可触发 XOR-Join
3. 安全性: 不会有多条路径同时到达（由前置XOR-Split保证）

Petri网语义:
  p₁ ──┐
  p₂ ──┼──[XOR-Join]──→ P'
  pₙ ──┘

触发条件: ∃i: m(pᵢ) ≥ 1
触发效果: m' = m - {pᵢ} + {P'}

验证要点:
- 结构验证: 确保前置是XOR-Split
- 可达性: 所有路径都能到达合并点
- 安全性: 证明不会有多令牌同时到达
```

---

### 模式 6: 多选 (Multi-Choice)

#### 定义

多选模式（OR-Split）基于条件选择一个或多个执行路径，可以同时激活多个分支。

#### BPMN 表示

```xml
<process id="multi_choice">
  <task id="checkRequirements" name="检查需求" />

  <inclusiveGateway id="orSplit" gatewayDirection="Diverging">
    <conditionExpression xsi:type="tFormalExpression">
      ${needsEmail || needsSMS || needsPush}
    </conditionExpression>
  </inclusiveGateway>

  <sequenceFlow sourceRef="orSplit" targetRef="sendEmail">
    <conditionExpression>${needsEmail}</conditionExpression>
  </sequenceFlow>

  <sequenceFlow sourceRef="orSplit" targetRef="sendSMS">
    <conditionExpression>${needsSMS}</conditionExpression>
  </sequenceFlow>

  <sequenceFlow sourceRef="orSplit" targetRef="sendPush">
    <conditionExpression>${needsPush}</conditionExpression>
  </sequenceFlow>

  <task id="sendEmail" name="发送邮件" />
  <task id="sendSMS" name="发送短信" />
  <task id="sendPush" name="发送推送" />
</process>
```

#### TypeScript 实现

```typescript
class MultiChoicePattern {
  private branches: Map<string, {
    predicate: (context: any) => boolean;
    action: () => Promise<any>;
  }> = new Map();

  addBranch(
    id: string,
    predicate: (context: any) => boolean,
    action: () => Promise<any>
  ): void {
    this.branches.set(id, { predicate, action });
  }

  async execute(context: any): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const promises: Promise<void>[] = [];

    for (const [id, branch] of this.branches) {
      if (branch.predicate(context)) {
        console.log(`Activating branch: ${id}`);
        promises.push(
          branch.action().then(result => {
            results.set(id, result);
          })
        );
      }
    }

    if (promises.length === 0) {
      throw new Error('No branch selected');
    }

    await Promise.all(promises);
    return results;
  }
}

// 使用示例
const multiChoice = new MultiChoicePattern();

multiChoice.addBranch(
  'email',
  (ctx) => ctx.preferences.includes('email'),
  async () => { console.log('Sending email'); return 'email_sent'; }
);

multiChoice.addBranch(
  'sms',
  (ctx) => ctx.preferences.includes('sms'),
  async () => { console.log('Sending SMS'); return 'sms_sent'; }
);

multiChoice.addBranch(
  'push',
  (ctx) => ctx.preferences.includes('push'),
  async () => { console.log('Sending push'); return 'push_sent'; }
);

const results = await multiChoice.execute({
  preferences: ['email', 'push']
});
// 同时发送邮件和推送
```

#### 适用场景

- 根据用户偏好选择多种通知方式
- 根据订单类型触发多个后续处理
- 条件性地执行多个验证步骤

#### 反例（错误实现）

```typescript
// 错误：强制只选一个
async executeWrong(context: any): Promise<any> {
  for (const [id, branch] of this.branches) {
    if (branch.predicate(context)) {
      return await branch.action(); // 只返回第一个匹配的
    }
  }
}

// 错误：条件互斥
addBranch('A', (ctx) => ctx.type === 'X', ...);
addBranch('B', (ctx) => ctx.type !== 'X', ...); // 与A互斥，失去多选意义
```

#### 可判断性分析

**可判断** ✅

多选模式可以通过条件组合分析进行验证。

**形式化论证：**

```
设多选为 OR-Split(C) 其中 C = {(c₁, a₁), (c₂, a₂), ..., (cₙ, aₙ)}

正确性条件:
1. 非空性: ∀x ∈ Domain: |{i | cᵢ(x) = true}| ≥ 1
2. 独立性: 各分支执行互不影响
3. 组合性: 支持任意条件组合

验证问题:
- 最小激活集: 最少需要激活多少个分支？
- 最大激活集: 最多可以同时激活多少个分支？
- 覆盖分析: 哪些分支组合是可能的？

复杂度:
- 条件可满足性: NP-Complete
- 分支组合分析: 2ⁿ 种可能
```

---

### 模式 7: 同步合并 (Synchronizing Merge)

#### 定义

同步合并模式（OR-Join）等待所有被激活的分支完成后才继续执行，需要动态确定哪些分支被激活了。

#### BPMN 表示

```xml
<process id="sync_merge">
  <!-- 多选产生的分支 -->
  <task id="branchA" name="分支A" />
  <task id="branchB" name="分支B" />
  <task id="branchC" name="分支C" />

  <inclusiveGateway id="orJoin" gatewayDirection="Converging">
    <incoming>fromA</incoming>
    <incoming>fromB</incoming>
    <incoming>fromC</incoming>
  </inclusiveGateway>

  <sequenceFlow id="fromA" sourceRef="branchA" targetRef="orJoin" />
  <sequenceFlow id="fromB" sourceRef="branchB" targetRef="orJoin" />
  <sequenceFlow id="fromC" sourceRef="branchC" targetRef="orJoin" />
</process>
```

#### TypeScript 实现

```typescript
class SynchronizingMergePattern {
  private activeBranches: Set<string> = new Set();
  private completedBranches: Set<string> = new Set();
  private resolveMerge?: () => void;

  activateBranches(context: any, conditions: Map<string, (ctx: any) => boolean>): void {
    for (const [branchId, condition] of conditions) {
      if (condition(context)) {
        this.activeBranches.add(branchId);
      }
    }
    console.log(`Activated branches: ${Array.from(this.activeBranches)}`);
  }

  completeBranch(branchId: string): void {
    if (!this.activeBranches.has(branchId)) {
      console.warn(`Branch ${branchId} was not activated`);
      return;
    }

    this.completedBranches.add(branchId);
    console.log(`Branch ${branchId} completed (${this.completedBranches.size}/${this.activeBranches.size})`);

    // 检查是否所有激活的分支都完成了
    if (this.completedBranches.size === this.activeBranches.size) {
      if (this.resolveMerge) {
        this.resolveMerge();
      }
    }
  }

  waitForSync(): Promise<void> {
    return new Promise((resolve) => {
      if (this.completedBranches.size === this.activeBranches.size &&
          this.activeBranches.size > 0) {
        resolve();
      } else {
        this.resolveMerge = resolve;
      }
    });
  }
}

// 使用示例
const syncMerge = new SynchronizingMergePattern();

// 定义条件
const conditions = new Map([
  ['email', (ctx) => ctx.needsEmail],
  ['sms', (ctx) => ctx.needsSMS],
  ['push', (ctx) => ctx.needsPush]
]);

// 激活分支
syncMerge.activateBranches(
  { needsEmail: true, needsSMS: false, needsPush: true },
  conditions
);

// 完成各分支
syncMerge.completeBranch('email');
syncMerge.completeBranch('push');

await syncMerge.waitForSync();
console.log('All active branches synchronized!');
```

#### 适用场景

- 多选后的分支汇合
- 动态确定需要等待的分支数量
- 复杂的条件分支汇聚

#### 反例（错误实现）

```typescript
// 错误：静态等待固定数量
async waitForWrongCount(): Promise<void> {
  // 假设总是等待3个分支
  await Promise.all([branchA, branchB, branchC]);
  // 但如果只激活了2个分支，会永远等待
}

// 错误：使用AND-Join
// AND-Join会等待所有输入，包括未激活的分支
```

#### 可判断性分析

**不可判断** ❌

同步合并模式是经典的不可判断模式。需要运行时信息来确定哪些分支被激活。

**形式化论证：**

```
设同步合并为 OR-Join(B, active)
其中 B = {b₁, b₂, ..., bₙ} 是所有可能的分支
active ⊆ B 是实际激活的分支集合

触发条件: ∀bᵢ ∈ active: bᵢ 已完成

不可判断性证明:
1. 需要知道哪些分支被激活才能确定等待条件
2. 激活信息依赖于运行时数据和条件求值
3. 静态分析无法确定所有可能的激活组合

形式化结果:
- 在一般情况下，OR-Join的正确性是 undecidable
- 需要运行时跟踪或限制模式结构

近似解法:
- 结构化模式: 限制为嵌套的AND/XOR结构
- 悲观策略: 等待所有可能的分支
- 乐观策略: 基于历史数据预测
```

---

### 模式 8: 多合并 (Multi-Merge)

#### 定义

多合并模式允许多个路径的每次到达都触发后续活动，不等待也不同步。

#### BPMN 表示

```xml
<process id="multi_merge">
  <task id="sourceA" name="源A" />
  <task id="sourceB" name="源B" />

  <!-- 多个独立的sequenceFlow指向同一个任务 -->
  <sequenceFlow sourceRef="sourceA" targetRef="processItem" />
  <sequenceFlow sourceRef="sourceB" targetRef="processItem" />

  <task id="processItem" name="处理项目" />
</process>
```

#### TypeScript 实现

```typescript
class MultiMergePattern {
  private handlers: Map<string, (data: any) => Promise<void>> = new Map();

  registerSource(
    sourceId: string,
    handler: (data: any) => Promise<void>
  ): void {
    this.handlers.set(sourceId, handler);
  }

  async onArrival(sourceId: string, data: any): Promise<void> {
    const handler = this.handlers.get(sourceId);
    if (handler) {
      // 每次到达都独立处理，不等待其他来源
      await handler(data);
    }
  }
}

// 使用示例
const multiMerge = new MultiMergePattern();

// 注册处理逻辑
const processHandler = async (data: any) => {
  console.log(`Processing: ${JSON.stringify(data)}`);
  // 每个到达都触发一次处理
};

multiMerge.registerSource('web', processHandler);
multiMerge.registerSource('mobile', processHandler);
multiMerge.registerSource('api', processHandler);

// 每个来源独立触发
await multiMerge.onArrival('web', { item: 'A' });
await multiMerge.onArrival('mobile', { item: 'B' });
// 两个独立的处理实例被创建
```

#### 适用场景

- 多渠道订单处理
- 独立事件的独立处理
- 消息队列的消费者

#### 反例（错误实现）

```typescript
// 错误：尝试同步
async onArrivalWrong(sourceId: string, data: any): Promise<void> {
  this.pendingArrivals.add(sourceId);
  if (this.pendingArrivals.size === this.expectedSources) {
    // 多合并不需要等待所有来源
    await this.processAll();
  }
}
```

#### 可判断性分析

**可判断** ✅

多合并模式结构简单，可以静态分析。

**形式化论证：**

```
设多合并为 MM(S, T)
其中 S = {s₁, s₂, ..., sₙ} 是源节点
T 是目标节点

语义: ∀sᵢ ∈ S: arrival(sᵢ) → instantiate(T)

正确性条件:
1. 独立性: 各到达事件独立处理
2. 无丢失: 每个到达都触发一个实例
3. 无阻塞: 不会因为其他到达而等待

可验证属性:
- 可达性: 每个源都能到达目标
- 活性: 目标节点能够被实例化
- 有界性: 实例数量是否有界
```

---

### 模式 9: 鉴别器 (Discriminator)

#### 定义

鉴别器模式等待多个分支中的第一个完成，然后继续执行，同时取消或忽略其他分支的结果。

#### BPMN 表示

```xml
<process id="discriminator">
  <parallelGateway id="fork" gatewayDirection="Diverging" />

  <task id="providerA" name="供应商A报价" />
  <task id="providerB" name="供应商B报价" />
  <task id="providerC" name="供应商C报价" />

  <!-- 复杂网关实现鉴别器语义 -->
  <complexGateway id="discriminator" gatewayDirection="Converging">
    <activationCondition>
      ${completionCount == 1}
    </activationCondition>
  </complexGateway>
</process>
```

#### TypeScript 实现

```typescript
class DiscriminatorPattern {
  private branches: Map<string, Promise<any>> = new Map();
  private firstCompleted: boolean = false;
  private resolveFirst?: (result: { branchId: string; data: any }) => void;
  private abortControllers: Map<string, AbortController> = new Map();

  addBranch(branchId: string, task: (signal: AbortSignal) => Promise<any>): void {
    const abortController = new AbortController();
    this.abortControllers.set(branchId, abortController);

    const promise = task(abortController.signal).then(result => ({
      branchId,
      data: result
    }));

    this.branches.set(branchId, promise);
  }

  async execute(): Promise<{ branchId: string; data: any }> {
    // 使用 Promise.race 获取第一个完成的
    const result = await Promise.race(Array.from(this.branches.values()));

    // 取消其他分支
    for (const [id, controller] of this.abortControllers) {
      if (id !== result.branchId) {
        controller.abort('Discriminator: another branch completed first');
      }
    }

    return result;
  }
}

// 使用示例
const discriminator = new DiscriminatorPattern();

// 添加多个报价请求
discriminator.addBranch('A', async (signal) => {
  return await fetchQuote('providerA', signal);
});
discriminator.addBranch('B', async (signal) => {
  return await fetchQuote('providerB', signal);
});
discriminator.addBranch('C', async (signal) => {
  return await fetchQuote('providerC', signal);
});

const firstQuote = await discriminator.execute();
console.log(`First quote from ${firstQuote.branchId}: ${firstQuote.data}`);
```

#### 适用场景

- 获取最快的服务响应
- 多个供应商报价，取第一个
- 超时回退机制

#### 反例（错误实现）

```typescript
// 错误：等待所有完成
async executeWrong(): Promise<any> {
  const results = await Promise.all(this.branches.values());
  return results[0]; // 虽然返回第一个，但等待了所有
}

// 错误：不取消其他分支
async executeWrong2(): Promise<any> {
  return Promise.race(this.branches.values());
  // 其他分支继续在后台运行，浪费资源
}
```

#### 可判断性分析

**可判断** ✅

鉴别器模式可以通过竞争语义进行形式化分析。

**形式化论证：**

```
设鉴别器为 Disc(B) 其中 B = {b₁, b₂, ..., bₙ}

语义: Disc(B) = first(completion(b₁), completion(b₂), ..., completion(bₙ))

正确性条件:
1. 竞争性: 第一个完成的被选中
2. 排他性: 只有一个结果被采用
3. 取消性: 其他分支被取消或忽略

Petri网扩展:
需要引入取消区域或优先级机制

可验证属性:
- 活性: 至少有一个分支会完成
- 公平性: 每个分支都有机会被选中
- 正确性: 确实只选择一个结果
```

---


## 2. 高级分支同步模式

高级分支同步模式处理更复杂的控制流结构，包括循环、递归和触发机制。

---

### 模式 10: 任意循环 (Arbitrary Cycles)

#### 定义

任意循环模式允许在流程中创建任意的循环结构，可以从前面的任意点跳转到后面的任意点，形成循环。

#### BPMN 表示

```xml
<process id="arbitrary_cycles">
  <task id="processOrder" name="处理订单" />

  <exclusiveGateway id="checkQuality" />
  <sequenceFlow sourceRef="processOrder" targetRef="checkQuality" />

  <sequenceFlow id="pass" sourceRef="checkQuality" targetRef="ship">
    <conditionExpression>${quality == 'PASS'}</conditionExpression>
  </sequenceFlow>

  <sequenceFlow id="fail" sourceRef="checkQuality" targetRef="rework">
    <conditionExpression>${quality == 'FAIL'}</conditionExpression>
  </sequenceFlow>

  <task id="rework" name="返工" />
  <!-- 循环回处理步骤 -->
  <sequenceFlow sourceRef="rework" targetRef="processOrder" />

  <task id="ship" name="发货" />
</process>
```

#### TypeScript 实现

```typescript
class ArbitraryCyclesPattern {
  private nodes: Map<string, {
    execute: () => Promise<any>;
    next: (result: any) => string | null;
  }> = new Map();

  registerNode(
    id: string,
    execute: () => Promise<any>,
    next: (result: any) => string | null
  ): void {
    this.nodes.set(id, { execute, next });
  }

  async execute(startNode: string): Promise<void> {
    let currentNode = startNode;
    const visited = new Set<string>();

    while (currentNode) {
      // 检测无限循环
      if (visited.has(currentNode)) {
        console.warn(`Loop detected at node: ${currentNode}`);
      }
      visited.add(currentNode);

      const node = this.nodes.get(currentNode);
      if (!node) {
        throw new Error(`Unknown node: ${currentNode}`);
      }

      console.log(`Executing: ${currentNode}`);
      const result = await node.execute();
      currentNode = node.next(result);
    }
  }
}

// 使用示例
const cycles = new ArbitraryCyclesPattern();

let attemptCount = 0;

cycles.registerNode(
  'process',
  async () => {
    console.log('Processing order...');
    return { quality: attemptCount++ < 2 ? 'FAIL' : 'PASS' };
  },
  (result) => result.quality === 'PASS' ? 'ship' : 'rework'
);

cycles.registerNode(
  'rework',
  async () => {
    console.log('Reworking...');
    return {};
  },
  () => 'process' // 循环回处理节点
);

cycles.registerNode(
  'ship',
  async () => {
    console.log('Shipping order');
    return {};
  },
  () => null
);

await cycles.execute('process');
```

#### 适用场景

- 质量检查不通过时返工
- 用户输入验证失败时重新输入
- 重试机制

#### 反例（错误实现）

```typescript
// 错误：没有循环终止条件
async executeWrong(): Promise<void> {
  while (true) {
    await this.process(); // 可能无限循环
  }
}

// 错误：循环计数错误
async executeWrong2(): Promise<void> {
  for (let i = 0; i >= 0; i++) { // 永远为正
    await this.process();
  }
}
```

#### 可判断性分析

**不可判断** ❌

任意循环的终止性是不可判断的（停机问题）。

**形式化论证：**

```
设任意循环为 AC(N, E) 其中 N 是节点集，E 是边集

语义: 流程可以在图中任意遍历

不可判断性证明:
1. 任意循环可以模拟图灵机
2. 循环终止性等价于图灵机停机问题
3. 由停机问题的不可判定性，任意循环的终止性不可判定

限制条件下的可判定性:
- 有界循环: 如果循环次数有明确上界
- 结构化循环: 如果限制为特定的循环结构
- 单调条件: 如果每次迭代都向终止条件靠近

验证技术:
- 模型检测: 验证有限状态空间
- 抽象解释: 近似分析循环行为
- 秩函数: 证明循环终止
```

---

### 模式 11: 结构化循环 (Structured Loop)

#### 定义

结构化循环模式使用明确的循环结构（While/Do-Until），有清晰的入口和出口条件。

#### BPMN 表示

```xml
<process id="structured_loop">
  <task id="initialize" name="初始化" />

  <!-- While 循环结构 -->
  <exclusiveGateway id="loopCondition" />
  <sequenceFlow sourceRef="initialize" targetRef="loopCondition" />

  <!-- 循环体 -->
  <sequenceFlow id="enterLoop" sourceRef="loopCondition" targetRef="loopBody">
    <conditionExpression>${counter &lt; 10}</conditionExpression>
  </sequenceFlow>

  <task id="loopBody" name="循环体" />
  <sequenceFlow sourceRef="loopBody" targetRef="loopCondition" />

  <!-- 退出循环 -->
  <sequenceFlow id="exitLoop" sourceRef="loopCondition" targetRef="after">
    <conditionExpression>${counter &gt;= 10}</conditionExpression>
  </sequenceFlow>

  <task id="after" name="循环后" />
</process>
```

#### TypeScript 实现

```typescript
class StructuredLoopPattern {
  // While 循环: 先检查条件
  async whileLoop(
    condition: () => boolean,
    body: () => Promise<void>,
    maxIterations: number = 1000
  ): Promise<void> {
    let iterations = 0;

    while (condition()) {
      if (iterations++ >= maxIterations) {
        throw new Error('Maximum iterations exceeded');
      }
      await body();
    }
  }

  // Do-Until 循环: 先执行后检查
  async doUntilLoop(
    body: () => Promise<void>,
    condition: () => boolean,
    maxIterations: number = 1000
  ): Promise<void> {
    let iterations = 0;

    do {
      if (iterations++ >= maxIterations) {
        throw new Error('Maximum iterations exceeded');
      }
      await body();
    } while (!condition());
  }

  // For 循环
  async forLoop(
    init: () => void,
    condition: () => boolean,
    increment: () => void,
    body: () => Promise<void>,
    maxIterations: number = 1000
  ): Promise<void> {
    let iterations = 0;

    for (init(); condition(); increment()) {
      if (iterations++ >= maxIterations) {
        throw new Error('Maximum iterations exceeded');
      }
      await body();
    }
  }
}

// 使用示例
const loop = new StructuredLoopPattern();

// While 循环示例
let counter = 0;
await loop.whileLoop(
  () => counter < 5,
  async () => {
    console.log(`Iteration: ${counter}`);
    counter++;
  }
);

// Do-Until 循环示例
let value = 0;
await loop.doUntilLoop(
  async () => {
    value = Math.random();
    console.log(`Generated: ${value}`);
  },
  () => value > 0.8
);
```

#### 适用场景

- 批量数据处理
- 重试机制
- 迭代优化算法

#### 反例（错误实现）

```typescript
// 错误：条件永远不成立
async wrongLoop(): Promise<void> {
  let i = 0;
  await this.whileLoop(
    () => i < 0,  // 永远不成立
    async () => { i++; }
  );
  // 循环体永远不会执行
}

// 错误：条件永远成立
async wrongLoop2(): Promise<void> {
  await this.whileLoop(
    () => true,  // 永远成立
    async () => { /* ... */ }
  );
  // 无限循环
}
```

#### 可判断性分析

**部分可判断** ⚠️

结构化循环在有特定约束条件下是可判断的。

**形式化论证：**

```
设结构化循环为 Loop(C, B) 其中 C 是条件，B 是循环体

可判断条件:
1. 条件单调性: 每次迭代都向终止条件靠近
2. 有界性: 循环变量有明确的上界/下界
3. 可计算性: 条件和循环体都是可计算的

形式化验证:
- 秩函数: 找到函数 f 使得 f(状态) 严格递减且有下界
- 不变量: 找到循环不变量证明正确性
- 边界分析: 计算循环迭代次数的上界

示例:
for (i = 0; i < n; i++)
  秩函数: f(i) = n - i
  初始: f(0) = n
  每次递减: f(i+1) = f(i) - 1
  终止: f(n) = 0

复杂度:
- 线性约束: PTIME
- 多项式约束: 可能不可判定
```

---

### 模式 12: 递归 (Recursion)

#### 定义

递归模式允许流程调用自身，通过将问题分解为更小的子问题来解决。

#### BPMN 表示

```xml
<process id="main_process">
  <task id="start" name="开始" />

  <!-- 调用递归子流程 -->
  <callActivity id="recursiveCall" calledElement="recursive_subprocess">
    <inputAssociation>
      <sourceRef>inputData</sourceRef>
      <targetRef>subProcessInput</targetRef>
    </inputAssociation>
  </callActivity>

  <task id="end" name="结束" />
</process>

<!-- 递归子流程定义 -->
<process id="recursive_subprocess">
  <exclusiveGateway id="baseCaseCheck" />

  <sequenceFlow id="isBase" sourceRef="baseCaseCheck" targetRef="return">
    <conditionExpression>${n &lt;= 1}</conditionExpression>
  </sequenceFlow>

  <sequenceFlow id="isRecursive" sourceRef="baseCaseCheck" targetRef="recursiveStep">
    <conditionExpression>${n &gt; 1}</conditionExpression>
  </sequenceFlow>

  <!-- 递归调用 -->
  <callActivity id="recursiveStep" calledElement="recursive_subprocess">
    <inputAssociation>
      <assignment>
        <from>${n - 1}</from>
        <to>subProcessInput</to>
      </assignment>
    </inputAssociation>
  </callActivity>

  <endEvent id="return" />
</process>
```

#### TypeScript 实现

```typescript
class RecursionPattern {
  private callStack: Array<{ fn: string; args: any[] }> = [];
  private maxDepth: number;

  constructor(maxDepth: number = 100) {
    this.maxDepth = maxDepth;
  }

  // 计算阶乘
  async factorial(n: number): Promise<number> {
    // 基本情况
    if (n <= 1) {
      return 1;
    }

    // 递归调用
    this.checkStackDepth('factorial');
    const subResult = await this.factorial(n - 1);
    return n * subResult;
  }

  // 树形结构遍历
  async traverseTree<T>(
    node: TreeNode<T>,
    processNode: (node: TreeNode<T>) => Promise<void>
  ): Promise<void> {
    await processNode(node);

    if (node.children) {
      for (const child of node.children) {
        this.checkStackDepth('traverseTree');
        await this.traverseTree(child, processNode);
      }
    }
  }

  // 二分查找
  async binarySearch<T>(
    sortedArray: T[],
    target: T,
    compare: (a: T, b: T) => number,
    left: number = 0,
    right: number = sortedArray.length - 1
  ): Promise<number> {
    // 基本情况：未找到
    if (left > right) {
      return -1;
    }

    const mid = Math.floor((left + right) / 2);
    const comparison = compare(sortedArray[mid], target);

    if (comparison === 0) {
      return mid; // 找到
    } else if (comparison > 0) {
      this.checkStackDepth('binarySearch');
      return this.binarySearch(sortedArray, target, compare, left, mid - 1);
    } else {
      this.checkStackDepth('binarySearch');
      return this.binarySearch(sortedArray, target, compare, mid + 1, right);
    }
  }

  private checkStackDepth(fn: string): void {
    this.callStack.push({ fn, args: [] });
    if (this.callStack.length > this.maxDepth) {
      throw new Error(`Maximum recursion depth exceeded: ${this.maxDepth}`);
    }
  }
}

// 树节点定义
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

// 使用示例
const recursion = new RecursionPattern();

// 阶乘计算
const fact5 = await recursion.factorial(5);
console.log(`5! = ${fact5}`); // 120

// 树遍历
const tree: TreeNode<string> = {
  value: 'root',
  children: [
    { value: 'child1', children: [{ value: 'grandchild1' }] },
    { value: 'child2' }
  ]
};

await recursion.traverseTree(tree, async (node) => {
  console.log(`Visiting: ${node.value}`);
});
```

#### 适用场景

- 树形结构处理
- 分治算法
- 数学递归计算

#### 反例（错误实现）

```typescript
// 错误：缺少基本情况
async wrongRecursion(n: number): Promise<number> {
  // 没有终止条件
  return n + await this.wrongRecursion(n - 1);
}

// 错误：基本情况不可达
async wrongRecursion2(n: number): Promise<number> {
  if (n === 0) return 1; // 基本情况
  return await this.wrongRecursion2(n); // 参数不变，永远到不了0
}

// 错误：栈溢出
async wrongRecursion3(n: number): Promise<number> {
  if (n <= 1) return 1;
  // 深度太大，超过调用栈限制
  return await this.wrongRecursion3(n - 1) +
         await this.wrongRecursion3(n - 2);
}
```

#### 可判断性分析

**不可判断** ❌

递归的终止性等价于停机问题，是不可判断的。

**形式化论证：**

```
设递归函数为 R(x) = if B(x) then Base(x) else R(f(x))

不可判断性证明:
1. 递归可以模拟任意图灵机
2. 递归终止性等价于图灵机停机问题
3. 因此递归终止性不可判定

可判断的特殊情况:
1. 原始递归: 有明确的基本情况和递减参数
2. 结构递归: 递归在结构更小的数据上
3. 有界递归: 递归深度有明确上界

验证技术:
- 结构归纳: 证明结构上的递归终止
- 良基归纳: 使用良基关系证明终止
- 大小分析: 证明参数大小递减

示例（可判断）:
function factorial(n):
  if n <= 1: return 1
  else: return n * factorial(n-1)

良基关系: (n-1) < n
终止性: n 递减且有下界 1
```

---

### 模式 13: 临时触发 (Transient Trigger)

#### 定义

临时触发模式等待一个特定的事件触发，如果在指定时间内没有触发，则继续执行或超时。

#### BPMN 表示

```xml
<process id="transient_trigger">
  <task id="sendRequest" name="发送请求" />

  <!-- 事件网关等待触发 -->
  <eventBasedGateway id="waitForTrigger" />

  <!-- 消息事件 -->
  <intermediateCatchEvent id="messageEvent">
    <messageEventDefinition />
  </intermediateCatchEvent>

  <!-- 定时器事件（超时） -->
  <intermediateCatchEvent id="timeoutEvent">
    <timerEventDefinition>
      <timeDuration>PT5M</timeDuration>
    </timerEventDefinition>
  </intermediateCatchEvent>

  <sequenceFlow sourceRef="waitForTrigger" targetRef="messageEvent" />
  <sequenceFlow sourceRef="waitForTrigger" targetRef="timeoutEvent" />

  <task id="processResponse" name="处理响应" />
  <task id="handleTimeout" name="处理超时" />
</process>
```

#### TypeScript 实现

```typescript
interface TriggerConfig {
  timeout: number; // 毫秒
  onTrigger: (data: any) => Promise<void>;
  onTimeout: () => Promise<void>;
}

class TransientTriggerPattern {
  private triggerReceived: boolean = false;
  private triggerData: any = null;
  private resolvePromise?: (result: { triggered: boolean; data?: any }) => void;

  async waitForTrigger(config: TriggerConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        if (!this.triggerReceived) {
          console.log('Trigger timeout');
          await config.onTimeout();
          resolve();
        }
      }, config.timeout);

      this.resolvePromise = (result) => {
        clearTimeout(timeoutId);
        if (result.triggered) {
          config.onTrigger(result.data).then(() => resolve());
        }
      };
    });
  }

  trigger(data: any): void {
    if (this.resolvePromise && !this.triggerReceived) {
      this.triggerReceived = true;
      this.triggerData = data;
      this.resolvePromise({ triggered: true, data });
    }
  }
}

// 使用示例
const trigger = new TransientTriggerPattern();

// 启动等待
const waitPromise = trigger.waitForTrigger({
  timeout: 5000, // 5秒超时
  onTrigger: async (data) => {
    console.log('Trigger received:', data);
  },
  onTimeout: async () => {
    console.log('Timeout - proceeding without trigger');
  }
});

// 模拟3秒后触发
setTimeout(() => {
  trigger.trigger({ message: 'Approval received' });
}, 3000);

await waitPromise;
```

#### 适用场景

- 等待用户确认
- 等待外部系统响应
- 限时审批流程

#### 反例（错误实现）

```typescript
// 错误：永久等待
async waitForever(): Promise<void> {
  await new Promise(() => {}); // 永远不会resolve
}

// 错误：竞态条件
async wrongTrigger(): Promise<void> {
  setTimeout(() => this.handleTrigger(), 5000);
  await this.waitForTrigger(); // 可能错过触发
}
```

#### 可判断性分析

**可判断** ✅

临时触发模式有明确的超时机制，可以分析。

**形式化论证：**

```
设临时触发为 TT(E, T) 其中 E 是触发事件，T 是超时时间

语义: TT(E, T) = E ∨ timeout(T)

正确性条件:
1. 互斥性: E 和 timeout(T) 只有一个会发生
2. 完备性: 必然发生 E 或 timeout(T) 之一
3. 及时性: timeout(T) 在 T 时间后必然发生

时间自动机建模:
- 状态: Waiting, Triggered, TimedOut
- 转换:
  * Waiting -(E)-> Triggered
  * Waiting -(T)-> TimedOut

可验证属性:
- 可达性: Triggered 和 TimedOut 都是可达的
- 实时性: TimedOut 在 T 时间内必然发生
- 无死锁: 不会永远停留在 Waiting
```

---

### 模式 14: 永久触发 (Persistent Trigger)

#### 定义

永久触发模式等待一个触发事件，事件可以发生在等待之前或之后，一旦触发就继续执行。

#### BPMN 表示

```xml
<process id="persistent_trigger">
  <!-- 信号捕获事件 -->
  <intermediateCatchEvent id="signalEvent">
    <signalEventDefinition signalRef="approvalSignal" />
  </intermediateCatchEvent>

  <task id="processApproval" name="处理批准" />

  <!-- 信号抛出事件（可能在其他地方触发） -->
  <intermediateThrowEvent id="triggerSignal">
    <signalEventDefinition signalRef="approvalSignal" />
  </intermediateThrowEvent>
</process>
```

#### TypeScript 实现

```typescript
class PersistentTriggerPattern {
  private triggered: boolean = false;
  private triggerQueue: any[] = [];
  private waiters: Array<(data: any) => void> = [];

  // 触发信号（可以在等待之前或之后调用）
  trigger(data: any): void {
    if (this.waiters.length > 0) {
      // 有等待者，立即通知
      const waiter = this.waiters.shift()!;
      waiter(data);
    } else {
      // 没有等待者，保存触发
      this.triggerQueue.push(data);
    }
  }

  // 等待触发
  async waitForTrigger(): Promise<any> {
    return new Promise((resolve) => {
      if (this.triggerQueue.length > 0) {
        // 之前有触发，立即返回
        resolve(this.triggerQueue.shift());
      } else {
        // 等待未来的触发
        this.waiters.push(resolve);
      }
    });
  }

  // 检查是否有待处理的触发
  hasPendingTrigger(): boolean {
    return this.triggerQueue.length > 0;
  }
}

// 使用示例
const persistent = new PersistentTriggerPattern();

// 先触发
persistent.trigger({ approvalId: 'A001' });

// 后等待（也能收到）
const result = await persistent.waitForTrigger();
console.log('Received:', result); // { approvalId: 'A001' }

// 另一个等待
const waitPromise = persistent.waitForTrigger();

// 稍后触发
setTimeout(() => {
  persistent.trigger({ approvalId: 'A002' });
}, 1000);

const result2 = await waitPromise;
console.log('Received:', result2); // { approvalId: 'A002' }
```

#### 适用场景

- 审批流程中的批准信号
- 订单取消通知
- 状态变更事件

#### 反例（错误实现）

```typescript
// 错误：丢失提前触发
class WrongPersistentTrigger {
  private triggered: boolean = false;

  trigger(): void {
    this.triggered = true; // 只记录状态，不保存数据
  }

  async waitForTrigger(): Promise<any> {
    while (!this.triggered) {
      await sleep(100);
    }
    return undefined; // 丢失了触发时的数据
  }
}
```

#### 可判断性分析

**可判断** ✅

永久触发模式可以通过队列语义进行形式化分析。

**形式化论证：**

```
设永久触发为 PT(Q) 其中 Q 是触发队列

语义: PT(Q) = if Q ≠ ∅ then dequeue(Q) else wait

正确性条件:
1. 持久性: 触发不会被丢失
2. FIFO: 触发按顺序处理
3. 无饥饿: 每个触发最终都会被处理

形式化验证:
- 队列不变量: Q 的长度有界或无限
- 活性: 等待者最终会得到触发
- 安全性: 触发不会被重复处理

Petri网扩展:
需要引入队列或缓冲区的概念

可验证属性:
- 队列有界性: 队列长度是否有上界
- 吞吐量: 处理触发的速率
- 延迟: 从触发到处理的平均时间
```

---


## 3. 多实例模式

多实例模式处理一个活动需要创建多个实例的场景，每个实例独立执行。

---

### 模式 15: 多实例无同步 (Multiple Instances Without Synchronization)

#### 定义

多实例无同步模式创建多个活动实例，各实例独立运行，不需要等待其他实例完成。

#### BPMN 表示

```xml
<process id="multi_instance_no_sync">
  <task id="distribute" name="分发任务" />

  <!-- 多实例任务，无同步 -->
  <task id="reviewDocument" name="审阅文档">
    <multiInstanceLoopCharacteristics
      isSequential="false"
      camunda:collection="${reviewers}"
      camunda:elementVariable="reviewer">
      <completionCondition>
        ${false} <!-- 永不等待同步 -->
      </completionCondition>
    </multiInstanceLoopCharacteristics>
  </task>
</process>
```

#### TypeScript 实现

```typescript
class MultiInstanceNoSyncPattern {
  async execute<T, R>(
    items: T[],
    task: (item: T) => Promise<R>,
    options: {
      maxConcurrency?: number;
      onInstanceComplete?: (item: T, result: R) => void;
      onInstanceError?: (item: T, error: Error) => void;
    } = {}
  ): Promise<void> {
    const { maxConcurrency = Infinity } = options;

    // 创建所有实例，不等待
    const promises = items.map(async (item) => {
      try {
        const result = await task(item);
        options.onInstanceComplete?.(item, result);
      } catch (error) {
        options.onInstanceError?.(item, error as Error);
      }
    });

    // 如果指定了并发限制，使用分批处理
    if (maxConcurrency < Infinity) {
      await this.runWithConcurrencyLimit(promises, maxConcurrency);
    }
    // 否则，所有实例独立运行，不等待
  }

  private async runWithConcurrencyLimit(
    promises: Promise<void>[],
    limit: number
  ): Promise<void> {
    const executing: Promise<void>[] = [];

    for (const promise of promises) {
      const p = promise.then(() => {
        executing.splice(executing.indexOf(p), 1);
      });
      executing.push(p);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
  }
}

// 使用示例
const noSync = new MultiInstanceNoSyncPattern();

const reviewers = ['Alice', 'Bob', 'Charlie', 'David'];

await noSync.execute(
  reviewers,
  async (reviewer) => {
    console.log(`${reviewer} 开始审阅`);
    await delay(Math.random() * 3000); // 模拟审阅时间
    console.log(`${reviewer} 完成审阅`);
    return { reviewer, approved: true };
  },
  {
    maxConcurrency: 2,
    onInstanceComplete: (item, result) => {
      console.log(`Instance completed: ${item}`, result);
    },
    onInstanceError: (item, error) => {
      console.error(`Instance error: ${item}`, error);
    }
  }
);

console.log('All instances launched (not necessarily completed)');
```

#### 适用场景

- 批量发送通知
- 独立的数据处理任务
- 不需要结果聚合的并行操作

#### 反例（错误实现）

```typescript
// 错误：尝试同步
async executeWrong(items: T[], task: (item: T) => Promise<R>): Promise<void> {
  const results = await Promise.all(items.map(task)); // 等待所有完成
  // 这不是"无同步"模式
}

// 错误：顺序执行
async executeWrong2(items: T[], task: (item: T) => Promise<R>): Promise<void> {
  for (const item of items) {
    await task(item); // 顺序执行，不是并行
  }
}
```

#### 可判断性分析

**可判断** ✅

多实例无同步模式可以通过独立实例分析进行验证。

**形式化论证：**

```
设多实例无同步为 MI-NS(I, T)
其中 I = {i₁, i₂, ..., iₙ} 是实例集合
T 是任务定义

语义: ∀i ∈ I: spawn(i.T) ∧ no_wait(i)

正确性条件:
1. 独立性: 各实例独立执行
2. 无同步: 实例之间没有等待关系
3. 资源安全: 并发实例不会导致资源冲突

可验证属性:
- 实例数量: |I| 是否可确定
- 资源使用: 并发实例的资源消耗
- 完成保证: 实例是否最终都会完成

复杂度:
- 实例分析: O(n) 其中 n = |I|
- 资源检查: 取决于资源模型
```

---

### 模式 16: 多实例与先决条件同步 (Multiple Instances With a Priori Design-Time Knowledge)

#### 定义

多实例与先决条件同步模式在设计时就知道实例数量，所有实例完成后才继续执行。

#### BPMN 表示

```xml
<process id="multi_instance_design_time">
  <task id="prepare" name="准备评审" />

  <!-- 设计时已知3个实例 -->
  <task id="peerReview" name="同行评审">
    <multiInstanceLoopCharacteristics
      isSequential="false"
      loopCardinality="3">
      <loopDataInputRef>reviewers</loopDataInputRef>
    </multiInstanceLoopCharacteristics>
  </task>

  <!-- 等待所有3个实例完成后才继续 -->
  <task id="compileResults" name="汇总结果" />
</process>
```

#### TypeScript 实现

```typescript
class MultiInstanceDesignTimePattern {
  async execute<T, R>(
    items: T[],
    task: (item: T, index: number) => Promise<R>
  ): Promise<R[]> {
    console.log(`Creating ${items.length} instances (known at design time)`);

    // 并行创建所有实例
    const promises = items.map((item, index) => task(item, index));

    // 等待所有实例完成
    const results = await Promise.all(promises);

    console.log(`All ${items.length} instances completed`);
    return results;
  }
}

// 使用示例
const designTime = new MultiInstanceDesignTimePattern();

const reviewers = [
  { name: 'Alice', expertise: 'security' },
  { name: 'Bob', expertise: 'performance' },
  { name: 'Charlie', expertise: 'usability' }
];

const results = await designTime.execute(
  reviewers,
  async (reviewer, index) => {
    console.log(`Reviewer ${index + 1}: ${reviewer.name} (${reviewer.expertise})`);
    await delay(1000 + Math.random() * 2000);
    return {
      reviewer: reviewer.name,
      score: Math.floor(Math.random() * 10) + 1,
      comments: `Reviewed from ${reviewer.expertise} perspective`
    };
  }
);

console.log('All reviews completed:', results);
const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
console.log(`Average score: ${averageScore}`);
```

#### 适用场景

- 固定数量的审批人
- 已知数量的并行测试
- 预定参与者的投票

#### 反例（错误实现）

```typescript
// 错误：实例数量不确定
async executeWrong(items: T[]): Promise<void> {
  const count = await fetchDynamicCount(); // 运行时确定
  // 不是设计时已知
}

// 错误：不等待所有完成
async executeWrong2(items: T[]): Promise<void> {
  items.map(task); // 不等待
  // 实例可能还在运行就继续了
}
```

#### 可判断性分析

**可判断** ✅

实例数量在设计时已知，可以静态分析。

**形式化论证：**

```
设多实例先决条件同步为 MI-DT(n, T)
其中 n 是设计时已知的实例数量
T 是任务定义

语义: spawn(n instances of T) ∧ join(all n)

正确性条件:
1. 数量确定: n 是编译时常量
2. 完整性: 必须等待所有 n 个实例
3. 结果聚合: 收集所有实例的结果

形式化验证:
- 实例计数: 验证恰好创建 n 个实例
- 同步正确性: 验证等待所有 n 个
- 类型安全: 验证结果类型一致性

Petri网表示:
  P --[n tokens]--> [Task] --[n tokens]--> P'

可验证属性:
- 有界性: 令牌数量 = n
- 活性: 所有实例都会完成
- 正确同步: 恰好消耗 n 个令牌
```

---

### 模式 17: 多实例与后决条件同步 (Multiple Instances With a Priori Run-Time Knowledge)

#### 定义

多实例与后决条件同步模式在运行时才知道实例数量，所有实例完成后才继续执行。

#### BPMN 表示

```xml
<process id="multi_instance_runtime">
  <task id="getReviewers" name="获取评审人列表" />

  <!-- 运行时确定实例数量 -->
  <task id="dynamicReview" name="动态评审">
    <multiInstanceLoopCharacteristics
      isSequential="false"
      camunda:collection="${reviewerList}"
      camunda:elementVariable="reviewer">
    </multiInstanceLoopCharacteristics>
  </task>

  <task id="aggregate" name="聚合结果" />
</process>
```

#### TypeScript 实现

```typescript
class MultiInstanceRuntimePattern {
  async execute<T, R>(
    getItems: () => Promise<T[]>,
    task: (item: T) => Promise<R>
  ): Promise<{ items: T[]; results: R[] }> {
    // 运行时获取实例列表
    const items = await getItems();
    console.log(`Dynamically creating ${items.length} instances at runtime`);

    // 并行执行所有实例
    const promises = items.map(item => task(item));
    const results = await Promise.all(promises);

    console.log(`All ${items.length} runtime instances completed`);
    return { items, results };
  }
}

// 使用示例
const runtime = new MultiInstanceRuntimePattern();

// 模拟运行时获取评审人
const getReviewers = async () => {
  // 从数据库或API获取
  const count = Math.floor(Math.random() * 5) + 2;
  return Array.from({ length: count }, (_, i) => ({
    id: `reviewer_${i + 1}`,
    name: `Reviewer ${i + 1}`
  }));
};

const { items, results } = await runtime.execute(
  getReviewers,
  async (reviewer) => {
    console.log(`Processing: ${reviewer.name}`);
    await delay(500 + Math.random() * 1500);
    return { reviewerId: reviewer.id, approved: Math.random() > 0.3 };
  }
);

console.log(`Processed ${items.length} reviewers`);
const approvedCount = results.filter(r => r.approved).length;
console.log(`${approvedCount}/${items.length} approved`);
```

#### 适用场景

- 动态分配的审批人
- 根据数据量确定的并行处理
- 用户选择的参与者

#### 反例（错误实现）

```typescript
// 错误：实例数量在运行中变化
async executeWrong(getItems: () => Promise<T[]>): Promise<void> {
  const items = await getItems();
  for (const item of items) {
    const updatedItems = await getItems(); // 重新获取，可能变化
    // 实例集合在运行中变化
  }
}
```

#### 可判断性分析

**部分可判断** ⚠️

虽然实例数量运行时确定，但同步结构可以静态分析。

**形式化论证：**

```
设多实例后决条件同步为 MI-RT(f, T)
其中 f 是运行时获取实例列表的函数
T 是任务定义

语义: items = f() ∧ spawn(|items| instances) ∧ join(all)

正确性条件:
1. 列表获取: f() 在实例创建前执行
2. 列表稳定: 实例创建后列表不再变化
3. 完整同步: 等待所有创建的实例

可验证的方面:
- 同步结构: 验证是完整的AND-Join
- 类型安全: 验证 f() 返回类型正确
- 资源边界: 分析最大可能的实例数

不可验证的方面:
- 实例数量: 取决于运行时数据
- 终止性: 取决于 f() 的终止性
```

---

### 模式 18: 多实例与指定条件同步 (Multiple Instances Without a Priori Run-Time Knowledge)

#### 定义

多实例与指定条件同步模式在运行时动态创建实例，当满足特定条件时继续执行，不需要等待所有实例。

#### BPMN 表示

```xml
<process id="multi_instance_condition">
  <task id="startProcessing" name="开始处理" />

  <!-- 动态实例，条件同步 -->
  <task id="conditionalProcess" name="条件处理">
    <multiInstanceLoopCharacteristics
      isSequential="false"
      camunda:collection="${items}"
      camunda:elementVariable="item">
      <completionCondition>
        ${nrOfCompletedInstances >= minimumRequired}
      </completionCondition>
    </multiInstanceLoopCharacteristics>
  </task>
</process>
```

#### TypeScript 实现

```typescript
class MultiInstanceConditionPattern {
  async execute<T, R>(
    items: T[],
    task: (item: T) => Promise<R>,
    completionCondition: (completed: R[], pending: number) => boolean,
    options: {
      maxConcurrent?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<R[]> {
    const results: R[] = [];
    const pendingItems = [...items];
    const runningPromises = new Map<string, Promise<void>>();
    let completedCount = 0;

    return new Promise((resolve, reject) => {
      const checkCompletion = () => {
        if (completionCondition(results, pendingItems.length + runningPromises.size)) {
          // 条件满足，取消剩余任务
          resolve(results);
        }
      };

      const startNext = () => {
        while (
          runningPromises.size < (options.maxConcurrent || Infinity) &&
          pendingItems.length > 0
        ) {
          const item = pendingItems.shift()!;
          const itemId = Math.random().toString(36);

          const promise = task(item)
            .then(result => {
              results.push(result);
              completedCount++;
              options.onProgress?.(completedCount, items.length);
              runningPromises.delete(itemId);
              checkCompletion();
              startNext();
            })
            .catch(reject);

          runningPromises.set(itemId, promise);
        }
      };

      startNext();
    });
  }
}

// 使用示例
const conditional = new MultiInstanceConditionPattern();

const items = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  priority: Math.random() > 0.7 ? 'high' : 'normal'
}));

const results = await conditional.execute(
  items,
  async (item) => {
    console.log(`Processing item ${item.id} (${item.priority})`);
    await delay(200 + Math.random() * 800);
    return { itemId: item.id, success: true };
  },
  // 完成条件：至少80%完成或所有高优先级完成
  (completed, pending) => {
    const highPriorityCompleted = completed.filter(
      (r: any) => items.find(i => i.id === r.itemId)?.priority === 'high'
    ).length;
    const totalHighPriority = items.filter(i => i.priority === 'high').length;

    return (
      completed.length >= items.length * 0.8 || // 80%完成
      highPriorityCompleted === totalHighPriority // 所有高优先级完成
    );
  },
  {
    maxConcurrent: 5,
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    }
  }
);

console.log(`Completed with ${results.length} results`);
```

#### 适用场景

- 达到法定人数就继续
- 满足特定条件后停止等待
- 部分结果即可继续的场景

#### 反例（错误实现）

```typescript
// 错误：条件永远不成立
async executeWrong(): Promise<void> {
  await this.execute(
    items,
    task,
    (completed, pending) => completed.length > items.length // 永远不满足
  );
}

// 错误：条件立即成立
async executeWrong2(): Promise<void> {
  await this.execute(
    items,
    task,
    () => true // 立即满足，不等待任何实例
  );
}
```

#### 可判断性分析

**不可判断** ❌

完成条件在运行时动态评估，静态分析困难。

**形式化论证：**

```
设多实例条件同步为 MI-C(I, T, C)
其中 I 是实例集合，T 是任务，C 是完成条件

语义: spawn(instances) ∧ wait_until(C(completed))

不可判断性:
1. 条件 C 可以是任意谓词
2. 判断 C 是否最终成立等价于停机问题
3. 因此模式的终止性不可判定

可验证的特殊情况:
- 固定阈值: C = completed >= k
- 时间限制: C = elapsed_time >= T
- 比例条件: C = completed/total >= p%

验证技术:
- 模型检测: 验证有限状态空间
- 抽象解释: 近似分析条件可满足性
- 测试: 通过测试覆盖各种场景
```

---


## 4. 状态模式

状态模式处理流程的终止和取消语义。

---

### 模式 19: 隐式终止 (Implicit Termination)

#### 定义

隐式终止模式指当流程中没有活动可以执行时，流程自动终止，不需要显式的结束事件。

#### BPMN 表示

```xml
<process id="implicit_termination">
  <startEvent id="start" />
  <sequenceFlow sourceRef="start" targetRef="taskA" />

  <task id="taskA" name="任务A" />
  <sequenceFlow sourceRef="taskA" targetRef="taskB" />

  <task id="taskB" name="任务B" />
  <!-- 没有显式的结束事件 -->
  <!-- 当taskB完成后，流程隐式终止 -->
</process>
```

#### TypeScript 实现

```typescript
class ImplicitTerminationPattern {
  private tasks: Map<string, {
    execute: () => Promise<any>;
    next: string[];
  }> = new Map();
  private activeTasks: Set<string> = new Set();

  registerTask(
    id: string,
    execute: () => Promise<any>,
    next: string[]
  ): void {
    this.tasks.set(id, { execute, next });
  }

  async execute(startTask: string): Promise<void> {
    const queue: string[] = [startTask];

    while (queue.length > 0) {
      const taskId = queue.shift()!;
      const task = this.tasks.get(taskId);

      if (!task) {
        console.log(`Task ${taskId} not found, implicit termination`);
        continue;
      }

      this.activeTasks.add(taskId);
      console.log(`Executing: ${taskId}`);

      await task.execute();
      this.activeTasks.delete(taskId);

      // 如果没有后续任务，隐式终止这条路径
      if (task.next.length === 0) {
        console.log(`Path ends at ${taskId}, implicit termination`);
      } else {
        queue.push(...task.next);
      }
    }

    // 当没有活动任务时，流程隐式终止
    if (this.activeTasks.size === 0) {
      console.log('No active tasks, process implicitly terminated');
    }
  }
}

// 使用示例
const implicit = new ImplicitTerminationPattern();

implicit.registerTask('start', async () => {}, ['process']);
implicit.registerTask('process', async () => {
  console.log('Processing...');
}, ['notify', 'log']);

// 两个并行路径，都没有后续
implicit.registerTask('notify', async () => {
  console.log('Notification sent');
}, []); // 隐式终止

implicit.registerTask('log', async () => {
  console.log('Log written');
}, []); // 隐式终止

await implicit.execute('start');
```

#### 适用场景

- 简单的线性流程
- 自然结束的业务流程
- 不需要显式结束标记的场景

#### 反例（错误实现）

```typescript
// 错误：死锁导致无法终止
async executeWrong(): Promise<void> {
  await Promise.all([
    this.waitForA(),
    this.waitForB() // B 等待 A，A 等待 B
  ]);
  // 永远不会到达这里
}

// 错误：无限循环
async executeWrong2(): Promise<void> {
  while (true) {
    await this.doSomething(); // 没有终止条件
  }
}
```

#### 可判断性分析

**部分可判断** ⚠️

在特定约束下可以判断流程是否会隐式终止。

**形式化论证：**

```
设隐式终止为 IT(P) 其中 P 是流程定义

终止条件: 没有可执行的活动 ∧ 没有正在执行的活动

可判断情况:
1. 无循环: 如果流程无循环，必然终止
2. 有界循环: 如果循环次数有界，必然终止
3. 结构化流程: 如果流程是结构化块

不可判断情况:
1. 任意循环: 可能无限循环
2. 递归: 可能无限递归
3. 等待外部事件: 可能永远等待

验证技术:
- 控制流分析: 检查是否有死循环
- 数据流分析: 检查终止条件是否可达
- 模型检测: 验证有限状态空间
```

---

### 模式 20: 显式终止 (Explicit Termination)

#### 定义

显式终止模式要求流程必须到达明确的结束事件才能终止，提供清晰的终止语义。

#### BPMN 表示

```xml
<process id="explicit_termination">
  <startEvent id="start" />
  <sequenceFlow sourceRef="start" targetRef="decision" />

  <exclusiveGateway id="decision" />

  <sequenceFlow id="success" sourceRef="decision" targetRef="successEnd">
    <conditionExpression>${approved}</conditionExpression>
  </sequenceFlow>

  <sequenceFlow id="reject" sourceRef="decision" targetRef="rejectEnd">
    <conditionExpression>${!approved}</conditionExpression>
  </sequenceFlow>

  <!-- 显式结束事件 -->
  <endEvent id="successEnd" name="批准结束">
    <terminateEventDefinition />
  </endEvent>

  <endEvent id="rejectEnd" name="拒绝结束">
    <terminateEventDefinition />
  </endEvent>
</process>
```

#### TypeScript 实现

```typescript
class ExplicitTerminationPattern {
  private states: Map<string, {
    execute: () => Promise<any>;
    transitions: Map<string, string>; // 事件 -> 下一状态
  }> = new Map();
  private endStates: Set<string> = new Set();

  registerState(
    id: string,
    execute: () => Promise<any>,
    transitions: Map<string, string>
  ): void {
    this.states.set(id, { execute, transitions });
  }

  registerEndState(id: string): void {
    this.endStates.add(id);
  }

  async execute(startState: string): Promise<{ endState: string; result: any }> {
    let currentState = startState;
    let lastResult: any;

    while (!this.endStates.has(currentState)) {
      const state = this.states.get(currentState);
      if (!state) {
        throw new Error(`Invalid state: ${currentState}`);
      }

      console.log(`Entering state: ${currentState}`);
      lastResult = await state.execute();

      // 确定下一状态
      const event = this.determineEvent(lastResult);
      const nextState = state.transitions.get(event);

      if (!nextState) {
        throw new Error(`No transition for event: ${event} from state: ${currentState}`);
      }

      currentState = nextState;
    }

    console.log(`Reached explicit end state: ${currentState}`);
    return { endState: currentState, result: lastResult };
  }

  private determineEvent(result: any): string {
    // 根据执行结果确定事件
    return result.success ? 'success' : 'failure';
  }
}

// 使用示例
const explicit = new ExplicitTerminationPattern();

explicit.registerState('start', async () => {
  return { success: true };
}, new Map([['success', 'process']]));

explicit.registerState('process', async () => {
  const approved = Math.random() > 0.5;
  return { success: true, approved };
}, new Map([
  ['success', 'approved'],
  ['failure', 'rejected']
]));

explicit.registerState('approved', async () => {
  console.log('Order approved');
  return { success: true };
}, new Map([['success', 'end_approved']]));

explicit.registerState('rejected', async () => {
  console.log('Order rejected');
  return { success: true };
}, new Map([['success', 'end_rejected']]));

// 注册显式结束状态
explicit.registerEndState('end_approved');
explicit.registerEndState('end_rejected');

const result = await explicit.execute('start');
console.log(`Process ended at: ${result.endState}`);
```

#### 适用场景

- 需要明确结束状态的业务流程
- 多种结束路径的流程
- 需要审计和追踪的场景

#### 反例（错误实现）

```typescript
// 错误：缺少结束状态
async executeWrong(): Promise<void> {
  const result = await this.process();
  if (result.success) {
    return; // 没有显式结束
  }
  // 也没有else分支的处理
}

// 错误：无法到达的结束状态
registerState('A', async () => {}, new Map([['event', 'B']]));
registerState('B', async () => {}, new Map([['event', 'A']])); // A和B循环
registerEndState('C'); // C 永远无法到达
```

#### 可判断性分析

**可判断** ✅

显式终止模式可以通过可达性分析进行验证。

**形式化论证：**

```
设显式终止为 ET(S, E, T)
其中 S 是状态集，E 是结束状态集，T 是转换关系

正确性条件:
1. 可达性: ∀s ∈ S: 存在路径到达某个 e ∈ E
2. 完整性: 每个执行都到达某个 e ∈ E
3. 确定性: 到达的结束状态是确定的

形式化验证:
- 死状态检测: 检查是否有状态无法到达结束状态
- 可达性分析: 验证所有结束状态都是可达的
- 完备性: 验证所有路径都导向结束状态

Petri网表示:
- 结束状态用终止转换表示
- 验证所有令牌最终都到达终止转换

复杂度:
- 可达性: PSPACE-Complete (一般Petri网)
- 有界网: PTIME
```

---

### 模式 21: 取消任务 (Cancel Task)

#### 定义

取消任务模式允许在流程执行过程中取消一个正在执行的任务。

#### BPMN 表示

```xml
<process id="cancel_task">
  <subProcess id="mainTask" name="主要任务">
    <task id="longRunning" name="长时间运行任务" />

    <!-- 边界取消事件 -->
    <boundaryEvent id="cancelEvent" attachedToRef="mainTask" cancelActivity="true">
      <cancelEventDefinition />
    </boundaryEvent>

    <sequenceFlow sourceRef="cancelEvent" targetRef="cleanup" />
    <task id="cleanup" name="清理" />
  </subProcess>

  <!-- 触发取消 -->
  <intermediateThrowEvent id="triggerCancel">
    <cancelEventDefinition />
  </intermediateThrowEvent>
</process>
```

#### TypeScript 实现

```typescript
interface CancellableTask {
  id: string;
  execute: (signal: AbortSignal) => Promise<any>;
  onCancel?: () => Promise<void>;
}

class CancelTaskPattern {
  private tasks: Map<string, {
    abortController: AbortController;
    promise: Promise<any>;
    onCancel?: () => Promise<void>;
  }> = new Map();

  async startTask(task: CancellableTask): Promise<void> {
    const abortController = new AbortController();

    const promise = task.execute(abortController.signal)
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log(`Task ${task.id} was cancelled`);
          return { cancelled: true };
        }
        throw error;
      });

    this.tasks.set(task.id, {
      abortController,
      promise,
      onCancel: task.onCancel
    });

    return promise;
  }

  async cancelTask(taskId: string): Promise<void> {
    const taskInfo = this.tasks.get(taskId);
    if (!taskInfo) {
      throw new Error(`Task ${taskId} not found`);
    }

    // 触发取消信号
    taskInfo.abortController.abort('Task cancelled');

    // 执行取消回调
    if (taskInfo.onCancel) {
      await taskInfo.onCancel();
    }

    this.tasks.delete(taskId);
  }

  cancelAll(): void {
    for (const [taskId] of this.tasks) {
      this.cancelTask(taskId).catch(console.error);
    }
  }
}

// 使用示例
const cancelPattern = new CancelTaskPattern();

// 启动可取消任务
const taskPromise = cancelPattern.startTask({
  id: 'data-processing',
  execute: async (signal) => {
    for (let i = 0; i < 10; i++) {
      if (signal.aborted) {
        throw new Error('AbortError');
      }
      console.log(`Processing batch ${i + 1}/10`);
      await delay(1000);
    }
    return { completed: true };
  },
  onCancel: async () => {
    console.log('Cleaning up partial results...');
    // 清理临时文件、回滚数据库等
  }
});

// 3秒后取消任务
setTimeout(() => {
  cancelPattern.cancelTask('data-processing');
}, 3000);

try {
  await taskPromise;
} catch (error) {
  console.log('Task was cancelled or failed');
}
```

#### 适用场景

- 用户取消长时间运行的操作
- 超时取消
- 前置条件不满足时取消

#### 反例（错误实现）

```typescript
// 错误：不清理资源
async cancelWrong(taskId: string): Promise<void> {
  this.tasks.delete(taskId); // 只是删除引用，任务继续运行
}

// 错误：不通知任务
async cancelWrong2(taskId: string): Promise<void> {
  const task = this.tasks.get(taskId);
  task.onCancel?.(); // 调用回调，但不停止任务执行
}
```

#### 可判断性分析

**可判断** ✅

取消任务模式可以通过异常处理语义进行形式化分析。

**形式化论证：**

```
设取消任务为 CT(T, C)
其中 T 是任务，C 是取消操作

语义: C → abort(T) ∧ cleanup(T)

正确性条件:
1. 响应性: 取消操作被及时响应
2. 完整性: 任务完全停止执行
3. 清理性: 相关资源被正确释放

形式化验证:
- 取消传播: 验证取消信号到达所有子任务
- 资源安全: 验证资源不会泄漏
- 状态一致性: 验证系统状态保持一致

Petri网扩展:
需要引入异常处理和取消弧

可验证属性:
- 取消可达性: 取消操作是否可达
- 取消完整性: 取消后是否完全停止
- 资源安全: 资源是否正确释放
```

---

### 模式 22: 取消案例 (Cancel Case)

#### 定义

取消案例模式允许取消整个流程实例，包括所有正在执行的任务。

#### BPMN 表示

```xml
<process id="cancel_case">
  <subProcess id="case" name="案例">
    <task id="step1" name="步骤1" />
    <task id="step2" name="步骤2" />
    <task id="step3" name="步骤3" />

    <!-- 边界信号事件取消整个案例 -->
    <boundaryEvent id="cancelSignal" attachedToRef="case" cancelActivity="true">
      <signalEventDefinition signalRef="cancelCaseSignal" />
    </boundaryEvent>
  </subProcess>

  <task id="cleanup" name="案例清理" />
</process>
```

#### TypeScript 实现

```typescript
class CaseInstance {
  id: string;
  tasks: Map<string, AbortController> = new Map();
  isCancelled: boolean = false;
  onCancel?: () => Promise<void>;

  constructor(id: string, onCancel?: () => Promise<void>) {
    this.id = id;
    this.onCancel = onCancel;
  }

  registerTask(taskId: string, abortController: AbortController): void {
    if (this.isCancelled) {
      abortController.abort('Case already cancelled');
      return;
    }
    this.tasks.set(taskId, abortController);
  }

  unregisterTask(taskId: string): void {
    this.tasks.delete(taskId);
  }

  async cancel(): Promise<void> {
    if (this.isCancelled) {
      return;
    }

    this.isCancelled = true;
    console.log(`Cancelling case: ${this.id}`);

    // 取消所有任务
    for (const [taskId, controller] of this.tasks) {
      console.log(`Cancelling task: ${taskId}`);
      controller.abort('Case cancelled');
    }

    // 执行案例级清理
    if (this.onCancel) {
      await this.onCancel();
    }

    this.tasks.clear();
  }
}

class CancelCasePattern {
  private cases: Map<string, CaseInstance> = new Map();

  createCase(caseId: string, onCancel?: () => Promise<void>): CaseInstance {
    const caseInstance = new CaseInstance(caseId, onCancel);
    this.cases.set(caseId, caseInstance);
    return caseInstance;
  }

  async cancelCase(caseId: string): Promise<void> {
    const caseInstance = this.cases.get(caseId);
    if (!caseInstance) {
      throw new Error(`Case ${caseId} not found`);
    }

    await caseInstance.cancel();
    this.cases.delete(caseId);
  }

  getCase(caseId: string): CaseInstance | undefined {
    return this.cases.get(caseId);
  }
}

// 使用示例
const cancelCase = new CancelCasePattern();

// 创建案例
const orderCase = cancelCase.createCase('order-123', async () => {
  console.log('Cleaning up order case...');
  // 释放库存、取消支付等
});

// 模拟启动多个任务
const task1Controller = new AbortController();
orderCase.registerTask('validate', task1Controller);

const task2Controller = new AbortController();
orderCase.registerTask('reserve-inventory', task2Controller);

// 取消整个案例
setTimeout(async () => {
  await cancelCase.cancelCase('order-123');
}, 2000);
```

#### 适用场景

- 用户取消订单
- 超时取消整个流程
- 前置条件失败取消案例

#### 反例（错误实现）

```typescript
// 错误：只取消部分任务
async cancelCaseWrong(caseId: string): Promise<void> {
  const caseInstance = this.cases.get(caseId);
  // 只取消第一个任务
  const firstTask = caseInstance.tasks.values().next().value;
  firstTask.abort();
  // 其他任务继续运行
}

// 错误：不执行清理
async cancelCaseWrong2(caseId: string): Promise<void> {
  const caseInstance = this.cases.get(caseId);
  for (const controller of caseInstance.tasks.values()) {
    controller.abort();
  }
  // 缺少清理操作
}
```

#### 可判断性分析

**可判断** ✅

取消案例模式可以通过层次化分析进行验证。

**形式化论证：**

```
设取消案例为 CC(Case)
其中 Case = {tasks, subprocesses, resources}

语义: cancel(Case) → ∀t ∈ Case.tasks: cancel(t) ∧ cleanup(Case)

正确性条件:
1. 传播性: 取消传播到所有子元素
2. 原子性: 案例完全取消或完全不取消
3. 一致性: 取消后系统状态一致

形式化验证:
- 层次分析: 验证取消传播到所有层次
- 事务性: 验证取消的原子性
- 补偿: 验证补偿操作正确执行

可验证属性:
- 取消完整性: 所有任务都被取消
- 无孤立任务: 没有任务继续运行
- 资源释放: 所有资源都被释放
```

---

### 模式 23: 取消区域 (Cancel Region)

#### 定义

取消区域模式定义一个可以整体取消的活动区域，区域内的所有活动在取消时都会停止。

#### BPMN 表示

```xml
<process id="cancel_region">
  <!-- 事务子流程作为取消区域 -->
  <transaction id="transactionRegion" name="事务区域">
    <task id="debit" name="扣款" />
    <task id="ship" name="发货" />
    <task id="notify" name="通知" />

    <!-- 取消边界事件 -->
    <boundaryEvent id="cancelBoundary" attachedToRef="transactionRegion">
      <cancelEventDefinition />
    </boundaryEvent>

    <!-- 取消处理子流程 -->
    <subProcess id="cancelHandler" triggeredByEvent="true">
      <startEvent id="cancelStart">
        <cancelEventDefinition />
      </startEvent>
      <task id="compensate" name="补偿操作" />
    </subProcess>
  </transaction>
</process>
```

#### TypeScript 实现

```typescript
interface RegionTask {
  id: string;
  execute: (signal: AbortSignal) => Promise<any>;
  compensate?: () => Promise<void>;
}

class CancelRegionPattern {
  private regions: Map<string, {
    tasks: Map<string, { controller: AbortController; compensate?: () => Promise<void> }>;
    onRegionCancel?: () => Promise<void>;
  }> = new Map();

  createRegion(regionId: string, onCancel?: () => Promise<void>): void {
    this.regions.set(regionId, {
      tasks: new Map(),
      onRegionCancel: onCancel
    });
  }

  async executeInRegion<T>(
    regionId: string,
    task: RegionTask
  ): Promise<T> {
    const region = this.regions.get(regionId);
    if (!region) {
      throw new Error(`Region ${regionId} not found`);
    }

    const controller = new AbortController();
    region.tasks.set(task.id, {
      controller,
      compensate: task.compensate
    });

    try {
      const result = await task.execute(controller.signal);
      region.tasks.delete(task.id);
      return result;
    } catch (error) {
      region.tasks.delete(task.id);
      throw error;
    }
  }

  async cancelRegion(regionId: string): Promise<void> {
    const region = this.regions.get(regionId);
    if (!region) {
      throw new Error(`Region ${regionId} not found`);
    }

    console.log(`Cancelling region: ${regionId}`);

    // 取消区域内所有任务
    for (const [taskId, taskInfo] of region.tasks) {
      console.log(`Cancelling task in region: ${taskId}`);
      taskInfo.controller.abort('Region cancelled');
    }

    // 执行补偿操作（逆序）
    const tasks = Array.from(region.tasks.entries()).reverse();
    for (const [taskId, taskInfo] of tasks) {
      if (taskInfo.compensate) {
        console.log(`Compensating task: ${taskId}`);
        await taskInfo.compensate();
      }
    }

    // 执行区域级取消回调
    if (region.onRegionCancel) {
      await region.onRegionCancel();
    }

    region.tasks.clear();
  }
}

// 使用示例
const cancelRegion = new CancelRegionPattern();

// 创建取消区域
cancelRegion.createRegion('payment-region', async () => {
  console.log('Payment region cancelled - releasing locks');
});

// 在区域内执行任务
const paymentPromise = cancelRegion.executeInRegion('payment-region', {
  id: 'charge-card',
  execute: async (signal) => {
    console.log('Charging card...');
    await delay(2000);
    if (signal.aborted) throw new Error('AbortError');
    console.log('Card charged');
    return { charged: true };
  },
  compensate: async () => {
    console.log('Refunding card charge...');
    // 执行退款
  }
});

const inventoryPromise = cancelRegion.executeInRegion('payment-region', {
  id: 'reserve-inventory',
  execute: async (signal) => {
    console.log('Reserving inventory...');
    await delay(1500);
    if (signal.aborted) throw new Error('AbortError');
    console.log('Inventory reserved');
    return { reserved: true };
  },
  compensate: async () => {
    console.log('Releasing inventory reservation...');
    // 释放库存
  }
});

// 1秒后取消整个区域
setTimeout(() => {
  cancelRegion.cancelRegion('payment-region');
}, 1000);
```

#### 适用场景

- 事务性业务流程
- 需要补偿操作的场景
- 原子性业务操作

#### 反例（错误实现）

```typescript
// 错误：不执行补偿
async cancelRegionWrong(regionId: string): Promise<void> {
  const region = this.regions.get(regionId);
  for (const [taskId, taskInfo] of region.tasks) {
    taskInfo.controller.abort();
  }
  // 缺少补偿操作
}

// 错误：补偿顺序错误
async cancelRegionWrong2(regionId: string): Promise<void> {
  const region = this.regions.get(regionId);
  // 正向顺序执行补偿，应该是逆序
  for (const [taskId, taskInfo] of region.tasks) {
    await taskInfo.compensate?.();
  }
}
```

#### 可判断性分析

**可判断** ✅

取消区域模式可以通过事务语义进行形式化分析。

**形式化论证：**

```
设取消区域为 CR(R, Tasks)
其中 R 是区域，Tasks = {t₁, t₂, ..., tₙ}

语义: cancel(R) → ∀t ∈ Tasks: cancel(t) ∧ compensate(t) (逆序)

正确性条件:
1. 原子性: 区域内所有任务一起成功或一起取消
2. 补偿性: 已完成的任务需要补偿
3. 隔离性: 区域执行期间对外部不可见

形式化验证:
- ACID属性: 验证原子性、一致性、隔离性、持久性
- 补偿正确性: 验证补偿操作恢复一致性
- 可串行化: 验证并发执行等价于某个串行执行

事务模型:
- Saga模式: 长事务的补偿
- 2PC: 两阶段提交
- TCC: Try-Confirm-Cancel

可验证属性:
- 原子性: 要么全部成功，要么全部取消
- 一致性: 补偿后系统状态一致
- 隔离性: 中间状态对外不可见
```

---


## 5. 其他模式

### 模式 24: 结构化 (Structured)

#### 定义

结构化模式要求流程由嵌套的结构化块组成，每个块有单一的入口和出口。

#### TypeScript 实现

```typescript
// 结构化流程构建器
class StructuredPattern {
  private blocks: Array<{
    type: 'sequence' | 'parallel' | 'choice' | 'loop';
    entry: string;
    exit: string;
    children: string[];
  }> = [];

  // 顺序块: 单一入口，单一出口
  createSequenceBlock(tasks: string[]): { entry: string; exit: string } {
    if (tasks.length === 0) {
      throw new Error('Sequence must have at least one task');
    }
    return {
      entry: tasks[0],
      exit: tasks[tasks.length - 1]
    };
  }

  // 并行块: Fork-Join 结构
  createParallelBlock(
    fork: string,
    branches: string[][],
    join: string
  ): { entry: string; exit: string } {
    return {
      entry: fork,
      exit: join
    };
  }

  // 选择块: XOR-Split 后接 XOR-Join
  createChoiceBlock(
    decision: string,
    branches: Map<string, string[]>,
    merge: string
  ): { entry: string; exit: string } {
    return {
      entry: decision,
      exit: merge
    };
  }

  // 循环块: 单一入口，条件决定循环或退出
  createLoopBlock(
    entry: string,
    body: string[],
    condition: string,
    exit: string
  ): { entry: string; exit: string } {
    return {
      entry,
      exit
    };
  }

  // 验证结构正确性
  validate(): boolean {
    // 检查每个块都有单一入口和单一出口
    for (const block of this.blocks) {
      if (!block.entry || !block.exit) {
        return false;
      }
    }
    return true;
  }
}
```

#### 可判断性分析

**可判断** ✅

结构化流程可以通过语法分析进行验证。

---

### 模式 25: 隔离 (Isolation)

#### 定义

隔离模式确保并行执行的活动不会相互干扰，通过资源隔离实现。

#### TypeScript 实现

```typescript
class IsolationPattern {
  private resourceLocks: Map<string, Mutex> = new Map();

  async executeIsolated<T>(
    resourceId: string,
    task: () => Promise<T>
  ): Promise<T> {
    // 获取资源锁
    const lock = this.getOrCreateLock(resourceId);

    return await lock.acquire(async () => {
      // 在隔离环境中执行
      console.log(`Executing isolated task on resource: ${resourceId}`);
      return await task();
    });
  }

  private getOrCreateLock(resourceId: string): Mutex {
    if (!this.resourceLocks.has(resourceId)) {
      this.resourceLocks.set(resourceId, new Mutex());
    }
    return this.resourceLocks.get(resourceId)!;
  }
}

// 互斥锁实现
class Mutex {
  private queue: Array<() => void> = [];
  private locked: boolean = false;

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    await this.lock();
    try {
      return await fn();
    } finally {
      this.unlock();
    }
  }

  private async lock(): Promise<void> {
    if (this.locked) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.locked = true;
  }

  private unlock(): void {
    this.locked = false;
    const next = this.queue.shift();
    if (next) {
      next();
    }
  }
}
```

#### 可判断性分析

**可判断** ✅

隔离模式可以通过资源访问分析进行验证。

---

### 模式 26: 里程碑 (Milestone)

#### 定义

里程碑模式表示一个活动只能在流程达到某个特定状态时才能执行。

#### TypeScript 实现

```typescript
class MilestonePattern {
  private milestones: Map<string, boolean> = new Map();
  private waitingTasks: Map<string, Array<() => void>> = new Map();

  // 设置里程碑
  async setMilestone(milestoneId: string): Promise<void> {
    console.log(`Milestone reached: ${milestoneId}`);
    this.milestones.set(milestoneId, true);

    // 唤醒等待的任务
    const waiters = this.waitingTasks.get(milestoneId);
    if (waiters) {
      for (const waiter of waiters) {
        waiter();
      }
      this.waitingTasks.delete(milestoneId);
    }
  }

  // 等待里程碑
  async waitForMilestone(milestoneId: string): Promise<void> {
    if (this.milestones.get(milestoneId)) {
      return; // 里程碑已达到
    }

    return new Promise((resolve) => {
      if (!this.waitingTasks.has(milestoneId)) {
        this.waitingTasks.set(milestoneId, []);
      }
      this.waitingTasks.get(milestoneId)!.push(resolve);
    });
  }

  // 检查里程碑状态
  isMilestoneReached(milestoneId: string): boolean {
    return this.milestones.get(milestoneId) || false;
  }
}

// 使用示例
const milestone = new MilestonePattern();

// 任务A等待里程碑
const taskA = async () => {
  console.log('Task A waiting for approval milestone...');
  await milestone.waitForMilestone('approved');
  console.log('Task A proceeding after approval');
};

// 任务B设置里程碑
const taskB = async () => {
  await delay(2000);
  console.log('Task B approving...');
  await milestone.setMilestone('approved');
};

// 并行执行
await Promise.all([taskA(), taskB()]);
```

#### 可判断性分析

**不可判断** ❌

里程碑的可达性取决于运行时状态。

---

### 模式 27: 关键区域 (Critical Section)

#### 定义

关键区域模式确保多个并行执行的活动不会同时访问共享资源。

#### TypeScript 实现

```typescript
class CriticalSectionPattern {
  private semaphore: Semaphore;

  constructor(maxConcurrent: number = 1) {
    this.semaphore = new Semaphore(maxConcurrent);
  }

  async executeInCriticalSection<T>(
    sectionName: string,
    task: () => Promise<T>
  ): Promise<T> {
    console.log(`Waiting to enter critical section: ${sectionName}`);

    return await this.semaphore.acquire(async () => {
      console.log(`Entered critical section: ${sectionName}`);
      try {
        return await task();
      } finally {
        console.log(`Exited critical section: ${sectionName}`);
      }
    });
  }
}

// 信号量实现
class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(initialPermits: number) {
    this.permits = initialPermits;
  }

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForPermit();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private async waitForPermit(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    await new Promise<void>(resolve => {
      this.queue.push(resolve);
    });
  }

  private release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}

// 使用示例
const criticalSection = new CriticalSectionPattern(1); // 互斥访问

// 多个任务竞争关键区域
const tasks = Array.from({ length: 5 }, (_, i) => async () => {
  await criticalSection.executeInCriticalSection('database', async () => {
    console.log(`Task ${i + 1} accessing database`);
    await delay(500);
    console.log(`Task ${i + 1} finished database access`);
    return `result-${i + 1}`;
  });
});

await Promise.all(tasks.map(t => t()));
```

#### 可判断性分析

**可判断** ✅

关键区域可以通过互斥分析进行验证。

---

### 模式 28: 交错并行路由 (Interleaved Parallel Routing)

#### 定义

交错并行路由模式允许多个活动并行执行，但它们的执行是交错的，不会真正同时执行。

#### TypeScript 实现

```typescript
class InterleavedParallelRoutingPattern {
  private executionQueue: Array<() => Promise<void>> = [];
  private isExecuting: boolean = false;

  async addTask(task: () => Promise<void>, priority: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      this.executionQueue.push(async () => {
        try {
          await task();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // 按优先级排序
      this.executionQueue.sort((a, b) => {
        // 简化：保持原有顺序
        return 0;
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isExecuting || this.executionQueue.length === 0) {
      return;
    }

    this.isExecuting = true;

    while (this.executionQueue.length > 0) {
      const task = this.executionQueue.shift()!;
      await task();
      // 任务之间交出控制权
      await new Promise(resolve => setImmediate(resolve));
    }

    this.isExecuting = false;
  }
}

// 使用示例
const interleaved = new InterleavedParallelRoutingPattern();

// 添加多个任务，它们会交错执行
await Promise.all([
  interleaved.addTask(async () => {
    console.log('Task 1 start');
    await delay(100);
    console.log('Task 1 end');
  }),
  interleaved.addTask(async () => {
    console.log('Task 2 start');
    await delay(100);
    console.log('Task 2 end');
  }),
  interleaved.addTask(async () => {
    console.log('Task 3 start');
    await delay(100);
    console.log('Task 3 end');
  })
]);
```

#### 可判断性分析

**可判断** ✅

交错执行可以通过调度分析进行验证。

---

## 6. 23种可判断模式详细分析

### 6.1 可判断模式列表

以下23种模式是**可判断的**（Decidable），可以通过形式化方法进行验证：

| 序号 | 模式名称 | 类别 | 判断方法 |
|------|----------|------|----------|
| 1 | 顺序 (Sequence) | 基本控制 | FSM可达性分析 |
| 2 | 并行分支 (Parallel Split) | 基本控制 | Petri网分析 |
| 3 | 同步 (Synchronization) | 基本控制 | AND-Join验证 |
| 4 | 排他选择 (Exclusive Choice) | 基本控制 | 条件可满足性 |
| 5 | 简单合并 (Simple Merge) | 基本控制 | XOR-Join验证 |
| 6 | 多选 (Multi-Choice) | 基本控制 | 条件组合分析 |
| 8 | 多合并 (Multi-Merge) | 基本控制 | 可达性分析 |
| 9 | 鉴别器 (Discriminator) | 基本控制 | 竞争语义分析 |
| 10 | 任意循环 (Arbitrary Cycles) | 高级分支 | 有界循环分析 |
| 11 | 结构化循环 (Structured Loop) | 高级分支 | 秩函数分析 |
| 13 | 临时触发 (Transient Trigger) | 高级分支 | 时间自动机 |
| 14 | 永久触发 (Persistent Trigger) | 高级分支 | 队列语义分析 |
| 15 | 多实例无同步 | 多实例 | 独立实例分析 |
| 16 | 多实例与先决条件同步 | 多实例 | 静态计数分析 |
| 17 | 多实例与后决条件同步 | 多实例 | 结构分析 |
| 19 | 隐式终止 | 状态 | 控制流分析 |
| 20 | 显式终止 | 状态 | 可达性分析 |
| 21 | 取消任务 | 状态 | 异常处理分析 |
| 22 | 取消案例 | 状态 | 层次化分析 |
| 23 | 取消区域 | 状态 | 事务语义分析 |
| 24 | 结构化 | 其他 | 语法分析 |
| 25 | 隔离 | 其他 | 资源访问分析 |
| 27 | 关键区域 | 其他 | 互斥分析 |
| 28 | 交错并行路由 | 其他 | 调度分析 |

### 6.2 不可判断模式列表

以下模式是**不可判断的**（Undecidable）：

| 序号 | 模式名称 | 不可判断原因 |
|------|----------|--------------|
| 7 | 同步合并 (Synchronizing Merge) | 需要运行时信息确定激活分支 |
| 12 | 递归 (Recursion) | 等价于停机问题 |
| 18 | 多实例与指定条件同步 | 完成条件动态评估 |
| 26 | 里程碑 (Milestone) | 状态可达性运行时确定 |

### 6.3 可判断性判定标准

#### 6.3.1 可判断的条件

一个工作流模式是可判断的，当且仅当满足以下条件之一：

1. **有限状态空间**: 流程的状态空间是有限的，可以通过模型检测验证
2. **静态可分析**: 所有关键决策可以在设计时或编译时确定
3. **有界结构**: 循环、递归等有明确的边界
4. **确定性语义**: 流程行为是确定的，不依赖于外部不确定性

#### 6.3.2 不可判断的原因

模式不可判断的常见原因：

1. **需要运行时信息**: 决策依赖于运行时数据
2. **无界结构**: 循环或递归没有明确的上界
3. **等价于停机问题**: 可以模拟图灵机的计算能力
4. **外部不确定性**: 依赖于不可预测的外部事件

### 6.4 形式化验证方法

#### 6.4.1 Petri网分析

Petri网是验证工作流模式的主要形式化工具：

```
基本Petri网元素:
- 位置 (Place): 表示状态或条件
- 转换 (Transition): 表示活动或事件
- 令牌 (Token): 表示流程实例

工作流到Petri网的映射:
- 任务 → 转换
- 控制流 → 位置和弧
- 并行 → AND-Split/AND-Join
- 选择 → XOR-Split/XOR-Join

可验证属性:
- 可达性: 某个状态是否可达
- 有界性: 位置中的令牌数是否有界
- 活性: 转换是否最终可以触发
- 可逆性: 是否可以回到初始状态
```

#### 6.4.2 有限状态机分析

对于简单模式，可以使用有限状态机（FSM）：

```
FSM = (S, Σ, δ, s₀, F)

其中:
- S: 有限状态集合
- Σ: 输入字母表（事件集合）
- δ: S × Σ → S 转换函数
- s₀: 初始状态
- F: 终止状态集合

可验证问题:
- 可达性: 是否存在路径 s₀ →* s
- 安全性: 是否永远不会到达错误状态
- 活性: 是否最终会到达终止状态
```

#### 6.4.3 时序逻辑验证

使用时序逻辑（LTL/CTL）表达和验证性质：

```
LTL 公式示例:
- ◇p: 最终p成立（活性）
- □p: 永远p成立（安全性）
- □◇p: 无限次p成立（公平性）
- p U q: p一直成立直到q成立

CTL 公式示例:
- AG p: 在所有路径的所有状态p成立
- EF p: 存在路径使p最终成立
- AF p: 所有路径都最终使p成立
```

### 6.5 可判断模式的验证算法

#### 6.5.1 可达性分析算法

```typescript
function reachabilityAnalysis(
  initialState: State,
  transitions: Transition[],
  targetState: State
): boolean {
  const visited = new Set<State>();
  const queue = [initialState];

  while (queue.length > 0) {
    const state = queue.shift()!;

    if (state.equals(targetState)) {
      return true; // 目标状态可达
    }

    if (visited.has(state)) {
      continue;
    }

    visited.add(state);

    // 获取所有后继状态
    for (const transition of transitions) {
      if (transition.from.equals(state)) {
        queue.push(transition.to);
      }
    }
  }

  return false; // 目标状态不可达
}
```

#### 6.5.2 死锁检测算法

```typescript
function detectDeadlock(
  states: State[],
  transitions: Transition[]
): State[] {
  const deadlocks: State[] = [];

  for (const state of states) {
    // 检查状态是否有出边
    const hasOutgoing = transitions.some(t => t.from.equals(state));

    // 检查状态是否是终止状态
    const isTerminal = state.isTerminal();

    // 如果没有出边且不是终止状态，则是死锁
    if (!hasOutgoing && !isTerminal) {
      deadlocks.push(state);
    }
  }

  return deadlocks;
}
```

#### 6.5.3 有界性分析算法

```typescript
function boundednessAnalysis(
  net: PetriNet,
  maxTokens: number
): { isBounded: boolean; unboundedPlaces: Place[] } {
  const unboundedPlaces: Place[] = [];
  const coverabilityGraph = buildCoverabilityGraph(net);

  for (const place of net.places) {
    const maxMarking = getMaximumMarking(coverabilityGraph, place);

    if (maxMarking === Infinity || maxMarking > maxTokens) {
      unboundedPlaces.push(place);
    }
  }

  return {
    isBounded: unboundedPlaces.length === 0,
    unboundedPlaces
  };
}
```

---


### 模式 29-43: 其他重要模式

#### 模式 29: 延迟选择 (Deferred Choice)

#### 定义

延迟选择模式允许在运行时根据第一个发生的事件来决定执行路径，而不是基于数据条件。

#### TypeScript 实现

```typescript
class DeferredChoicePattern {
  async execute<T>(
    alternatives: Map<string, {
      waitFor: () => Promise<any>;
      action: (event: any) => Promise<T>;
    }>
  ): Promise<{ choice: string; result: T }> {
    // 创建所有等待的Promise
    const promises = Array.from(alternatives.entries()).map(
      async ([name, alt]) => {
        const event = await alt.waitFor();
        return { name, event, action: alt.action };
      }
    );

    // 第一个完成的决定选择
    const winner = await Promise.race(promises);
    console.log(`Deferred choice: ${winner.name} occurred first`);

    const result = await winner.action(winner.event);
    return { choice: winner.name, result };
  }
}

// 使用示例
const deferredChoice = new DeferredChoicePattern();

const alternatives = new Map([
  ['email', {
    waitFor: async () => {
      // 等待邮件到达
      return await waitForEmail();
    },
    action: async (email) => {
      return `Processed email: ${email.subject}`;
    }
  }],
  ['timeout', {
    waitFor: async () => {
      await delay(5000);
      return { type: 'timeout' };
    },
    action: async () => {
      return 'Timeout occurred';
    }
  }]
]);

const result = await deferredChoice.execute(alternatives);
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 30: 静态部分合并 (Static Partial Join)

#### 定义

等待固定数量的分支完成后继续执行。

#### TypeScript 实现

```typescript
class StaticPartialJoinPattern {
  async execute<T>(
    branches: Array<() => Promise<T>>,
    requiredCount: number
  ): Promise<T[]> {
    const results: T[] = [];

    return new Promise((resolve, reject) => {
      let completedCount = 0;
      let rejectedCount = 0;

      branches.forEach((branch, index) => {
        branch()
          .then(result => {
            results[index] = result;
            completedCount++;

            if (completedCount >= requiredCount) {
              resolve(results.filter(r => r !== undefined));
            }
          })
          .catch(error => {
            rejectedCount++;
            if (rejectedCount > branches.length - requiredCount) {
              reject(new Error('Too many branches failed'));
            }
          });
      });
    });
  }
}
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 31: 动态部分合并 (Dynamic Partial Join)

#### 定义

等待动态确定数量的分支完成后继续执行。

#### TypeScript 实现

```typescript
class DynamicPartialJoinPattern {
  async execute<T>(
    branches: Array<() => Promise<T>>,
    getRequiredCount: (total: number) => number
  ): Promise<T[]> {
    const requiredCount = getRequiredCount(branches.length);
    console.log(`Need ${requiredCount} of ${branches.length} branches`);

    const results: T[] = [];
    let completedCount = 0;

    return new Promise((resolve) => {
      branches.forEach((branch, index) => {
        branch().then(result => {
          results[index] = result;
          completedCount++;

          if (completedCount >= requiredCount) {
            resolve(results.filter(r => r !== undefined));
          }
        });
      });
    });
  }
}
```

#### 可判断性分析

**部分可判断** ⚠️

---

#### 模式 32: 取消部分合并 (Canceling Partial Join)

#### 定义

当足够数量的分支完成后，取消剩余分支。

#### TypeScript 实现

```typescript
class CancelingPartialJoinPattern {
  async execute<T>(
    branches: Map<string, {
      task: (signal: AbortSignal) => Promise<T>;
    }>,
    requiredCount: number
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const abortControllers = new Map<string, AbortController>();

    // 为每个分支创建AbortController
    for (const [id] of branches) {
      abortControllers.set(id, new AbortController());
    }

    return new Promise((resolve) => {
      let completedCount = 0;

      for (const [id, branch] of branches) {
        const controller = abortControllers.get(id)!;

        branch.task(controller.signal)
          .then(result => {
            results.set(id, result);
            completedCount++;

            if (completedCount >= requiredCount) {
              // 取消剩余分支
              for (const [otherId, otherController] of abortControllers) {
                if (!results.has(otherId)) {
                  otherController.abort('Partial join satisfied');
                }
              }
              resolve(results);
            }
          })
          .catch(() => {
            // 分支被取消或失败
          });
      }
    });
  }
}
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 33: 结构化部分合并 (Structured Partial Join)

#### 定义

在结构化块中实现部分合并。

#### TypeScript 实现

```typescript
class StructuredPartialJoinPattern {
  async executeInBlock<T>(
    blockName: string,
    branches: Array<() => Promise<T>>,
    requiredCount: number
  ): Promise<{ blockName: string; results: T[] }> {
    console.log(`Entering block: ${blockName}`);

    const results = await this.partialJoin(branches, requiredCount);

    console.log(`Exiting block: ${blockName}`);
    return { blockName, results };
  }

  private async partialJoin<T>(
    branches: Array<() => Promise<T>>,
    requiredCount: number
  ): Promise<T[]> {
    const results: T[] = [];

    return new Promise((resolve) => {
      let completed = 0;

      branches.forEach(branch => {
        branch().then(result => {
          results.push(result);
          completed++;

          if (completed >= requiredCount) {
            resolve(results);
          }
        });
      });
    });
  }
}
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 34: 多实例循环 (Multi-Instance Loop)

#### 定义

基于集合创建多个实例，可以顺序或并行执行。

#### TypeScript 实现

```typescript
class MultiInstanceLoopPattern {
  async execute<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options: {
      sequential?: boolean;
      completionCondition?: (results: R[]) => boolean;
    } = {}
  ): Promise<R[]> {
    const { sequential = false } = options;
    const results: R[] = [];

    if (sequential) {
      // 顺序执行
      for (let i = 0; i < items.length; i++) {
        const result = await processor(items[i], i);
        results.push(result);

        if (options.completionCondition?.(results)) {
          break;
        }
      }
    } else {
      // 并行执行
      const promises = items.map((item, i) => processor(item, i));
      const allResults = await Promise.all(promises);
      results.push(...allResults);
    }

    return results;
  }
}
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 35: 子流程 (Subprocess)

#### 定义

将一组相关活动封装为可复用的子流程。

#### TypeScript 实现

```typescript
interface SubprocessDefinition {
  id: string;
  execute: (input: any) => Promise<any>;
}

class SubprocessPattern {
  private subprocesses = new Map<string, SubprocessDefinition>();

  registerSubprocess(def: SubprocessDefinition): void {
    this.subprocesses.set(def.id, def);
  }

  async callSubprocess(id: string, input: any): Promise<any> {
    const subprocess = this.subprocesses.get(id);
    if (!subprocess) {
      throw new Error(`Subprocess ${id} not found`);
    }

    console.log(`Calling subprocess: ${id}`);
    const result = await subprocess.execute(input);
    console.log(`Subprocess ${id} completed`);

    return result;
  }
}
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 36: 事务 (Transaction)

#### 定义

将一组活动作为原子事务执行，支持提交或回滚。

#### TypeScript 实现

```typescript
interface TransactionalTask {
  execute: () => Promise<void>;
  compensate: () => Promise<void>;
}

class TransactionPattern {
  async executeTransaction(
    tasks: TransactionalTask[]
  ): Promise<void> {
    const completed: TransactionalTask[] = [];

    try {
      for (const task of tasks) {
        await task.execute();
        completed.push(task);
      }
      console.log('Transaction committed');
    } catch (error) {
      console.log('Transaction failed, compensating...');
      // 逆序补偿
      for (let i = completed.length - 1; i >= 0; i--) {
        await completed[i].compensate();
      }
      throw error;
    }
  }
}
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 37: 补偿 (Compensation)

#### 定义

定义如何撤销已完成的任务。

#### TypeScript 实现

```typescript
class CompensationPattern {
  private compensations: Array<() => Promise<void>> = [];

  registerCompensation(compensate: () => Promise<void>): void {
    this.compensations.push(compensate);
  }

  async compensateAll(): Promise<void> {
    console.log(`Compensating ${this.compensations.length} tasks`);

    // 逆序执行补偿
    for (let i = this.compensations.length - 1; i >= 0; i--) {
      try {
        await this.compensations[i]();
      } catch (error) {
        console.error(`Compensation ${i} failed:`, error);
        // 继续补偿其他任务
      }
    }
  }
}
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 38: 调用活动 (Call Activity)

#### 定义

调用外部定义的流程或子流程。

#### TypeScript 实现

```typescript
class CallActivityPattern {
  private externalProcesses = new Map<string, (input: any) => Promise<any>>();

  registerExternalProcess(
    id: string,
    process: (input: any) => Promise<any>
  ): void {
    this.externalProcesses.set(id, process);
  }

  async callActivity(processId: string, input: any): Promise<any> {
    const process = this.externalProcesses.get(processId);
    if (!process) {
      throw new Error(`External process ${processId} not found`);
    }

    console.log(`Calling external process: ${processId}`);
    return await process(input);
  }
}
```

#### 可判断性分析

**部分可判断** ⚠️

---

#### 模式 39: 事件子流程 (Event Subprocess)

#### 定义

由事件触发的子流程，可以中断或并行执行。

#### TypeScript 实现

```typescript
class EventSubprocessPattern {
  private eventHandlers = new Map<string, {
    handler: (event: any) => Promise<void>;
    interrupting: boolean;
  }>();

  registerEventHandler(
    eventType: string,
    handler: (event: any) => Promise<void>,
    interrupting: boolean = true
  ): void {
    this.eventHandlers.set(eventType, { handler, interrupting });
  }

  async handleEvent(eventType: string, event: any): Promise<boolean> {
    const handler = this.eventHandlers.get(eventType);
    if (!handler) {
      return false;
    }

    console.log(`Handling event: ${eventType}`);
    await handler.handler(event);
    return handler.interrupting;
  }
}
```

#### 可判断性分析

**部分可判断** ⚠️

---

#### 模式 40: 边界事件 (Boundary Event)

#### 定义

附加到活动边界的事件处理器。

#### TypeScript 实现

```typescript
class BoundaryEventPattern {
  private boundaryHandlers = new Map<string, {
    event: string;
    handler: () => Promise<void>;
    cancelActivity: boolean;
  }>();

  attachBoundaryEvent(
    activityId: string,
    event: string,
    handler: () => Promise<void>,
    cancelActivity: boolean = true
  ): void {
    this.boundaryHandlers.set(`${activityId}_${event}`, {
      event,
      handler,
      cancelActivity
    });
  }

  async triggerBoundaryEvent(activityId: string, event: string): Promise<boolean> {
    const handler = this.boundaryHandlers.get(`${activityId}_${event}`);
    if (!handler) {
      return false;
    }

    await handler.handler();
    return handler.cancelActivity;
  }
}
```

#### 可判断性分析

**可判断** ✅

---

#### 模式 41: 消息事件 (Message Event)

#### 定义

基于消息传递的事件机制。

#### TypeScript 实现

```typescript
class MessageEventPattern {
  private messageHandlers = new Map<string, Array<(message: any) => Promise<void>>>();
  private messageQueue: Array<{ type: string; payload: any }> = [];

  registerHandler(messageType: string, handler: (message: any) => Promise<void>): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  async sendMessage(type: string, payload: any): Promise<void> {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      for (const handler of handlers) {
        await handler(payload);
      }
    } else {
      this.messageQueue.push({ type, payload });
    }
  }
}
```

#### 可判断性分析

**部分可判断** ⚠️

---

#### 模式 42: 信号事件 (Signal Event)

#### 定义

广播式的事件通知机制。

#### TypeScript 实现

```typescript
class SignalEventPattern {
  private signalHandlers = new Map<string, Array<(data: any) => Promise<void>>>();

  registerSignalHandler(
    signalName: string,
    handler: (data: any) => Promise<void>
  ): void {
    if (!this.signalHandlers.has(signalName)) {
      this.signalHandlers.set(signalName, []);
    }
    this.signalHandlers.get(signalName)!.push(handler);
  }

  async broadcastSignal(signalName: string, data: any): Promise<void> {
    const handlers = this.signalHandlers.get(signalName);
    if (handlers) {
      console.log(`Broadcasting signal: ${signalName} to ${handlers.length} handlers`);
      await Promise.all(handlers.map(h => h(data)));
    }
  }
}
```

#### 可判断性分析

**部分可判断** ⚠️

---

#### 模式 43: 定时器事件 (Timer Event)

#### 定义

基于时间的触发机制。

#### TypeScript 实现

```typescript
class TimerEventPattern {
  private timers = new Map<string, NodeJS.Timeout>();

  scheduleTimer(
    timerId: string,
    duration: number,
    callback: () => void
  ): void {
    const timer = setTimeout(() => {
      console.log(`Timer ${timerId} fired`);
      callback();
      this.timers.delete(timerId);
    }, duration);

    this.timers.set(timerId, timer);
    console.log(`Timer ${timerId} scheduled for ${duration}ms`);
  }

  cancelTimer(timerId: string): boolean {
    const timer = this.timers.get(timerId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(timerId);
      console.log(`Timer ${timerId} cancelled`);
      return true;
    }
    return false;
  }

  scheduleRepeatingTimer(
    timerId: string,
    interval: number,
    callback: () => void
  ): void {
    const timer = setInterval(() => {
      callback();
    }, interval);

    this.timers.set(timerId, timer);
  }
}
```

#### 可判断性分析

**可判断** ✅

---

## 7. 总结与最佳实践

### 7.1 模式选择指南

| 场景 | 推荐模式 |
|------|----------|
| 简单的线性流程 | 顺序 |
| 并行独立任务 | 并行分支 + 同步 |
| 条件分支 | 排他选择 + 简单合并 |
| 多条件组合 | 多选 + 同步合并 |
| 竞速场景 | 鉴别器 |
| 循环处理 | 结构化循环 |
| 动态实例 | 多实例与后决条件同步 |
| 事务处理 | 取消区域 + 补偿 |

### 7.2 可判断性设计原则

1. **优先使用可判断模式**: 在可能的情况下，选择可判断的模式
2. **限制运行时依赖**: 减少设计时无法确定的决策
3. **使用有界结构**: 确保循环和递归有明确的上界
4. **结构化设计**: 使用嵌套的结构化块组织流程

### 7.3 形式化验证建议

1. **模型检查**: 使用Petri网或FSM进行可达性分析
2. **类型检查**: 确保数据流类型正确
3. **死锁检测**: 验证流程不会陷入死锁
4. **有界性分析**: 确保资源使用有界

### 7.4 43种模式完整列表

#### 基本控制模式 (9种)

1. 顺序 (Sequence) ✅
2. 并行分支 (Parallel Split) ✅
3. 同步 (Synchronization) ✅
4. 排他选择 (Exclusive Choice) ✅
5. 简单合并 (Simple Merge) ✅
6. 多选 (Multi-Choice) ✅
7. 同步合并 (Synchronizing Merge) ❌
8. 多合并 (Multi-Merge) ✅
9. 鉴别器 (Discriminator) ✅

#### 高级分支同步模式 (5种)

1. 任意循环 (Arbitrary Cycles) ✅
2. 结构化循环 (Structured Loop) ✅
3. 递归 (Recursion) ❌
4. 临时触发 (Transient Trigger) ✅
5. 永久触发 (Persistent Trigger) ✅

#### 多实例模式 (4种)

1. 多实例无同步 ✅
2. 多实例与先决条件同步 ✅
3. 多实例与后决条件同步 ✅
4. 多实例与指定条件同步 ❌

#### 状态模式 (5种)

1. 隐式终止 ✅
2. 显式终止 ✅
3. 取消任务 ✅
4. 取消案例 ✅
5. 取消区域 ✅

#### 其他模式 (20种)

1. 结构化 ✅
2. 隔离 ✅
3. 里程碑 ❌
4. 关键区域 ✅
5. 交错并行路由 ✅
6. 延迟选择 ✅
7. 静态部分合并 ✅
8. 动态部分合并 ⚠️
9. 取消部分合并 ✅
10. 结构化部分合并 ✅
11. 多实例循环 ✅
12. 子流程 ✅
13. 事务 ✅
14. 补偿 ✅
15. 调用活动 ⚠️
16. 事件子流程 ⚠️
17. 边界事件 ✅
18. 消息事件 ⚠️
19. 信号事件 ⚠️
20. 定时器事件 ✅

### 7.5 可判断模式统计

- **完全可判断**: 32种
- **部分可判断**: 6种
- **不可判断**: 5种

**总计**: 43种模式中，**23种完全可判断**，约占总数的53%。

---

## 附录: 工具函数

```typescript
// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟等待邮件
async function waitForEmail(): Promise<any> {
  await delay(Math.random() * 3000);
  return { subject: 'Test Email', body: 'Hello' };
}

// 模拟获取报价
async function fetchQuote(provider: string, signal: AbortSignal): Promise<number> {
  await delay(1000 + Math.random() * 2000);
  if (signal.aborted) {
    throw new Error('AbortError');
  }
  return Math.random() * 100;
}
```

---

*文档生成时间: 2024年*
*基于 Workflow Patterns 理论框架*
