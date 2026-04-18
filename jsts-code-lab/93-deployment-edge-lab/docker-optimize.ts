/**
 * @file Node.js Docker 镜像优化策略
 * @category Deployment & Edge → Docker
 * @difficulty medium
 * @tags docker, multi-stage, pnpm, distroless, layer-cache
 */

// ============================================================================
// 1. Dockerfile 生成器
// ============================================================================

export interface DockerfileOptions {
  /** Node.js 基础镜像版本 */
  nodeVersion?: string;
  /** 包管理器：pnpm | npm | yarn */
  packageManager?: 'pnpm' | 'npm' | 'yarn';
  /** 是否使用 distroless 最终镜像 */
  useDistroless?: boolean;
  /** 是否需要 native 依赖编译（如 bcrypt, sqlite3） */
  hasNativeDeps?: boolean;
  /** 应用端口 */
  port?: number;
  /** 启动命令 */
  startCommand?: string;
  /** 健康检查路径 */
  healthCheckPath?: string;
}

/**
 * 生成生产级多阶段 Dockerfile
 *
 * 优化策略：
 * 1. 依赖安装阶段单独分层，利用 Docker Layer Cache
 * 2. pnpm 启用内容可寻址存储，减少重复下载
 * 3. 构建阶段与运行阶段分离，最终镜像不含 devDependencies
 * 4. 可选 distroless 镜像，移除 shell 与包管理器，减小攻击面
 * 5. 非 root 用户运行
 */
export function generateDockerfile(options: DockerfileOptions = {}): string {
  const {
    nodeVersion = '22-alpine',
    packageManager = 'pnpm',
    useDistroless = true,
    hasNativeDeps = false,
    port = 3000,
    startCommand = 'node dist/index.js',
    healthCheckPath = '/health'
  } = options;

  const isPnpm = packageManager === 'pnpm';
  const isNpm = packageManager === 'npm';
  const installCmd = isPnpm
    ? 'pnpm install --frozen-lockfile'
    : isNpm
      ? 'npm ci'
      : 'yarn install --frozen-lockfile';

  const copyLockfile = isPnpm
    ? 'COPY pnpm-lock.yaml ./'
    : isNpm
      ? 'COPY package-lock.json ./'
      : 'COPY yarn.lock ./';

  const baseImage = hasNativeDeps ? `node:${nodeVersion}` : `node:${nodeVersion}`;
  const finalImage = useDistroless ? `gcr.io/distroless/nodejs${nodeVersion.split('-')[0]}-debian12` : baseImage;

  return `# ==========================================
# 阶段 1: 依赖安装 (Dependency Installation)
# ==========================================
FROM ${baseImage} AS deps
WORKDIR /app

# 先仅复制包管理器锁定文件，最大化 Layer Cache 命中率
${copyLockfile}
COPY package.json ./

# 安装 pnpm (若使用)
${isPnpm ? 'RUN npm install -g pnpm' : ''}

# 安装生产依赖
${isPnpm ? 'RUN pnpm install --prod --frozen-lockfile' : `${installCmd} --production`}

# ==========================================
# 阶段 2: 构建 (Build)
# ==========================================
FROM ${baseImage} AS builder
WORKDIR /app

${isPnpm ? 'RUN npm install -g pnpm' : ''}
COPY ${isPnpm ? 'pnpm-lock.yaml' : isNpm ? 'package-lock.json' : 'yarn.lock'} ./
COPY package.json ./
RUN ${installCmd}

COPY . .
RUN ${isPnpm ? 'pnpm build' : isNpm ? 'npm run build' : 'yarn build'}

# ==========================================
# 阶段 3: 运行 (Runtime)
# ==========================================
FROM ${finalImage} AS runner
WORKDIR /app

# 仅复制必要文件，最小化镜像体积
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 非 root 用户运行
${useDistroless ? '' : 'RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001\nUSER nodejs'}

ENV NODE_ENV=production
ENV PORT=${port}
EXPOSE ${port}

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:${port}${healthCheckPath}', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["${startCommand.replace('node ', '')}"]
`;
}

// ============================================================================
// 2. .dockerignore 生成器
// ============================================================================

/**
 * 生成优化的 .dockerignore，减少构建上下文体积
 */
export function generateDockerignore(): string {
  return `# 依赖与缓存
node_modules
.pnpm-store
.npm
.yarn/cache

# 构建输出
dist
build
coverage

# 版本控制
.git
.gitignore

# 文档与配置
*.md
*.log
Dockerfile*
.dockerignore
.env*
.vscode
.idea

# 测试文件
**/*.test.ts
**/*.spec.ts
tests
__tests__

# 本地开发
docker-compose*.yml
playground
tmp
`;
}

// ============================================================================
// 3. Docker Compose 优化配置
// ============================================================================

export interface ComposeServiceOptions {
  name: string;
  image: string;
  port: number;
  replicas?: number;
  memoryLimit?: string;
  cpuLimit?: string;
}

/**
 * 生成生产级 docker-compose.yml 片段
 */
export function generateComposeServices(services: ComposeServiceOptions[]): string {
  const lines: string[] = ['services:'];

  for (const svc of services) {
    lines.push(`  ${svc.name}:`);
    lines.push(`    image: ${svc.image}`);
    lines.push(`    ports:`);
    lines.push(`      - "${svc.port}:${svc.port}"`);
    if (svc.replicas && svc.replicas > 1) {
      lines.push(`    deploy:`);
      lines.push(`      replicas: ${svc.replicas}`);
      lines.push(`      resources:`);
      lines.push(`        limits:`);
      if (svc.memoryLimit) lines.push(`          memory: ${svc.memoryLimit}`);
      if (svc.cpuLimit) lines.push(`          cpus: '${svc.cpuLimit}'`);
    }
    lines.push(`    environment:`);
    lines.push(`      - NODE_ENV=production`);
    lines.push(`    healthcheck:`);
    lines.push(`      test: ["CMD", "node", "-e", "require('http').get('http://localhost:${svc.port}/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"]`);
    lines.push(`      interval: 30s`);
    lines.push(`      timeout: 3s`);
    lines.push(`      retries: 3`);
    lines.push(`      start_period: 5s`);
    lines.push(`    restart: unless-stopped`);
  }

  return lines.join('\n');
}

