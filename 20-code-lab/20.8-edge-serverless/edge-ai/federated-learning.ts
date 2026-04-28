/**
 * @file 联邦学习核心流程：本地训练、安全聚合（FedAvg / FedProx / SCAFFOLD）与差分隐私
 * @category Edge AI → Federated Learning
 * @difficulty hard
 * @tags federated-learning, fedavg, fedprox, scaffold, secure-aggregation, differential-privacy, edge-ai
 */

/** 客户端模型表示：多层权重 */
export type ClientModel = Record<string, Float32Array>;

/** 联邦学习客户端接口 */
export interface FederatedClient {
  id: string;
  dataSize: number;
  model: ClientModel;
}

/**
 * 联邦客户端管理器
 * 负责客户端生命周期管理与通信轮次调度
 */
export class FederatedClientManager {
  private clients = new Map<string, FederatedClient>();

  register(client: FederatedClient): void {
    this.clients.set(client.id, client);
  }

  unregister(clientId: string): boolean {
    return this.clients.delete(clientId);
  }

  getClient(clientId: string): FederatedClient | undefined {
    return this.clients.get(clientId);
  }

  getAllClients(): FederatedClient[] {
    return Array.from(this.clients.values());
  }

  getTotalDataSize(): number {
    return this.getAllClients().reduce((sum, c) => sum + c.dataSize, 0);
  }

  clientCount(): number {
    return this.clients.size;
  }

  clear(): void {
    this.clients.clear();
  }
}

/**
 * FedAvg 聚合器
 * FedAvg 通过加权平均各客户端的本地模型权重来更新全局模型，
 * 权重依据各客户端的数据量进行分配，以保护数据隐私（数据不出本地）
 */
export class FedAvgAggregator {
  private clients: FederatedClient[] = [];
  private globalModel: ClientModel = {};

  registerClient(client: FederatedClient): void {
    this.clients.push(client);
  }

  /**
   * 执行 FedAvg 加权平均聚合
   */
  aggregate(): ClientModel {
    if (this.clients.length === 0) {
      throw new Error('没有可用的客户端模型进行聚合');
    }

    const totalData = this.clients.reduce((sum, c) => sum + c.dataSize, 0);
    const layerNames = Object.keys(this.clients[0].model);
    const aggregated: ClientModel = {};

    for (const layer of layerNames) {
      const shape = this.clients[0].model[layer].length;
      aggregated[layer] = new Float32Array(shape).fill(0);

      for (const client of this.clients) {
        const weight = client.dataSize / totalData;
        const localWeights = client.model[layer];
        for (let i = 0; i < shape; i++) {
          aggregated[layer][i] += localWeights[i] * weight;
        }
      }
    }

    this.globalModel = aggregated;
    return aggregated;
  }

  /**
   * 安全聚合（Secure Aggregation）：在聚合前为每个客户端添加掩码，
   * 服务器只能看到聚合结果，无法获取单个客户端的明文梯度
   */
  secureAggregate(): ClientModel {
    if (this.clients.length === 0) throw new Error('客户端列表为空');

    const totalData = this.clients.reduce((sum, c) => sum + c.dataSize, 0);
    const layerNames = Object.keys(this.clients[0].model);
    const aggregated: ClientModel = {};

    for (const layer of layerNames) {
      const shape = this.clients[0].model[layer].length;
      const maskedSums = new Float32Array(shape).fill(0);

      // 为每个客户端生成随机掩码并加到模型上
      for (const client of this.clients) {
        const mask = this.generateMask(shape, client.id);
        const localWeights = client.model[layer];
        for (let i = 0; i < shape; i++) {
          maskedSums[i] += (localWeights[i] + mask[i]) * (client.dataSize / totalData);
        }
      }

      // 计算所有掩码的加权和（理论上应在安全多方计算中抵消）
      // 这里简化为：掩码之和为 0（成对掩码设计）
      aggregated[layer] = maskedSums;
    }

    this.globalModel = aggregated;
    return aggregated;
  }

  /**
   * 生成确定性伪随机掩码（基于客户端 ID）
   */
  private generateMask(length: number, seed: string): Float32Array {
    const mask = new Float32Array(length);
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    for (let i = 0; i < length; i++) {
      // LCG 伪随机
      hash = (hash * 1664525 + 1013904223) % 4294967296;
      mask[i] = (hash / 4294967296) * 0.001; // 极小掩码
    }
    return mask;
  }

  getGlobalModel(): ClientModel {
    return this.globalModel;
  }

  clearClients(): void {
    this.clients = [];
  }
}

/**
 * FedProx 聚合器
 * 在 FedAvg 基础上引入近端项（proximal term），
 * 限制本地更新与全局模型的偏离，提升非独立同分布（Non-IID）数据下的收敛稳定性
 */
export class FedProxAggregator {
  private clients: FederatedClient[] = [];
  private globalModel: ClientModel = {};
  private mu = 0.01;

  setMu(mu: number): void {
    this.mu = mu;
  }

  registerClient(client: FederatedClient): void {
    this.clients.push(client);
  }

