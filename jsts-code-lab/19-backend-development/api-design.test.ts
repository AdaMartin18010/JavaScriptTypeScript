import { describe, it, expect, vi } from 'vitest';
import {
  ApiVersioning,
  ApiVersion,
  PaginationHelper,
  QueryParser,
  ResponseBuilder,
  OpenAPIGenerator,
} from './api-design';

describe('ApiVersioning', () => {
  it('should create path version', () => {
    expect(ApiVersioning.createPathVersion(ApiVersion.V1, '/users')).toBe('/v1/users');
  });

  it('should parse header version', () => {
    expect(ApiVersioning.parseHeaderVersion('application/json;version=2')).toBe(ApiVersion.V2);
    expect(ApiVersioning.parseHeaderVersion('application/json')).toBeNull();
  });

  it('should parse query version', () => {
    expect(ApiVersioning.parseQueryVersion({ 'api-version': '2' })).toBe(ApiVersion.V2);
    expect(ApiVersioning.parseQueryVersion({})).toBeNull();
  });

  it('should register versioned routes', () => {
    const versioning = new ApiVersioning();
    versioning.register('/users', ApiVersion.V1, () => {});
    versioning.register('/users', ApiVersion.V2, () => {});
  });
});

describe('PaginationHelper', () => {
  it('should create offset pagination result', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = PaginationHelper.createOffsetResult(data, 100, { page: 2, limit: 10, cursor: '' }, '/api/users');

    expect(result.data).toEqual(data);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(10);
    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrev).toBe(true);
    expect(result.links.prev).toContain('page=1');
    expect(result.links.next).toContain('page=3');
  });

  it('should create cursor pagination result', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = PaginationHelper.createCursorResult(
      data,
      10,
      true,
      item => String(item.id),
      '/api/users'
    );

    expect(result.data).toEqual(data);
    expect(result.pagination.nextCursor).toBe('2');
    expect(result.links.next).toContain('cursor=2');
  });

  it('should return null cursor when no more data', () => {
    const data = [{ id: 1 }];
    const result = PaginationHelper.createCursorResult(
      data,
      10,
      false,
      item => String(item.id),
      '/api/users'
    );

    expect(result.pagination.nextCursor).toBeNull();
    expect(result.links.next).toBeNull();
  });
});

describe('QueryParser', () => {
  it('should parse filter conditions', () => {
    const filters = QueryParser.parseFilters({
      'age[gte]': '18',
      'name[like]': 'John',
      'role[in]': 'admin,user',
    });

    expect(filters).toHaveLength(3);
    expect(filters[0]).toEqual({ field: 'age', operator: 'gte', value: '18' });
    expect(filters[1]).toEqual({ field: 'name', operator: 'like', value: 'John' });
    expect(filters[2]).toEqual({ field: 'role', operator: 'in', value: ['admin', 'user'] });
  });

  it('should parse sort parameters', () => {
    const sort = QueryParser.parseSort('-created_at,name');
    expect(sort).toEqual([
      { field: 'created_at', direction: 'desc' },
      { field: 'name', direction: 'asc' },
    ]);
  });

  it('should parse field selection', () => {
    const fields = QueryParser.parseFields('id,name,email');
    expect(fields).toEqual(['id', 'name', 'email']);
  });
});

describe('ResponseBuilder', () => {
  it('should build success response', () => {
    const response = ResponseBuilder.success({ id: 1 }).withMeta({ requestId: 'req-1' }).build();
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ id: 1 });
    expect(response.meta?.requestId).toBe('req-1');
    expect(response.meta?.timestamp).toBeDefined();
  });

  it('should build error response', () => {
    const response = ResponseBuilder
      .error('VALIDATION_ERROR', 'Invalid input', { email: ['Required'] })
      .build();

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('VALIDATION_ERROR');
    expect(response.error?.details).toEqual({ email: ['Required'] });
  });

  it('should include pagination meta', () => {
    const pagination = {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
      hasNext: true,
      hasPrev: false,
    };
    const response = ResponseBuilder.success([]).withPagination(pagination).build();
    expect(response.meta?.pagination).toEqual(pagination);
  });
});

describe('OpenAPIGenerator', () => {
  it('should generate OpenAPI spec', () => {
    const generator = new OpenAPIGenerator('Test API', '1.0.0', 'A test API');
    generator
      .addSchema('User', { type: 'object' })
      .addPath('/users', {
        get: {
          summary: 'List users',
          responses: { '200': { description: 'OK' } },
        },
      })
      .addSecurityScheme('bearerAuth', { type: 'http', scheme: 'bearer' });

    const spec = generator.generate();
    expect(spec.openapi).toBe('3.0.0');
    expect(spec.info.title).toBe('Test API');
    expect(spec.paths['/users']).toBeDefined();
    expect(spec.components?.schemas?.User).toBeDefined();
    expect(spec.components?.securitySchemes?.bearerAuth).toBeDefined();
  });

  it('should export JSON', () => {
    const generator = new OpenAPIGenerator('Test API', '1.0.0');
    const json = generator.toJSON();
    expect(JSON.parse(json).openapi).toBe('3.0.0');
  });

  it('should export YAML', () => {
    const generator = new OpenAPIGenerator('Test API', '1.0.0');
    const yaml = generator.toYAML();
    expect(yaml).toContain('openapi: 3.0.0');
    expect(yaml).toContain('title: Test API');
  });
});
