/**
 * @file CI/CD 流水线配置
 * @category Deployment → CI/CD
 * @difficulty medium
 * @tags ci-cd, github-actions, pipeline, automation
 * 
 * @description
 * CI/CD 流水线配置生成器：
 * - GitHub Actions
 * - 多环境部署
 * - 工作流编排
 */

// ============================================================================
// 1. GitHub Actions 类型定义
// ============================================================================

export interface GitHubWorkflow {
  name: string;
  on: Trigger | Trigger[];
  env?: Record<string, string>;
  jobs: Record<string, Job>;
}

export interface Trigger {
  push?: { branches?: string[]; tags?: string[]; paths?: string[] };
  pull_request?: { branches?: string[] };
  workflow_dispatch?: Record<string, unknown>;
  schedule?: Array<{ cron: string }>;
}

export interface Job {
  'runs-on': string;
  needs?: string | string[];
  if?: string;
  env?: Record<string, string>;
  steps: Step[];
  strategy?: {
    matrix?: Record<string, string[]>;
    'fail-fast'?: boolean;
  };
}

export interface Step {
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, string | boolean | number>;
  env?: Record<string, string>;
  if?: string;
  id?: string;
  'working-directory'?: string;
}

// ============================================================================
// 2. 工作流构建器
// ============================================================================

export class WorkflowBuilder {
  private workflow: Partial<GitHubWorkflow> = {};

  name(n: string): WorkflowBuilder {
    this.workflow.name = n;
    return this;
  }

  on(trigger: Trigger): WorkflowBuilder {
    this.workflow.on = trigger;
    return this;
  }

  onPush(branches?: string[], tags?: string[]): WorkflowBuilder {
    this.workflow.on = {
      push: { branches, tags }
    };
    return this;
  }

  onPullRequest(branches?: string[]): WorkflowBuilder {
    this.workflow.on = {
      pull_request: { branches }
    };
    return this;
  }

  env(key: string, value: string): WorkflowBuilder {
    this.workflow.env = this.workflow.env || {};
    this.workflow.env[key] = value;
    return this;
  }

  job(id: string, job: Job): WorkflowBuilder {
    this.workflow.jobs = this.workflow.jobs || {};
    this.workflow.jobs[id] = job;
    return this;
  }

  build(): GitHubWorkflow {
    return this.workflow as GitHubWorkflow;
  }

  toYAML(): string {
    const lines: string[] = [];
    
    if (this.workflow.name) {
      lines.push(`name: ${this.workflow.name}`);
    }
    
    // on 部分
    lines.push('on:');
    const on = this.workflow.on as Trigger;
    if (on.push) {
      lines.push('  push:');
      if (on.push.branches) {
        lines.push('    branches:');
        on.push.branches.forEach(b => lines.push(`      - ${b}`));
      }
    }
    if (on.pull_request) {
      lines.push('  pull_request:');
      if (on.pull_request.branches) {
        lines.push('    branches:');
        on.pull_request.branches.forEach(b => lines.push(`      - ${b}`));
      }
    }

    // env
    if (this.workflow.env) {
      lines.push('env:');
      for (const [key, value] of Object.entries(this.workflow.env)) {
        lines.push(`  ${key}: ${value}`);
      }
    }

    // jobs
    lines.push('jobs:');
    for (const [jobId, job] of Object.entries(this.workflow.jobs || {})) {
      lines.push(`  ${jobId}:`);
      lines.push(`    runs-on: ${job['runs-on']}`);
      
      if (job.needs) {
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        lines.push(`    needs: [${needs.join(', ')}]`);
      }

      lines.push('    steps:');
      for (const step of job.steps) {
        if (step.name) {
          lines.push(`      - name: ${step.name}`);
        }
        if (step.uses) {
          lines.push(`        uses: ${step.uses}`);
        }
        if (step.run) {
          lines.push(`        run: ${step.run}`);
        }
        if (step.with) {
          lines.push('        with:');
          for (const [key, value] of Object.entries(step.with)) {
            lines.push(`          ${key}: ${value}`);
          }
        }
      }
    }

    return lines.join('\n');
  }
}

// ============================================================================
// 3. 预设工作流
// ============================================================================

