/**
 * @file 可选链操作符测试
 */

import { describe, it, expect } from 'vitest';
import {
  getCountryNameTraditional,
  getCountryNameModern,
  getAvatarUrl,
  getPoolSize,
  type User,
  type ApiResponse,
  type Config
} from '../../01-ecmascript-evolution/es2020/optional-chaining.js';

describe('Optional Chaining', () => {
  const userWithFullAddress: User = {
    name: 'Alice',
    address: {
      city: 'Beijing',
      country: {
        code: 'CN',
        name: 'China'
      }
    }
  };

  const userWithPartialAddress: User = {
    name: 'Bob',
    address: {
      city: 'Shanghai'
    }
  };

  const userWithoutAddress: User = {
    name: 'Charlie'
  };

  describe('getCountryName', () => {
    it('should return country name when fully nested', () => {
      expect(getCountryNameModern(userWithFullAddress)).toBe('China');
    });

    it('should return undefined when country is missing', () => {
      expect(getCountryNameModern(userWithPartialAddress)).toBeUndefined();
    });

    it('should return undefined when address is missing', () => {
      expect(getCountryNameModern(userWithoutAddress)).toBeUndefined();
    });

    it('traditional and modern should behave the same', () => {
      expect(getCountryNameTraditional(userWithFullAddress))
        .toBe(getCountryNameModern(userWithFullAddress));
    });
  });

  describe('getAvatarUrl', () => {
    it('should extract deeply nested avatar URL', () => {
      const response: ApiResponse = {
        data: {
          users: [{
            profile: {
              avatar: {
                url: 'https://example.com/avatar.png'
              }
            }
          }]
        }
      };
      expect(getAvatarUrl(response)).toBe('https://example.com/avatar.png');
    });

    it('should return undefined for empty response', () => {
      expect(getAvatarUrl({})).toBeUndefined();
    });

    it('should return undefined when users array is empty', () => {
      const response: ApiResponse = { data: { users: [] } };
      expect(getAvatarUrl(response)).toBeUndefined();
    });
  });

  describe('getPoolSize', () => {
    it('should return max pool size when configured', () => {
      const config: Config = {
        server: {
          database: {
            connection: {
              pool: { max: 20, min: 5 }
            }
          }
        }
      };
      expect(getPoolSize(config)).toBe(20);
    });

    it('should return default when not configured', () => {
      expect(getPoolSize({})).toBe(10);
    });
  });
});