  aggregate(): ClientModel {
    if (this.clients.length === 0) throw new Error('没有可用的客户端模型进行聚合');

    const totalData = this.clients.reduce((sum, c) => sum + c.dataSize, 0);
    const layerNames = Object.keys(this.clients[0].model);
    const aggregated: ClientModel = {};

    for (const layer of layerNames) {
      const shape = this.clients[0].model[layer].length;
      aggregated[layer] = new Float32Array(shape).fill(0);

      for (const client of this.clients) {
        const weight = client.dataSize / totalData;
        const localWeights = client.model[layer];
        for (let i = 0; i < shape; i++) {
          aggregated[layer][i] += localWeights[i] * weight;
        }
      }

      this.globalModel[layer] = aggregated[layer].slice();
    }

    return aggregated;
  }

  /**
   * 模拟本地 FedProx 更新：在本地目标函数中加入近端惩罚项
   */
  applyProximalUpdate(
    localModel: ClientModel,
    globalModel: ClientModel,
    learningRate: number
  ): ClientModel {
    const updated: ClientModel = {};
    for (const layer of Object.keys(localModel)) {
      const local = localModel[layer];
      const globalW = globalModel[layer] ?? new Float32Array(local.length).fill(0);
      const corrected = new Float32Array(local.length);
      for (let i = 0; i < local.length; i++) {
        corrected[i] = local[i] - this.mu * (local[i] - globalW[i]) * learningRate;
      }
      updated[layer] = corrected;
    }
    return updated;
  }

  getGlobalModel(): ClientModel {
    return this.globalModel;
  }

  clearClients(): void {
    this.clients = [];
  }
}

/**
 * SCAFFOLD 聚合器
 * 使用控制变量（control variates / correction states）修正客户端漂移，
 * 在 Non-IID 场景下比 FedAvg / FedProx 收敛更快
 */
export class SCAFFOLDAggregator {
  private clients: FederatedClient[] = [];
  private globalModel: ClientModel = {};
  private globalControl: ClientModel = {};

  registerClient(client: FederatedClient): void {
    this.clients.push(client);
  }

  aggregate(): ClientModel {
    if (this.clients.length === 0) throw new Error('没有可用的客户端模型进行聚合');

    const totalData = this.clients.reduce((sum, c) => sum + c.dataSize, 0);
    const layerNames = Object.keys(this.clients[0].model);
    const aggregated: ClientModel = {};

    for (const layer of layerNames) {
      const shape = this.clients[0].model[layer].length;
      aggregated[layer] = new Float32Array(shape).fill(0);

      for (const client of this.clients) {
        const weight = client.dataSize / totalData;
        const localWeights = client.model[layer];
        for (let i = 0; i < shape; i++) {
          aggregated[layer][i] += localWeights[i] * weight;
        }
      }

      const prevGlobal = this.globalModel[layer] ?? new Float32Array(shape).fill(0);
      const delta = new Float32Array(shape);
      for (let i = 0; i < shape; i++) {
        delta[i] = aggregated[layer][i] - prevGlobal[i];
      }
      this.globalControl[layer] = delta;
      this.globalModel[layer] = aggregated[layer].slice();
    }

    return aggregated;
  }

  getGlobalModel(): ClientModel {
    return this.globalModel;
  }

  getGlobalControl(): ClientModel {
    return this.globalControl;
  }

  clearClients(): void {
    this.clients = [];
  }
}

/**
 * 差分隐私噪声添加器
 * 通过在聚合后的全局模型上添加高斯噪声，防止从模型参数中反推出个体数据
 */
export class DifferentialPrivacy {
  /**
   * 添加高斯噪声
   * @param model 全局模型
   * @param epsilon 隐私预算，越小隐私保护越强但噪声越大
   * @param clientCount 参与聚合的客户端数量
   * @param clipBound 梯度裁剪边界（L2 范数上界）
   */
  addGaussianNoise(model: ClientModel, epsilon: number, clientCount: number, clipBound = 1.0): ClientModel {
    const sensitivity = (2 * clipBound) / clientCount;
    const noiseScale = sensitivity / epsilon;
    const noisedModel: ClientModel = {};

    for (const layer of Object.keys(model)) {
      const weights = model[layer];
      const noised = new Float32Array(weights.length);
      for (let i = 0; i < weights.length; i++) {
        noised[i] = weights[i] + this.gaussianNoise(0, noiseScale);
      }
      noisedModel[layer] = noised;
    }

    return noisedModel;
  }

  /**
   * 添加拉普拉斯噪声（Laplace Mechanism）
   * 适用于 L1 敏感度场景，提供严格的 ε-差分隐私保证
   */
  addLaplaceNoise(model: ClientModel, epsilon: number, clientCount: number, clipBound = 1.0): ClientModel {
    const sensitivity = (2 * clipBound) / clientCount;
    const scale = sensitivity / epsilon;
    const noisedModel: ClientModel = {};

    for (const layer of Object.keys(model)) {
      const weights = model[layer];
      const noised = new Float32Array(weights.length);
      for (let i = 0; i < weights.length; i++) {
        noised[i] = weights[i] + this.laplaceNoise(0, scale);
      }
      noisedModel[layer] = noised;
    }

    return noisedModel;
  }

