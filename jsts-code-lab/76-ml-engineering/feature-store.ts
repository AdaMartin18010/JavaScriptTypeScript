/**
 * @file 特征存储实现
 * @category ML Engineering → Feature Store
 * @difficulty hard
 * @tags ml-engineering, feature-store, feature-engineering, mlops
 *
 * @description
 * 企业级特征存储，支持在线/离线特征、特征版本管理和实时/批处理特征计算。
 *
 * 特征类型：
 * - 原始特征: 直接从数据源获取
 * - 派生特征: 通过转换计算得到
 * - 聚合特征: 基于时间窗口的统计计算
 * - 嵌入特征: 预训练的向量表示
 *
 * 存储分层：
 * - 在线存储: 低延迟获取，支持点查（Redis/DynamoDB）
 * - 离线存储: 大批量读取，支持分析（S3/HDFS）
 * - 元数据存储: 特征定义、血缘、版本
 *
 * 特征工程：
 * - 标准化/归一化
 * - One-hot/Label 编码
 * - 特征交叉
 * - 缺失值处理
 */

export enum FeatureType {
  NUMERIC = 'numeric',
  CATEGORICAL = 'categorical',
  TEXT = 'text',
  EMBEDDING = 'embedding',
  BOOLEAN = 'boolean',
  TIMESTAMP = 'timestamp',
  ARRAY = 'array'
}

export enum FeatureStorage {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BOTH = 'both'
}

export interface FeatureDefinition {
  name: string;
  type: FeatureType;
  description: string;
  entity: string; // 关联的实体（如 user, item, order）
  storage: FeatureStorage;
  ttl?: number; // 在线缓存 TTL（秒）
  
  // 数据源配置
  source?: {
    type: 'database' | 'stream' | 'file' | 'computed';
    config: Record<string, unknown>;
  };
  
  // 特征工程配置
  transformation?: {
    type: 'none' | 'normalize' | 'bucketize' | 'onehot' | 'embedding' | 'custom';
    config: Record<string, unknown>;
  };
  
  // 验证规则
  validation?: {
    required: boolean;
    min?: number;
    max?: number;
    allowedValues?: unknown[];
    regex?: string;
  };
  
  metadata: {
    owner: string;
    createdAt: number;
    updatedAt: number;
    version: string;
    tags: string[];
  };
}

export interface FeatureValue {
  featureName: string;
  entityId: string;
  value: unknown;
  timestamp: number;
  eventTimestamp?: number; // 事件发生时间（用于 point-in-time 正确性）
  version: string;
}

export interface FeatureVector {
  entityId: string;
  timestamp: number;
  features: Record<string, unknown>;
  missing: string[]; // 缺失的特征列表
}

export interface FeatureQuery {
  entityType: string;
  entityIds: string[];
  featureNames: string[];
  timestamp?: number; // 用于获取历史特征（point-in-time）
}

export interface FeatureStatistics {
  featureName: string;
  count: number;
  nullCount: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  distinctCount?: number;
  histogram?: Array<{ bucket: string; count: number }>;
}

// ==================== 特征注册表 ====================

export class FeatureRegistry {
  private features: Map<string, FeatureDefinition> = new Map();
  private entityFeatures: Map<string, Set<string>> = new Map(); // entity -> feature names

  /**
   * 注册特征定义
   */
  registerFeature(definition: FeatureDefinition): void {
    const key = `${definition.entity}.${definition.name}`;
    this.features.set(key, definition);

    // 更新实体-特征映射
    if (!this.entityFeatures.has(definition.entity)) {
      this.entityFeatures.set(definition.entity, new Set());
    }
    this.entityFeatures.get(definition.entity)!.add(definition.name);

    console.log(`[FeatureRegistry] Registered feature: ${key} v${definition.metadata.version}`);
  }

  /**
   * 获取特征定义
   */
  getFeature(entity: string, name: string): FeatureDefinition | undefined {
    return this.features.get(`${entity}.${name}`);
  }

