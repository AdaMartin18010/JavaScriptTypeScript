import { describe, it, expect } from 'vitest';
import { Person, BankAccount, Database, Container, User, NewBankAccount } from './class-fields.js';

describe('ES2022 class fields', () => {
  it('Person should initialize public fields', () => {
    const person = new Person('Alice', 30);
    expect(person.name).toBe('Alice');
    expect(person.age).toBe(30);
  });

  it('BankAccount should use true private fields', () => {
    const account = new BankAccount('ACC-123', 1000);
    account.deposit(500);
    expect(account.getBalance()).toBe(1500);
    account.withdraw(200);
    expect(account.getBalance()).toBe(1300);
    expect(() => { account.deposit(0); }).toThrow('Invalid amount');
    expect(() => { account.withdraw(2000); }).toThrow('Insufficient funds');
  });

  it('Database should be singleton with private static fields', () => {
    const db1 = Database.getInstance('mongodb://localhost/db');
    const db2 = Database.getInstance('postgres://localhost/db');
    expect(db1).toBe(db2);
  });

  it('Container should check private field with in operator', () => {
    const container = new Container();
    expect(container.hasPrivateData()).toBe(true);
    expect(Container.hasPrivateData(container)).toBe(true);
  });

  it('User should implement UserData and use readonly/optional fields', () => {
    const user = new User({ id: '1', name: 'Bob', email: 'bob@example.com', password: 'secret' });
    expect(user.id).toBe('1');
    expect(user.name).toBe('Bob');
    expect(user.validatePassword('secret')).toBe(true);
    expect(user.validatePassword('wrong')).toBe(false);
  });

  it('NewBankAccount should expose balance through getter', () => {
    const account = new NewBankAccount();
    expect(account.getBalance()).toBe(0);
  });
});