export const WorkflowPresets = {
  // Node.js 项目 CI
  nodeCI(): GitHubWorkflow {
    return {
      name: 'Node.js CI',
      on: {
        push: { branches: ['main', 'develop'] },
        pull_request: { branches: ['main'] }
      },
      jobs: {
        test: {
          'runs-on': 'ubuntu-latest',
          strategy: {
            matrix: { node: ['18', '20', '22'] },
            'fail-fast': false
          },
          steps: [
            { uses: 'actions/checkout@v4' },
            { name: 'Setup Node.js', uses: 'actions/setup-node@v4', with: { 'node-version': '${{ matrix.node }}' } },
            { name: 'Install dependencies', run: 'npm ci' },
            { name: 'Run linter', run: 'npm run lint' },
            { name: 'Run tests', run: 'npm test' },
            { name: 'Build', run: 'npm run build' }
          ]
        }
      }
    };
  },

  // Docker 构建与推送
  dockerBuild(): GitHubWorkflow {
    return {
      name: 'Docker Build',
      on: {
        push: { tags: ['v*'] },
        workflow_dispatch: {}
      },
      jobs: {
        build: {
          'runs-on': 'ubuntu-latest',
          steps: [
            { uses: 'actions/checkout@v4' },
            { name: 'Set up Docker Buildx', uses: 'docker/setup-buildx-action@v3' },
            { name: 'Login to Docker Hub', uses: 'docker/login-action@v3', with: { username: '${{ secrets.DOCKER_USERNAME }}', password: '${{ secrets.DOCKER_PASSWORD }}' } },
            { name: 'Build and push', uses: 'docker/build-push-action@v5', with: { context: '.', push: true, tags: '${{ secrets.DOCKER_USERNAME }}/app:${{ github.ref_name }}' } }
          ]
        }
      }
    };
  },

  // 多环境部署
  multiEnvDeploy(): GitHubWorkflow {
    return {
      name: 'Deploy',
      on: { push: { branches: ['main', 'staging'] } },
      jobs: {
        build: {
          'runs-on': 'ubuntu-latest',
          steps: [
            { uses: 'actions/checkout@v4' },
            { name: 'Build', run: 'npm ci && npm run build' },
            { name: 'Upload artifact', uses: 'actions/upload-artifact@v4', with: { name: 'build', path: 'dist' } }
          ]
        },
        deploy_staging: {
          'runs-on': 'ubuntu-latest',
          needs: 'build',
          if: "github.ref == 'refs/heads/staging'",
          steps: [
            { name: 'Download artifact', uses: 'actions/download-artifact@v4', with: { name: 'build' } },
            { name: 'Deploy to Staging', run: 'echo "Deploying to staging..."' }
          ]
        },
        deploy_production: {
          'runs-on': 'ubuntu-latest',
          needs: 'build',
          if: "github.ref == 'refs/heads/main'",
          environment: { name: 'production' },
          steps: [
            { name: 'Download artifact', uses: 'actions/download-artifact@v4', with: { name: 'build' } },
            { name: 'Deploy to Production', run: 'echo "Deploying to production..."' }
          ]
        } as unknown as Job
      }
    };
  }
};

// ============================================================================
// 4. 部署策略
// ============================================================================

export enum DeploymentStrategy {
  ROLLING = 'rolling',       // 滚动更新
  BLUE_GREEN = 'blue-green', // 蓝绿部署
  CANARY = 'canary',         // 金丝雀发布
  RECREATE = 'recreate'      // 重建
}

export interface DeploymentConfig {
  strategy: DeploymentStrategy;
  replicas: number;
  healthCheckPath: string;
  timeout: number;
  rollbackOnFailure: boolean;
}

export class DeploymentStrategyBuilder {
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  generateSteps(): Step[] {
    switch (this.config.strategy) {
      case DeploymentStrategy.ROLLING:
        return this.rollingUpdateSteps();
      case DeploymentStrategy.BLUE_GREEN:
        return this.blueGreenSteps();
      case DeploymentStrategy.CANARY:
        return this.canarySteps();
      default:
        return this.recreateSteps();
    }
  }

  private rollingUpdateSteps(): Step[] {
    return [
      { name: 'Deploy new version (rolling)', run: 'kubectl set image deployment/app app=myapp:${{ github.sha }}' },
      { name: 'Wait for rollout', run: 'kubectl rollout status deployment/app --timeout=300s' },
      { name: 'Health check', run: `curl -f http://app${this.config.healthCheckPath} || exit 1` }
    ];
  }

