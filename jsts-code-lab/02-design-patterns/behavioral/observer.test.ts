import { describe, it, expect } from 'vitest';
import { Subject, EventEmitter, ObservableState, Store, createObservable } from './observer';

describe('observer pattern', () => {
  it('Subject should notify and allow unsubscribe', () => {
    const subject = new Subject<string>();
    const values: string[] = [];
    const unsubscribe = subject.subscribe((msg) => values.push(msg));
    subject.notify('hello');
    expect(values).toEqual(['hello']);
    unsubscribe();
    subject.notify('world');
    expect(values).toEqual(['hello']);
  });

  it('EventEmitter should support on, off, once', () => {
    const emitter = new EventEmitter<{ msg: string }>();
    const values: string[] = [];
    emitter.on('msg', (data) => values.push(data));
    emitter.emit('msg', 'a');
    emitter.emit('msg', 'b');
    expect(values).toEqual(['a', 'b']);
  });

  it('EventEmitter once should only fire once', () => {
    const emitter = new EventEmitter<{ count: number }>();
    let count = 0;
    emitter.once('count', () => count++);
    emitter.emit('count', 1);
    emitter.emit('count', 2);
    expect(count).toBe(1);
  });

  it('ObservableState should notify on change', () => {
    const state = new ObservableState(0);
    const changes: Array<{ value: number; oldValue: number }> = [];
    state.subscribe((value, oldValue) => changes.push({ value, oldValue }));
    state.value = 10;
    state.value = 10; // no change, should not notify
    state.value = 20;
    expect(changes).toEqual([{ value: 10, oldValue: 0 }, { value: 20, oldValue: 10 }]);
  });

  it('Store should manage state and emit events', () => {
    const store = new Store();
    let loginData: unknown;
    store.on('user:login', (data) => {
      loginData = data;
    });
    store.login('123', 'Alice');
    expect(loginData).toEqual({ userId: '123', name: 'Alice' });
    expect(store.getData('currentUser')).toEqual({ userId: '123', name: 'Alice' });
    store.logout();
    expect(store.getData('currentUser')).toBeUndefined();
  });

  it('createObservable should trigger callback on property change', () => {
    let changedProp: string | symbol = '';
    let changedValue: unknown;
    const obj = createObservable({ count: 0 }, (prop, value) => {
      changedProp = prop;
      changedValue = value;
    });
    obj.count = 5;
    expect(changedProp).toBe('count');
    expect(changedValue).toBe(5);
  });
});
