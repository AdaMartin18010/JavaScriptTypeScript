/**
 * @file SQL 查询构建器
 * @category Database → Query Builder
 * @difficulty medium
 * @tags sql, query-builder, type-safe, fluent-api
 * 
 * @description
 * 类型安全的 SQL 查询构建器实现：
 * - Fluent API
 * - 类型安全
 * - 参数化查询
 * - 复杂查询支持
 */

// ============================================================================
// 1. 类型定义
// ============================================================================

type Primitive = string | number | boolean | Date | null;

interface Column<T = unknown> {
  name: string;
  type: string;
  nullable?: boolean;
  default?: Primitive;
  primary?: boolean;
}

interface Table<T = Record<string, unknown>> {
  name: string;
  columns: { [K in keyof T]: Column<T[K]> };
}

// ============================================================================
// 2. 查询构建器
// ============================================================================

export class QueryBuilder<T = Record<string, unknown>> {
  private tableName = '';
  private selectColumns: string[] = ['*'];
  private whereConditions: { column: string; operator: string; value: Primitive }[] = [];
  private orderByClauses: { column: string; direction: 'ASC' | 'DESC' }[] = [];
  private limitValue: number | null = null;
  private offsetValue: number | null = null;
  private joinClauses: { type: string; table: string; on: string }[] = [];
  private groupByColumns: string[] = [];
  private havingConditions: { column: string; operator: string; value: Primitive }[] = [];

  // 选择表
  table(name: string): this {
    this.tableName = name;
    return this;
  }

  // 选择列
  select(...columns: (keyof T | string)[]): this {
    this.selectColumns = columns as string[];
    return this;
  }

  // WHERE 条件
  where<K extends keyof T>(column: K, operator: string, value: T[K]): this {
    this.whereConditions.push({ column: column as string, operator, value: value as Primitive });
    return this;
  }

  whereEquals<K extends keyof T>(column: K, value: T[K]): this {
    return this.where(column, '=', value);
  }

  whereIn<K extends keyof T>(column: K, values: T[K][]): this {
    this.whereConditions.push({
      column: column as string,
      operator: 'IN',
      value: values as unknown as Primitive
    });
    return this;
  }

  whereNull<K extends keyof T>(column: K): this {
    this.whereConditions.push({
      column: column as string,
      operator: 'IS NULL',
      value: null
    });
    return this;
  }

  whereBetween<K extends keyof T>(column: K, min: T[K], max: T[K]): this {
    this.whereConditions.push({
      column: column as string,
      operator: 'BETWEEN',
      value: `${min} AND ${max}` as Primitive
    });
    return this;
  }

  // JOIN
  join(table: string, on: string): this {
    this.joinClauses.push({ type: 'JOIN', table, on });
    return this;
  }

  leftJoin(table: string, on: string): this {
    this.joinClauses.push({ type: 'LEFT JOIN', table, on });
    return this;
  }

  rightJoin(table: string, on: string): this {
    this.joinClauses.push({ type: 'RIGHT JOIN', table, on });
    return this;
  }

  // ORDER BY
  orderBy<K extends keyof T>(column: K, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByClauses.push({ column: column as string, direction });
    return this;
  }

  // GROUP BY
  groupBy<K extends keyof T>(...columns: K[]): this {
    this.groupByColumns = columns as string[];
    return this;
  }

  // HAVING
  having<K extends keyof T>(column: K, operator: string, value: T[K]): this {
    this.havingConditions.push({ column: column as string, operator, value: value as Primitive });
    return this;
  }

  // LIMIT / OFFSET
  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  offset(n: number): this {
    this.offsetValue = n;
    return this;
  }

  // 构建 SQL
  build(): { sql: string; params: Primitive[] } {
    const parts: string[] = [];
    const params: Primitive[] = [];

    // SELECT
    parts.push(`SELECT ${this.selectColumns.join(', ')}`);

    // FROM
    parts.push(`FROM ${this.tableName}`);

    // JOIN
    for (const join of this.joinClauses) {
      parts.push(`${join.type} ${join.table} ON ${join.on}`);
    }

    // WHERE
    if (this.whereConditions.length > 0) {
      const whereClause = this.whereConditions
        .map(cond => {
          if (cond.operator === 'IN') {
            const values = Array.isArray(cond.value) ? cond.value : [cond.value];
            const placeholders = values.map(() => '?').join(', ');
            params.push(...values);
            return `${cond.column} IN (${placeholders})`;
          } else if (cond.operator === 'IS NULL') {
            return `${cond.column} IS NULL`;
          } else if (cond.operator === 'BETWEEN') {
            return `${cond.column} BETWEEN ? AND ?`;
          } else {
            params.push(cond.value);
            return `${cond.column} ${cond.operator} ?`;
          }
        })
        .join(' AND ');
      parts.push(`WHERE ${whereClause}`);
    }

    // GROUP BY
    if (this.groupByColumns.length > 0) {
      parts.push(`GROUP BY ${this.groupByColumns.join(', ')}`);
    }

    // HAVING
    if (this.havingConditions.length > 0) {
      const havingClause = this.havingConditions
        .map(cond => {
          params.push(cond.value);
          return `${cond.column} ${cond.operator} ?`;
        })
        .join(' AND ');
      parts.push(`HAVING ${havingClause}`);
    }

    // ORDER BY
    if (this.orderByClauses.length > 0) {
      const orderClause = this.orderByClauses
        .map(o => `${o.column} ${o.direction}`)
        .join(', ');
      parts.push(`ORDER BY ${orderClause}`);
    }

    // LIMIT
    if (this.limitValue !== null) {
      parts.push(`LIMIT ${this.limitValue}`);
    }

    // OFFSET
    if (this.offsetValue !== null) {
      parts.push(`OFFSET ${this.offsetValue}`);
    }

    return { sql: parts.join(' '), params };
  }

