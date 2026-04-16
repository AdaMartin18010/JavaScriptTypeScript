import { describe, it, expect } from 'vitest';
import { WorkflowBuilder, WorkflowPresets, DeploymentStrategyBuilder, DeploymentStrategy } from './cicd-pipeline';

describe('WorkflowBuilder', () => {
  it('builds a workflow', () => {
    const wf = new WorkflowBuilder()
      .name('CI')
      .onPush(['main'])
      .env('NODE_ENV', 'test')
      .job('build', { 'runs-on': 'ubuntu-latest', steps: [{ run: 'echo ok' }] })
      .build();
    expect(wf.name).toBe('CI');
    expect(wf.jobs.build['runs-on']).toBe('ubuntu-latest');
  });

  it('generates YAML', () => {
    const yaml = new WorkflowBuilder().name('Test').onPush(['main']).toYAML();
    expect(yaml).toContain('name: Test');
    expect(yaml).toContain('push:');
  });
});

describe('WorkflowPresets', () => {
  it('nodeCI has matrix node versions', () => {
    const wf = WorkflowPresets.nodeCI();
    expect(wf.name).toBe('Node.js CI');
    expect(wf.jobs.test.strategy?.matrix?.node).toContain('20');
  });

  it('dockerBuild triggers on tags', () => {
    const wf = WorkflowPresets.dockerBuild();
    expect(wf.on.push?.tags).toContain('v*');
  });
});

describe('DeploymentStrategyBuilder', () => {
  it('generates rolling steps', () => {
    const builder = new DeploymentStrategyBuilder({ strategy: DeploymentStrategy.ROLLING, replicas: 3, healthCheckPath: '/health', timeout: 300, rollbackOnFailure: true });
    const steps = builder.generateSteps();
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].name).toContain('rolling');
  });

  it('generates blue-green steps', () => {
    const builder = new DeploymentStrategyBuilder({ strategy: DeploymentStrategy.BLUE_GREEN, replicas: 3, healthCheckPath: '/health', timeout: 300, rollbackOnFailure: true });
    const steps = builder.generateSteps();
    expect(steps.some(s => s.name?.includes('blue'))).toBe(true);
  });
});
