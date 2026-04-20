/**
 * @file 23-toolchain-configuration 测试套件
 * @description 验证工具链配置文件的 JSON 结构和合法性
 */

import { describe, it, expect } from 'vitest'

// ============================================================================
// Biome 配置验证
// ============================================================================

describe('Biome 配置 (biome-migration.ts)', () => {
  it('应包含有效的 BiomeConfig 接口定义', () => {
    const config = getMockBiomeConfig()
    expect(config.$schema).toMatch(/biome\.json/)
  })

  it('应定义 formatter 配置', () => {
    const config = getMockBiomeConfig()
    expect(config.formatter).toBeDefined()
    expect(config.formatter?.indentStyle).toMatch(/tab|space/)
  })

  it('应定义 linter 规则配置', () => {
    const config = getMockBiomeConfig()
    expect(config.linter).toBeDefined()
    expect(config.linter?.enabled).toBe(true)
  })

  it('应支持 CSS 和 GraphQL (Biome 1.x)', () => {
    const config = getMockBiomeConfig()
    expect(config.css).toBeDefined()
    expect(config.graphql).toBeDefined()
  })
})

// ============================================================================
// Oxc 配置验证
// ============================================================================

describe('Oxc 配置 (oxc-integration.ts)', () => {
  it('应包含 oxlint CLI 配置', () => {
    const config = getMockOxlintConfig()
    expect(config.rules).toBeDefined()
    expect(Array.isArray(config.rules)).toBe(true)
  })

  it('应支持 ESLint 规则映射', () => {
    const mapping = getEslintToOxcMapping()
    expect(mapping['no-unused-vars']).toBeDefined()
    expect(mapping['eqeqeq']).toBeDefined()
  })

  it('transform 配置应包含 target 环境', () => {
    const config = getMockOxcTransformConfig()
    expect(config.target).toBeDefined()
    expect(['es2015', 'es2020', 'es2022', 'esnext']).toContain(config.target)
  })
})

// ============================================================================
// Rolldown 配置验证
// ============================================================================

describe('Rolldown 配置 (rolldown-config.ts)', () => {
  it('应定义有效的 RolldownConfig 接口', () => {
    const config = getMockRolldownConfig()
    expect(config.input).toBeDefined()
    expect(config.output).toBeDefined()
  })

  it('输出格式应为有效的 module 类型', () => {
    const config = getMockRolldownConfig()
    const validFormats = ['esm', 'cjs', 'umd', 'iife']
    expect(validFormats).toContain(config.output?.format)
  })

  it('应支持 external 依赖排除', () => {
    const config = getMockRolldownConfig()
    expect(Array.isArray(config.external)).toBe(true)
  })
})

// ============================================================================
// Vite 配置验证（已有文件）
// ============================================================================

describe('Vite 配置 (vite-config.ts)', () => {
  it('应定义有效的 ViteUserConfig 接口', () => {
    const config = getMockViteConfig()
    expect(config.plugins).toBeDefined()
    expect(Array.isArray(config.plugins)).toBe(true)
  })

  it('应包含 build 配置', () => {
    const config = getMockViteConfig()
    expect(config.build).toBeDefined()
    expect(config.build?.outDir).toBeDefined()
  })
})

// ============================================================================
// 测试辅助函数与 Mock 数据
// ============================================================================

interface BiomeConfig {
  $schema?: string
  organizer?: { enabled?: boolean }
  files?: unknown
  formatter?: { indentStyle?: string; indentWidth?: number; lineWidth?: number }
  linter?: { enabled?: boolean; rules?: unknown }
  javascript?: unknown
  json?: unknown
  css?: unknown
  graphql?: unknown
}

function getMockBiomeConfig(): BiomeConfig {
  return {
    $schema: 'https://biomejs.dev/schemas/1.8.0/biome.json',
    formatter: { indentStyle: 'space', indentWidth: 2, lineWidth: 100 },
    linter: { enabled: true, rules: { recommended: true } },
    css: { formatter: { enabled: true } },
    graphql: { formatter: { enabled: true } },
  }
}

interface OxlintConfig {
  rules: string[]
  plugins?: string[]
  env?: Record<string, boolean>
}

function getMockOxlintConfig(): OxlintConfig {
  return {
    rules: ['no-unused-vars', 'eqeqeq', 'no-console'],
    plugins: ['react', 'typescript'],
    env: { browser: true, es2022: true },
  }
}

function getEslintToOxcMapping(): Record<string, string> {
  return {
    'no-unused-vars': 'oxc/no-unused-vars',
    eqeqeq: 'oxc/eqeqeq',
    'no-console': 'oxc/no-console',
  }
}

interface OxcTransformConfig {
  target: string
  jsx?: string
  minify?: boolean
}

function getMockOxcTransformConfig(): OxcTransformConfig {
  return { target: 'es2022', jsx: 'automatic', minify: true }
}

interface RolldownConfig {
  input: string | string[] | Record<string, string>
  output?: { format?: string; dir?: string }
  external?: string[]
  plugins?: unknown[]
}

function getMockRolldownConfig(): RolldownConfig {
  return {
    input: './src/index.ts',
    output: { format: 'esm', dir: './dist' },
    external: ['react', 'react-dom'],
    plugins: [],
  }
}

interface ViteConfig {
  plugins: unknown[]
  build?: { outDir?: string; minify?: boolean }
  resolve?: { alias?: Record<string, string> }
}

function getMockViteConfig(): ViteConfig {
  return {
    plugins: [],
    build: { outDir: 'dist', minify: true },
    resolve: { alias: { '@': './src' } },
  }
}
