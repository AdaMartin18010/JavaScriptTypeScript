import { describe, it, expect } from 'vitest';
import { WorldModel, SensePlanActLoop, ReactivePlanner } from './sense-plan-act.js';
import type { Environment, SensorReading, ActionResult, Action } from './sense-plan-act.js';

function createMockEnvironment(readings: SensorReading[]): Environment {
  return {
    readSensors: () => readings,
    getEntities: () => [],
    applyAction: () => {},
  };
}

describe('WorldModel', () => {
  it('should update and retrieve entities', () => {
    const wm = new WorldModel();
    wm.updateEntity({ id: 'e1', type: 'robot', properties: { x: 10 }, lastUpdated: Date.now() });
    expect(wm.getEntity('e1')?.properties.x).toBe(10);
  });

  it('should integrate sensor readings', () => {
    const wm = new WorldModel();
    wm.integrateSensorReading({ sensorId: 's1', type: 'temp', value: 25, timestamp: Date.now(), confidence: 1 });
    const entity = wm.getEntity('s1');
    expect(entity).toBeDefined();
    expect(entity!.properties.temp).toBe(25);
  });

  it('should prune stale entities', () => {
    const wm = new WorldModel();
    wm.integrateSensorReading({ sensorId: 'old', type: 'temp', value: 0, timestamp: Date.now() - 10000, confidence: 1 });
    const removed = wm.pruneStaleEntities(5000);
    expect(removed).toHaveLength(1);
    expect(wm.getEntity('old')).toBeUndefined();
  });

  it('should return all entities', () => {
    const wm = new WorldModel();
    wm.updateEntity({ id: 'a', type: 'x', properties: {}, lastUpdated: Date.now() });
    wm.updateEntity({ id: 'b', type: 'y', properties: {}, lastUpdated: Date.now() });
    expect(wm.getAllEntities()).toHaveLength(2);
  });
});

describe('SensePlanActLoop', () => {
  it('should sense environment in step', () => {
    const env = createMockEnvironment([
      { sensorId: 's1', type: 'light', value: 100, timestamp: Date.now(), confidence: 0.9 },
    ]);

    const loop = new SensePlanActLoop(env, () => undefined, { maxLoops: 1 });
    const result = loop.step();

    expect(result.sensed).toHaveLength(1);
    expect(result.sensed[0].value).toBe(100);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should execute planned actions', () => {
    const executed: string[] = [];
    const env = createMockEnvironment([]);

    const action: Action = {
      id: 'a1',
      name: 'move',
      type: 'motion',
      parameters: {},
      execute: () => {
        executed.push('move');
        return { success: true, message: 'moved' };
      },
    };

    const loop = new SensePlanActLoop(
      env,
      () => ({ id: 'p1', actions: [action], goal: 'move-forward', priority: 1 }),
      { maxLoops: 1 }
    );

    const result = loop.step();
    expect(result.actionResults).toHaveLength(1);
    expect(result.actionResults[0].success).toBe(true);
    expect(executed).toContain('move');
  });

  it('should stop on failed action', () => {
    const env = createMockEnvironment([]);
    const action: Action = {
      id: 'a1',
      name: 'fail',
      type: 'test',
      parameters: {},
      execute: () => ({ success: false, message: 'error' }),
    };

    const loop = new SensePlanActLoop(
      env,
      () => ({ id: 'p1', actions: [action, action], goal: 'test', priority: 1 }),
      { maxLoops: 1 }
    );

    const result = loop.step();
    expect(result.actionResults).toHaveLength(1);
    expect(result.actionResults[0].success).toBe(false);
  });

  it('should run multiple loops', () => {
    let count = 0;
    const env = createMockEnvironment([]);
    const loop = new SensePlanActLoop(env, () => {
      count++;
      return undefined;
    }, { maxLoops: 3 });

    loop.run();
    expect(loop.getLoopCount()).toBe(3);
  });

  it('should update world model from action results', () => {
    const env = createMockEnvironment([]);
    const action: Action = {
      id: 'a1',
      name: 'update',
      type: 'test',
      parameters: {},
      execute: () => ({
        success: true,
        message: 'ok',
        worldChanges: [{ id: 'obj1', properties: { status: 'active' } }],
      }),
    };

    const loop = new SensePlanActLoop(
      env,
      () => ({ id: 'p1', actions: [action], goal: 'update', priority: 1 }),
      { maxLoops: 1 }
    );

    loop.step();
    const entity = loop.getWorldModel().getEntity('obj1');
    expect(entity).toBeDefined();
  });
});

describe('ReactivePlanner', () => {
  it('should create plan when condition matches', () => {
    const planner = new ReactivePlanner();
    const wm = new WorldModel();
    wm.updateEntity({ id: 'temp', type: 'sensor', properties: { value: 35 }, lastUpdated: Date.now() });

    planner.addRule(
      worldModel => (worldModel.getEntity('temp')?.properties.value as number) > 30,
      { id: 'ac', name: 'cool', type: 'control', parameters: {}, execute: () => ({ success: true, message: 'cooling' }) },
      5
    );

    const plan = planner.plan(wm);
    expect(plan).toBeDefined();
    expect(plan!.goal).toBe('cool');
  });

  it('should return undefined when no rule matches', () => {
    const planner = new ReactivePlanner();
    const wm = new WorldModel();
    const plan = planner.plan(wm);
    expect(plan).toBeUndefined();
  });

  it('should select highest priority matching rule', () => {
    const planner = new ReactivePlanner();
    const wm = new WorldModel();
    wm.updateEntity({ id: 'flag', type: 'sensor', properties: { on: true }, lastUpdated: Date.now() });

    planner.addRule(
      () => true,
      { id: 'low', name: 'low-action', type: 'test', parameters: {}, execute: () => ({ success: true, message: '' }) },
      1
    );
    planner.addRule(
      () => true,
      { id: 'high', name: 'high-action', type: 'test', parameters: {}, execute: () => ({ success: true, message: '' }) },
      10
    );

    const plan = planner.plan(wm);
    expect(plan!.goal).toBe('high-action');
  });
});