  /**
   * 获取实体的所有特征
   */
  getEntityFeatures(entity: string): FeatureDefinition[] {
    const names = this.entityFeatures.get(entity);
    if (!names) return [];

    return Array.from(names).map(name => this.getFeature(entity, name)!).filter(Boolean);
  }

  /**
   * 搜索特征
   */
  searchFeatures(query: { entity?: string; type?: FeatureType; tags?: string[] }): FeatureDefinition[] {
    let results = Array.from(this.features.values());

    if (query.entity) {
      results = results.filter(f => f.entity === query.entity);
    }

    if (query.type) {
      results = results.filter(f => f.type === query.type);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(f => 
        query.tags!.some(tag => f.metadata.tags.includes(tag))
      );
    }

    return results;
  }

  /**
   * 获取特征血缘
   */
  getLineage(featureName: string): { 
    upstream: string[]; 
    downstream: string[];
  } {
    const feature = Array.from(this.features.values()).find(f => f.name === featureName);
    if (!feature) return { upstream: [], downstream: [] };

    const upstream: string[] = [];
    if (feature.source?.type === 'computed' && feature.source.config.dependsOn) {
      upstream.push(...(feature.source.config.dependsOn as string[]));
    }

    // 查找下游特征
    const downstream: string[] = [];
    for (const f of this.features.values()) {
      if (f.source?.type === 'computed') {
        const deps = f.source.config.dependsOn as string[] || [];
        if (deps.includes(featureName)) {
          downstream.push(f.name);
        }
      }
    }

    return { upstream, downstream };
  }
}

// ==================== 在线特征存储 ====================

export class OnlineFeatureStore {
  private store: Map<string, FeatureValue> = new Map();
  private ttlTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  private getKey(entityType: string, entityId: string, featureName: string): string {
    return `${entityType}:${entityId}:${featureName}`;
  }

  /**
   * 写入特征值
   */
  write(feature: FeatureValue, ttlSeconds?: number): void {
    const key = this.getKey(feature.entityId.split(':')[0], feature.entityId, feature.featureName);
    
    this.store.set(key, feature);

    // 设置 TTL
    if (ttlSeconds !== undefined && ttlSeconds > 0) {
      const existingTimer = this.ttlTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        this.store.delete(key);
        this.ttlTimers.delete(key);
      }, ttlSeconds * 1000);

      this.ttlTimers.set(key, timer);
    }
  }

  /**
   * 读取特征值
   */
  read(entityType: string, entityId: string, featureName: string): FeatureValue | undefined {
    const key = this.getKey(entityType, entityId, featureName);
    return this.store.get(key);
  }

  /**
   * 批量读取
   */
  batchRead(query: FeatureQuery): Map<string, FeatureValue> {
    const results = new Map<string, FeatureValue>();

    for (const entityId of query.entityIds) {
      for (const featureName of query.featureNames) {
        const value = this.read(query.entityType, entityId, featureName);
        if (value) {
          results.set(`${entityId}:${featureName}`, value);
        }
      }
    }

    return results;
  }

  /**
   * 获取特征向量
   */
  getFeatureVector(query: FeatureQuery): FeatureVector[] {
    const values = this.batchRead(query);
    const vectors: FeatureVector[] = [];

    for (const entityId of query.entityIds) {
      const features: Record<string, unknown> = {};
      const missing: string[] = [];

      for (const featureName of query.featureNames) {
        const key = `${entityId}:${featureName}`;
        const value = values.get(key);

        if (value) {
          features[featureName] = value.value;
        } else {
          missing.push(featureName);
        }
      }

      vectors.push({
        entityId,
        timestamp: Date.now(),
        features,
        missing
      });
    }

    return vectors;
  }

  /**
   * 删除特征值
   */
  delete(entityType: string, entityId: string, featureName: string): void {
    const key = this.getKey(entityType, entityId, featureName);
    this.store.delete(key);

    const timer = this.ttlTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.ttlTimers.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }
    this.ttlTimers.clear();
  }
}

