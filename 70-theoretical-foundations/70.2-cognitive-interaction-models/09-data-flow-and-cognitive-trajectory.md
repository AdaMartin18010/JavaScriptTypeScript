---
title: "数据流与认知轨迹"
description: "单向 vs 双向数据流、全局状态心智地图、不可变数据的认知优势"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P2
actual-length: ~3200 words
references:
  - Ousterhout, A Philosophy of Software Design (2018)
---

# 数据流与认知轨迹

> **理论深度**: 跨学科
> **前置阅读**: [01-cognitive-science-primer-for-developers.md](01-cognitive-science-primer-for-developers.md)
> **目标读者**: 状态管理设计者、架构师

---

## 目录

- [数据流与认知轨迹](#数据流与认知轨迹)
  - [目录](#目录)
  - [1. 单向数据流 vs 双向绑定的认知轨迹](#1-单向数据流-vs-双向绑定的认知轨迹)
    - [1.1 数据变化的追踪难度](#11-数据变化的追踪难度)
  - [2. 全局状态管理的心智地图构建](#2-全局状态管理的心智地图构建)
    - [2.1 Redux/Zustand/Pinia](#21-reduxzustandpinia)
  - [3. 数据变换管道的认知线性度](#3-数据变换管道的认知线性度)
    - [3.1 管道 vs 嵌套](#31-管道-vs-嵌套)
  - [4. 不可变数据更新的认知优势](#4-不可变数据更新的认知优势)
    - [4.1 时间旅行调试](#41-时间旅行调试)
  - [参考文献](#参考文献)

---

## 1. 单向数据流 vs 双向绑定的认知轨迹

### 1.1 数据变化的追踪难度

单向数据流的可预测性认知优势：数据从父到子，事件从子到父。

---

## 2. 全局状态管理的心智地图构建

### 2.1 Redux/Zustand/Pinia

全局状态如何构建开发者的心智地图。

---

## 3. 数据变换管道的认知线性度

### 3.1 管道 vs 嵌套

`.map().filter().reduce()` 的可读性，管道 vs 嵌套的对比。

---

## 4. 不可变数据更新的认知优势

### 4.1 时间旅行调试

不可变数据更新的认知优势：时间旅行调试的心理学。

---

## 参考文献

1. Ousterhout, J. (2018). *A Philosophy of Software Design*. Yaknyam Press.
