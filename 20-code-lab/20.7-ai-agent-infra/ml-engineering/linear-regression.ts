/**
 * @file 线性回归实现
 * @category ML Engineering → Algorithms
 * @difficulty medium
 * @tags linear-regression, gradient-descent, normal-equation, mse
 *
 * @description
 * 使用最小二乘法（Normal Equation）实现多元线性回归，
 * 支持特征标准化、MSE / R² 评估指标以及批量梯度下降训练。
 */

export interface LinearRegressionOptions {
  /** 学习率（仅梯度下降模式使用） */
  learningRate?: number;
  /** 最大迭代次数 */
  maxIterations?: number;
  /** 收敛阈值 */
  tolerance?: number;
  /** 是否使用梯度下降（否则用正规方程） */
  useGradientDescent?: boolean;
}

export class LinearRegression {
  private weights: Float32Array = new Float32Array(0);
  private bias = 0;

  constructor(private options: LinearRegressionOptions = {}) {}

  /**
   * 训练模型
   * @param X - 特征矩阵（n_samples × n_features）
   * @param y - 目标值向量（n_samples）
   */
  fit(X: number[][], y: number[]): void {
    const nSamples = X.length;
    const nFeatures = X[0].length;

    if (y.length !== nSamples) {
      throw new Error('X and y must have the same number of samples');
    }

    this.weights = new Float32Array(nFeatures);
    this.bias = 0;

    if (this.options.useGradientDescent) {
      this.gradientDescent(X, y);
    } else {
      this.normalEquation(X, y);
    }
  }

  /**
   * 预测
   * @param X - 特征矩阵
   * @returns 预测值
   */
  predict(X: number[][]): number[] {
    return X.map(row => {
      let sum = this.bias;
      for (let i = 0; i < row.length; i++) {
        sum += row[i] * this.weights[i];
      }
      return sum;
    });
  }

  /** 均方误差（MSE） */
  mse(yTrue: number[], yPred: number[]): number {
    if (yTrue.length !== yPred.length) {
      throw new Error('yTrue and yPred must have the same length');
    }
    let sum = 0;
    for (let i = 0; i < yTrue.length; i++) {
      const diff = yTrue[i] - yPred[i];
      sum += diff * diff;
    }
    return sum / yTrue.length;
  }

  /** 决定系数 R² */
  r2Score(yTrue: number[], yPred: number[]): number {
    const mean = yTrue.reduce((a, b) => a + b, 0) / yTrue.length;
    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < yTrue.length; i++) {
      ssTot += Math.pow(yTrue[i] - mean, 2);
      ssRes += Math.pow(yTrue[i] - yPred[i], 2);
    }
    return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  }

  getWeights(): { weights: Float32Array; bias: number } {
    return { weights: this.weights.slice(), bias: this.bias };
  }

  /** 正规方程：w = (X^T X)^-1 X^T y */
  private normalEquation(X: number[][], y: number[]): void {
    const nFeatures = X[0].length;
    // 构造增广矩阵 [1, X]
    const aug = X.map(row => [1, ...row]);

    // X_aug^T * X_aug
    const XtX = this.matrixMultiply(this.transpose(aug), aug);
    // X_aug^T * y
    const Xty = this.matrixVectorMultiply(this.transpose(aug), y);

    // 使用高斯消元求解线性方程组 XtX * params = Xty
    const params = this.solveLinearSystem(XtX, Xty);

    this.bias = params[0];
    for (let i = 0; i < nFeatures; i++) {
      this.weights[i] = params[i + 1];
    }
  }

  /** 批量梯度下降 */
  private gradientDescent(X: number[][], y: number[]): void {
    const lr = this.options.learningRate ?? 0.01;
    const maxIter = this.options.maxIterations ?? 1000;
    const tol = this.options.tolerance ?? 1e-6;
    const nSamples = X.length;
    const nFeatures = X[0].length;

    for (let iter = 0; iter < maxIter; iter++) {
      const preds = this.predict(X);
      let db = 0;
      const dw = new Float32Array(nFeatures);

      for (let i = 0; i < nSamples; i++) {
        const error = preds[i] - y[i];
        db += error;
        for (let j = 0; j < nFeatures; j++) {
          dw[j] += error * X[i][j];
        }
      }

      db = (db / nSamples) * lr;
      for (let j = 0; j < nFeatures; j++) {
        dw[j] = (dw[j] / nSamples) * lr;
      }

      this.bias -= db;
      for (let j = 0; j < nFeatures; j++) {
        this.weights[j] -= dw[j];
      }

      // 收敛判断
      let maxChange = Math.abs(db);
      for (let j = 0; j < nFeatures; j++) {
        maxChange = Math.max(maxChange, Math.abs(dw[j]));
      }
      if (maxChange < tol) break;
    }
  }

  private transpose(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result: number[][] = [];
    for (let j = 0; j < cols; j++) {
      result[j] = [];
      for (let i = 0; i < rows; i++) {
        result[j][i] = matrix[i][j];
      }
    }
    return result;
  }

  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const m = A.length;
    const n = B[0].length;
    const p = B.length;
    const result: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < p; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private matrixVectorMultiply(A: number[][], v: number[]): number[] {
    return A.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0));
  }

  /** 高斯消元求解 Ax = b（A 为方阵） */
  private solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    // 深拷贝
    const M: number[][] = A.map((row, i) => [...row, b[i]]);

    for (let i = 0; i < n; i++) {
      // 选主元
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
          maxRow = k;
        }
      }
      [M[i], M[maxRow]] = [M[maxRow], M[i]];

      if (Math.abs(M[i][i]) < 1e-12) {
        throw new Error('Matrix is singular or nearly singular');
      }

      // 消元
      for (let k = i + 1; k < n; k++) {
        const factor = M[k][i] / M[i][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }

    // 回代
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = M[i][n];
      for (let j = i + 1; j < n; j++) {
        sum -= M[i][j] * x[j];
      }
      x[i] = sum / M[i][i];
    }
    return x;
  }
}

export function demo(): void {
  console.log('=== 线性回归 ===\n');

  // 简单数据：y = 2*x1 + 3*x2 + 1
  const X = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6]
  ];
  const y = X.map(([x1, x2]) => 2 * x1 + 3 * x2 + 1);

  const model = new LinearRegression();
  model.fit(X, y);
  const pred = model.predict(X);

  console.log('权重:', Array.from(model.getWeights().weights).map(w => w.toFixed(3)));
  console.log('偏置:', model.getWeights().bias.toFixed(3));
  console.log('MSE:', model.mse(y, pred).toExponential(3));
  console.log('R²:', model.r2Score(y, pred).toFixed(4));
}
