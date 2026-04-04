/**
 * @file 模型服务实现
 * @category ML Engineering → Model Serving
 * @difficulty hard
 * @tags ml-engineering, model-serving, inference, model-deployment
 *
 * @description
 * 高性能模型服务系统，支持多模型管理、A/B测试、金丝雀发布和推理优化。
 *
 * 核心功能：
 * - 模型版本管理: 支持多版本共存、灰度发布
 * - 推理优化: 批处理、缓存、预/后处理流水线
 * - 负载均衡: 按延迟、容量、健康状态路由
 * - 模型预热: 预加载模型到内存
 * - 动态扩缩容: 根据负载自动调整实例数
 *
 * 部署策略：
 * - A/B Testing: 流量按比例分配给不同版本
 * - Canary: 渐进式发布新版本
 * - Shadow: 影子流量验证
 * - Blue/Green: 蓝绿部署
 */

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  framework: 'tensorflow' | 'pytorch' | 'onnx' | 'sklearn' | 'xgboost' | 'custom';
  path: string;
  inputShape: number[];
  outputShape: number[];
  metadata: {
    accuracy: number;
    latency: number; // P99 latency in ms
    size: number; // Model size in bytes
    createdAt: number;
    description?: string;
  };
  status: 'loading' | 'ready' | 'error' | 'unloading';
}

export interface InferenceRequest {
  id: string;
  modelName: string;
  modelVersion?: string; // 未指定则使用默认版本
  inputs: Record<string, number[] | number[][]>;
  context?: {
    priority?: number;
    timeout?: number;
    traceId?: string;
  };
}

export interface InferenceResponse {
  requestId: string;
  modelId: string;
  modelVersion: string;
  outputs: Record<string, number[] | number[][]>;
  latency: number;
  timestamp: number;
}

export interface ModelInstance {
  id: string;
  version: ModelVersion;
  loadTime: number;
  lastUsed: number;
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  healthy: boolean;
  memoryUsage: number;
}

export type DeploymentStrategy = 'direct' | 'canary' | 'ab-test' | 'shadow';

export interface DeploymentConfig {
  strategy: DeploymentStrategy;
  versions: Array<{
    version: string;
    trafficPercent: number;
  }>;
  shadowVersion?: string; // 用于影子流量
}

// ==================== 模型管理器 ====================

export class ModelManager {
  private models: Map<string, Map<string, ModelVersion>> = new Map(); // name -> version -> model
  private instances: Map<string, ModelInstance> = new Map();
  private deployments: Map<string, DeploymentConfig> = new Map(); // modelName -> config

  /**
   * 注册模型版本
   */
  registerModel(model: ModelVersion): void {
    if (!this.models.has(model.name)) {
      this.models.set(model.name, new Map());
    }
    
    this.models.get(model.name)!.set(model.version, model);
    console.log(`[ModelManager] Registered ${model.name} v${model.version}`);
  }

  /**
   * 获取模型版本
   */
  getModel(name: string, version?: string): ModelVersion | undefined {
    const versions = this.models.get(name);
    if (!versions) return undefined;

    if (version) {
      return versions.get(version);
    }

    // 返回最新版本
    return Array.from(versions.values()).sort((a, b) => 
      b.metadata.createdAt - a.metadata.createdAt
    )[0];
  }

  /**
   * 创建模型实例
   */
  createInstance(model: ModelVersion): ModelInstance {
    const instance: ModelInstance = {
      id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      version: model,
      loadTime: Date.now(),
      lastUsed: Date.now(),
      requestCount: 0,
      errorCount: 0,
      averageLatency: 0,
      healthy: true,
      memoryUsage: 0
    };

    this.instances.set(instance.id, instance);
    model.status = 'ready';
    
    console.log(`[ModelManager] Created instance ${instance.id} for ${model.name} v${model.version}`);
    return instance;
  }

