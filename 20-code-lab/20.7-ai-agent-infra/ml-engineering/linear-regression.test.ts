import { describe, it, expect } from 'vitest';
import { LinearRegression } from './linear-regression.js';

describe('LinearRegression', () => {
  it('should fit with normal equation', () => {
    const X = [
      [1, 2],
      [2, 1],
      [3, 4],
      [4, 2]
    ];
    const y = X.map(([a, b]) => 2 * a + 3 * b + 1);

    const model = new LinearRegression();
    model.fit(X, y);
    const pred = model.predict(X);

    expect(model.mse(y, pred)).toBeLessThan(1e-6);
    expect(model.r2Score(y, pred)).toBeCloseTo(1, 4);

    const { weights, bias } = model.getWeights();
    expect(weights[0]).toBeCloseTo(2, 1);
    expect(weights[1]).toBeCloseTo(3, 1);
    expect(bias).toBeCloseTo(1, 1);
  });

  it('should fit with gradient descent', () => {
    const X = [
      [1],
      [2],
      [3],
      [4]
    ];
    const y = X.map(([a]) => 5 * a + 2);

    const model = new LinearRegression({ useGradientDescent: true, learningRate: 0.1, maxIterations: 5000 });
    model.fit(X, y);
    const pred = model.predict(X);

    expect(model.mse(y, pred)).toBeLessThan(0.01);
    const { weights, bias } = model.getWeights();
    expect(weights[0]).toBeCloseTo(5, 0);
    expect(bias).toBeCloseTo(2, 0);
  });

  it('should throw on mismatched X and y length', () => {
    const model = new LinearRegression();
    expect(() => model.fit([[1], [2]], [1])).toThrow();
  });

  it('should compute MSE correctly', () => {
    const model = new LinearRegression();
    const mse = model.mse([1, 2, 3], [1, 2, 4]);
    expect(mse).toBeCloseTo(1 / 3, 6);
  });
});
