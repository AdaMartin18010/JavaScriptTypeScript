import { describe, it, expect } from 'vitest';
import {
  DesktopComputerBuilder,
  ComputerDirector,
  UserProfileBuilder,
  createBuilder
} from './builder.js';

describe('builder pattern', () => {
  it('ComputerDirector should build gaming PC', () => {
    const builder = new DesktopComputerBuilder();
    const director = new ComputerDirector(builder);
    const pc = director.buildGamingPC();

    expect(pc.cpu).toBe('Intel i9');
    expect(pc.ram).toBe('32GB');
    expect(pc.storage).toBe('2TB SSD');
    expect(pc.gpu).toBe('RTX 4090');
    expect(pc.wifi).toBe(true);
  });

  it('ComputerDirector should build office PC', () => {
    const builder = new DesktopComputerBuilder();
    const director = new ComputerDirector(builder);
    const pc = director.buildOfficePC();

    expect(pc.cpu).toBe('Intel i5');
    expect(pc.ram).toBe('16GB');
    expect(pc.storage).toBe('512GB SSD');
    expect(pc.wifi).toBe(true);
    expect(pc.gpu).toBeUndefined();
  });

  it('DesktopComputerBuilder should support manual configuration', () => {
    const builder = new DesktopComputerBuilder();
    const pc = builder
      .setCPU('AMD Ryzen 9')
      .setRAM('64GB')
      .setStorage('4TB NVMe')
      .setGPU('RX 7900 XTX')
      .setWiFi(true)
      .build();

    expect(pc.cpu).toBe('AMD Ryzen 9');
    expect(pc.ram).toBe('64GB');
  });

  it('DesktopComputerBuilder reset should clear state', () => {
    const builder = new DesktopComputerBuilder();
    builder.setCPU('Intel i9').setRAM('32GB').build();
    builder.reset();

    const pc = builder.build();
    expect(pc.cpu).toBe('');
    expect(pc.ram).toBe('');
  });

  it('UserProfileBuilder should enforce required fields', () => {
    const builder = new UserProfileBuilder();
    expect(() => builder.build()).toThrow('Required fields missing');

    const profile = builder
      .setId('123')
      .setName('Alice')
      .setEmail('alice@example.com')
      .setAge(30)
      .build();

    expect(profile.id).toBe('123');
    expect(profile.name).toBe('Alice');
    expect(profile.email).toBe('alice@example.com');
    expect(profile.age).toBe(30);
  });

  it('createBuilder should build generic objects fluently', () => {
    interface Config {
      host: string;
      port: number;
      ssl: boolean;
    }

    const builder = createBuilder<Config>({ host: 'localhost', port: 3000, ssl: false });
    const config = builder.set('host', 'example.com').set('ssl', true).build();

    expect(config).toEqual({ host: 'example.com', port: 3000, ssl: true });
  });
});
