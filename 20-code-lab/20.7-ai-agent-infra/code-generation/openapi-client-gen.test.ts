import { describe, it, expect } from 'vitest';
import {
  TypeScriptTypeGenerator,
  APIMethodGenerator,
  RequestWrapperGenerator,
  type OpenAPISpec
} from './openapi-client-gen.js';

describe('TypeScriptTypeGenerator', () => {
  it('TypeScriptTypeGenerator is defined', () => {
    expect(typeof TypeScriptTypeGenerator).not.toBe('undefined');
  });

  it('generates string type for string schema', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.schemaToTypeString({ type: 'string' });
    expect(result).toBe('string');
  });

  it('generates number type for integer schema', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.schemaToTypeString({ type: 'integer' });
    expect(result).toBe('number');
  });

  it('generates Date type for date-time format', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.schemaToTypeString({ type: 'string', format: 'date-time' });
    expect(result).toBe('Date | string');
  });

  it('generates array type with items', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.schemaToTypeString({ type: 'array', items: { type: 'string' } });
    expect(result).toBe('Array<string>');
  });

  it('generates enum union type', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.schemaToTypeString({ type: 'string', enum: ['a', 'b', 'c'] });
    expect(result).toBe("'a' | 'b' | 'c'");
  });

  it('generates object interface with properties', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.generateSchemaType('User', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        age: { type: 'integer' }
      },
      required: ['id']
    });
    expect(result).toContain('export interface User');
    expect(result).toContain('id: string;');
    expect(result).toContain('age?: number;');
  });

  it('resolves $ref to PascalCase name', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.schemaToTypeString({ $ref: '#/components/schemas/UserProfile' });
    expect(result).toBe('UserProfile');
  });

  it('handles allOf as intersection', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.schemaToTypeString({
      allOf: [{ type: 'object', properties: { a: { type: 'string' } } }, { $ref: '#/components/schemas/B' }]
    });
    expect(result).toContain('&');
  });

  it('handles Record for additionalProperties true', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.schemaToTypeString({ type: 'object', additionalProperties: true });
    expect(result).toBe('Record<string, unknown>');
  });

  it('generates component schemas', () => {
    const gen = new TypeScriptTypeGenerator();
    const result = gen.generateComponentSchemas({
      User: { type: 'object', properties: { id: { type: 'string' } } },
      Order: { type: 'object', properties: { total: { type: 'number' } } }
    });
    expect(result).toContain('User');
    expect(result).toContain('Order');
  });
});

describe('APIMethodGenerator', () => {
  it('APIMethodGenerator is defined', () => {
    expect(typeof APIMethodGenerator).not.toBe('undefined');
  });

  const sampleSpec: OpenAPISpec = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          operationId: 'listUsers',
          summary: 'List users',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } }
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' } } } }
                }
              }
            }
          }
        },
        post: {
          operationId: 'createUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', properties: { name: { type: 'string' } } }
              }
            }
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { id: { type: 'string' } } }
                }
              }
            }
          }
        }
      },
      '/users/{id}': {
        get: {
          operationId: 'getUser',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { id: { type: 'string' } } }
                }
              }
            }
          }
        }
      }
    }
  };

  it('extracts methods from paths', () => {
    const gen = new APIMethodGenerator();
    const methods = gen.generateMethods(sampleSpec.paths);
    expect(methods.length).toBe(3);
    expect(methods.map(m => m.name)).toContain('listUsers');
    expect(methods.map(m => m.name)).toContain('createUser');
    expect(methods.map(m => m.name)).toContain('getUser');
  });

  it('infers method name when operationId is missing', () => {
    const gen = new APIMethodGenerator();
    const methods = gen.generateMethods({
      '/items': {
        get: {
          responses: { '200': { description: 'OK' } }
        }
      }
    });
    expect(methods[0].name).toContain('get');
  });

  it('generates client method code', () => {
    const gen = new APIMethodGenerator();
    const methods = gen.generateMethods(sampleSpec.paths);
    const listUsers = methods.find(m => m.name === 'listUsers');
    expect(listUsers).toBeDefined();

    const code = gen.generateClientMethod(listUsers!);
    expect(code).toContain('async listUsers');
    expect(code).toContain('Promise<Array<{');
    expect(code).toContain('this.request');
  });

  it('identifies path and query parameters', () => {
    const gen = new APIMethodGenerator();
    const methods = gen.generateMethods(sampleSpec.paths);
    const getUser = methods.find(m => m.name === 'getUser');
    expect(getUser).toBeDefined();
    expect(getUser!.parameters.some(p => p.location === 'path')).toBe(true);

    const listUsers = methods.find(m => m.name === 'listUsers');
    expect(listUsers!.parameters.some(p => p.location === 'query')).toBe(true);
  });

  it('extracts request body type', () => {
    const gen = new APIMethodGenerator();
    const methods = gen.generateMethods(sampleSpec.paths);
    const createUser = methods.find(m => m.name === 'createUser');
    expect(createUser).toBeDefined();
    expect(createUser!.requestBodyType).toBeDefined();
  });
});

describe('RequestWrapperGenerator', () => {
  it('RequestWrapperGenerator is defined', () => {
    expect(typeof RequestWrapperGenerator).not.toBe('undefined');
  });

  it('generates base client with APIError and APIClient', () => {
    const gen = new RequestWrapperGenerator();
    const code = gen.generateBaseClient();
    expect(code).toContain('interface APIError');
    expect(code).toContain('class APIClient');
    expect(code).toContain('request<T>');
  });

  it('generates full client from spec', () => {
    const gen = new RequestWrapperGenerator();
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Pet Store', version: '1.0.0' },
      paths: {
        '/pets': {
          get: {
            operationId: 'listPets',
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          Pet: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' }
            },
            required: ['id', 'name']
          }
        }
      }
    };

    const code = gen.generateFullClient(spec);
    expect(code).toContain('interface Pet');
    expect(code).toContain('class PetStoreClient');
    expect(code).toContain('listPets');
  });

  it('demo is defined and callable', async () => {
    const { demo } = await import('./openapi-client-gen.js');
    expect(typeof demo).toBe('function');
    await expect(demo()).resolves.toBeUndefined();
  });
});
