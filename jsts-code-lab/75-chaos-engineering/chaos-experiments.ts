/**
 * @file 混沌实验
 * @category Chaos Engineering → Experiments
 * @difficulty hard
 * @tags chaos-engineering, fault-injection, resilience-testing
 */

export interface ChaosExperiment {
  id: string;
  name: string;
  target: {
    type: 'service' | 'node' | 'network';
    selector: string;
  };
  faults: Fault[];
  duration: number;
  blastRadius: number; // 百分比
}

export interface Fault {
  type: 'latency' | 'error' | 'cpu' | 'memory' | 'network' | 'kill';
  config: Record<string, unknown>;
}

export interface ExperimentResult {
  experimentId: string;
  startTime: number;
  endTime: number;
  status: 'running' | 'completed' | 'stopped' | 'failed';
  observations: Observation[];
  hypothesisValidated: boolean;
}

export interface Observation {
  timestamp: number;
  metric: string;
  value: number;
  expected: number;
  withinThreshold: boolean;
}

// 混沌实验控制器
export class ChaosController {
  private experiments: Map<string, ChaosExperiment> = new Map();
  private results: Map<string, ExperimentResult> = new Map();
  private activeFaults: Map<string, () => void> = new Map();
  
  createExperiment(config: Omit<ChaosExperiment, 'id'>): ChaosExperiment {
    const experiment: ChaosExperiment = {
      ...config,
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    };
    
    this.experiments.set(experiment.id, experiment);
    console.log(`[Chaos] 实验创建: ${experiment.name} (${experiment.id})`);
    return experiment;
  }
  
  async runExperiment(experimentId: string): Promise<ExperimentResult> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error('Experiment not found');
    
    const result: ExperimentResult = {
      experimentId,
      startTime: Date.now(),
      endTime: 0,
      status: 'running',
      observations: [],
      hypothesisValidated: false
    };
    
    this.results.set(experimentId, result);
    
    console.log(`[Chaos] 实验开始: ${experiment.name}`);
    console.log(`[Chaos] 目标: ${experiment.target.type}/${experiment.target.selector}`);
    console.log(`[Chaos] 持续时间: ${experiment.duration}ms`);
    
    // 注入故障
    for (const fault of experiment.faults) {
      const stopFault = this.injectFault(fault);
      this.activeFaults.set(`${experimentId}-${fault.type}`, stopFault);
    }
    
    // 运行实验
    await this.delay(experiment.duration);
    
    // 停止故障
    this.stopExperiment(experimentId);
    
    result.endTime = Date.now();
    result.status = 'completed';
    
    // 验证假设
    result.hypothesisValidated = this.validateHypothesis(result);
    
    console.log(`[Chaos] 实验完成: ${experiment.name}`);
    console.log(`[Chaos] 假设验证: ${result.hypothesisValidated ? '通过' : '失败'}`);
    