// ==================== 离线特征存储 ====================

export class OfflineFeatureStore {
  private partitions: Map<string, FeatureValue[]> = new Map(); // partition_key -> values

  private getPartitionKey(entityType: string, date: Date): string {
    return `${entityType}/${date.toISOString().split('T')[0]}`;
  }

  /**
   * 写入特征值（批量）
   */
  writeBatch(entityType: string, features: FeatureValue[]): void {
    for (const feature of features) {
      const date = new Date(feature.timestamp);
      const partitionKey = this.getPartitionKey(entityType, date);

      if (!this.partitions.has(partitionKey)) {
        this.partitions.set(partitionKey, []);
      }

      this.partitions.get(partitionKey)!.push(feature);
    }
  }

  /**
   * 查询时间范围特征（Point-in-time 正确性）
   */
  queryTimeRange(
    entityType: string,
    entityIds: string[],
    featureNames: string[],
    startTime: number,
    endTime: number
  ): Map<string, FeatureValue[]> {
    const results = new Map<string, FeatureValue[]>();

    for (const partition of this.partitions.values()) {
      for (const value of partition) {
        const entityId = value.entityId;
        
        if (!entityIds.includes(entityId)) continue;
        if (!featureNames.includes(value.featureName)) continue;
        if (value.timestamp < startTime || value.timestamp > endTime) continue;

        const key = `${entityId}:${value.featureName}`;
        if (!results.has(key)) {
          results.set(key, []);
        }
        results.get(key)!.push(value);
      }
    }

    return results;
  }