  /**
   * 配置部署策略
   */
  configureDeployment(modelName: string, config: DeploymentConfig): void {
    // 验证配置
    const totalTraffic = config.versions.reduce((sum, v) => sum + v.trafficPercent, 0);
    if (totalTraffic !== 100) {
      throw new Error(`Traffic percentages must sum to 100, got ${totalTraffic}`);
    }

    this.deployments.set(modelName, config);
    console.log(`[ModelManager] Configured ${config.strategy} deployment for ${modelName}`);
  }

  /**
   * 选择模型版本进行推理
   */
  selectVersion(modelName: string, context?: Record<string, string>): { version: string; isShadow?: boolean } {
    const deployment = this.deployments.get(modelName);
    
    if (!deployment || deployment.strategy === 'direct') {
      const model = this.getModel(modelName);
      return { version: model?.version || 'latest' };
    }

    // 根据策略选择版本
    switch (deployment.strategy) {
      case 'canary':
      case 'ab-test':
        return this.selectByTraffic(deployment);
      
      case 'shadow':
        const primary = this.selectByTraffic(deployment);
        return { ...primary, isShadow: false };
      
      default:
        return { version: deployment.versions[0]?.version || 'latest' };
    }
  }

  private selectByTraffic(deployment: DeploymentConfig): { version: string } {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const v of deployment.versions) {
      cumulative += v.trafficPercent;
      if (random <= cumulative) {
        return { version: v.version };
      }
    }

    return { version: deployment.versions[deployment.versions.length - 1]?.version || 'latest' };
  }

  /**
   * 获取健康的实例
   */
  getHealthyInstances(modelName: string, version?: string): ModelInstance[] {
    return Array.from(this.instances.values()).filter(inst => 
      inst.version.name === modelName &&
      (version === undefined || inst.version.version === version) &&
      inst.healthy
    );
  }

  /**
   * 更新实例指标
   */
  updateInstanceMetrics(instanceId: string, latency: number, error: boolean): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.lastUsed = Date.now();
    instance.requestCount++;
    
    if (error) {
      instance.errorCount++;
    }

    // 更新平均延迟（指数移动平均）
    instance.averageLatency = instance.averageLatency * 0.9 + latency * 0.1;

    // 健康检查
    if (instance.requestCount > 10) {
      const errorRate = instance.errorCount / instance.requestCount;
      instance.healthy = errorRate < 0.1; // 错误率 < 10%
    }
  }

  /**
   * 卸载模型实例
   */
  unloadInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.version.status = 'unloading';
    this.instances.delete(instanceId);
    
    console.log(`[ModelManager] Unloaded instance ${instanceId}`);
  }

  /**
   * 获取所有模型列表
   */
  listModels(): Array<{ name: string; versions: string[]; defaultVersion?: string }> {
    return Array.from(this.models.entries()).map(([name, versions]) => ({
      name,
      versions: Array.from(versions.keys()),
      defaultVersion: this.getModel(name)?.version
    }));
  }
}

// ==================== 推理引擎 ====================

export class InferenceEngine {
  private manager: ModelManager;
  private cache: Map<string, { result: InferenceResponse; timestamp: number }> = new Map();
  private cacheTtlMs = 60000;
  private batchQueue: Array<{ request: InferenceRequest; resolve: (value: InferenceResponse) => void }> = [];
  private batchSize = 32;
  private batchTimeoutMs = 10;

  constructor(manager: ModelManager) {
    this.manager = manager;
    this.startBatchProcessor();
  }

  /**
   * 执行推理
   */
  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = performance.now();
    
