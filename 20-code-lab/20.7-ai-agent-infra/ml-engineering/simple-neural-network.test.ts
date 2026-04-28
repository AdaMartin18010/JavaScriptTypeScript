import { describe, it, expect } from 'vitest';
import { SimpleNeuralNetwork } from './simple-neural-network.js';

describe('SimpleNeuralNetwork', () => {
  it('should learn XOR', () => {
    const X = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ];
    const y = [[0], [1], [1], [0]];

    const nn = new SimpleNeuralNetwork([
      { inputSize: 2, outputSize: 8, activation: 'relu' },
      { inputSize: 8, outputSize: 1, activation: 'sigmoid' }
    ]);

    nn.train(X, y, 8000, 0.5);

    for (let i = 0; i < X.length; i++) {
      const pred = nn.forward(X[i])[0];
      const expected = y[i][0];
      const diff = Math.abs(pred - expected);
      expect(diff).toBeLessThan(0.35);
    }
  });

  it('should throw on empty layers', () => {
    expect(() => new SimpleNeuralNetwork([])).toThrow();
  });

  it('should throw on mismatched layer sizes', () => {
    expect(() =>
      new SimpleNeuralNetwork([
        { inputSize: 2, outputSize: 3, activation: 'relu' },
        { inputSize: 4, outputSize: 1, activation: 'sigmoid' }
      ])
    ).toThrow();
  });

  it('should throw on mismatched X and y length', () => {
    const nn = new SimpleNeuralNetwork([
      { inputSize: 2, outputSize: 2, activation: 'relu' }
    ]);
    expect(() => nn.train([[0, 0]], [], 10, 0.1)).toThrow();
  });
});
