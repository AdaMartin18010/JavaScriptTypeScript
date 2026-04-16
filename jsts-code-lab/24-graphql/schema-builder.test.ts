import { describe, it, expect } from 'vitest';
import { SchemaBuilder, QueryParser, QueryExecutor, DataLoader } from './schema-builder';

describe('SchemaBuilder', () => {
  it('builds schema with query', () => {
    const builder = new SchemaBuilder();
    builder.query({
      hello: { type: 'String', resolve: () => 'world' }
    });
    const schema = builder.build();
    expect(schema.query.fields.hello).toBeDefined();
    expect(schema.query.fields.hello.type).toBe('String');
  });

  it('builds schema with mutation', () => {
    const builder = new SchemaBuilder();
    builder.mutation({
      createUser: { type: 'String', resolve: () => 'ok' }
    });
    const schema = builder.build();
    expect(schema.mutation?.fields.createUser).toBeDefined();
  });
});

describe('QueryParser', () => {
  it('parses query name and selections', () => {
    const parser = new QueryParser();
    const parsed = parser.parse(`query GetUser
{
  user(id: "1")
  {
    name
    email
  }
}`);
    expect(parsed.operation).toBe('query');
    expect(parsed.name).toBe('GetUser');
    expect(parsed.selections.map(s => s.name)).toContain('user');
    const userSel = parsed.selections.find(s => s.name === 'user');
    expect(userSel?.selections?.map(s => s.name)).toEqual(['name', 'email']);
  });

  it('parses mutation', () => {
    const parser = new QueryParser();
    const parsed = parser.parse(`mutation CreateUser
{
  createUser
}`);
    expect(parsed.operation).toBe('mutation');
    expect(parsed.name).toBe('CreateUser');
  });
});

describe('QueryExecutor', () => {
  it('executes resolver and returns data', async () => {
    const builder = new SchemaBuilder();
    builder.query({
      hello: { type: 'String', resolve: () => 'world' }
    });
    const executor = new QueryExecutor(builder.build());
    const result = await executor.execute(`query Q
{
  hello
}`);
    expect(result.data?.hello).toBe('world');
  });

  it('returns error for unknown field', async () => {
    const builder = new SchemaBuilder();
    builder.query({ hello: { type: 'String' } });
    const executor = new QueryExecutor(builder.build());
    const result = await executor.execute(`query Q
{
  unknown
}`);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});

describe('DataLoader', () => {
  it('batches duplicate keys', async () => {
    let batchCount = 0;
    const loader = new DataLoader<string, string>(async (keys) => {
      batchCount++;
      return keys.map(k => `v-${k}`);
    });
    const [a, b, c] = await Promise.all([loader.load('1'), loader.load('2'), loader.load('1')]);
    expect(batchCount).toBe(1);
    expect(a).toBe('v-1');
    expect(b).toBe('v-2');
    expect(c).toBe('v-1');
  });

  it('loadMany returns values and errors', async () => {
    const loader = new DataLoader<number, number>(async (keys) => {
      return keys.map(k => (k === 2 ? new Error('fail') : k * 2));
    });
    const results = await loader.loadMany([1, 2, 3]);
    expect(results[0]).toBe(2);
    expect(results[1]).toBeInstanceOf(Error);
    expect(results[2]).toBe(6);
  });
});
