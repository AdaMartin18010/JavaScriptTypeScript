import { describe, it, expect } from 'vitest';
import { RuleBasedAgent } from './rule-based-agent.js';

describe('RuleBasedAgent', () => {
  it('should assert and retrieve facts', () => {
    const agent = new RuleBasedAgent();
    agent.assert({ predicate: 'temp', subject: 'room', value: 25 });
    expect(agent.getFacts()).toHaveLength(1);
    expect(agent.query('temp', 'room')[0].value).toBe(25);
  });

  it('should fire rule when condition matches', () => {
    const agent = new RuleBasedAgent();
    agent.addRule({
      id: 'r1',
      name: '高温规则',
      priority: 1,
      once: true,
      conditions: [{ predicate: 'temp', subject: 'room', value: 30 }],
      actions: [{ type: 'assert', fact: { predicate: 'alert', subject: 'system', value: 'hot' } }],
    });

    agent.assert({ predicate: 'temp', subject: 'room', value: 30 });
    const result = agent.infer();

    expect(result.firings).toHaveLength(1);
    expect(result.firings[0].ruleName).toBe('高温规则');
    expect(result.newFacts).toHaveLength(1);
    expect(result.newFacts[0].predicate).toBe('alert');
  });

  it('should not fire rule when condition does not match', () => {
    const agent = new RuleBasedAgent();
    agent.addRule({
      id: 'r1',
      name: '低温规则',
      priority: 1,
      once: true,
      conditions: [{ predicate: 'temp', subject: 'room', value: 10 }],
      actions: [{ type: 'assert', fact: { predicate: 'alert', subject: 'system', value: 'cold' } }],
    });

    agent.assert({ predicate: 'temp', subject: 'room', value: 30 });
    const result = agent.infer();

    expect(result.firings).toHaveLength(0);
    expect(result.newFacts).toHaveLength(0);
  });

  it('should support numeric comparison operators', () => {
    const agent = new RuleBasedAgent();
    agent.addRule({
      id: 'r1',
      name: '大于规则',
      priority: 1,
      once: true,
      conditions: [{ predicate: 'temp', subject: 'room', value: 25, operator: 'gt' }],
      actions: [{ type: 'assert', fact: { predicate: 'status', subject: 'room', value: 'warm' } }],
    });

    agent.assert({ predicate: 'temp', subject: 'room', value: 30 });
    const result = agent.infer();
    expect(result.firings).toHaveLength(1);
  });

  it('should retract facts', () => {
    const agent = new RuleBasedAgent();
    agent.assert({ predicate: 'temp', subject: 'room', value: 30 });
    const removed = agent.retract('temp', 'room');
    expect(removed).toHaveLength(1);
    expect(agent.getFacts()).toHaveLength(0);
  });

  it('should respect once flag on rules', () => {
    const agent = new RuleBasedAgent();
    agent.addRule({
      id: 'r1',
      name: '一次性规则',
      priority: 1,
      once: true,
      conditions: [{ predicate: 'signal', subject: 'sensor', value: 'on' }],
      actions: [{ type: 'assert', fact: { predicate: 'log', subject: 'system', value: 'triggered' } }],
    });

    agent.assert({ predicate: 'signal', subject: 'sensor', value: 'on' });
    agent.infer();
    const result = agent.infer();

    expect(result.firings).toHaveLength(0);
  });

  it('should prioritize higher priority rules', () => {
    const agent = new RuleBasedAgent();
    const fired: string[] = [];

    agent.addRule({
      id: 'r-low',
      name: '低优先级',
      priority: 1,
      conditions: [{ predicate: 'trigger', subject: 'test', value: true }],
      actions: [{ type: 'log', message: 'low' }],
    });

    agent.addRule({
      id: 'r-high',
      name: '高优先级',
      priority: 10,
      conditions: [{ predicate: 'trigger', subject: 'test', value: true }],
      actions: [{ type: 'log', message: 'high' }],
    });

    agent.assert({ predicate: 'trigger', subject: 'test', value: true });
    const result = agent.infer();

    expect(result.firings[0].ruleName).toBe('高优先级');
  });

  it('should support modify action', () => {
    const agent = new RuleBasedAgent();
    agent.addRule({
      id: 'r1',
      name: '修改规则',
      priority: 1,
      conditions: [{ predicate: 'status', subject: 'door', value: 'closed' }],
      actions: [{ type: 'modify', predicate: 'status', subject: 'door', value: 'open' }],
    });

    agent.assert({ predicate: 'status', subject: 'door', value: 'closed' });
    agent.infer();

    const fact = agent.query('status', 'door')[0];
    expect(fact.value).toBe('open');
  });

  it('should clear all state', () => {
    const agent = new RuleBasedAgent();
    agent.assert({ predicate: 'test', subject: 'a', value: 1 });
    agent.addRule({ id: 'r1', name: 'test', priority: 1, conditions: [], actions: [] });
    agent.clear();

    expect(agent.getFacts()).toHaveLength(0);
    expect(agent.infer().firings).toHaveLength(0);
  });
});
