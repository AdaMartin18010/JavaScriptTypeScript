import { describe, it, expect } from 'vitest';
import { ESLintConfigBuilder, PrettierConfigBuilder, ESLintPresets, PrettierPresets, LintingSetup } from './eslint-prettier.js';

describe('ESLintConfigBuilder', () => {
  it('builds TypeScript config', () => {
    const config = new ESLintConfigBuilder().setRoot().node().useTypeScript('./tsconfig.json').build();
    expect(config.root).toBe(true);
    expect(config.parser).toBe('@typescript-eslint/parser');
  });

  it('chains rules and overrides', () => {
    const config = new ESLintConfigBuilder()
      .rule('no-console', 'warn')
      .ignore('dist/')
      .build();
    expect(config.rules?.['no-console']).toBe('warn');
    expect(config.ignorePatterns).toContain('dist/');
  });
});

describe('PrettierConfigBuilder', () => {
  it('builds config and JSON output', () => {
    const config = new PrettierConfigBuilder().semi(false).singleQuote(true).tabWidth(4).build();
    expect(config.semi).toBe(false);
    expect(config.tabWidth).toBe(4);
    const json = new PrettierConfigBuilder().semi(true).toJSON();
    expect(json).toContain('"semi": true');
  });
});

describe('Presets', () => {
  it('ESLintPresets.typescript has recommended extends', () => {
    const cfg = ESLintPresets.typescript();
    expect(cfg.extends).toContain('eslint:recommended');
  });

  it('PrettierPresets.default has standard values', () => {
    const cfg = PrettierPresets.default();
    expect(cfg.semi).toBe(true);
    expect(cfg.singleQuote).toBe(true);
    expect(cfg.tabWidth).toBe(2);
  });
});

describe('LintingSetup', () => {
  it('generates scripts', () => {
    const scripts = LintingSetup.generateScripts();
    expect(scripts.lint).toContain('eslint');
    expect(scripts.format).toContain('prettier');
  });

  it('generates VS Code settings', () => {
    const settings = LintingSetup.generateVSCodeSettings();
    expect(settings['editor.formatOnSave']).toBe(true);
  });
});
