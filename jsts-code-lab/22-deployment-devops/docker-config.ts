/**
 * @file Docker 配置管理
 * @category Deployment → Docker
 * @difficulty medium
 * @tags docker, container, deployment, dockerfile, compose
 * 
 * @description
 * Docker 容器化配置生成与管理：
 * - Dockerfile 生成
 * - Docker Compose 配置
 * - 多阶段构建
 * - 环境变量管理
 */

// ============================================================================
// 1. Dockerfile 构建器
// ============================================================================

export interface DockerfileStage {
  name: string;
  baseImage: string;
  commands: DockerfileCommand[];
}

export interface DockerfileCommand {
  type: 'FROM' | 'RUN' | 'COPY' | 'ADD' | 'WORKDIR' | 'ENV' | 'EXPOSE' | 'CMD' | 'ENTRYPOINT' | 'LABEL' | 'USER' | 'ARG';
  args: string[];
  options?: Record<string, string>;
}

export class DockerfileBuilder {
  private stages: DockerfileStage[] = [];
  private currentStage: DockerfileStage | null = null;

  // 基础镜像
  from(image: string, options?: { as?: string; platform?: string }): DockerfileBuilder {
    const stage: DockerfileStage = {
      name: options?.as || 'builder',
      baseImage: image,
      commands: []
    };

    const args = [image];
    if (options?.platform) {
      args.unshift(`--platform=${options.platform}`);
    }
    if (options?.as) {
      args.push(`AS ${options.as}`);
    }

    stage.commands.push({ type: 'FROM', args });
    this.stages.push(stage);
    this.currentStage = stage;
    return this;
  }

  // 工作目录
  workdir(path: string): DockerfileBuilder {
    this.currentStage?.commands.push({ type: 'WORKDIR', args: [path] });
    return this;
  }

  // 复制文件
  copy(source: string, dest: string, options?: { from?: string; chown?: string }): DockerfileBuilder {
    const args = [source, dest];
    const cmdOptions: Record<string, string> = {};
    
    if (options?.from) {
      cmdOptions.from = options.from;
    }
    if (options?.chown) {
      cmdOptions.chown = options.chown;
    }

    this.currentStage?.commands.push({ type: 'COPY', args, options: cmdOptions });
    return this;
  }

  // 运行命令
  run(...commands: string[]): DockerfileBuilder {
    this.currentStage?.commands.push({ type: 'RUN', args: commands });
    return this;
  }

  // 环境变量
  env(key: string, value: string): DockerfileBuilder {
    this.currentStage?.commands.push({ type: 'ENV', args: [`${key}=${value}`] });
    return this;
  }

  // 构建参数
  arg(name: string, defaultValue?: string): DockerfileBuilder {
    const args = defaultValue ? [`${name}=${defaultValue}`] : [name];
    this.currentStage?.commands.push({ type: 'ARG', args });
    return this;
  }

  // 暴露端口
  expose(port: number, protocol: 'tcp' | 'udp' = 'tcp'): DockerfileBuilder {
    this.currentStage?.commands.push({ type: 'EXPOSE', args: [`${port}/${protocol}`] });
    return this;
  }

  // 标签
  label(key: string, value: string): DockerfileBuilder {
    this.currentStage?.commands.push({ type: 'LABEL', args: [`${key}=${value}`] });
    return this;
  }

  // 用户
  user(name: string): DockerfileBuilder {
    this.currentStage?.commands.push({ type: 'USER', args: [name] });
    return this;
  }

  // 启动命令
  cmd(...args: string[]): DockerfileBuilder {
    this.currentStage?.commands.push({ type: 'CMD', args });
    return this;
  }

  // 入口点
  entrypoint(...args: string[]): DockerfileBuilder {
    this.currentStage?.commands.push({ type: 'ENTRYPOINT', args });
    return this;
  }

  // 构建
  build(): string {
    return this.stages
      .flatMap(stage => stage.commands.map(cmd => this.formatCommand(cmd)))
      .join('\n');
  }

  private formatCommand(cmd: DockerfileCommand): string {
    let result = cmd.type;
    
    if (cmd.options) {
      for (const [key, value] of Object.entries(cmd.options)) {
        result += ` --${key}=${value}`;
      }
    }

    if (cmd.type === 'RUN') {
      result += ` ${cmd.args.join(' && ')}`;
    } else if (cmd.type === 'CMD' || cmd.type === 'ENTRYPOINT') {
      result += ` [${cmd.args.map(a => `"${a}"`).join(', ')}]`;
    } else {
      result += ` ${cmd.args.join(' ')}`;
    }

    return result;
  }
}

// ============================================================================
// 2. Docker Compose 构建器
// ============================================================================

export interface DockerComposeService {
  image?: string;
  build?: {
    context?: string;
    dockerfile?: string;
    args?: Record<string, string>;
    target?: string;
  };
  ports?: string[];
  environment?: Record<string, string>;
  env_file?: string[];
  volumes?: string[];
  depends_on?: string[];
  networks?: string[];
  command?: string | string[];
  restart?: 'no' | 'always' | 'on-failure' | 'unless-stopped';
  healthcheck?: {
    test: string[];
    interval?: string;
    timeout?: string;
    retries?: number;
    start_period?: string;
  };
  labels?: Record<string, string>;
  deploy?: {
    replicas?: number;
    resources?: {
      limits?: { cpus?: string; memory?: string };
      reservations?: { cpus?: string; memory?: string };
    };
  };
}

export interface DockerComposeConfig {
  version: string;
  services: Record<string, DockerComposeService>;
  networks?: Record<string, { driver?: string }>;
  volumes?: Record<string, { driver?: string }>;
}

