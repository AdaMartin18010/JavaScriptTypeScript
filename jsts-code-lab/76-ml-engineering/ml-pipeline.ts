/**
 * @file ML流水线
 * @category ML Engineering → Pipeline
 * @difficulty hard
 * @tags ml-engineering, feature-engineering, model-serving, inference
 */

export interface Feature {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'embedding';
  value: unknown;
  timestamp: number;
}

export interface Model {
  id: string;
  name: string;
  version: string;
  framework: 'tensorflow' | 'pytorch' | 'sklearn' | 'onnx';
  features: string[];
  metrics: { accuracy?: number; f1?: number; latency?: number };
}

// 特征存储
export class FeatureStore {
  private onlineStore = new Map<string, Feature>();
  private offlineStore = new Map<string, Feature[]>();
  
  // 实时特征（在线）
  setOnlineFeature(entityId: string, feature: Feature): void {
    const key = `${entityId}:${feature.name}`;
    this.onlineStore.set(key, feature);
  }
  
  getOnlineFeature(entityId: string, featureName: string): Feature | undefined {
    return this.onlineStore.get(`${entityId}:${featureName}`);
  }
  
  getOnlineFeatures(entityId: string, featureNames: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const name of featureNames) {
      const feature = this.getOnlineFeature(entityId, name);
      if (feature) {
        result[name] = feature.value;
      }
    }
    
    return result;
  }
  
  // 批量特征（离线）
  appendOfflineFeature(entityId: string, feature: Feature): void {
    if (!this.offlineStore.has(entityId)) {
      this.offlineStore.set(entityId, []);
    }
    this.offlineStore.get(entityId)!.push(feature);
  }
  
  getOfflineFeatures(entityId: string, featureName: string, timeRange: [number, number]): Feature[] {
    const features = this.offlineStore.get(entityId) || [];
    return features.filter(f => 
      f.name === featureName && 
      f.timestamp >= timeRange[0] && 
      f.timestamp <= timeRange[1]
    );
  }
  
  // 特征转换
  transform(feature: Feature, transform: 'normalize' | 'onehot' | 'bucketize'): Feature {
    switch (transform) {
      case 'normalize':
        // 简化：假设值已经在0-1范围
        return { ...feature, value: Number(feature.value) };
        
      case 'onehot':
        // 分类变量转one-hot
        const categories = feature.value as string[];
        const onehot: Record<string, number> = {};
        for (const cat of categories) {
          onehot[`${feature.name}_${cat}`] = 1;
        }
        return { ...feature, value: onehot };
        
      case 'bucketize':
        // 数值分桶
        const value = Number(feature.value);
        let bucket = 'low';
        if (value > 0.33) bucket = 'medium';
        if (value > 0.66) bucket = 'high';
        return { ...feature, value: bucket };
        
      default:
        return feature;
    }
  }
}

// 模型注册表
export class ModelRegistry {
  private models = new Map<string, Model[]>();
  private productionModel = new Map<string, string>();
  
  register(model: Model): void {
    if (!this.models.has(model.name)) {
      this.models.set(model.name, []);
    }
    this.models.get(model.name)!.push(model);
    
    console.log(`[ML] 模型注册: ${model.name} v${model.version}`);
  }
  
  getModel(name: string, version?: string): Model | undefined {
    const versions = this.models.get(name);
    if (!versions) return undefined;
    
    if (version) {
      return versions.find(m => m.version === version);
    }
    
    return versions[versions.length - 1]; // 返回最新版本
  }
  
  promoteToProduction(name: string, version: string): void {
    const model = this.getModel(name, version);
    if (!model) throw new Error('Model not found');
    
    this.productionModel.set(name, version);
    console.log(`[ML] 模型 ${name} v${version} 已上线生产环境`);
  }
  
  getProductionModel(name: string): Model | undefined {
    const version = this.productionModel.get(name);
    return version ? this.getModel(name, version) : undefined;
  }
  
  listModels(): { name: string; versions: string[]; production?: string }[] {
    return Array.from(this.models.entries()).map(([name, models]) => ({
      name,
      versions: models.map(m => m.version),
      production: this.productionModel.get(name)
    }));
  }
}

// 模型服务
export class ModelServer {
  private models = new Map<string, (features: Record<string, unknown>) => unknown>();
  private predictions: { modelId: string; input: unknown; output: unknown; latency: number; timestamp: number }[] = [];
  
  loadModel(model: Model, inferenceFn: (features: Record<string, unknown>) => unknown): void {
    this.models.set(model.id, inferenceFn);
    console.log(`[ML] 模型加载: ${model.name} v${model.version}`);
  }
  
  async predict(modelId: string, features: Record<string, unknown>): Promise<{
    prediction: unknown;
    confidence?: number;
    latency: number;
  }> {
    const model = this.models.get(modelId);
    if (!model) throw new Error('Model not loaded');
    
    const start = Date.now();
    const result = model(features);
    const latency = Date.now() - start;
    
    this.predictions.push({
      modelId,
      input: features,
      output: result,
      latency,
      timestamp: Date.now()
    });
    
    // 保留最近1000条预测记录
    if (this.predictions.length > 1000) {
      this.predictions.shift();
    }
    
    return {
      prediction: result,
      confidence: Math.random() * 0.2 + 0.8, // 模拟置信度
      latency
    };
  }
  
  getPredictionStats(modelId: string): { count: number; avgLatency: number; p99Latency: number } {
    const preds = this.predictions.filter(p => p.modelId === modelId);
    if (preds.length === 0) {
      return { count: 0, avgLatency: 0, p99Latency: 0 };
    }
    
    const latencies = preds.map(p => p.latency).sort((a, b) => a - b);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    
    return {
      count: preds.length,
      avgLatency: avg,
      p99Latency: p99
    };
  }
}

