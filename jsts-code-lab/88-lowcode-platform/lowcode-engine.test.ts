import { describe, it, expect } from 'vitest';
import {
  ComponentLibrary,
  PageDesigner,
  CodeGenerator,
  WorkflowEngine,
  ExpressionEngine
} from './lowcode-engine.js';

describe('ComponentLibrary', () => {
  it('should register and retrieve components', () => {
    const lib = new ComponentLibrary();
    lib.register({
      type: 'button',
      name: '按钮',
      icon: 'button',
      category: 'basic',
      properties: [],
      defaultProps: {}
    });
    expect(lib.get('button')).toBeDefined();
    expect(lib.getAll().length).toBe(1);
  });
});

describe('PageDesigner', () => {
  const emptyPage = {
    id: 'p1',
    name: 'test',
    route: '/test',
    components: [],
    dataSources: [],
    variables: []
  };

  it('should add component to page', () => {
    const designer = new PageDesigner(emptyPage);
    designer.addComponent(null, {
      id: 'c1', type: 'button', name: 'btn',
      properties: {}, children: [], styles: {}, events: {}
    });
    expect(designer.getPage().components.length).toBe(1);
  });

  it('should support undo/redo', () => {
    const designer = new PageDesigner(emptyPage);
    designer.addComponent(null, {
      id: 'c1', type: 'button', name: 'btn',
      properties: {}, children: [], styles: {}, events: {}
    });
    expect(designer.getPage().components.length).toBe(1);

    designer.undo();
    expect(designer.getPage().components.length).toBe(0);

    designer.redo();
    expect(designer.getPage().components.length).toBe(1);
  });

  it('should find component by id', () => {
    const designer = new PageDesigner(emptyPage);
    designer.addComponent(null, {
      id: 'parent', type: 'container', name: 'box',
      properties: {}, children: [], styles: {}, events: {}
    });
    designer.addComponent('parent', {
      id: 'child', type: 'button', name: 'btn',
      properties: {}, children: [], styles: {}, events: {}
    });
    expect(designer.findComponent('child')).not.toBeNull();
  });
});

describe('CodeGenerator', () => {
  it('should generate React code', () => {
    const gen = new CodeGenerator();
    const page = {
      id: 'p1', name: 'home', route: '/',
      components: [{
        id: 'btn', type: 'button', name: 'Button',
        properties: { text: 'Click me' },
        children: [], styles: {}, events: {}
      }],
      dataSources: [], variables: []
    };
    const code = gen.generateReact(page);
    expect(code).toContain('import React');
    expect(code).toContain('Click me');
    expect(code).toContain('function Home');
  });
});

describe('WorkflowEngine', () => {
  it('should execute simple workflow', () => {
    const engine = new WorkflowEngine();
    const workflow = {
      id: 'wf1', name: 'test',
      nodes: [
        { id: 'start', type: 'start', name: 'Start', config: {} },
        { id: 'task', type: 'task', name: 'Task', config: {} },
        { id: 'end', type: 'end', name: 'End', config: {} }
      ],
      edges: [
        { from: 'start', to: 'task' },
        { from: 'task', to: 'end' }
      ]
    };
    engine.register(workflow);
    const instanceId = engine.start('wf1');
    const instance = engine.getInstance(instanceId);
    expect(instance?.status).toBe('completed');
  });

  it('should evaluate condition branches', () => {
    const engine = new WorkflowEngine();
    const workflow = {
      id: 'wf2', name: 'conditional',
      nodes: [
        { id: 'start', type: 'start', name: 'Start', config: {} },
        { id: 'check', type: 'condition', name: 'Check', config: { condition: 'context.val > 10' } },
        { id: 'high', type: 'end', name: 'High', config: {} },
        { id: 'low', type: 'end', name: 'Low', config: {} }
      ],
      edges: [
        { from: 'start', to: 'check' },
        { from: 'check', to: 'high', condition: 'true' },
        { from: 'check', to: 'low', condition: 'false' }
      ]
    };
    engine.register(workflow);

    const instHigh = engine.start('wf2', { val: 20 });
    expect(engine.getInstance(instHigh)?.status).toBe('completed');

    const instLow = engine.start('wf2', { val: 5 });
    expect(engine.getInstance(instLow)?.status).toBe('completed');
  });
});

describe('ExpressionEngine', () => {
  it('should evaluate template expressions', () => {
    const engine = new ExpressionEngine();
    const result = engine.evaluate('Hello {{name}}!', { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('should handle nested paths', () => {
    const engine = new ExpressionEngine();
    const result = engine.evaluate('{{user.name}}', { user: { name: 'Alice' } });
    expect(result).toBe('Alice');
  });

  it('should handle missing values', () => {
    const engine = new ExpressionEngine();
    const result = engine.evaluate('{{missing}}', {});
    expect(result).toBe('');
  });
});