  /**
   * 获取指定时间点的特征值（Point-in-time lookup）
   */
  getAtTimePoint(
    entityType: string,
    entityId: string,
    featureName: string,
    timestamp: number
  ): FeatureValue | undefined {
    const allValues = this.queryTimeRange(
      entityType,
      [entityId],
      [featureName],
      0,
      timestamp
    );

    const values = allValues.get(`${entityId}:${featureName}`);
    if (!values || values.length === 0) return undefined;

    // 返回最接近但不超过 timestamp 的值
    return values
      .filter(v => v.timestamp <= timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  /**
   * 计算特征统计信息
   */
  computeStatistics(entityType: string, featureName: string): FeatureStatistics {
    const allValues: number[] = [];
    let nullCount = 0;

    for (const partition of this.partitions.values()) {
      for (const value of partition) {
        if (value.entityId.startsWith(entityType) && value.featureName === featureName) {
          if (value.value === null || value.value === undefined) {
            nullCount++;
          } else if (typeof value.value === 'number') {
            allValues.push(value.value);
          }
        }
      }
    }

    if (allValues.length === 0) {
      return {
        featureName,
        count: 0,
        nullCount,
        mean: undefined,
        std: undefined,
        min: undefined,
        max: undefined
      };
    }

    const sum = allValues.reduce((a, b) => a + b, 0);
    const mean = sum / allValues.length;
    const variance = allValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allValues.length;

    return {
      featureName,
      count: allValues.length + nullCount,
      nullCount,
      mean,
      std: Math.sqrt(variance),
      min: Math.min(...allValues),
      max: Math.max(...allValues)
    };
  }
}

// ==================== 特征转换器 ====================

export class FeatureTransformer {
  /**
   * 标准化 (Z-score normalization)
   */
  static standardize(value: number, mean: number, std: number): number {
    return std === 0 ? 0 : (value - mean) / std;
  }

  /**
   * Min-Max 归一化
   */
  static minMaxNormalize(value: number, min: number, max: number): number {
    return max === min ? 0 : (value - min) / (max - min);
  }

  /**
   * 分桶
   */
  static bucketize(value: number, boundaries: number[]): number {
    for (let i = 0; i < boundaries.length; i++) {
      if (value < boundaries[i]) {
        return i;
      }
    }
    return boundaries.length;
  }

  /**
   * One-hot 编码
   */
  static oneHotEncode(value: string, categories: string[]): number[] {
    return categories.map(cat => (cat === value ? 1 : 0));
  }

  /**
   * Label 编码
   */
  static labelEncode(value: string, mapping: Record<string, number>): number {
    return mapping[value] ?? -1;
  }

  /**
   * 多项式特征交叉
   */
  static polynomialFeatures(values: number[], degree: number = 2): number[] {
    const result: number[] = [...values];
    
    for (let d = 2; d <= degree; d++) {
      for (let i = 0; i < values.length; i++) {
        for (let j = i; j < values.length; j++) {
          result.push(Math.pow(values[i] * values[j], d - 1));
        }
      }
    }

    return result;
  }

  /**
   * 处理缺失值
   */
  static fillMissing(value: unknown, strategy: 'mean' | 'median' | 'mode' | 'constant', fillValue?: unknown): unknown {
    if (value !== null && value !== undefined) {
      return value;
    }

    switch (strategy) {
      case 'constant':
        return fillValue ?? 0;
      case 'mean':
      case 'median':
      case 'mode':
        // 需要传入统计值
        return fillValue ?? 0;
      default:
        return fillValue ?? 0;
    }
  }
}

// ==================== 特征监控 ====================

export class FeatureMonitor {
  private distributions: Map<string, number[]> = new Map();
  private alerts: Array<{
    featureName: string;
    type: 'drift' | 'outlier' | 'null_increase';
    severity: 'warning' | 'critical';
    message: string;
    timestamp: number;
  }> = [];

  record(featureName: string, value: number): void {
    if (!this.distributions.has(featureName)) {
      this.distributions.set(featureName, []);
    }

    const dist = this.distributions.get(featureName)!;
    dist.push(value);

    // 保留最近 10000 个值
    if (dist.length > 10000) {
      dist.shift();
    }

    // 检测异常
    this.detectAnomalies(featureName, dist, value);
  }

  private detectAnomalies(featureName: string, values: number[], newValue: number): void {
    if (values.length < 100) return;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    // 检测离群值（3 sigma 原则）
    if (Math.abs(newValue - mean) > 3 * std) {
      this.alerts.push({
        featureName,
        type: 'outlier',
        severity: 'warning',
        message: `Outlier detected: ${newValue} (mean=${mean.toFixed(2)}, std=${std.toFixed(2)})`,
        timestamp: Date.now()
      });
    }

    // 检测漂移（比较近期和远期分布）
    if (values.length >= 1000) {
      const recent = values.slice(-100);
      const older = values.slice(-1000, -100);

      const recentMean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderMean = older.reduce((a, b) => a + b, 0) / older.length;

      const drift = Math.abs(recentMean - olderMean) / (std || 1);

      if (drift > 0.5) {
        this.alerts.push({
          featureName,
          type: 'drift',
          severity: drift > 1.0 ? 'critical' : 'warning',
          message: `Distribution drift detected: ${drift.toFixed(2)}`,
          timestamp: Date.now()
        });
      }
    }
  }

  getAlerts(): typeof this.alerts {
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 特征存储 ===\n');

  const registry = new FeatureRegistry();

  // 注册特征定义
  console.log('--- 注册特征 ---');
  
  const userAgeFeature: FeatureDefinition = {
    name: 'age',
    type: FeatureType.NUMERIC,
    description: 'User age in years',
    entity: 'user',
    storage: FeatureStorage.BOTH,
    ttl: 3600,
    source: {
      type: 'database',
      config: { table: 'users', column: 'age' }
    },
    transformation: {
      type: 'normalize',
      config: { min: 0, max: 100 }
    },
    validation: {
      required: true,
      min: 0,
      max: 150
    },
    metadata: {
      owner: 'data-team',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      tags: ['demographic', 'user']
    }
  };

  const userCountryFeature: FeatureDefinition = {
    name: 'country',
    type: FeatureType.CATEGORICAL,
    description: 'User country code',
    entity: 'user',
    storage: FeatureStorage.ONLINE,
    transformation: {
      type: 'onehot',
      config: { categories: ['US', 'UK', 'CN', 'JP', 'DE'] }
    },
    metadata: {
      owner: 'data-team',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      tags: ['demographic', 'user']
    }
  };

  registry.registerFeature(userAgeFeature);
  registry.registerFeature(userCountryFeature);

  console.log('User features:', registry.getEntityFeatures('user').map(f => f.name));

  // 在线特征存储
  console.log('\n--- 在线特征存储 ---');
  const onlineStore = new OnlineFeatureStore();

  // 写入特征值
  onlineStore.write({
    featureName: 'age',
    entityId: 'user:123',
    value: 25,
    timestamp: Date.now(),
    version: '1.0.0'
  }, 60);

  onlineStore.write({
    featureName: 'country',
    entityId: 'user:123',
    value: 'US',
    timestamp: Date.now(),
    version: '1.0.0'
  });

  // 读取特征向量
  const vector = onlineStore.getFeatureVector({
    entityType: 'user',
    entityIds: ['123'],
    featureNames: ['age', 'country', 'income'] // income 不存在
  });

  console.log('Feature vector:', vector[0]);

  // 离线特征存储
  console.log('\n--- 离线特征存储 ---');
  const offlineStore = new OfflineFeatureStore();

  // 模拟历史特征数据
  const historicalFeatures: FeatureValue[] = [];
  for (let i = 0; i < 30; i++) {
    historicalFeatures.push({
      featureName: 'age',
      entityId: 'user:456',
      value: 20 + Math.floor(Math.random() * 40),
      timestamp: Date.now() - i * 86400000, // 过去30天
      version: '1.0.0'
    });
  }

  offlineStore.writeBatch('user', historicalFeatures);

  // 计算统计信息
  const stats = offlineStore.computeStatistics('user', 'age');
  console.log('Feature statistics:', {
    count: stats.count,
    mean: stats.mean?.toFixed(2),
    std: stats.std?.toFixed(2),
    min: stats.min,
    max: stats.max
  });

  // 特征转换
  console.log('\n--- 特征转换 ---');
  const rawValue = 75;
  const normalized = FeatureTransformer.minMaxNormalize(rawValue, 0, 100);
  console.log(`Min-Max normalization: ${rawValue} -> ${normalized.toFixed(4)}`);

  const bucketIndex = FeatureTransformer.bucketize(rawValue, [18, 30, 45, 60]);
  console.log(`Bucketize result: ${rawValue} -> bucket ${bucketIndex}`);

  const oneHot = FeatureTransformer.oneHotEncode('CN', ['US', 'UK', 'CN', 'JP', 'DE']);
  console.log('One-hot encoding:', oneHot);

  // 特征监控
  console.log('\n--- 特征监控 ---');
  const monitor = new FeatureMonitor();

  // 模拟正常数据
  for (let i = 0; i < 1000; i++) {
    monitor.record('user_age', 25 + Math.random() * 10);
  }

  // 模拟异常值
  monitor.record('user_age', 150);
  monitor.record('user_age', 200);

  // 模拟数据漂移
  for (let i = 0; i < 100; i++) {
    monitor.record('user_age', 80 + Math.random() * 5);
  }

  const alerts = monitor.getAlerts();
  console.log('Detected alerts:', alerts.length);
  for (const alert of alerts) {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}`);
  }

  // 特征血缘
  console.log('\n--- 特征血缘 ---');
  
  // 注册依赖特征
  registry.registerFeature({
    name: 'age_group',
    type: FeatureType.CATEGORICAL,
    description: 'Age group category',
    entity: 'user',
    storage: FeatureStorage.BOTH,
    source: {
      type: 'computed',
      config: { dependsOn: ['age'] }
    },
    metadata: {
      owner: 'data-team',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      tags: []
    }
  });

  const lineage = registry.getLineage('age');
  console.log('Lineage of "age":');
  console.log('  Upstream:', lineage.upstream);
  console.log('  Downstream:', lineage.downstream);
}
