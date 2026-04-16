import { describe, it, expect } from 'vitest';
import { UserRepository, UserService, UserController, Container, container } from './index.js';

describe('layered architecture', () => {
  it('UserRepository should CRUD users', async () => {
    const repo = new UserRepository();
    const user = { id: '1', name: 'Alice', email: 'alice@example.com' };
    await repo.save(user);
    expect(await repo.findById('1')).toEqual(user);
    expect(await repo.findAll()).toEqual([user]);
    await repo.delete('1');
    expect(await repo.findById('1')).toBeNull();
  });

  it('UserService should validate email before creating user', async () => {
    const service = new UserService(new UserRepository());
    await expect(service.createUser('Alice', 'invalid-email')).rejects.toThrow('Invalid email');
    const user = await service.createUser('Alice', 'alice@example.com');
    expect(user.name).toBe('Alice');
    expect(user.email).toBe('alice@example.com');
  });

  it('UserService should update email', async () => {
    const service = new UserService(new UserRepository());
    const user = await service.createUser('Alice', 'alice@example.com');
    const updated = await service.updateEmail(user.id, 'alice@new.com');
    expect(updated.email).toBe('alice@new.com');
    await expect(service.updateEmail('nonexistent', 'test@example.com')).rejects.toThrow('User not found');
  });

  it('UserController should wrap service results', async () => {
    const service = new UserService(new UserRepository());
    const controller = new UserController(service);
    const createResult = await controller.createUser('Alice', 'alice@example.com');
    expect(createResult.success).toBe(true);
    const getResult = await controller.getUser((createResult as any).data.id);
    expect(getResult.success).toBe(true);
    const notFound = await controller.getUser('missing');
    expect(notFound.success).toBe(false);
  });

  it('Container should register and resolve services', () => {
    const c = new Container();
    c.register('value', () => 42);
    expect(c.resolve<number>('value')).toBe(42);
    expect(() => c.resolve('missing')).toThrow('Service missing not found');
  });

  it('default container should resolve UserController', async () => {
    const controller = container.resolve<UserController>('userController');
    const result = await controller.createUser('Bob', 'bob@example.com');
    expect(result.success).toBe(true);
  });
});