// ============================================================================
// 4. 镜像优化分析与建议
// ============================================================================

export interface ImageOptimizationSuggestion {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  fix: string;
}

/**
 * 分析 Dockerfile 内容并给出优化建议
 */
export function analyzeDockerfile(dockerfile: string): ImageOptimizationSuggestion[] {
  const suggestions: ImageOptimizationSuggestion[] = [];

  if (!dockerfile.includes('AS ') || !dockerfile.includes('FROM')) {
    suggestions.push({
      severity: 'high',
      title: '缺少多阶段构建',
      description: '未使用多阶段构建，最终镜像包含构建工具与 devDependencies，体积过大。',
      fix: '使用 "FROM ... AS builder" 分离构建阶段与运行阶段。'
    });
  }

  if (dockerfile.includes('npm install') && !dockerfile.includes('--production') && !dockerfile.includes('ci')) {
    suggestions.push({
      severity: 'high',
      title: '未区分生产与开发依赖',
      description: 'npm install 默认安装所有依赖，生产镜像不应包含 devDependencies。',
      fix: '使用 "npm ci --only=production" 或 "pnpm install --prod"。'
    });
  }

  if (!dockerfile.includes('USER ') && !dockerfile.includes('distroless')) {
    suggestions.push({
      severity: 'medium',
      title: '未使用非 root 用户',
      description: '容器以 root 运行增加了安全风险。',
      fix: '添加 "USER node" 或 "USER 1000" 指令。'
    });
  }

  if (!dockerfile.includes('HEALTHCHECK')) {
    suggestions.push({
      severity: 'medium',
      title: '缺少健康检查',
      description: '未配置 HEALTHCHECK，编排工具无法自动重启异常容器。',
      fix: '添加 HEALTHCHECK 指令检测应用可用性。'
    });
  }

  if (dockerfile.includes('COPY . .') && dockerfile.includes('RUN npm install')) {
    suggestions.push({
      severity: 'medium',
      title: '依赖缓存失效风险',
      description: 'COPY . . 在 RUN npm install 之前会导致每次代码变更都重新安装依赖。',
      fix: '先单独 COPY package.json 与 lockfile，再执行 install，最后 COPY 源码。'
    });
  }

  if (!dockerfile.includes('.dockerignore') && !dockerfile.includes('gcr.io/distroless')) {
    suggestions.push({
      severity: 'low',
      title: '可考虑使用 distroless 镜像',
      description: 'distroless 镜像移除了 shell 与包管理器，显著减小攻击面。',
      fix: '最终阶段使用 "gcr.io/distroless/nodejs22-debian12" 替代 Alpine。'
    });
  }

  return suggestions;
}

// ============================================================================
// 5. Layer 缓存策略说明
// ============================================================================

export interface LayerCacheStrategy {
  layer: string;
  description: string;
  cacheBustFrequency: 'low' | 'medium' | 'high';
}

/**
 * 返回推荐的 Layer 缓存策略
 */
export function getLayerCacheStrategies(): LayerCacheStrategy[] {
  return [
    {
      layer: '基础镜像 (FROM node:22-alpine)',
      description: '低频变化，由 Docker Daemon 缓存',
      cacheBustFrequency: 'low'
    },
    {
      layer: '包管理器安装 (RUN pnpm install)',
      description: '仅当 package.json / lockfile 变更时重建，最大化缓存命中',
      cacheBustFrequency: 'low'
    },
    {
      layer: '源码复制 (COPY . .)',
      description: '高频变化，每次代码提交都会重建此层及后续',
      cacheBustFrequency: 'high'
    },
    {
      layer: '构建产物 (RUN pnpm build)',
      description: '依赖源码层，仅源码或配置变更时重建',
      cacheBustFrequency: 'medium'
    }
  ];
}

// ============================================================================
// Demo
// ============================================================================

export function demo(): void {
  console.log('=== Docker 镜像优化演示 ===\n');

  // 1. 生成 Dockerfile
  console.log('--- 1. 多阶段 Dockerfile (pnpm + distroless) ---');
  const dockerfile = generateDockerfile({
    packageManager: 'pnpm',
    useDistroless: true,
    port: 3000,
    startCommand: 'node dist/index.js'
  });
  console.log(dockerfile.slice(0, 500) + '...');

  // 2. 分析建议
  console.log('\n--- 2. 优化建议 ---');
  const badDockerfile = `FROM node:22
COPY . .
RUN npm install
CMD ["node", "index.js"]`;
  const suggestions = analyzeDockerfile(badDockerfile);
  for (const s of suggestions) {
    console.log(`[${s.severity.toUpperCase()}] ${s.title}: ${s.description}`);
  }

  // 3. .dockerignore
  console.log('\n--- 3. .dockerignore ---');
  console.log(generateDockerignore().slice(0, 300) + '...');

  // 4. Layer 缓存策略
  console.log('\n--- 4. Layer 缓存策略 ---');
  for (const strategy of getLayerCacheStrategies()) {
    console.log(`- ${strategy.layer}: ${strategy.description} (${strategy.cacheBustFrequency})`);
  }

  console.log('\n=== 演示结束 ===\n');
}