    // 检查缓存
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return { ...cached.result, latency: 0 }; // 缓存命中延迟为0
    }

    // 选择模型版本
    const selection = this.manager.selectVersion(request.modelName, request.context as Record<string, string>);
    const model = this.manager.getModel(request.modelName, selection.version);

    if (!model) {
      throw new Error(`Model ${request.modelName} v${selection.version} not found`);
    }

    // 获取或创建实例
    let instances = this.manager.getHealthyInstances(request.modelName, selection.version);
    if (instances.length === 0) {
      const instance = this.manager.createInstance(model);
      instances = [instance];
    }

    // 选择最优实例（最少连接）
    const instance = instances.sort((a, b) => a.requestCount - b.requestCount)[0];

    // 执行推理
    try {
      const result = await this.executeInference(instance, request);
      const latency = performance.now() - startTime;

      const response: InferenceResponse = {
        requestId: request.id,
        modelId: model.id,
        modelVersion: model.version,
        outputs: result,
        latency,
        timestamp: Date.now()
      };

      // 更新实例指标
      this.manager.updateInstanceMetrics(instance.id, latency, false);

      // 缓存结果
      this.cache.set(cacheKey, { result: response, timestamp: Date.now() });

      // 影子流量处理
      if (!selection.isShadow) {
        this.handleShadowTraffic(request, selection.version);
      }

      return response;
    } catch (error) {
      this.manager.updateInstanceMetrics(instance.id, performance.now() - startTime, true);
      throw error;
    }
  }

  /**
   * 批量推理
   */
  async batchInfer(requests: InferenceRequest[]): Promise<InferenceResponse[]> {
    return Promise.all(requests.map(req => this.infer(req)));
  }

  /**
   * 动态批处理（请求合并）
   */
  enqueueForBatch(request: InferenceRequest): Promise<InferenceResponse> {
    return new Promise((resolve) => {
      this.batchQueue.push({ request, resolve });

      if (this.batchQueue.length >= this.batchSize) {
        this.processBatch();
      }
    });
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.processBatch();
      }
    }, this.batchTimeoutMs);
  }

  private processBatch(): void {
    const batch = this.batchQueue.splice(0, this.batchSize);
    if (batch.length === 0) return;

    // 执行批量推理
    // 实际实现中会合并输入张量进行批量推理
    for (const item of batch) {
      this.infer(item.request).then(item.resolve);
    }
  }

  private async executeInference(
    instance: ModelInstance,
    request: InferenceRequest
  ): Promise<Record<string, number[] | number[][]>> {
    // 模拟推理延迟
    await new Promise(r => setTimeout(r, instance.version.metadata.latency * (0.5 + Math.random())));

    // 模拟输出
    const outputs: Record<string, number[] | number[][]> = {};
    const outputShape = instance.version.outputShape;
    
    for (let i = 0; i < outputShape[0]; i++) {
      outputs[`output_${i}`] = Array.from({ length: outputShape[1] || 1 }, () => Math.random());
    }

    return outputs;
  }

  private generateCacheKey(request: InferenceRequest): string {
    const inputsHash = JSON.stringify(request.inputs);
    return `${request.modelName}:${request.modelVersion || 'latest'}:${inputsHash}`;
  }

  private handleShadowTraffic(request: InferenceRequest, primaryVersion: string): void {
    const deployment = this.manager['deployments'].get(request.modelName);
    if (!deployment?.shadowVersion || deployment.shadowVersion === primaryVersion) {
      return;
    }

    // 异步执行影子推理（不等待结果）
    const shadowRequest: InferenceRequest = {
      ...request,
      id: `${request.id}-shadow`
    };

    this.infer(shadowRequest).then(response => {
      console.log(`[Shadow] ${request.modelName} v${deployment.shadowVersion} latency: ${response.latency.toFixed(2)}ms`);
    }).catch(err => {
      console.log(`[Shadow] ${request.modelName} v${deployment.shadowVersion} error:`, err.message);
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ==================== 模型预热器 ====================

export class ModelWarmer {
  constructor(private manager: ModelManager, private engine: InferenceEngine) {}

  /**
   * 预热模型
   */
  async warmUp(modelName: string, version?: string): Promise<void> {
    const model = this.manager.getModel(modelName, version);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    console.log(`[ModelWarmer] Warming up ${modelName} v${model.version}`);

    // 创建实例
    const instance = this.manager.createInstance(model);

    // 执行预热推理
    const warmUpRequest: InferenceRequest = {
      id: `warmup-${Date.now()}`,
      modelName: model.name,
      modelVersion: model.version,
      inputs: this.generateWarmUpInputs(model.inputShape)
    };

    try {
      await this.engine.infer(warmUpRequest);
      console.log(`[ModelWarmer] ${modelName} v${model.version} is ready`);
    } catch (error) {
      console.error(`[ModelWarmer] Failed to warm up ${modelName}:`, error);
      model.status = 'error';
    }
  }

  private generateWarmUpInputs(shape: number[]): Record<string, number[]> {
    const size = shape.reduce((a, b) => a * b, 1);
    return {
      input: Array.from({ length: size }, () => Math.random())
    };
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 模型服务 ===\n');

  const manager = new ModelManager();

  // 注册模型版本
  console.log('--- 注册模型 ---');
  
  const modelV1: ModelVersion = {
    id: 'model-1',
    name: 'sentiment-classifier',
    version: '1.0.0',
    framework: 'tensorflow',
    path: '/models/sentiment/v1',
    inputShape: [1, 128],
    outputShape: [1, 3], // negative, neutral, positive
    metadata: {
      accuracy: 0.85,
      latency: 50,
      size: 1024 * 1024 * 10,
      createdAt: Date.now() - 86400000
    },
    status: 'loading'
  };

  const modelV2: ModelVersion = {
    id: 'model-2',
    name: 'sentiment-classifier',
    version: '2.0.0',
    framework: 'pytorch',
    path: '/models/sentiment/v2',
    inputShape: [1, 128],
    outputShape: [1, 3],
    metadata: {
      accuracy: 0.92,
      latency: 40,
      size: 1024 * 1024 * 15,
      createdAt: Date.now()
    },
    status: 'loading'
  };

  manager.registerModel(modelV1);
  manager.registerModel(modelV2);

  console.log('Registered models:', manager.listModels());

  // 配置金丝雀部署
  console.log('\n--- 配置金丝雀部署 ---');
  manager.configureDeployment('sentiment-classifier', {
    strategy: 'canary',
    versions: [
      { version: '1.0.0', trafficPercent: 90 },
      { version: '2.0.0', trafficPercent: 10 }
    ]
  });

  // 预热模型
  console.log('\n--- 模型预热 ---');
  const engine = new InferenceEngine(manager);
  const warmer = new ModelWarmer(manager, engine);
  
  warmer.warmUp('sentiment-classifier', '1.0.0');

  // 执行推理
  console.log('\n--- 执行推理 ---');
  
  async function runInference() {
    const versionCounts = { '1.0.0': 0, '2.0.0': 0 };
    
    for (let i = 0; i < 20; i++) {
      const request: InferenceRequest = {
        id: `req-${i}`,
        modelName: 'sentiment-classifier',
        inputs: {
          text: Array.from({ length: 128 }, () => Math.random())
        },
        context: {
          priority: 1,
          timeout: 5000
        }
      };

      try {
        const response = await engine.infer(request);
        versionCounts[response.modelVersion as keyof typeof versionCounts]++;
        console.log(`Request ${i}: v${response.modelVersion}, latency=${response.latency.toFixed(2)}ms`);
      } catch (error) {
        console.log(`Request ${i}: ERROR - ${(error as Error).message}`);
      }
    }

    console.log('\nTraffic distribution:', versionCounts);
  }

  runInference();

  // A/B测试配置
  console.log('\n--- A/B测试配置 ---');
  manager.configureDeployment('sentiment-classifier', {
    strategy: 'ab-test',
    versions: [
      { version: '1.0.0', trafficPercent: 50 },
      { version: '2.0.0', trafficPercent: 50 }
    ]
  });
  console.log('A/B test configured: 50/50 split');
}
