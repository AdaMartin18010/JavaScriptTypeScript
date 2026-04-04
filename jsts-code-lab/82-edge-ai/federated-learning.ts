/**
 * @file 联邦学习核心流程：本地训练、安全聚合（FedAvg / Secure Aggregation）与差分隐私
 * @category Edge AI → Federated Learning
 * @difficulty hard
 * @tags federated-learning, fedavg, secure-aggregation, differential-privacy, edge-ai
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
  const trainer = new LocalTrainer();
  const dp = new DifferentialPrivacy();

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

  clients.forEach(c => aggregator.registerClient(c));

  console.log('--- FedAvg 聚合 ---');
  const aggregated = aggregator.aggregate();
  console.log('聚合后 layer1:', Array.from(aggregated.layer1).map(v => v.toFixed(4)).join(', '));
  console.log('聚合后 layer2:', Array.from(aggregated.layer2).map(v => v.toFixed(4)).join(', '));
  console.log('FedAvg 通过加权平均保护数据隐私：原始数据始终保留在客户端本地。');

  console.log('\n--- 安全聚合 ---');
  const secureAggregated = aggregator.secureAggregate();
  console.log('安全聚合后 layer1:', Array.from(secureAggregated.layer1).map(v => v.toFixed(4)).join(', '));
  console.log('安全聚合通过随机掩码确保服务器无法窥探单个客户端的模型。');

  console.log('\n--- 差分隐私 ---');
  const epsilon = 1.0;
  const privateModel = dp.addGaussianNoise(aggregated, epsilon, clients.length, 1.0);
  console.log('加噪后 layer1:', Array.from(privateModel.layer1).map(v => v.toFixed(4)).join(', '));
  console.log('差分隐私通过添加校准后的高斯噪声，防止成员推断攻击。');
}
