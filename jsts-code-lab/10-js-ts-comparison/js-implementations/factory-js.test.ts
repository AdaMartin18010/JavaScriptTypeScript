import { describe, it, expect } from 'vitest';
import {
  VehicleFactoryTS,
  VehicleFactoryJS,
  VehicleFactoryJSDefensive,
  Car,
  Motorcycle,
  Truck,
} from './factory-js.js';

describe('VehicleFactoryTS', () => {
  it('should create a car', () => {
    const car = VehicleFactoryTS.createVehicle('car', 'Toyota', { seats: 5 });
    expect(car).toBeInstanceOf(Car);
    expect(car.getInfo()).toContain('Toyota');
    expect(car.getInfo()).toContain('5');
  });

  it('should create a motorcycle', () => {
    const bike = VehicleFactoryTS.createVehicle('motorcycle', 'Honda', { hasSidecar: true });
    expect(bike).toBeInstanceOf(Motorcycle);
    expect(bike.getInfo()).toContain('Honda');
  });

  it('should create a truck', () => {
    const truck = VehicleFactoryTS.createVehicle('truck', 'Volvo', { capacity: 10 });
    expect(truck).toBeInstanceOf(Truck);
    expect(truck.getInfo()).toContain('Volvo');
    expect(truck.getInfo()).toContain('10t');
  });

  it('should use default options', () => {
    const car = VehicleFactoryTS.createVehicle('car', 'Toyota', {});
    expect(car.getInfo()).toContain('4');
  });

  it('should throw for unknown vehicle type', () => {
    expect(() =>
      // @ts-expect-error testing invalid input
      VehicleFactoryTS.createVehicle('plane', 'Boeing', {})
    ).toThrow('Unknown vehicle type');
  });
});

describe('VehicleFactoryJS', () => {
  it('should create vehicles via JS factory', () => {
    const car = VehicleFactoryJS.createVehicle('car', 'Toyota', { seats: 5 });
    expect(car.getInfo()).toContain('Toyota');
    expect(car.getInfo()).toContain('5');
  });

  it('should throw for unknown type in JS factory', () => {
    expect(() => VehicleFactoryJS.createVehicle('plane', 'Boeing', {})).toThrow('Unknown vehicle type');
  });
});

describe('VehicleFactoryJSDefensive', () => {
  it('should create vehicles with runtime checks', () => {
    const car = VehicleFactoryJSDefensive.createVehicle('car', 'Toyota', { seats: 5 });
    expect(car.getInfo()).toContain('Toyota');
  });

  it('should throw for non-string type', () => {
    // @ts-expect-error testing invalid input
    expect(() => VehicleFactoryJSDefensive.createVehicle(123, 'Toyota', {})).toThrow(TypeError);
  });

  it('should throw for non-string brand', () => {
    // @ts-expect-error testing invalid input
    expect(() => VehicleFactoryJSDefensive.createVehicle('car', 123, {})).toThrow(TypeError);
  });

  it('should throw for invalid vehicle type', () => {
    expect(() => VehicleFactoryJSDefensive.createVehicle('plane', 'Boeing', {})).toThrow('Invalid type');
  });
});
