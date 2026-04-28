/**
 * @file Import Attributes (ES2025)
 * @category ECMAScript Evolution → ES2025
 * @difficulty easy
 * @tags modules, json, es2025
 * @description
 * 演示 ES2025 标准化的 Import Attributes 语法（with { type: "json" }），
 * 用于在静态和动态导入时声明模块属性，特别适用于 JSON 模块的安全导入。
 */

// 注意：以下静态导入语法在运行时需要宿主环境支持 JSON 模块
// import config from './config.json' with { type: 'json' };

/** 动态导入带属性 */
export async function dynamicImportWithAttributesDemo(modulePath: string): Promise<unknown> {
  // 在支持的环境中，可以这样动态导入 JSON 模块
  const module = await import(modulePath, {
    with: { type: 'json' },
  });
  return module;
}

/** 构建导入属性对象 */
export function buildImportAttributes(type: string): { with: { type: string } } {
  return {
    with: { type },
  };
}

/** TypeScript 类型声明示例 */
export interface ConfigSchema {
  name: string;
  version: string;
}

/** 模拟 JSON 模块导入后的类型断言 */
export function assertConfig(module: unknown): ConfigSchema {
  const m = module as { default: ConfigSchema };
  return m.default;
}

/** 属性不匹配错误的说明 */
export function mismatchErrorExplanation(): string {
  return `
如果导入路径与实际声明的 type 属性不匹配，模块加载器将抛出错误：
  import data from './data.txt' with { type: 'json' };
上述代码会失败，因为 .txt 文件不被识别为 JSON 模块。
`;
}
