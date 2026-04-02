/**
 * @file 设计模式测试
 * @description 测试常用设计模式
 */

import { describe, it, expect } from 'vitest';
import { Singleton, Logger } from '../../02-design-patterns/creational/singleton.js';
import { VehicleFactory } from '../../02-design-patterns/creational/factory.js';
import { Subject } from '../../02-design-patterns/behavioral/observer.js';

describe('Singleton Pattern', () => {
  it('should return same instance', () => {
    const logger1 = new Logger();
    const logger2 = new Logger();
    
    expect(logger1).toBe(logger2);
  });

  it('should share state between instances', () => {
    const logger1 = new Logger();
    logger1.log('message 1');
    
    const logger2 = new Logger();
    expect(logger2.getLogs().some(log => log.includes('message 1'))).toBe(true);
  });
});

describe('Factory Pattern', () => {
  it('should create different vehicle types', () => {
    const car = VehicleFactory.create('car');
    const bike = VehicleFactory.create('bike');
    const truck = VehicleFactory.create('truck');
    
    expect(car.drive()).toBe('Driving car');
    expect(bike.drive()).toBe('Riding bike');
    expect(truck.drive()).toBe('Driving truck');
  });

  it('should throw for unknown type', () => {
    // @ts-expect-error 故意传入非法类型以测试异常分支
    expect(() => VehicleFactory.create('plane')).toThrow('Unknown vehicle type');
  });
});

describe('Observer Pattern', () => {
  it('should notify observers', () => {
    const subject = new Subject<string>();
    const messages: string[] = [];
    
    subject.subscribe(msg => messages.push(msg));
    subject.notify('hello');
    subject.notify('world');
    
    expect(messages).toEqual(['hello', 'world']);
  });

  it('should allow unsubscribing', () => {
    const subject = new Subject<number>();
    const values: number[] = [];
    
    const unsubscribe = subject.subscribe(n => values.push(n));
    subject.notify(1);
    unsubscribe();
    subject.notify(2);
    
    expect(values).toEqual([1]);
  });
});
