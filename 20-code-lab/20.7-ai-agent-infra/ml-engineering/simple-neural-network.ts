/**
 * @file 简单神经网络前向/反向传播
 * @category ML Engineering → Neural Networks
 * @difficulty hard
 * @tags neural-network, backpropagation, sgd, activation, feed-forward
 *
 * @description
 * 实现一个全连接前馈神经网络（Feed-Forward Neural Network），
 * 包含前向传播、反向传播（Backpropagation）与 SGD 优化，
 * 用于理解深度学习训练的基本原理。支持 ReLU 与 Sigmoid 激活函数。
 */

export interface LayerConfig {
  inputSize: number;
  outputSize: number;
  activation: 'relu' | 'sigmoid';
}

export class SimpleNeuralNetwork {
  private weights: Float32Array[] = [];
  private biases: Float32Array[] = [];
  private configs: LayerConfig[] = [];

  constructor(layers: LayerConfig[]) {
    if (layers.length === 0) {
      throw new Error('Network must have at least one layer');
    }
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (i > 0 && layers[i - 1].outputSize !== layer.inputSize) {
        throw new Error(`Layer ${i - 1} output size does not match layer ${i} input size`);
      }
      // Xavier 初始化
      const scale = Math.sqrt(2 / (layer.inputSize + layer.outputSize));
      const w = new Float32Array(layer.inputSize * layer.outputSize);
      for (let j = 0; j < w.length; j++) {
        w[j] = (Math.random() - 0.5) * 2 * scale;
      }
      this.weights.push(w);
      this.biases.push(new Float32Array(layer.outputSize).fill(0));
      this.configs.push(layer);
    }
  }

  /**
   * 前向传播
   * @param input - 输入向量（长度等于第一层 inputSize）
   * @returns 各层激活后的输出（最后一层为网络输出）
   */
  forward(input: number[]): number[] {
    let current = input;
    for (let i = 0; i < this.configs.length; i++) {
      const config = this.configs[i];
      const w = this.weights[i];
      const b = this.biases[i];
      const next: number[] = [];
      for (let j = 0; j < config.outputSize; j++) {
        let sum = b[j];
        for (let k = 0; k < config.inputSize; k++) {
          sum += current[k] * w[k * config.outputSize + j];
        }
        next[j] = this.activate(sum, config.activation);
      }
      current = next;
    }
    return current;
  }

  /**
   * 训练网络（单样本 SGD）
   * @param X - 输入样本数组
   * @param y - 目标输出数组
   * @param epochs - 迭代轮数
   * @param learningRate - 学习率
   */
  train(X: number[][], y: number[][], epochs = 1000, learningRate = 0.1): void {
    if (X.length !== y.length) {
      throw new Error('X and y must have the same number of samples');
    }

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      for (let s = 0; s < X.length; s++) {
        const input = X[s];
        const target = y[s];

        // 前向传播并保存中间结果
        const activations: number[][] = [input];
        const zValues: number[][] = [];
        let current = input;

        for (let i = 0; i < this.configs.length; i++) {
          const config = this.configs[i];
          const w = this.weights[i];
          const b = this.biases[i];
          const z: number[] = [];
          const a: number[] = [];
          for (let j = 0; j < config.outputSize; j++) {
            let sum = b[j];
            for (let k = 0; k < config.inputSize; k++) {
              sum += current[k] * w[k * config.outputSize + j];
            }
            z[j] = sum;
            a[j] = this.activate(sum, config.activation);
          }
          zValues.push(z);
          activations.push(a);
          current = a;
        }

        // 计算损失（MSE）
        const output = activations[activations.length - 1];
        for (let i = 0; i < target.length; i++) {
          totalLoss += 0.5 * Math.pow(output[i] - target[i], 2);
        }

        // 反向传播
        let delta: number[] = [];
        for (let i = this.configs.length - 1; i >= 0; i--) {
          const config = this.configs[i];
          const z = zValues[i];
          const aPrev = activations[i];

          if (i === this.configs.length - 1) {
            // 输出层
            delta = [];
            for (let j = 0; j < config.outputSize; j++) {
              const error = output[j] - target[j];
              delta[j] = error * this.activateDerivative(z[j], config.activation);
            }
          } else {
            // 隐藏层
            const nextConfig = this.configs[i + 1];
            const nextW = this.weights[i + 1];
            const newDelta: number[] = [];
            for (let j = 0; j < config.outputSize; j++) {
              let error = 0;
              for (let k = 0; k < nextConfig.outputSize; k++) {
                error += delta[k] * nextW[j * nextConfig.outputSize + k];
              }
              newDelta[j] = error * this.activateDerivative(z[j], config.activation);
            }
            delta = newDelta;
          }

          // 更新权重与偏置
          for (let j = 0; j < config.outputSize; j++) {
            for (let k = 0; k < config.inputSize; k++) {
              const idx = k * config.outputSize + j;
              this.weights[i][idx] -= learningRate * delta[j] * aPrev[k];
            }
            this.biases[i][j] -= learningRate * delta[j];
          }
        }
      }

      if (epoch % 200 === 0) {
        console.log(`  Epoch ${epoch}, loss: ${(totalLoss / X.length).toFixed(6)}`);
      }
    }
  }

  private activate(x: number, type: 'relu' | 'sigmoid'): number {
    if (type === 'relu') return Math.max(0, x);
    return 1 / (1 + Math.exp(-x));
  }

  private activateDerivative(x: number, type: 'relu' | 'sigmoid'): number {
    if (type === 'relu') return x > 0 ? 1 : 0;
    const s = 1 / (1 + Math.exp(-x));
    return s * (1 - s);
  }
}

export function demo(): void {
  console.log('=== 简单神经网络 ===\n');

  // XOR 问题
  const X = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1]
  ];
  const y = [
    [0],
    [1],
    [1],
    [0]
  ];

  const nn = new SimpleNeuralNetwork([
    { inputSize: 2, outputSize: 4, activation: 'relu' },
    { inputSize: 4, outputSize: 1, activation: 'sigmoid' }
  ]);

  nn.train(X, y, 2000, 0.5);

  console.log('\nXOR 预测结果:');
  for (let i = 0; i < X.length; i++) {
    const pred = nn.forward(X[i]);
    console.log(`  ${X[i]} -> ${pred[0].toFixed(4)} (target: ${y[i][0]})`);
  }
}