  // 重置构建器
  reset(): this {
    this.tableName = '';
    this.selectColumns = ['*'];
    this.whereConditions = [];
    this.orderByClauses = [];
    this.limitValue = null;
    this.offsetValue = null;
    this.joinClauses = [];
    this.groupByColumns = [];
    this.havingConditions = [];
    return this;
  }
}

// ============================================================================
// 3. 插入构建器
// ============================================================================

export class InsertBuilder<T = Record<string, unknown>> {
  private tableName = '';
  private data: Partial<T> = {};

  table(name: string): this {
    this.tableName = name;
    return this;
  }

  values(data: Partial<T>): this {
    this.data = data;
    return this;
  }

  build(): { sql: string; params: Primitive[] } {
    const columns = Object.keys(this.data);
    const placeholders = columns.map(() => '?').join(', ');
    const params = Object.values(this.data) as Primitive[];

    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    return { sql, params };
  }
}

// ============================================================================
// 4. 更新构建器
// ============================================================================

export class UpdateBuilder<T = Record<string, unknown>> {
  private tableName = '';
  private data: Partial<T> = {};
  private whereConditions: { column: string; operator: string; value: Primitive }[] = [];

  table(name: string): this {
    this.tableName = name;
    return this;
  }

  set(data: Partial<T>): this {
    this.data = data;
    return this;
  }

  where<K extends keyof T>(column: K, operator: string, value: T[K]): this {
    this.whereConditions.push({ column: column as string, operator, value: value as Primitive });
    return this;
  }

  build(): { sql: string; params: Primitive[] } {
    const setClauses = Object.keys(this.data);
    const params = [
      ...Object.values(this.data) as Primitive[],
      ...this.whereConditions.map(c => c.value)
    ];

    let sql = `UPDATE ${this.tableName} SET ${setClauses.map(c => `${c} = ?`).join(', ')}`;

    if (this.whereConditions.length > 0) {
      const whereClause = this.whereConditions
        .map(c => `${c.column} ${c.operator} ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }

    return { sql, params };
  }
}

// ============================================================================
// 5. 删除构建器
// ============================================================================

export class DeleteBuilder<T = Record<string, unknown>> {
  private tableName = '';
  private whereConditions: { column: string; operator: string; value: Primitive }[] = [];

  table(name: string): this {
    this.tableName = name;
    return this;
  }

  where<K extends keyof T>(column: K, operator: string, value: T[K]): this {
    this.whereConditions.push({ column: column as string, operator, value: value as Primitive });
    return this;
  }

  build(): { sql: string; params: Primitive[] } {
    let sql = `DELETE FROM ${this.tableName}`;

    if (this.whereConditions.length > 0) {
      const whereClause = this.whereConditions
        .map(c => `${c.column} ${c.operator} ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      const params = this.whereConditions.map(c => c.value);
      return { sql, params };
    }

    return { sql, params: [] };
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

interface UserTable {
  id: number;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive';
  created_at: Date;
}

export function demo(): void {
  console.log('=== SQL 查询构建器 ===\n');

  // SELECT 查询
  console.log('--- SELECT 查询 ---');
  const selectQuery = new QueryBuilder<UserTable>()
    .table('users')
    .select('id', 'name', 'email')
    .whereEquals('status', 'active')
    .where('age', '>=', 18)
    .orderBy('created_at', 'DESC')
    .limit(10)
    .build();
  console.log('SQL:', selectQuery.sql);
  console.log('Params:', selectQuery.params);

  // JOIN 查询
  console.log('\n--- JOIN 查询 ---');
  const joinQuery = new QueryBuilder()
    .table('users')
    .select('users.name', 'posts.title')
    .leftJoin('posts', 'users.id = posts.user_id')
    .where('users.status', '=', 'active')
    .build();
  console.log('SQL:', joinQuery.sql);

  // IN 查询
  console.log('\n--- IN 查询 ---');
  const inQuery = new QueryBuilder<UserTable>()
    .table('users')
    .whereIn('id', [1, 2, 3, 4, 5])
    .build();
  console.log('SQL:', inQuery.sql);

  // GROUP BY 查询
  console.log('\n--- GROUP BY 查询 ---');
  const groupQuery = new QueryBuilder()
    .table('users')
    .select('status', 'COUNT(*) as count')
    .groupBy('status')
    .having('COUNT(*)', '>', 5)
    .build();
  console.log('SQL:', groupQuery.sql);

  // INSERT
  console.log('\n--- INSERT ---');
  const insertQuery = new InsertBuilder<UserTable>()
    .table('users')
    .values({ name: 'John', email: 'john@example.com', age: 25, status: 'active' })
    .build();
  console.log('SQL:', insertQuery.sql);
  console.log('Params:', insertQuery.params);

  // UPDATE
  console.log('\n--- UPDATE ---');
  const updateQuery = new UpdateBuilder<UserTable>()
    .table('users')
    .set({ status: 'inactive' })
    .where('id', '=', 1)
    .build();
  console.log('SQL:', updateQuery.sql);

  // DELETE
  console.log('\n--- DELETE ---');
  const deleteQuery = new DeleteBuilder<UserTable>()
    .table('users')
    .where('status', '=', 'inactive')
    .build();
  console.log('SQL:', deleteQuery.sql);

  console.log('\n查询构建器特点:');
  console.log('- 类型安全：利用 TypeScript 类型检查');
  console.log('- 参数化：防止 SQL 注入');
  console.log('- 流式 API：链式调用，清晰可读');
  console.log('- 灵活组合：支持复杂查询');
}

// ============================================================================
// 导出
// ============================================================================

// Classes already exported inline above

export type {
  Primitive,
  Column,
  Table
};
