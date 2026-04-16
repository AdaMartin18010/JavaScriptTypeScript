import { describe, it, expect } from 'vitest';
import {
  QueryBuilder,
  InsertBuilder,
  UpdateBuilder,
  DeleteBuilder,
} from './sql-query-builder';

describe('QueryBuilder', () => {
  interface User {
    id: number;
    name: string;
    age: number;
    status: 'active' | 'inactive';
  }

  it('should build basic SELECT', () => {
    const { sql } = new QueryBuilder<User>()
      .table('users')
      .select('id', 'name')
      .build();

    expect(sql).toBe('SELECT id, name FROM users');
  });

  it('should build SELECT with WHERE', () => {
    const { sql, params } = new QueryBuilder<User>()
      .table('users')
      .whereEquals('status', 'active')
      .where('age', '>=', 18)
      .build();

    expect(sql).toBe('SELECT * FROM users WHERE status = ? AND age >= ?');
    expect(params).toEqual(['active', 18]);
  });

  it('should build SELECT with IN', () => {
    const { sql, params } = new QueryBuilder<User>()
      .table('users')
      .whereIn('id', [1, 2, 3])
      .build();

    expect(sql).toBe('SELECT * FROM users WHERE id IN (?, ?, ?)');
    expect(params).toEqual([1, 2, 3]);
  });

  it('should build SELECT with NULL check', () => {
    const { sql } = new QueryBuilder<User>()
      .table('users')
      .whereNull('name')
      .build();

    expect(sql).toBe('SELECT * FROM users WHERE name IS NULL');
  });

  it('should build SELECT with BETWEEN', () => {
    const { sql } = new QueryBuilder<User>()
      .table('users')
      .whereBetween('age', 18, 65)
      .build();

    expect(sql).toBe('SELECT * FROM users WHERE age BETWEEN ? AND ?');
  });

  it('should build SELECT with JOIN', () => {
    const { sql } = new QueryBuilder()
      .table('users')
      .select('users.name', 'posts.title')
      .leftJoin('posts', 'users.id = posts.user_id')
      .build();

    expect(sql).toBe('SELECT users.name, posts.title FROM users LEFT JOIN posts ON users.id = posts.user_id');
  });

  it('should build SELECT with ORDER BY and LIMIT/OFFSET', () => {
    const { sql } = new QueryBuilder<User>()
      .table('users')
      .orderBy('age', 'DESC')
      .limit(10)
      .offset(20)
      .build();

    expect(sql).toBe('SELECT * FROM users ORDER BY age DESC LIMIT 10 OFFSET 20');
  });

  it('should build SELECT with GROUP BY and HAVING', () => {
    const { sql, params } = new QueryBuilder()
      .table('users')
      .select('status', 'COUNT(*) as count')
      .groupBy('status')
      .having('COUNT(*)', '>', 5)
      .build();

    expect(sql).toBe('SELECT status, COUNT(*) as count FROM users GROUP BY status HAVING COUNT(*) > ?');
    expect(params).toEqual([5]);
  });

  it('should reset builder state', () => {
    const qb = new QueryBuilder();
    qb.table('users').where('id', '=', 1);
    qb.reset();
    const { sql } = qb.build();
    expect(sql).toBe('SELECT * FROM ');
  });
});

describe('InsertBuilder', () => {
  interface User {
    name: string;
    age: number;
  }

  it('should build INSERT statement', () => {
    const { sql, params } = new InsertBuilder<User>()
      .table('users')
      .values({ name: 'Alice', age: 30 })
      .build();

    expect(sql).toBe('INSERT INTO users (name, age) VALUES (?, ?)');
    expect(params).toEqual(['Alice', 30]);
  });
});

describe('UpdateBuilder', () => {
  interface User {
    name: string;
    age: number;
  }

  it('should build UPDATE statement', () => {
    const { sql, params } = new UpdateBuilder<User>()
      .table('users')
      .set({ name: 'Alice' })
      .where('id', '=', 1)
      .build();

    expect(sql).toBe('UPDATE users SET name = ? WHERE id = ?');
    expect(params).toEqual(['Alice', 1]);
  });

  it('should build UPDATE with multiple SETs and WHEREs', () => {
    const { sql, params } = new UpdateBuilder<User>()
      .table('users')
      .set({ name: 'Alice', age: 30 })
      .where('id', '=', 1)
      .where('status', '=', 'active')
      .build();

    expect(sql).toBe('UPDATE users SET name = ?, age = ? WHERE id = ? AND status = ?');
    expect(params).toEqual(['Alice', 30, 1, 'active']);
  });
});

describe('DeleteBuilder', () => {
  interface User {
    id: number;
    status: string;
  }

  it('should build DELETE statement', () => {
    const { sql, params } = new DeleteBuilder<User>()
      .table('users')
      .where('id', '=', 1)
      .build();

    expect(sql).toBe('DELETE FROM users WHERE id = ?');
    expect(params).toEqual([1]);
  });

  it('should build DELETE without WHERE (dangerous but valid)', () => {
    const { sql, params } = new DeleteBuilder<User>()
      .table('users')
      .build();

    expect(sql).toBe('DELETE FROM users');
    expect(params).toEqual([]);
  });
});
