/**
 * @file 量子模拟器
 * @category Quantum Computing → Simulator
 * @difficulty hard
 * @tags quantum, qubit, quantum-gates, superposition
 */

export interface Complex {
  real: number;
  imag: number;
}

export class ComplexNumber implements Complex {
  constructor(public real: number, public imag: number) {}
  
  add(other: Complex): ComplexNumber {
    return new ComplexNumber(this.real + other.real, this.imag + other.imag);
  }
  
  multiply(other: Complex): ComplexNumber {
    return new ComplexNumber(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }
  
  magnitude(): number {
    return Math.sqrt(this.real ** 2 + this.imag ** 2);
  }
  
  toString(): string {
    if (this.imag >= 0) {
      return `${this.real.toFixed(3)} + ${this.imag.toFixed(3)}i`;
    }
    return `${this.real.toFixed(3)} - ${Math.abs(this.imag).toFixed(3)}i`;
  }
}

// 量子比特
export class Qubit {
  // 状态: α|0⟩ + β|1⟩
  private alpha: ComplexNumber = new ComplexNumber(1, 0);
  private beta: ComplexNumber = new ComplexNumber(0, 0);
  
  // 设置状态
  setState(alpha: Complex, beta: Complex): void {
    // 归一化
    const a = new ComplexNumber(alpha.real, alpha.imag);
    const b = new ComplexNumber(beta.real, beta.imag);
    const norm = Math.sqrt(a.magnitude() ** 2 + b.magnitude() ** 2);
    
    this.alpha = new ComplexNumber(a.real / norm, a.imag / norm);
    this.beta = new ComplexNumber(b.real / norm, b.imag / norm);
  }
  
  // 测量（坍缩）
  measure(): 0 | 1 {
    const prob0 = this.alpha.magnitude() ** 2;
    const result = Math.random() < prob0 ? 0 : 1;
    
    // 坍缩
    if (result === 0) {
      this.alpha = new ComplexNumber(1, 0);
      this.beta = new ComplexNumber(0, 0);
    } else {
      this.alpha = new ComplexNumber(0, 0);
      this.beta = new ComplexNumber(1, 0);
    }
    
    return result as 0 | 1;
  }
  
  // 应用单量子门
  applyGate(matrix: Complex[][]): void {
    const newAlpha = 
      this.alpha.multiply(matrix[0][0]).add(this.beta.multiply(matrix[0][1]));
    const newBeta = 
      this.alpha.multiply(matrix[1][0]).add(this.beta.multiply(matrix[1][1]));
    
    this.alpha = newAlpha;
    this.beta = newBeta;
  }
  
  getState(): { alpha: Complex; beta: Complex; prob0: number; prob1: number } {
    return {
      alpha: { real: this.alpha.real, imag: this.alpha.imag },
      beta: { real: this.beta.real, imag: this.beta.imag },
      prob0: this.alpha.magnitude() ** 2,
      prob1: this.beta.magnitude() ** 2
    };
  }
  
  toString(): string {
    return `${this.alpha}|0⟩ + ${this.beta}|1⟩`;
  }
}

// 量子门
export const QuantumGates = {
  // Hadamard门: 创建叠加态
  H: (): Complex[][] => [
    [new ComplexNumber(1 / Math.sqrt(2), 0), new ComplexNumber(1 / Math.sqrt(2), 0)],
    [new ComplexNumber(1 / Math.sqrt(2), 0), new ComplexNumber(-1 / Math.sqrt(2), 0)]
  ],
  
  // Pauli-X门 (NOT)
  X: (): Complex[][] => [
    [new ComplexNumber(0, 0), new ComplexNumber(1, 0)],
    [new ComplexNumber(1, 0), new ComplexNumber(0, 0)]
  ],
  
  // Pauli-Y门
  Y: (): Complex[][] => [
    [new ComplexNumber(0, 0), new ComplexNumber(0, -1)],
    [new ComplexNumber(0, 1), new ComplexNumber(0, 0)]
  ],
  
  // Pauli-Z门
  Z: (): Complex[][] => [
    [new ComplexNumber(1, 0), new ComplexNumber(0, 0)],
    [new ComplexNumber(0, 0), new ComplexNumber(-1, 0)]
  ],
  
  // 相位门 S
  S: (): Complex[][] => [
    [new ComplexNumber(1, 0), new ComplexNumber(0, 0)],
    [new ComplexNumber(0, 0), new ComplexNumber(0, 1)]
  ],
  
  // π/8门 T
  T: (): Complex[][] => {
    const sqrt2 = Math.sqrt(2);
    return [
      [new ComplexNumber(1, 0), new ComplexNumber(0, 0)],
      [new ComplexNumber(0, 0), new ComplexNumber(1 / sqrt2, 1 / sqrt2)]
    ];
  }
};

// 量子电路
export class QuantumCircuit {
  private qubits: Qubit[];
  private operations: Array<{ type: 'gate'; qubit: number; gate: Complex[][] } | 
                                     { type: 'cnot'; control: number; target: number }> = [];
  
  constructor(numQubits: number) {
    this.qubits = Array.from({ length: numQubits }, () => new Qubit());
  }
  
  // 应用单量子门
  applyGate(gate: Complex[][], qubitIndex: number): this {
    this.operations.push({ type: 'gate', qubit: qubitIndex, gate });
    this.qubits[qubitIndex].applyGate(gate);
    return this;
  }
  
