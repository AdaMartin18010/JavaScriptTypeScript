import { describe, it, expect } from 'vitest';
import {
  PIDController,
  BangBangController,
  DeadZoneController,
  ControlSystemSimulator,
} from './feedback-controller.js';

describe('PIDController', () => {
  it('should compute proportional output', () => {
    const pid = new PIDController({ kp: 2, ki: 0, kd: 0 });
    const result = pid.compute(10, 0, 1);
    expect(result.output).toBe(20);
    expect(result.error).toBe(10);
  });

  it('should accumulate integral term', () => {
    const pid = new PIDController({ kp: 0, ki: 1, kd: 0 });
    pid.compute(10, 0, 1);
    const result = pid.compute(10, 0, 1);
    expect(result.iTerm).toBe(20);
  });

  it('should clamp output to limits', () => {
    const pid = new PIDController({ kp: 10, ki: 0, kd: 0, outputMin: -50, outputMax: 50 });
    const result = pid.compute(100, 0, 1);
    expect(result.output).toBe(50);
  });

  it('should throw on invalid dt', () => {
    const pid = new PIDController({ kp: 1, ki: 0, kd: 0 });
    expect(() => pid.compute(10, 0, 0)).toThrow('dt must be greater than 0');
    expect(() => pid.compute(10, 0, -1)).toThrow('dt must be greater than 0');
  });

  it('should reset internal state', () => {
    const pid = new PIDController({ kp: 0, ki: 1, kd: 0 });
    pid.compute(10, 0, 1);
    pid.reset();
    const result = pid.compute(10, 0, 1);
    expect(result.iTerm).toBe(10);
  });

  it('should tune parameters dynamically', () => {
    const pid = new PIDController({ kp: 1, ki: 0, kd: 0 });
    pid.tune(2, 0, 0);
    const result = pid.compute(10, 0, 1);
    expect(result.pTerm).toBe(20);
  });

  it('should limit integral to prevent windup', () => {
    const pid = new PIDController({ kp: 0, ki: 10, kd: 0, integralLimit: 5, outputMax: 1000 });
    const result = pid.compute(100, 0, 1);
    expect(result.iTerm).toBeLessThanOrEqual(50);
  });

  it('should reduce error over time in simulation', () => {
    const pid = new PIDController({ kp: 2, ki: 0.5, kd: 0.1, outputMin: 0, outputMax: 100 });
    const results = ControlSystemSimulator.simulateFirstOrder(pid, 50, 0, 2, 0.1, 100);
    const finalError = results[results.length - 1].error;
    expect(finalError).toBeLessThan(5);
  });
});

describe('BangBangController', () => {
  it('should turn on when error exceeds onThreshold', () => {
    const ctrl = new BangBangController(5, -5);
    expect(ctrl.compute(30, 20)).toBe(true); // error = 10 > 5
  });

  it('should turn off when error below offThreshold', () => {
    const ctrl = new BangBangController(5, -5);
    ctrl.compute(30, 20); // turn on (error=10 > 5.5)
    expect(ctrl.compute(20, 30)).toBe(false); // error = -10 < -5.5
  });

  it('should maintain state within hysteresis band', () => {
    const ctrl = new BangBangController(10, -10, 2);
    ctrl.compute(100, 80); // error = 20 > 12 -> on
    expect(ctrl.compute(100, 95)).toBe(true); // error = 5, within hysteresis, maintain on
  });

  it('should throw if thresholds are invalid', () => {
    expect(() => new BangBangController(5, 10)).toThrow('onThreshold must be greater');
  });
});

describe('DeadZoneController', () => {
  it('should output zero within dead zone', () => {
    const pid = new PIDController({ kp: 10, ki: 0, kd: 0 });
    const dz = new DeadZoneController(pid, 5);
    const output = dz.compute(10, 8, 1);
    expect(output).toBe(0);
  });

  it('should pass through outside dead zone', () => {
    const pid = new PIDController({ kp: 1, ki: 0, kd: 0 });
    const dz = new DeadZoneController(pid, 1);
    const output = dz.compute(100, 0, 1) as number;
    expect(output).toBeGreaterThan(0);
  });

  it('should work with bang-bang controller', () => {
    const bb = new BangBangController(10, -10);
    const dz = new DeadZoneController(bb, 5);
    expect(dz.compute(10, 8, 1)).toBe(false); // error=2 < 5, dead zone
    expect(dz.compute(20, 0, 1)).toBe(true); // error=20 > 5, outside dead zone
  });
});

describe('ControlSystemSimulator', () => {
  it('should simulate convergence to setpoint', () => {
    const pid = new PIDController({ kp: 1, ki: 0.1, kd: 0.01 });
    const results = ControlSystemSimulator.simulateFirstOrder(pid, 100, 0, 5, 0.1, 50);
    expect(results[0].measurement).toBe(0);
    expect(results[results.length - 1].measurement).toBeGreaterThan(0);
  });

  it('should return correct number of steps', () => {
    const pid = new PIDController({ kp: 1, ki: 0, kd: 0 });
    const results = ControlSystemSimulator.simulateFirstOrder(pid, 10, 0, 1, 0.1, 20);
    expect(results).toHaveLength(20);
  });
});
