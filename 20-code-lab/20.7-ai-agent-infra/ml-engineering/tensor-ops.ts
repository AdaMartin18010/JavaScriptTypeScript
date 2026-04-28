/**
 * @file 张量运算基础
 * @category ML Engineering → Tensor Operations
 * @difficulty medium
 * @tags tensor, linear-algebra, matrix-multiplication, broadcasting
 *
 * @description
 * 实现深度学习框架中最基础的张量（Tensor）数据结构及其核心运算：
 * 逐元素加法/乘法、矩阵乘法、转置、reshape 等。
 * 所有运算均为纯 TypeScript 实现，用于理解底层数值计算原理。
 */

export interface TensorShape {
  readonly dims: readonly number[];
  readonly size: number;
}

export class Tensor {
  readonly shape: TensorShape;
  readonly data: Float32Array;

  constructor(shape: readonly number[], data?: Float32Array) {
    const size = shape.reduce((a, b) => a * b, 1);
    this.shape = { dims: shape, size };
    if (data) {
      if (data.length !== size) {
        throw new Error(`Data length ${data.length} does not match shape size ${size}`);
      }
      this.data = data;
    } else {
      this.data = new Float32Array(size);
    }
  }

  /** 创建全零张量 */
  static zeros(shape: readonly number[]): Tensor {
    return new Tensor(shape);
  }

  /** 创建全一张量 */
  static ones(shape: readonly number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    return new Tensor(shape, new Float32Array(size).fill(1));
  }

  /** 创建随机张量（均匀分布 0~1） */
  static random(shape: readonly number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random();
    }
    return new Tensor(shape, data);
  }

  /** 逐元素加法（支持广播到相同形状） */
  add(other: Tensor): Tensor {
    const outShape = Tensor.broadcastShape(this.shape.dims, other.shape.dims);
    const result = new Float32Array(outShape.size);

    for (let i = 0; i < outShape.size; i++) {
      result[i] = this.data[i % this.shape.size] + other.data[i % other.shape.size];
    }
    return new Tensor(outShape.dims, result);
  }

  /** 逐元素乘法（Hadamard product / 广播） */
  mul(other: Tensor): Tensor {
    const outShape = Tensor.broadcastShape(this.shape.dims, other.shape.dims);
    const result = new Float32Array(outShape.size);

    for (let i = 0; i < outShape.size; i++) {
      result[i] = this.data[i % this.shape.size] * other.data[i % other.shape.size];
    }
    return new Tensor(outShape.dims, result);
  }

  /** 标量乘法 */
  scale(scalar: number): Tensor {
    const result = new Float32Array(this.shape.size);
    for (let i = 0; i < this.shape.size; i++) {
      result[i] = this.data[i] * scalar;
    }
    return new Tensor(this.shape.dims, result);
  }

  /** 矩阵乘法（2D 张量） */
  matmul(other: Tensor): Tensor {
    if (this.shape.dims.length !== 2 || other.shape.dims.length !== 2) {
      throw new Error('matmul requires 2D tensors');
    }
    const [m, k1] = this.shape.dims;
    const [k2, n] = other.shape.dims;
    if (k1 !== k2) {
      throw new Error(`Shape mismatch: ${k1} vs ${k2}`);
    }

    const result = new Float32Array(m * n);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < k1; k++) {
          sum += this.data[i * k1 + k] * other.data[k * n + j];
        }
        result[i * n + j] = sum;
      }
    }
    return new Tensor([m, n], result);
  }

  /** 转置（仅支持 2D） */
  transpose(): Tensor {
    if (this.shape.dims.length !== 2) {
      throw new Error('transpose currently supports 2D tensors only');
    }
    const [rows, cols] = this.shape.dims;
    const result = new Float32Array(rows * cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j * rows + i] = this.data[i * cols + j];
      }
    }
    return new Tensor([cols, rows], result);
  }

  /** reshape 为新的形状（元素总数必须一致） */
  reshape(newShape: readonly number[]): Tensor {
    const newSize = newShape.reduce((a, b) => a * b, 1);
    if (newSize !== this.shape.size) {
      throw new Error(`Cannot reshape tensor of size ${this.shape.size} to size ${newSize}`);
    }
    return new Tensor(newShape, this.data.slice());
  }

  /** 广播形状校验（简化版：仅支持完全相同的形状或单元素广播） */
  private static broadcastShape(a: readonly number[], b: readonly number[]): TensorShape {
    if (a.length !== b.length) {
      throw new Error('Broadcasting requires same rank in this simplified implementation');
    }
    const dims: number[] = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] === b[i]) {
        dims.push(a[i]);
      } else if (a[i] === 1 || b[i] === 1) {
        dims.push(Math.max(a[i], b[i]));
      } else {
        throw new Error(`Incompatible shapes for broadcasting: [${a.join(',')}] vs [${b.join(',')}]`);
      }
    }
    return { dims, size: dims.reduce((x, y) => x * y, 1) };
  }
}

export function demo(): void {
  console.log('=== 张量运算 ===\n');

  const a = Tensor.random([2, 3]);
  const b = Tensor.random([2, 3]);

  console.log('A shape:', a.shape.dims);
  console.log('B shape:', b.shape.dims);

  const c = a.add(b);
  console.log('A + B shape:', c.shape.dims);

  const d = a.matmul(b.transpose());
  console.log('A @ B^T shape:', d.shape.dims);
}