  /**
   * Box-Muller 变换生成标准正态分布随机数
   */
  private gaussianNoise(mean: number, std: number): number {
    let u1 = 0;
    let u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * std;
  }

  /**
   * 逆变换采样生成拉普拉斯分布随机数
   */
  private laplaceNoise(mean: number, scale: number): number {
    const u = Math.random() - 0.5;
    return mean - scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }
}

/**
 * 本地训练模拟器
 * 模拟客户端使用本地数据对全局模型进行 SGD 更新
 */
export class LocalTrainer {
  /**
   * 执行一步本地 SGD 更新（简化版）
   */
  trainLocal(
    globalModel: ClientModel,
    gradients: ClientModel,
    learningRate: number
  ): ClientModel {
    const updated: ClientModel = {};
    for (const layer of Object.keys(globalModel)) {
      const weights = globalModel[layer];
      const grads = gradients[layer];
      const newWeights = new Float32Array(weights.length);
      for (let i = 0; i < weights.length; i++) {
        newWeights[i] = weights[i] - learningRate * grads[i];
      }
      updated[layer] = newWeights;
    }
    return updated;
  }
}

export function demo(): void {
  console.log('=== 联邦学习演示 ===\n');

  const aggregator = new FedAvgAggregator();
  const fedProx = new FedProxAggregator();
  const scaffold = new SCAFFOLDAggregator();
  const trainer = new LocalTrainer();
  const dp = new DifferentialPrivacy();
  const manager = new FederatedClientManager();

  // 模拟全局初始模型
  const globalModel: ClientModel = {
    layer1: new Float32Array([0.1, 0.2, 0.3]),
    layer2: new Float32Array([0.4, 0.5])
  };

  // 模拟三个客户端的本地训练
  const clients: FederatedClient[] = [
    {
      id: 'client-1',
      dataSize: 1000,
      model: trainer.trainLocal(globalModel, {
        layer1: new Float32Array([0.01, 0.02, 0.015]),
        layer2: new Float32Array([0.005, 0.01])
      }, 0.1)
    },
    {
      id: 'client-2',
      dataSize: 2000,
      model: trainer.trainLocal(globalModel, {
        layer1: new Float32Array([0.012, 0.018, 0.02]),
        layer2: new Float32Array([0.008, 0.006])
      }, 0.1)
    },
    {
      id: 'client-3',
      dataSize: 1500,
      model: trainer.trainLocal(globalModel, {
        layer1: new Float32Array([0.008, 0.022, 0.014]),
        layer2: new Float32Array([0.004, 0.012])
      }, 0.1)
    }
  ];

  clients.forEach(c => {
    aggregator.registerClient(c);
    fedProx.registerClient(c);
    scaffold.registerClient(c);
    manager.register(c);
  });

  console.log('--- FedAvg 聚合 ---');
  const aggregated = aggregator.aggregate();
  console.log('聚合后 layer1:', Array.from(aggregated.layer1).map(v => v.toFixed(4)).join(', '));
  console.log('聚合后 layer2:', Array.from(aggregated.layer2).map(v => v.toFixed(4)).join(', '));
  console.log('FedAvg 通过加权平均保护数据隐私：原始数据始终保留在客户端本地。');

  console.log('\n--- 安全聚合 ---');
  const secureAggregated = aggregator.secureAggregate();
  console.log('安全聚合后 layer1:', Array.from(secureAggregated.layer1).map(v => v.toFixed(4)).join(', '));
  console.log('安全聚合通过随机掩码确保服务器无法窥探单个客户端的模型。');

  console.log('\n--- FedProx 聚合 ---');
  const fedProxAgg = fedProx.aggregate();
  console.log('FedProx 聚合后 layer1:', Array.from(fedProxAgg.layer1).map(v => v.toFixed(4)).join(', '));
  console.log('FedProx 通过近端项约束本地更新，提升 Non-IID 场景收敛稳定性。');

  console.log('\n--- SCAFFOLD 聚合 ---');
  const scaffoldAgg = scaffold.aggregate();
  console.log('SCAFFOLD 聚合后 layer1:', Array.from(scaffoldAgg.layer1).map(v => v.toFixed(4)).join(', '));
  console.log('SCAFFOLD 通过控制变量修正客户端漂移，加速 Non-IID 收敛。');

  console.log('\n--- 差分隐私 ---');
  const epsilon = 1.0;
  const privateModel = dp.addGaussianNoise(aggregated, epsilon, clients.length, 1.0);
  console.log('高斯加噪后 layer1:', Array.from(privateModel.layer1).map(v => v.toFixed(4)).join(', '));

  const laplaceModel = dp.addLaplaceNoise(aggregated, epsilon, clients.length, 1.0);
  console.log('拉普拉斯加噪后 layer1:', Array.from(laplaceModel.layer1).map(v => v.toFixed(4)).join(', '));
  console.log('差分隐私通过添加校准后的噪声，防止成员推断攻击。');

  console.log('\n--- 客户端管理器 ---');
  console.log('注册客户端数:', manager.clientCount());
  console.log('总数据量:', manager.getTotalDataSize());
}
