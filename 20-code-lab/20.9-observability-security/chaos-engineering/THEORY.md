# 混沌工程 — 理论基础

## 1. 混沌工程原则

Netflix 于 2010 年代提出并实践的生产环境韧性验证方法，核心思想是**通过可控实验发现系统弱点**。其理论基石基于以下四大原则：

1. **建立稳态假设（Steady State）**
   - 定义系统正常行为的可量化指标（吞吐量、错误率、延迟 P99）
   - 稳态应在实验组与对照组中保持一致

2. **引入真实世界的故障事件**
   - 故障应反映生产环境实际可能发生的异常（非随机破坏）
   - 包括：网络分区、依赖宕机、资源耗尽、区域故障

3. **验证稳态是否保持**
   - 实验期间持续监控业务指标
   - 若稳态被破坏，则暴露了一个可修复的弱点

4. **最小化爆炸半径（Blast Radius）**
   - 从开发/预发环境开始，逐步扩大至金丝雀/生产环境
   - 始终具备快速终止实验和回滚的能力

## 2. 故障注入类型

| 类型 | 工具 | 影响 | 适用层级 |
|------|------|------|----------|
| **网络延迟** | Toxiproxy、Chaos Mesh | 模拟慢网络、超时 | 网络层 |
| **服务宕机** | Chaos Monkey、Gremlin | 随机终止实例 | 服务层 |
| **CPU 满载** | stress-ng | 资源竞争、调度延迟 | 系统层 |
| **内存耗尽** | Linux cgroups、Chaos Blade | OOM 场景 | 系统层 |
| **磁盘故障** | disk-fill、Chaos Mesh | I/O 压力、存储耗尽 | 系统层 |
| **时钟跳跃** | libfaketime | 时间敏感系统异常 | 应用层 |
| **DNS 故障** | toxiproxy、PowerDNS | 服务发现失效 | 网络层 |
| **数据库延迟** | pgbench + tc | 查询超时、连接池耗尽 | 数据层 |

## 3. 故障注入代码示例（Node.js）

```typescript
// fault-injection.ts — 可编程故障注入器

import { EventEmitter } from 'events';

interface FaultConfig {
  type: 'latency' | 'error' | 'memory-leak' | 'cpu-spike';
  probability: number; // 0.0 - 1.0
  durationMs?: number;
  magnitude?: number;  // 延迟毫秒数 / 内存泄漏字节数
}

class FaultInjector extends EventEmitter {
  private activeFaults = new Set<string>();

  /** 为异步函数注入网络延迟 */
  async injectLatency<T>(
    operation: () => Promise<T>,
    latencyMs: number,
    probability = 0.1
  ): Promise<T> {
    if (Math.random() < probability) {
      this.emit('faultTriggered', { type: 'latency', latencyMs });
      await this.delay(latencyMs);
    }
    return operation();
  }

  /** 注入随机错误 */
  injectError(probability = 0.05): void {
    if (Math.random() < probability) {
      this.emit('faultTriggered', { type: 'error' });
      throw new Error('Injected fault: random service error');
    }
  }

  /** 模拟内存泄漏（仅用于测试环境） */
  startMemoryLeak(bytesPerSecond = 1024 * 1024, durationMs = 30000): string {
    const id = `memory-leak-${Date.now()}`;
    this.activeFaults.add(id);
    const leak: Buffer[] = [];

    const interval = setInterval(() => {
      if (!this.activeFaults.has(id)) {
        clearInterval(interval);
        leak.length = 0; // 释放引用
        return;
      }
      leak.push(Buffer.alloc(bytesPerSecond));
      this.emit('faultTriggered', { type: 'memory-leak', leaked: leak.length * bytesPerSecond });
    }, 1000);

    setTimeout(() => this.stopFault(id), durationMs);
    return id;
  }

  /** 模拟 CPU 尖峰（通过密集计算） */
  async cpuSpike(durationMs = 5000, cores = 1): Promise<void> {
    this.emit('faultTriggered', { type: 'cpu-spike', durationMs, cores });
    const workers = Array.from({ length: cores }, () =>
      new Promise<void>((resolve) => {
        const end = Date.now() + durationMs;
        while (Date.now() < end) {
          Math.random() ** Math.random(); // 无意义计算占用 CPU
        }
        resolve();
      })
    );
    await Promise.all(workers);
  }

  stopFault(id: string): void {
    this.activeFaults.delete(id);
    this.emit('faultStopped', { id });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ===== 使用示例 =====
const injector = new FaultInjector();
injector.on('faultTriggered', (fault) => {
  console.warn('[CHAOS] Fault triggered:', fault);
});

// 在 API 路由中注入延迟
async function fetchUser(userId: string) {
  return injector.injectLatency(
    () => db.users.findById(userId),
    2000,  // 注入 2s 延迟
    0.2    // 20% 概率
  );
}
```

## 4. 游戏日（Game Day）

有组织的混沌实验标准化流程：

- **提前通知相关团队**（设置值班与升级路径）
- **设定明确的实验范围、成功标准和回滚条件**
- **实时监控业务指标**（SLI/SLO 仪表盘）
- **实验结束后复盘总结**（更新运行手册与自动化检测）

## 5. 与相邻模块的关系

- **70-distributed-systems**: 分布式系统故障模型
- **74-observability**: 实验期间的监控
- **28-testing-advanced**: 混沌测试的理论基础

## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Principles of Chaos Engineering | 论文 | [principlesofchaos.org](https://principlesofchaos.org) — Netflix 原始定义 |
| Chaos Monkey (Netflix) | 工具 | [github.com/Netflix/chaosmonkey](https://github.com/Netflix/chaosmonkey) |
| Chaos Mesh | 工具 | [chaos-mesh.org](https://chaos-mesh.org) — Kubernetes 原生混沌工程 |
| Gremlin | 平台 | [gremlin.com](https://www.gremlin.com) — 企业级混沌工程 SaaS |
| Litmus | 工具 | [litmuschaos.io](https://litmuschaos.io) — CNCF 混沌工程沙箱项目 |
| AWS Fault Injection Simulator | 服务 | [aws.amazon.com/fis](https://aws.amazon.com/fis/) |
| Azure Chaos Studio | 服务 | [azure.microsoft.com/services/chaos-studio](https://azure.microsoft.com/en-us/services/chaos-studio/) |
| Google SRE Book — Testing | 书籍 | [sre.google/sre-book/testing-reliability](https://sre.google/sre-book/testing-reliability/) |

---

*最后更新: 2026-04-29*
