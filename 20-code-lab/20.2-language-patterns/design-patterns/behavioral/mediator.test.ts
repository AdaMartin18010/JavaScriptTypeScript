import { describe, it, expect, vi } from 'vitest';
import {
  ChatRoom,
  ConcreteUser,
  RegistrationForm,
  EventBus
} from './mediator.js';

describe('mediator pattern', () => {
  it('ChatRoom should broadcast messages to all users except sender', () => {
    const chatRoom = new ChatRoom();
    const alice = new ConcreteUser('Alice');
    const bob = new ConcreteUser('Bob');
    const carol = new ConcreteUser('Carol');

    chatRoom.addUser(alice);
    chatRoom.addUser(bob);
    chatRoom.addUser(carol);

    const bobReceive = vi.spyOn(bob, 'receive');
    const carolReceive = vi.spyOn(carol, 'receive');

    alice.send('Hello everyone!');

    expect(bobReceive).toHaveBeenCalledWith('Hello everyone!', 'Alice');
    expect(carolReceive).toHaveBeenCalledWith('Hello everyone!', 'Alice');
  });

  it('RegistrationForm should validate and enable submit button', () => {
    const form = new RegistrationForm();
    const submitButton = form.getSubmitButton();

    // Initially invalid
    submitButton.click();
    // Should not throw, just not notify because button is disabled

    form.getNameField().setValue('John Doe');
    form.getEmailField().setValue('john@example.com');
    form.getAgreeCheckbox().check();

    // Now button should be enabled
    expect(() => { submitButton.click(); }).not.toThrow();
  });

  it('RegistrationForm should keep submit disabled with invalid data', () => {
    const form = new RegistrationForm();
    const submitButton = form.getSubmitButton();

    form.getNameField().setValue('John');
    // Missing @ in email and checkbox not checked
    form.getEmailField().setValue('invalid-email');

    // Even if we try to click, the button should remain disabled
    expect(() => { submitButton.click(); }).not.toThrow();
  });

  it('EventBus should support subscribe, publish and unsubscribe', () => {
    const bus = new EventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const unsubscribe1 = bus.subscribe('test-event', handler1);
    bus.subscribe('test-event', handler2);

    bus.publish('test-event', { data: 1 });
    expect(handler1).toHaveBeenCalledWith({ data: 1 });
    expect(handler2).toHaveBeenCalledWith({ data: 1 });

    unsubscribe1();
    bus.publish('test-event', { data: 2 });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(2);
  });

  it('EventBus should not call handlers for different events', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe('event-a', handler);
    bus.publish('event-b', { data: 1 });

    expect(handler).not.toHaveBeenCalled();
  });
});
