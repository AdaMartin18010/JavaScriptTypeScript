import { describe, it, expect } from 'vitest';
import { RequestTransformer, ResponseTransformer, ProtocolAdapter } from './request-transformer.js';

describe('RequestTransformer', () => {
  it('rewrites paths', () => {
    const transformer = new RequestTransformer({
      pathRewrite: { '^/api/v1': '/v1' }
    });
    const result = transformer.transform({
      method: 'GET',
      path: '/api/v1/users',
      headers: {},
      query: {}
    });
    expect(result.path).toBe('/v1/users');
  });

  it('maps headers', () => {
    const transformer = new RequestTransformer({
      headerMappings: [{ source: 'X-User-ID', target: 'X-Internal-ID' }]
    });
    const result = transformer.transform({
      method: 'GET',
      path: '/',
      headers: { 'x-user-id': '123' },
      query: {}
    });
    expect(result.headers['x-internal-id']).toBe('123');
  });

  it('strips specified headers', () => {
    const transformer = new RequestTransformer({
      stripHeaders: ['x-forwarded-for']
    });
    const result = transformer.transform({
      method: 'GET',
      path: '/',
      headers: { 'x-forwarded-for': '1.2.3.4', 'content-type': 'json' },
      query: {}
    });
    expect(result.headers['x-forwarded-for']).toBeUndefined();
    expect(result.headers['content-type']).toBe('json');
  });

  it('adds fixed headers', () => {
    const transformer = new RequestTransformer({
      addHeaders: { 'X-Gateway': 'v1' }
    });
    const result = transformer.transform({
      method: 'GET',
      path: '/',
      headers: {},
      query: {}
    });
    expect(result.headers['x-gateway']).toBe('v1');
  });

  it('maps query parameters', () => {
    const transformer = new RequestTransformer({
      queryMappings: [{ source: 'page', target: 'pageNumber' }]
    });
    const result = transformer.transform({
      method: 'GET',
      path: '/',
      headers: {},
      query: { page: '1' }
    });
    expect(result.query['pageNumber']).toBe('1');
    expect(result.query['page']).toBeUndefined();
  });

  it('maps body fields', () => {
    const transformer = new RequestTransformer({
      bodyMappings: [{ source: 'userName', target: 'name' }]
    });
    const result = transformer.transform({
      method: 'POST',
      path: '/',
      headers: {},
      query: {},
      body: { userName: 'Alice', age: 30 }
    });
    expect((result.body as Record<string, unknown>).name).toBe('Alice');
  });

  it('applies default values for required missing fields', () => {
    const transformer = new RequestTransformer({
      headerMappings: [{ source: 'X-Trace', target: 'X-Trace-ID', required: true, defaultValue: 'default-trace' }]
    });
    const result = transformer.transform({
      method: 'GET',
      path: '/',
      headers: {},
      query: {}
    });
    expect(result.headers['x-trace-id']).toBe('default-trace');
  });
});

describe('ResponseTransformer', () => {
  it('wraps data in success response', () => {
    const response = ResponseTransformer.wrap({ id: 1 });
    expect(response.status).toBe(200);
    expect((response.body as Record<string, unknown>).success).toBe(true);
  });

  it('wraps error response', () => {
    const response = ResponseTransformer.error('Not found', 404, 'NOT_FOUND');
    expect(response.status).toBe(404);
    expect((response.body as Record<string, unknown>).success).toBe(false);
    expect((response.body as Record<string, unknown>).code).toBe('NOT_FOUND');
  });

  it('aggregates multiple responses', () => {
    const result = ResponseTransformer.aggregate([
      { service: 'a', response: ResponseTransformer.wrap({}) },
      { service: 'b', response: ResponseTransformer.error('fail', 500) }
    ]);
    expect(result.status).toBe(207);
    expect((result.body as Record<string, unknown>).errors).toBeDefined();
  });

  it('returns 200 when all aggregated responses succeed', () => {
    const result = ResponseTransformer.aggregate([
      { service: 'a', response: ResponseTransformer.wrap({}) },
      { service: 'b', response: ResponseTransformer.wrap({}) }
    ]);
    expect(result.status).toBe(200);
  });

  it('transforms content type', () => {
    const response = ResponseTransformer.wrap({});
    const transformed = ResponseTransformer.transformContentType(response, 'text/plain');
    expect(transformed.headers['Content-Type']).toBe('text/plain');
  });
});

describe('ProtocolAdapter', () => {
  it('converts GraphQL to REST', () => {
    const result = ProtocolAdapter.graphqlToRest({
      operationName: 'getUsers',
      variables: { limit: 10 }
    });
    expect(result.path).toBe('getUsers');
    expect(result.params).toEqual({ limit: 10 });
  });

  it('converts REST to gRPC', () => {
    const result = ProtocolAdapter.restToGRPC('/users/:id', { id: '123', name: 'Alice' });
    expect(result.method).toBe('users.ById');
  });

  it('converts WebSocket to HTTP', () => {
    const result = ProtocolAdapter.websocketToHttp({ action: 'create', payload: { id: 1 } });
    expect(result.method).toBe('POST');
    expect(result.path).toBe('/ws/create');
  });
});
