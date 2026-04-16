import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  UserRepository,
  RelationLoader,
  TransactionManager,
  PaginationHelper,
} from './prisma-patterns.js';
import type { User } from './prisma-patterns.js';

describe('UserRepository', () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
  });

  it('should create a user', async () => {
    const user = await repo.create({ email: 'test@example.com', name: 'Alice' });
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Alice');
    expect(user.posts).toEqual([]);
  });

  it('should find a user by id', async () => {
    const user = await repo.create({ email: 'test@example.com' });
    const found = await repo.findUnique(user.id);
    expect(found?.id).toBe(user.id);
  });

  it('should return null for missing user', async () => {
    const found = await repo.findUnique('nonexistent');
    expect(found).toBeNull();
  });

  it('should find first matching user', async () => {
    await repo.create({ email: 'a@example.com' });
    await repo.create({ email: 'b@example.com' });
    const found = await repo.findFirst({ email: 'b@example.com' });
    expect(found?.email).toBe('b@example.com');
  });

  it('should update a user', async () => {
    const user = await repo.create({ email: 'test@example.com' });
    const updated = await repo.update(user.id, { name: 'Bob' });
    expect(updated.name).toBe('Bob');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
  });

  it('should throw when updating missing user', async () => {
    await expect(repo.update('missing', { name: 'Bob' })).rejects.toThrow('User not found');
  });

  it('should delete a user', async () => {
    const user = await repo.create({ email: 'test@example.com' });
    const deleted = await repo.delete(user.id);
    expect(deleted.id).toBe(user.id);
    expect(await repo.findUnique(user.id)).toBeNull();
  });

  it('should throw when deleting missing user', async () => {
    await expect(repo.delete('missing')).rejects.toThrow('User not found');
  });

  it('should find many with pagination', async () => {
    await repo.create({ email: 'a@example.com' });
    await repo.create({ email: 'b@example.com' });
    await repo.create({ email: 'c@example.com' });

    const results = await repo.findMany({ skip: 1, take: 2, orderBy: { email: 'asc' } });
    expect(results).toHaveLength(2);
  });

  it('should count users', async () => {
    await repo.create({ email: 'a@example.com' });
    await repo.create({ email: 'b@example.com' });
    expect(await repo.count()).toBe(2);
    expect(await repo.count({ email: 'a@example.com' })).toBe(1);
  });
});

describe('RelationLoader', () => {
  const loader = new RelationLoader();

  it('should eager load posts', async () => {
    const user = await loader.loadWithPosts('user-1');
    expect(user).not.toBeNull();
    expect(user!.posts.length).toBeGreaterThan(0);
  });

  it('should lazy load posts', async () => {
    const posts = await loader.loadPostsLazy('user-1');
    expect(posts.length).toBeGreaterThan(0);
  });

  it('should select specific fields', async () => {
    const partial = await loader.selectFields('user-1');
    expect(partial.id).toBe('user-1');
    expect(partial.email).toBeDefined();
  });
});

describe('TransactionManager', () => {
  it('should commit operations in order', async () => {
    const tm = new TransactionManager();
    const order: number[] = [];

    tm.add(async () => { order.push(1); return 1; });
    tm.add(async () => { order.push(2); return 2; });
    await tm.commit();

    expect(order).toEqual([1, 2]);
  });

  it('should resolve operation results', async () => {
    const tm = new TransactionManager();
    const result = tm.add(async () => 42);
    await tm.commit();
    expect(await result).toBe(42);
  });

  it('should clear operations on rollback', async () => {
    const tm = new TransactionManager();
    const op = vi.fn().mockResolvedValue(1);
    tm.add(op);
    await tm.rollback();
    await tm.commit();
    expect(op).not.toHaveBeenCalled();
  });
});

describe('PaginationHelper', () => {
  it('should paginate results', async () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = await PaginationHelper.paginate(
      async () => data,
      async () => 10,
      1,
      3
    );

    expect(result.data).toEqual(data);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalItems).toBe(10);
    expect(result.pagination.totalPages).toBe(4);
    expect(result.pagination.hasNextPage).toBe(true);
  });

  it('should create cursor pagination', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const result = PaginationHelper.createCursor(items, 2);

    expect(result.data).toHaveLength(2);
    expect(result.nextCursor).toBe('b');
  });

  it('should return null cursor when no more items', () => {
    const items = [{ id: 'a' }];
    const result = PaginationHelper.createCursor(items, 2);

    expect(result.data).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });
});
