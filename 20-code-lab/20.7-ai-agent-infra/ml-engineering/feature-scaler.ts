/**
 * @file 特征标准化与归一化
 * @category ML Engineering → Feature Engineering
 * @difficulty easy
 * @tags standardization, normalization, z-score, min-max, feature-scaling
 *
 * @description
 * 实现两种最常用的特征缩放方法：
 * - StandardScaler：Z-score 标准化（均值为 0，标准差为 1）
 * - MinMaxScaler：Min-Max 归一化（缩放到 [0, 1]）
 *
 * 支持 fit（基于训练集计算统计量）、transform（转换数据）与 inverse_transform（还原）。
 */

export class StandardScaler {
  private means: number[] = [];
  private stds: number[] = [];
  private fitted = false;

  /**
   * 基于训练数据计算每列的均值与标准差
   * @param X - 二维数值矩阵（n_samples × n_features）
   */
  fit(X: number[][]): void {
    if (X.length === 0 || X[0].length === 0) {
      throw new Error('X must be non-empty');
    }
    const nFeatures = X[0].length;
    this.means = new Array(nFeatures).fill(0);
    this.stds = new Array(nFeatures).fill(0);

    for (let j = 0; j < nFeatures; j++) {
      let sum = 0;
      for (let i = 0; i < X.length; i++) {
        sum += X[i][j];
      }
      this.means[j] = sum / X.length;

      let sqSum = 0;
      for (let i = 0; i < X.length; i++) {
        sqSum += Math.pow(X[i][j] - this.means[j], 2);
      }
      this.stds[j] = Math.sqrt(sqSum / X.length);
      if (this.stds[j] === 0) {
        this.stds[j] = 1; // 避免除以零
      }
    }

    this.fitted = true;
  }

  /**
   * 对数据进行 Z-score 标准化
   * @param X - 二维数值矩阵
   */
  transform(X: number[][]): number[][] {
    if (!this.fitted) {
      throw new Error('Scaler must be fitted before transform');
    }
    return X.map(row =>
      row.map((val, j) => (val - this.means[j]) / this.stds[j])
    );
  }

  /**
   * 将标准化后的数据还原为原始尺度
   * @param X - 标准化后的矩阵
   */
  inverseTransform(X: number[][]): number[][] {
    if (!this.fitted) {
      throw new Error('Scaler must be fitted before inverseTransform');
    }
    return X.map(row =>
      row.map((val, j) => val * this.stds[j] + this.means[j])
    );
  }

  getStats(): { means: number[]; stds: number[] } {
    if (!this.fitted) {
      throw new Error('Scaler has not been fitted yet');
    }
    return { means: [...this.means], stds: [...this.stds] };
  }
}

export class MinMaxScaler {
  private mins: number[] = [];
  private maxs: number[] = [];
  private fitted = false;

  /**
   * 基于训练数据计算每列的最小值与最大值
   * @param X - 二维数值矩阵
   */
  fit(X: number[][]): void {
    if (X.length === 0 || X[0].length === 0) {
      throw new Error('X must be non-empty');
    }
    const nFeatures = X[0].length;
    this.mins = new Array(nFeatures).fill(Infinity);
    this.maxs = new Array(nFeatures).fill(-Infinity);

    for (let j = 0; j < nFeatures; j++) {
      for (let i = 0; i < X.length; i++) {
        const val = X[i][j];
        if (val < this.mins[j]) this.mins[j] = val;
        if (val > this.maxs[j]) this.maxs[j] = val;
      }
      if (this.maxs[j] === this.mins[j]) {
        this.maxs[j] = this.mins[j] + 1; // 避免除以零
      }
    }

    this.fitted = true;
  }

  /**
   * 将数据缩放到 [0, 1]
   * @param X - 二维数值矩阵
   */
  transform(X: number[][]): number[][] {
    if (!this.fitted) {
      throw new Error('Scaler must be fitted before transform');
    }
    return X.map(row =>
      row.map((val, j) => (val - this.mins[j]) / (this.maxs[j] - this.mins[j]))
    );
  }

  /**
   * 将归一化后的数据还原
   * @param X - 归一化后的矩阵
   */
  inverseTransform(X: number[][]): number[][] {
    if (!this.fitted) {
      throw new Error('Scaler must be fitted before inverseTransform');
    }
    return X.map(row =>
      row.map((val, j) => val * (this.maxs[j] - this.mins[j]) + this.mins[j])
    );
  }

  getStats(): { mins: number[]; maxs: number[] } {
    if (!this.fitted) {
      throw new Error('Scaler has not been fitted yet');
    }
    return { mins: [...this.mins], maxs: [...this.maxs] };
  }
}

export function demo(): void {
  console.log('=== 特征缩放 ===\n');

  const data = [
    [1, 200],
    [2, 300],
    [3, 400],
    [4, 500]
  ];

  const standard = new StandardScaler();
  standard.fit(data);
  const standardized = standard.transform(data);
  console.log('Standardized:', standardized.map(r => r.map(v => v.toFixed(2))));

  const minmax = new MinMaxScaler();
  minmax.fit(data);
  const normalized = minmax.transform(data);
  console.log('Min-Max normalized:', normalized.map(r => r.map(v => v.toFixed(2))));
}
