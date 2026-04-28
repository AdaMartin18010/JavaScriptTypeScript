import { describe, it, expect } from 'vitest';
import { DockerfileBuilder, DockerComposeBuilder, createNodeDockerfile } from './docker-config.js';

describe('DockerfileBuilder', () => {
  it('builds multi-stage Dockerfile', () => {
    const df = new DockerfileBuilder()
      .from('node:20-alpine', { as: 'builder' })
      .workdir('/app')
      .copy('package.json', '.')
      .run('npm install')
      .build();
    expect(df).toContain('FROM node:20-alpine AS builder');
    expect(df).toContain('WORKDIR /app');
    expect(df).toContain('COPY package.json .');
    expect(df).toContain('RUN npm install');
  });

  it('formats CMD and ENTRYPOINT with JSON arrays', () => {
    const df = new DockerfileBuilder()
      .from('node:20-alpine')
      .cmd('node', 'server.js')
      .entrypoint('docker-entrypoint.sh')
      .build();
    expect(df).toContain('CMD ["node", "server.js"]');
    expect(df).toContain('ENTRYPOINT ["docker-entrypoint.sh"]');
  });
});

describe('DockerComposeBuilder', () => {
  it('builds compose config', () => {
    const compose = new DockerComposeBuilder()
      .version('3.8')
      .service('app')
        .image('myapp')
        .port(3000, 3000)
        .env('NODE_ENV', 'production')
        .done()
      .network('frontend')
      .build();
    expect(compose.version).toBe('3.8');
    expect(compose.services.app.image).toBe('myapp');
    expect(compose.services.app.ports).toContain('3000:3000');
    expect(compose.networks?.frontend).toBeDefined();
  });

  it('generates YAML', () => {
    const yaml = new DockerComposeBuilder()
      .service('db').image('postgres').done()
      .toYaml();
    expect(yaml).toContain('services:');
    expect(yaml).toContain('db:');
    expect(yaml).toContain('image: postgres');
  });
});

describe('createNodeDockerfile', () => {
  it('creates multi-stage node Dockerfile', () => {
    const df = createNodeDockerfile();
    expect(df).toContain('AS deps');
    expect(df).toContain('AS builder');
    expect(df).toContain('AS runner');
    expect(df).toContain('NODE_ENV=production');
  });
});
