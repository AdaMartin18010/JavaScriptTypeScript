import { describe, it, expect } from 'vitest';
import { VehicleFactory, RoadLogistics, SeaLogistics, WindowsFactory, MacFactory, GenericFactory } from './factory.js';

describe('factory pattern', () => {
  it('VehicleFactory should create correct vehicles', () => {
    const car = VehicleFactory.create('car');
    expect(car.drive()).toBe('Driving car');
    const bike = VehicleFactory.create('bike');
    expect(bike.drive()).toBe('Riding bike');
    const truck = VehicleFactory.create('truck');
    expect(truck.drive()).toBe('Driving truck');
  });

  it('RoadLogistics should plan delivery by truck', () => {
    const logistics = new RoadLogistics();
    expect(logistics.planDelivery()).toContain('truck on road');
  });

  it('SeaLogistics should plan delivery by ship', () => {
    const logistics = new SeaLogistics();
    expect(logistics.planDelivery()).toContain('ship on sea');
  });

  it('WindowsFactory should create Windows UI components', () => {
    const factory = new WindowsFactory();
    const button = factory.createButton();
    const checkbox = factory.createCheckbox();
    expect(button.render()).toBe('Windows Button');
    expect(checkbox.render()).toBe('Windows Checkbox');
  });

  it('MacFactory should create Mac UI components', () => {
    const factory = new MacFactory();
    const button = factory.createButton();
    expect(button.render()).toBe('Mac Button');
  });

  it('GenericFactory should create instances of any class', () => {
    class User {
      constructor(public name: string, public age: number) {}
    }
    const factory = new GenericFactory(User);
    const user = factory.create('Alice', 30);
    expect(user.name).toBe('Alice');
    expect(user.age).toBe(30);
  });
});