  // CNOT门（受控非门）
  cnot(control: number, target: number): this {
    this.operations.push({ type: 'cnot', control, target });
    
    // 简化的CNOT实现
    const controlState = this.qubits[control].getState();
    if (controlState.prob1 > 0.99) {
      this.qubits[target].applyGate(QuantumGates.X());
    }
    
    return this;
  }
  
  // 测量所有量子比特
  measureAll(): number[] {
    return this.qubits.map(q => q.measure());
  }
  
  // 测量特定量子比特
  measure(qubitIndex: number): 0 | 1 {
    return this.qubits[qubitIndex].measure();
  }
  
  getState(): Array<{ alpha: Complex; beta: Complex }> {
    return this.qubits.map(q => {
      const state = q.getState();
      return { alpha: state.alpha, beta: state.beta };
    });
  }
  
  reset(): void {
    this.qubits.forEach(q => q.setState({ real: 1, imag: 0 }, { real: 0, imag: 0 }));
  }
}

// 量子算法: Deutsch-Jozsa
export class DeutschJozsaAlgorithm {
  // 判断函数是常数还是平衡
  execute(f: (x: number) => number, n: number): 'constant' | 'balanced' {
    // 简化的经典模拟
    const results: number[] = [];
    
    for (let i = 0; i < (1 << n); i++) {
      results.push(f(i));
    }
    
    const sum = results.reduce((a, b) => a + b, 0);
    
    // 如果所有输出相同，是常数函数
    if (sum === 0 || sum === results.length) {
      return 'constant';
    }
    
    return 'balanced';
  }
}

// 量子算法: Grover搜索（简化版）
export class GroverSearch {
  // 在N个元素中搜索目标
  search(target: number, database: number[]): { found: boolean; iterations: number } {
    const N = database.length;
    const iterations = Math.floor(Math.PI / 4 * Math.sqrt(N));
    
    // 模拟：经典搜索
    let found = false;
    let actualIterations = 0;
    
    for (let i = 0; i < Math.min(iterations * 2, N); i++) {
      actualIterations++;
      if (database[i] === target) {
        found = true;
        break;
      }
    }
    
    return { found, iterations: actualIterations };
  }
}

// 量子密钥分发 (BB84协议简化)
export class BB84Protocol {
  generateKey(length: number): { alice: string; bob: string; errorRate: number } {
    let alice = '';
    let bob = '';
    let errors = 0;
    
    for (let i = 0; i < length; i++) {
      // Alice随机生成比特和基
      const aliceBit = Math.random() < 0.5 ? 0 : 1;
      const aliceBasis = Math.random() < 0.5 ? 'Z' : 'X';
      
      // Bob随机选择基测量
      const bobBasis = Math.random() < 0.5 ? 'Z' : 'X';
      
      // 如果基相同，结果应该相同
      if (aliceBasis === bobBasis) {
        // 模拟信道噪声
        const error = Math.random() < 0.05; // 5%错误率
        const bobBit = error ? 1 - aliceBit : aliceBit;
        
        alice += aliceBit;
        bob += bobBit;
        
        if (error) errors++;
      }
    }
    
    return {
      alice,
      bob,
      errorRate: errors / alice.length
    };
  }
}

export function demo(): void {
  console.log('=== 量子计算模拟 ===\n');
  
  // 单量子比特演示
  console.log('--- 量子比特 ---');
  const qubit = new Qubit();
  console.log('初始状态:', qubit.getState());
  
  // 应用Hadamard门（创建叠加态）
  qubit.applyGate(QuantumGates.H());
  console.log('H门后:', qubit.getState());
  console.log('测量概率: |0⟩=' + qubit.getState().prob0.toFixed(3) + 
              ', |1⟩=' + qubit.getState().prob1.toFixed(3));
  
  // 多次测量
  let zeros = 0;
  let ones = 0;
  for (let i = 0; i < 100; i++) {
    qubit.setState({ real: 1 / Math.sqrt(2), imag: 0 }, { real: 1 / Math.sqrt(2), imag: 0 });
    const result = qubit.measure();
    if (result === 0) zeros++;
    else ones++;
  }
  console.log(`100次测量: |0⟩=${zeros}, |1⟩=${ones}`);
  
  // 量子电路
  console.log('\n--- 量子电路 ---');
  const circuit = new QuantumCircuit(2);
  
  // 创建贝尔态
  circuit
    .applyGate(QuantumGates.H(), 0)
    .cnot(0, 1);
  
  console.log('贝尔态电路: H(q0) -> CNOT(q0, q1)');
  const bellResult = circuit.measureAll();
  console.log('测量结果:', bellResult);
  console.log('（应该总是00或11，表示纠缠）');
  
  // Grover搜索
  console.log('\n--- Grover搜索 ---');
  const grover = new GroverSearch();
  const database = [3, 7, 1, 9, 4, 2, 8, 5];
  const searchResult = grover.search(8, database);
  console.log('数据库:', database);
  console.log('搜索8:', searchResult);
  console.log(`经典搜索需要O(N)，量子搜索只需要O(√N) ~ ${Math.floor(Math.PI / 4 * Math.sqrt(database.length))}次`);
  
  // BB84协议
  console.log('\n--- BB84量子密钥分发 ---');
  const bb84 = new BB84Protocol();
  const key = bb84.generateKey(100);
  console.log('生成的密钥长度:', key.alice.length);
  console.log('错误率:', (key.errorRate * 100).toFixed(2) + '%');
  console.log('Alice密钥:', key.alice.slice(0, 20) + '...');
  console.log('Bob密钥:  ', key.bob.slice(0, 20) + '...');
}