// 影子流量测试
export class ShadowTesting {
  private shadowModels = new Map<string, string>(); // production -> shadow
  private results: {
    production: unknown;
    shadow: unknown;
    diff: number;
    timestamp: number;
  }[] = [];
  
  enableShadow(productionModelId: string, shadowModelId: string): void {
    this.shadowModels.set(productionModelId, shadowModelId);
    console.log(`[ML] 影子测试: ${productionModelId} -> ${shadowModelId}`);
  }
  
  async compare(productionModelId: string, features: Record<string, unknown>): Promise<void> {
    const shadowModelId = this.shadowModels.get(productionModelId);
    if (!shadowModelId) return;
    
    // 实际场景中这里会调用两个模型
    const productionResult = { prediction: Math.random() };
    const shadowResult = { prediction: Math.random() };
    
    const diff = Math.abs(Number(productionResult.prediction) - Number(shadowResult.prediction));
    
    this.results.push({
      production: productionResult,
      shadow: shadowResult,
      diff,
      timestamp: Date.now()
    });
    
    if (diff > 0.1) {
      console.log(`[Shadow] 差异警报: diff=${diff.toFixed(4)}`);
    }
  }
  
  getComparisonReport(): { avgDiff: number; maxDiff: number; samples: number } {
    if (this.results.length === 0) {
      return { avgDiff: 0, maxDiff: 0, samples: 0 };
    }
    
    const diffs = this.results.map(r => r.diff);
    return {
      avgDiff: diffs.reduce((a, b) => a + b, 0) / diffs.length,
      maxDiff: Math.max(...diffs),
      samples: this.results.length
    };
  }
}

// 特征监控
export class FeatureMonitoring {
  private distributions = new Map<string, number[]>();
  private alerts: { feature: string; type: string; severity: string }[] = [];
  
  record(featureName: string, value: number): void {
    if (!this.distributions.has(featureName)) {
      this.distributions.set(featureName, []);
    }
    
    const dist = this.distributions.get(featureName)!;
    dist.push(value);
    
    // 保留最近10000个值
    if (dist.length > 10000) {
      dist.shift();
    }
    
    // 简单漂移检测
    this.detectDrift(featureName, dist);
  }
  
  private detectDrift(featureName: string, values: number[]): void {
    if (values.length < 1000) return;
    
    // 计算近期和远期的统计差异
    const recent = values.slice(-100);
    const older = values.slice(-1000, -100);
    
    const recentMean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderMean = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = Math.abs(recentMean - olderMean);
    const threshold = olderMean * 0.1; // 10%阈值
    
    if (diff > threshold) {
      this.alerts.push({
        feature: featureName,
        type: 'drift',
        severity: 'warning'
      });
      console.log(`[FeatureMonitor] 特征漂移检测: ${featureName} (diff=${diff.toFixed(4)})`);
    }
  }
  
  getAlerts(): { feature: string; type: string; severity: string }[] {
    return [...this.alerts];
  }
}

export function demo(): void {
  console.log('=== 机器学习工程 ===\n');
  
  // 特征存储
  const featureStore = new FeatureStore();
  
  // 设置实时特征
  featureStore.setOnlineFeature('user-123', {
    name: 'last_login_hours',
    type: 'numeric',
    value: 2.5,
    timestamp: Date.now()
  });
  
  featureStore.setOnlineFeature('user-123', {
    name: 'subscription_type',
    type: 'categorical',
    value: 'premium',
    timestamp: Date.now()
  });
  
  const features = featureStore.getOnlineFeatures('user-123', [
    'last_login_hours',
    'subscription_type'
  ]);
  console.log('在线特征:', features);
  
  // 特征转换
  const rawFeature: Feature = {
    name: 'engagement_score',
    type: 'numeric',
    value: 0.75,
    timestamp: Date.now()
  };
  
  const bucketized = featureStore.transform(rawFeature, 'bucketize');
  console.log('分桶结果:', bucketized.value);
  
  // 模型注册表
  console.log('\n--- 模型管理 ---');
  const registry = new ModelRegistry();
  
  const modelV1: Model = {
    id: 'model-1',
    name: 'churn-predictor',
    version: '1.0.0',
    framework: 'sklearn',
    features: ['last_login_hours', 'subscription_type'],
    metrics: { accuracy: 0.85, f1: 0.82 }
  };
  
  const modelV2: Model = {
    id: 'model-2',
    name: 'churn-predictor',
    version: '2.0.0',
    framework: 'pytorch',
    features: ['last_login_hours', 'subscription_type', 'engagement_score'],
    metrics: { accuracy: 0.91, f1: 0.89 }
  };
  
  registry.register(modelV1);
  registry.register(modelV2);
  registry.promoteToProduction('churn-predictor', '2.0.0');
  
  console.log('模型列表:', registry.listModels());
  
  // 模型服务
  console.log('\n--- 模型服务 ---');
  const server = new ModelServer();
  
  server.loadModel(modelV2, (features) => {
    // 模拟推理
    const score = Math.random();
    return { churn_probability: score, will_churn: score > 0.5 };
  });
  
  server.predict('model-2', features).then(result => {
    console.log('预测结果:', result.prediction);
    console.log('延迟:', result.latency, 'ms');
  });
  
  // 特征监控
  console.log('\n--- 特征监控 ---');
  const monitor = new FeatureMonitoring();
  
  // 模拟特征值（正常分布）
  for (let i = 0; i < 1000; i++) {
    monitor.record('user_age', 25 + Math.random() * 10);
  }
  
  // 模拟漂移（值变大）
  for (let i = 0; i < 100; i++) {
    monitor.record('user_age', 60 + Math.random() * 5);
  }
  
  console.log('监控告警:', monitor.getAlerts());
}