  private blueGreenSteps(): Step[] {
    return [
      { name: 'Deploy to blue environment', run: 'kubectl apply -f k8s/blue-deployment.yaml' },
      { name: 'Health check blue', run: 'curl -f http://app-blue/health || exit 1' },
      { name: 'Switch traffic to blue', run: 'kubectl patch service app -p \'{"spec":{"selector":{"version":"blue"}}}\'' },
      { name: 'Verify', run: 'sleep 30 && curl -f http://app/health || kubectl patch service app -p \'{"spec":{"selector":{"version":"green"}}}\'' }
    ];
  }

  private canarySteps(): Step[] {
    return [
      { name: 'Deploy canary (10%)', run: 'kubectl apply -f k8s/canary-deployment.yaml' },
      { name: 'Wait and monitor', run: 'sleep 300' },
      { name: 'Check error rate', run: '# check metrics' },
      { name: 'Promote or rollback', run: '# based on metrics' }
    ];
  }

  private recreateSteps(): Step[] {
    return [
      { name: 'Stop current version', run: 'kubectl scale deployment app --replicas=0' },
      { name: 'Deploy new version', run: 'kubectl set image deployment/app app=myapp:${{ github.sha }}' },
      { name: 'Start new version', run: `kubectl scale deployment app --replicas=${this.config.replicas}` },
      { name: 'Wait for ready', run: 'kubectl wait --for=condition=available deployment/app --timeout=300s' }
    ];
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== CI/CD 流水线配置 ===\n');

  console.log('1. Node.js CI 工作流');
  const nodeWorkflow = WorkflowPresets.nodeCI();
  console.log('   Name:', nodeWorkflow.name);
  console.log('   Triggers:', Object.keys(nodeWorkflow.on).join(', '));
  console.log('   Jobs:', Object.keys(nodeWorkflow.jobs).join(', '));
  console.log('   Node versions:', nodeWorkflow.jobs.test.strategy?.matrix?.node?.join(', '));

  console.log('\n2. Docker 构建工作流');
  const dockerWorkflow = WorkflowPresets.dockerBuild();
  console.log('   Name:', dockerWorkflow.name);
  console.log('   Triggers:', Object.keys(dockerWorkflow.on).join(', '));

  console.log('\n3. 多环境部署工作流');
  const deployWorkflow = WorkflowPresets.multiEnvDeploy();
  console.log('   Name:', deployWorkflow.name);
  console.log('   Jobs:', Object.keys(deployWorkflow.jobs).join(', '));
  console.log('   Dependencies:');
  console.log('     build -> deploy_staging (on staging branch)');
  console.log('     build -> deploy_production (on main branch)');

  console.log('\n4. 使用工作流构建器');
  const customWorkflow = new WorkflowBuilder()
    .name('Custom Workflow')
    .onPush(['main'], ['v*'])
    .env('NODE_ENV', 'production')
    .job('test', {
      'runs-on': 'ubuntu-latest',
      steps: [
        { name: 'Checkout', uses: 'actions/checkout@v4' },
        { name: 'Test', run: 'npm test' }
      ]
    })
    .build();
  console.log('   Built workflow:', customWorkflow.name);

  console.log('\n5. 部署策略');
  const strategies = [
    DeploymentStrategy.ROLLING,
    DeploymentStrategy.BLUE_GREEN,
    DeploymentStrategy.CANARY
  ];
  strategies.forEach(strategy => {
    const builder = new DeploymentStrategyBuilder({
      strategy,
      replicas: 3,
      healthCheckPath: '/health',
      timeout: 300,
      rollbackOnFailure: true
    });
    console.log(`   ${strategy}: ${builder.generateSteps().length} steps`);
  });

  console.log('\nCI/CD 最佳实践:');
  console.log('- 自动化测试：每次提交都运行测试');
  console.log('- 构建一次：同一份构建产物部署到各环境');
  console.log('- 环境隔离：staging、production 完全分离');
  console.log('- 部署策略：根据风险选择合适的部署方式');
  console.log('- 回滚机制：失败时自动或手动回滚');
  console.log('- 安全：使用 secrets 管理敏感信息');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
