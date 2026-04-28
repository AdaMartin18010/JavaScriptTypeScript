import { describe, it, expect } from 'vitest';
import { ViteConfigBuilder, VitePresets } from './vite-config.js';

describe('ViteConfigBuilder', () => {
  it('builds custom config', () => {
    const config = new ViteConfigBuilder()
      .root('./src')
      .base('/app/')
      .define('__VERSION__', '1.0.0')
      .buildConfig();
    expect(config.root).toBe('./src');
    expect(config.base).toBe('/app/');
    expect(config.define?.__VERSION__).toBe('1.0.0');
  });

  it('chains build options', () => {
    const config = new ViteConfigBuilder()
      .build().target('es2020').outDir('dist').minify('terser').done()
      .buildConfig();
    expect(config.build?.target).toBe('es2020');
    expect(config.build?.outDir).toBe('dist');
    expect(config.build?.minify).toBe('terser');
  });

  it('chains server options', () => {
    const config = new ViteConfigBuilder()
      .server().port(8080).host(true).cors(true).proxy('/api', 'http://localhost:3000').done()
      .buildConfig();
    expect(config.server?.port).toBe(8080);
    expect(config.server?.host).toBe(true);
    expect(config.server?.cors).toBe(true);
    expect(config.server?.proxy?.['/api']).toBeDefined();
  });

  it('chains resolve aliases', () => {
    const config = new ViteConfigBuilder()
      .resolve().alias('@', './src').alias('~', './assets').done()
      .buildConfig();
    const aliases = config.resolve?.alias as Record<string, string>;
    expect(aliases['@']).toBe('./src');
    expect(aliases['~']).toBe('./assets');
  });
});

describe('VitePresets', () => {
  it('react preset includes plugin and port', () => {
    const cfg = VitePresets.react();
    expect(cfg.plugins?.some((p: any) => p.name === '@vitejs/plugin-react')).toBe(true);
    expect(cfg.server?.port).toBe(3000);
  });

  it('lib preset includes entry and formats', () => {
    const cfg = VitePresets.lib('myLib', './src/index.ts');
    expect(cfg.build?.lib?.entry).toBe('./src/index.ts');
    expect(cfg.build?.lib?.formats).toContain('es');
  });
});