export class DockerComposeBuilder {
  private config: DockerComposeConfig = {
    version: '3.8',
    services: {}
  };

  version(v: string): DockerComposeBuilder {
    this.config.version = v;
    return this;
  }

  service(name: string): ServiceBuilder {
    return new ServiceBuilder(this, name);
  }

  addService(name: string, service: DockerComposeService): DockerComposeBuilder {
    this.config.services[name] = service;
    return this;
  }

  network(name: string, driver = 'bridge'): DockerComposeBuilder {
    this.config.networks = this.config.networks || {};
    this.config.networks[name] = { driver };
    return this;
  }

  volume(name: string, driver = 'local'): DockerComposeBuilder {
    this.config.volumes = this.config.volumes || {};
    this.config.volumes[name] = { driver };
    return this;
  }

  build(): DockerComposeConfig {
    return this.config;
  }

  toYaml(): string {
    const lines: string[] = [`version: '${this.config.version}'`, ''];
    
    // Services
    lines.push('services:');
    for (const [name, service] of Object.entries(this.config.services)) {
      lines.push(`  ${name}:`);
      if (service.image) lines.push(`    image: ${service.image}`);
      if (service.build) {
        lines.push('    build:');
        if (service.build.context) lines.push(`      context: ${service.build.context}`);
        if (service.build.dockerfile) lines.push(`      dockerfile: ${service.build.dockerfile}`);
        if (service.build.target) lines.push(`      target: ${service.build.target}`);
      }
      if (service.ports) {
        lines.push('    ports:');
        service.ports.forEach(p => lines.push(`      - "${p}"`));
      }
      if (service.environment) {
        lines.push('    environment:');
        for (const [key, value] of Object.entries(service.environment)) {
          lines.push(`      ${key}: ${value}`);
        }
      }
      if (service.volumes) {
        lines.push('    volumes:');
        service.volumes.forEach(v => lines.push(`      - ${v}`));
      }
      if (service.depends_on) {
        lines.push('    depends_on:');
        service.depends_on.forEach(d => lines.push(`      - ${d}`));
      }
      if (service.restart) {
        lines.push(`    restart: ${service.restart}`);
      }
    }

    return lines.join('\n');
  }
}

export class ServiceBuilder {
  private service: DockerComposeService = {};

  constructor(
    private compose: DockerComposeBuilder,
    private name: string
  ) {}

  image(img: string): ServiceBuilder {
    this.service.image = img;
    return this;
  }

  build(context: string, dockerfile?: string): ServiceBuilder {
    this.service.build = { context, dockerfile };
    return this;
  }

  port(host: number, container: number): ServiceBuilder {
    this.service.ports = this.service.ports || [];
    this.service.ports.push(`${host}:${container}`);
    return this;
  }

  env(key: string, value: string): ServiceBuilder {
    this.service.environment = this.service.environment || {};
    this.service.environment[key] = value;
    return this;
  }

  volume(host: string, container: string): ServiceBuilder {
    this.service.volumes = this.service.volumes || [];
    this.service.volumes.push(`${host}:${container}`);
    return this;
  }

  dependsOn(...services: string[]): ServiceBuilder {
    this.service.depends_on = services;
    return this;
  }

  restart(policy: DockerComposeService['restart']): ServiceBuilder {
    this.service.restart = policy;
    return this;
  }

  done(): DockerComposeBuilder {
    return this.compose.addService(this.name, this.service);
  }
}

// ============================================================================
// 3. 多阶段构建配置
// ============================================================================

export function createNodeDockerfile(): string {
  return new DockerfileBuilder()
    // 依赖安装阶段
    .from('node:20-alpine', { as: 'deps' })
    .workdir('/app')
    .copy('package*.json', '.')
    .run('npm ci --only=production')
    
    // 构建阶段
    .from('node:20-alpine', { as: 'builder' })
    .workdir('/app')
    .copy('package*.json', '.')
    .run('npm ci')
    .copy('.', '.')
    .run('npm run build')
    
    // 运行阶段
    .from('node:20-alpine', { as: 'runner' })
    .workdir('/app')
    .env('NODE_ENV', 'production')
    .user('node')
    .copy('.next/standalone', '.', { from: 'builder' })
    .copy('.next/static', '.next/static', { from: 'builder' })
    .expose(3000)
    .cmd('node', 'server.js')
    .build();
}

// ============================================================================
// 4. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Docker 配置管理 ===\n');

  console.log('1. 多阶段 Dockerfile');
  const dockerfile = createNodeDockerfile();
  console.log(dockerfile);

  console.log('\n2. Docker Compose 配置');
  const compose = new DockerComposeBuilder()
    .version('3.8')
    .service('app')
      .build('.', 'Dockerfile')
      .port(3000, 3000)
      .env('NODE_ENV', 'production')
      .dependsOn('db', 'redis')
      .restart('unless-stopped')
      .done()
    .service('db')
      .image('postgres:15-alpine')
      .port(5432, 5432)
      .env('POSTGRES_USER', 'app')
      .env('POSTGRES_PASSWORD', 'secret')
      .volume('postgres_data', '/var/lib/postgresql/data')
      .done()
    .service('redis')
      .image('redis:7-alpine')
      .port(6379, 6379)
      .done()
    .volume('postgres_data')
    .toYaml();

  console.log(compose);

  console.log('\nDocker 最佳实践:');
  console.log('- 使用多阶段构建减小镜像体积');
  console.log('- 使用特定版本标签而非 latest');
  console.log('- 非 root 用户运行应用');
  console.log('- 合理使用缓存层');
  console.log('- 设置健康检查');
}

// ============================================================================
// 导出
// ============================================================================

// Classes/functions already exported inline above

;