    return result;
  }
  
  stopExperiment(experimentId: string): void {
    // 停止所有相关故障
    for (const [key, stopFn] of this.activeFaults) {
      if (key.startsWith(experimentId)) {
        stopFn();
        this.activeFaults.delete(key);
      }
    }
    
    const result = this.results.get(experimentId);
    if (result && result.status === 'running') {
      result.status = 'stopped';
      result.endTime = Date.now();
    }
  }
  
  private injectFault(fault: Fault): () => void {
    console.log(`[Chaos] 注入故障: ${fault.type}`, fault.config);
    
    switch (fault.type) {
      case 'latency':
        return this.injectLatency(fault.config);
      case 'error':
        return this.injectError(fault.config);
      case 'cpu':
        return this.injectCPULoad(fault.config);
      case 'memory':
        return this.injectMemoryPressure(fault.config);
      case 'network':
        return this.injectNetworkPartition(fault.config);
      case 'kill':
        return this.injectProcessKill(fault.config);
      default:
        return () => {};
    }
  }
  
  private injectLatency(config: Record<string, unknown>): () => void {
    const delay = (config.delay as number) || 100;
    const jitter = (config.jitter as number) || 0;
    
    // 模拟：拦截请求并添加延迟
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args) => {
      const actualDelay = delay + (Math.random() * jitter - jitter / 2);
      await this.delay(actualDelay);
      return originalFetch(...args);
    };
    
    return () => {
      globalThis.fetch = originalFetch;
    };
  }
  
  private injectError(config: Record<string, unknown>): () => void {
    const rate = (config.rate as number) || 0.1;
    const errorCode = (config.code as number) || 500;
    
    let requestCount = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args) => {
      requestCount++;
      if (Math.random() < rate) {
        throw new Error(`Injected error: HTTP ${errorCode}`);
      }
      return originalFetch(...args);
    };
    
    return () => {
      globalThis.fetch = originalFetch;
    };
  }
  
  private injectCPULoad(config: Record<string, unknown>): () => void {
    const duration = (config.duration as number) || 5000;
    const intensity = (config.intensity as number) || 0.8;
    
    const interval = setInterval(() => {
      const start = Date.now();
      while (Date.now() - start < 100 * intensity) {
        //  busy loop
        Math.random() * Math.random();
      }
    }, 100);
    
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, duration);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }
  
  private injectMemoryPressure(config: Record<string, unknown>): () => void {
    const size = (config.size as number) || 100 * 1024 * 1024; // 100MB
    const arrays: number[][] = [];
    
    const interval = setInterval(() => {
      // 分配内存
      const arr = new Array(Math.floor(size / 8 / 10)).fill(0);
      arrays.push(arr);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      arrays.length = 0; // 释放引用
    };
  }
  
  private injectNetworkPartition(config: Record<string, unknown>): () => void {
    const targets = (config.targets as string[]) || [];
    
    console.log(`[Chaos] 网络分区: 隔离 ${targets.join(', ')}`);
    
    return () => {
      console.log('[Chaos] 网络分区恢复');
    };
  }
  
  private injectProcessKill(config: Record<string, unknown>): () => void {
    const delay = (config.delay as number) || 0;
    
    const timeout = setTimeout(() => {
      console.log('[Chaos] 进程将被终止');
      // 实际实现中会调用 process.exit
    }, delay);
    
    return () => {
      clearTimeout(timeout);
    };
  }
  
  private validateHypothesis(result: ExperimentResult): boolean {
    // 简化的假设验证
    // 真实场景会检查系统可用性、错误率等指标
    const errorObservations = result.observations.filter(o => 
      o.metric.includes('error') && !o.withinThreshold
    );
    
    return errorObservations.length === 0;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getExperimentHistory(): ExperimentResult[] {
    return Array.from(this.results.values())
      .sort((a, b) => b.startTime - a.startTime);
  }
}

// 自动停止机制 (Safety)
export class SafetyMonitor {
  private thresholds: Map<string, { metric: string; max: number; min?: number }> = new Map();
  private abortCallbacks: Array<() => void> = [];
  
  addThreshold(name: string, metric: string, max: number, min?: number): void {
    this.thresholds.set(name, { metric, max, min });
  }
  
  monitor(metrics: Record<string, number>): boolean {
    for (const [name, threshold] of this.thresholds) {
      const value = metrics[threshold.metric];
      if (value === undefined) continue;
      
      if (value > threshold.max) {
        console.log(`[Safety] 阈值告警: ${name} = ${value} (max: ${threshold.max})`);
        this.triggerAbort();
        return false;
      }
      
      if (threshold.min !== undefined && value < threshold.min) {
        console.log(`[Safety] 阈值告警: ${name} = ${value} (min: ${threshold.min})`);
        this.triggerAbort();
        return false;
      }
    }
    
    return true;
  }
  
  onAbort(callback: () => void): void {
    this.abortCallbacks.push(callback);
  }
  
  private triggerAbort(): void {
    for (const callback of this.abortCallbacks) {
      callback();
    }
  }
}

// 游戏日演练 (Game Day)
export class GameDay {
  private scenarios: Map<string, ChaosExperiment[]> = new Map();
  
  addScenario(name: string, experiments: ChaosExperiment[]): void {
    this.scenarios.set(name, experiments);
  }
  
  async runScenario(name: string, controller: ChaosController): Promise<{
    scenario: string;
    results: ExperimentResult[];
    overallSuccess: boolean;
  }> {
    const experiments = this.scenarios.get(name);
    if (!experiments) throw new Error('Scenario not found');
    
    console.log(`[GameDay] 开始场景: ${name}`);
    console.log(`[GameDay] 包含 ${experiments.length} 个实验`);
    
    const results: ExperimentResult[] = [];
    
    for (const exp of experiments) {
      const result = await controller.runExperiment(exp.id);
      results.push(result);
    }
    
    const overallSuccess = results.every(r => r.hypothesisValidated);
    
    console.log(`[GameDay] 场景完成: ${overallSuccess ? '成功' : '失败'}`);
    
    return { scenario: name, results, overallSuccess };
  }
}

export function demo(): void {
  console.log('=== 混沌工程 ===\n');
  
  const controller = new ChaosController();
  
  // 创建延迟实验
  const latencyExp = controller.createExperiment({
    name: 'API延迟测试',
    target: { type: 'service', selector: 'payment-service' },
    faults: [{
      type: 'latency',
      config: { delay: 500, jitter: 200 }
    }],
    duration: 30000,
    blastRadius: 25
  });
  
  // 创建错误注入实验
  const errorExp = controller.createExperiment({
    name: '数据库错误注入',
    target: { type: 'service', selector: 'database' },
    faults: [{
      type: 'error',
      config: { rate: 0.1, code: 503 }
    }],
    duration: 60000,
    blastRadius: 10
  });
  
  console.log(`\n创建实验:`);
  console.log(`  1. ${latencyExp.name} (${latencyExp.id})`);
  console.log(`  2. ${errorExp.name} (${errorExp.id})`);
  
  // 安全监控
  console.log('\n--- 安全监控 ---');
  const safety = new SafetyMonitor();
  safety.addThreshold('error-rate', 'error_rate', 0.05);
  safety.addThreshold('availability', 'availability', 1, 0.99);
  
  safety.onAbort(() => {
    console.log('[Safety] 触发自动停止');
    controller.stopExperiment(latencyExp.id);
  });
  
  // 模拟监控
  safety.monitor({ error_rate: 0.02, availability: 0.995 }); // 正常
  safety.monitor({ error_rate: 0.08, availability: 0.995 }); // 触发告警
  
  // Game Day
  console.log('\n--- Game Day演练 ---');
  const gameDay = new GameDay();
  
  gameDay.addScenario('周末故障演练', [latencyExp, errorExp]);
  
  console.log('场景列表:', Array.from(gameDay['scenarios'].keys()));
}
