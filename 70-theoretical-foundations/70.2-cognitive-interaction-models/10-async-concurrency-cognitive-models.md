---
title: "异步与并发的认知模型"
description: "人类并发直觉、Event Loop 认知优势、竞态条件检测困难"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: skeleton
priority: P1
estimated-length: 3500 words
references:
  - CONCURRENCY_MODELS_DEEP_DIVE.md
  - Baddeley, Working Memory (2007)
---

# 异步与并发的认知模型

> **理论深度**: 跨学科
> **前置阅读**: [01-cognitive-science-primer-for-developers.md](01-cognitive-science-primer-for-developers.md)
> **目标读者**: 并发开发者、系统设计

---

## 目录

- [异步与并发的认知模型](#异步与并发的认知模型)
  - [目录](#目录)
  - [1. 人类对并发的心智限制](#1-人类对并发的心智限制)
  - [2. Event Loop 模型的认知优势](#2-event-loop-模型的认知优势)
  - [3. Worker/多线程模型的认知挑战](#3-worker多线程模型的认知挑战)
  - [4. async/await 的"伪同步"错觉](#4-asyncawait-的伪同步错觉)
  - [5. 竞态条件的认知检测困难](#5-竞态条件的认知检测困难)
  - [参考文献](#参考文献)

---

## 1. 人类对并发的心智限制

> 🚧 **骨架占位符**：单线程直觉 vs 多线程现实，人类的"序列化偏见"。

---

## 2. Event Loop 模型的认知优势

> 🚧 **骨架占位符**："一次只做一件事"的直觉匹配，为什么 Event Loop 对人类更友好。

---

## 3. Worker/多线程模型的认知挑战

> 🚧 **骨架占位符**：共享状态的"他心问题"（Theory of Mind），消息传递的认知优势。

---

## 4. async/await 的"伪同步"错觉

> 🚧 **骨架占位符**：同步式语法隐藏异步语义，导致的认知陷阱。

---

## 5. 竞态条件的认知检测困难

> 🚧 **骨架占位符**：为什么人类难以直觉发现竞态条件，需要形式化工具辅助。

---

## 参考文献

1. Baddeley, A. (2007). *Working Memory, Thought, and Action*. Oxford University Press.
2. CONCURRENCY_MODELS_DEEP_DIVE.md. (Existing project content)
