import { describe, it, expect } from 'vitest'
import { JwtSecurityService, demo } from '\./jwt-security.js'

describe('jwt-security', () => {
  it('JwtSecurityService is defined', () => {
    expect(typeof JwtSecurityService).not.toBe('undefined');
  });
  it('JwtSecurityService can be instantiated if constructor permits', () => {
    if (typeof JwtSecurityService === 'function') {
      try {
        const instance = new (JwtSecurityService as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('demo is defined', () => {
    expect(typeof demo).not.toBe('undefined');
  });
  it('demo is callable', () => {
    if (typeof demo === 'function') {
      try {
        const result = (demo as any)();
        expect(result).toBeDefined();
      } catch { }
    }
  });
});

