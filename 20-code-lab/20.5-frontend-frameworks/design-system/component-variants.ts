/**
 * @file 组件变体生成器
 * @category Design System → Component Variants
 * @difficulty medium
 * @tags design-system, component, variants, cva, compound-variants
 *
 * @description
 * 受 CVA (Class Variance Authority) 启发的组件变体生成器
 */

// ============================================================================
// 类型定义
// ============================================================================

export type VariantValue = string | boolean | number;

export interface VariantConfig<T extends Record<string, Record<string, VariantValue>>> {
  base?: string;
  variants: T;
  defaultVariants?: { [K in keyof T]?: keyof T[K] };
  compoundVariants?: Array<{
    criteria: { [K in keyof T]?: keyof T[K] | Array<keyof T[K]> };
    className: string;
  }>;
}

export type VariantProps<T extends VariantConfig<Record<string, Record<string, VariantValue>>>> = {
  [K in keyof T['variants']]?: keyof T['variants'][K];
};

// ============================================================================
// 变体生成器
// ============================================================================

export class ComponentVariantGenerator<
  T extends Record<string, Record<string, VariantValue>>
> {
  private config: VariantConfig<T>;

  constructor(config: VariantConfig<T>) {
    this.config = config;
  }

  /**
   * 根据变体 props 生成类名字符串
   */
  generate(props?: { [K in keyof T]?: keyof T[K] }): string {
    const classes: string[] = [];

    // 基础类名
    if (this.config.base) {
      classes.push(this.config.base);
    }

    // 合并默认变体和传入的变体
    const merged = {
      ...this.config.defaultVariants,
      ...props
    } as { [K in keyof T]?: keyof T[K] };

    // 应用变体类名
    for (const [variantKey, variantValue] of Object.entries(merged)) {
      const variantGroup = this.config.variants[variantKey];
      if (!variantGroup) continue;

      const value = variantGroup[variantValue as string];
      if (typeof value === 'string') {
        classes.push(value);
      }
    }

    // 应用复合变体
    if (this.config.compoundVariants) {
      for (const compound of this.config.compoundVariants) {
        if (this.matchesCriteria(merged, compound.criteria)) {
          classes.push(compound.className);
        }
      }
    }

    return classes.join(' ');
  }

  /**
   * 获取所有可能的变体组合
   */
  getCombinations(): Array<{ props: { [K in keyof T]?: keyof T[K] }; className: string }> {
    const variantKeys = Object.keys(this.config.variants) as Array<keyof T>;
    const combinations: Array<{ [K in keyof T]?: keyof T[K] }> = [{}];

    for (const key of variantKeys) {
      const values = Object.keys(this.config.variants[key]);
      const newCombinations: Array<{ [K in keyof T]?: keyof T[K] }> = [];

      for (const combo of combinations) {
        for (const value of values) {
          newCombinations.push({ ...combo, [key]: value });
        }
      }

      combinations.length = 0;
      combinations.push(...newCombinations);
    }

    return combinations.map(props => ({
      props,
      className: this.generate(props)
    }));
  }

  /**
   * 获取变体的默认值
   */
  getDefaults(): { [K in keyof T]?: keyof T[K] } {
    return { ...this.config.defaultVariants };
  }

  /**
   * 获取指定变体的所有可选值
   */
  getVariantOptions<K extends keyof T>(variant: K): Array<keyof T[K]> {
    return Object.keys(this.config.variants[variant]);
  }

  private matchesCriteria(
    props: { [K in keyof T]?: keyof T[K] },
    criteria: { [K in keyof T]?: keyof T[K] | Array<keyof T[K]> }
  ): boolean {
    for (const [key, expected] of Object.entries(criteria)) {
      const actual = props[key as keyof T];

      if (Array.isArray(expected)) {
        if (!expected.includes(actual as string)) {
          return false;
        }
      } else if (actual !== expected) {
        return false;
      }
    }

    return true;
  }
}

// ============================================================================
// 样式合并工具
// ============================================================================

export class StyleComposer {
  /**
   * 合并多个类名字符串（去重）
   */
  static compose(...classes: Array<string | undefined | false>): string {
    const set = new Set<string>();

    for (const cls of classes) {
      if (!cls) continue;
      for (const part of cls.split(/\s+/)) {
        if (part) set.add(part);
      }
    }

    return Array.from(set).join(' ');
  }

  /**
   * 条件性添加类名
   */
  static conditional(classes: Record<string, boolean>): string {
    const result: string[] = [];

    for (const [cls, condition] of Object.entries(classes)) {
      if (condition) {
        result.push(cls);
      }
    }

    return result.join(' ');
  }

  /**
   * 从对象生成内联样式字符串
   */
  static inlineStyle(styles: Record<string, string | number | undefined>): string {
    const entries: string[] = [];

    for (const [key, value] of Object.entries(styles)) {
      if (value !== undefined) {
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        entries.push(`${kebabKey}: ${value}`);
      }
    }

    return entries.join('; ');
  }
}

// ============================================================================
// 预设变体（Button 示例）
// ============================================================================

export const buttonVariants = new ComponentVariantGenerator({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  variants: {
    variant: {
      solid: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost: 'text-blue-600 hover:bg-blue-50'
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed pointer-events-none',
      false: ''
    }
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    disabled: false
  },
  compoundVariants: [
    {
      criteria: { variant: 'solid', size: 'lg' },
      className: 'shadow-lg'
    }
  ]
});

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 组件变体生成器 ===\n');

  // 按钮变体
  console.log('--- Button Variants ---');
  console.log('  Default:', buttonVariants.generate());
  console.log('  Outline Large:', buttonVariants.generate({ variant: 'outline', size: 'lg' }));
  console.log('  Disabled:', buttonVariants.generate({ disabled: true }));

  // 所有组合
  console.log('\n--- All Combinations ---');
  const combos = buttonVariants.getCombinations();
  combos.slice(0, 4).forEach(({ props, className }) => {
    console.log(`  ${JSON.stringify(props)} -> ${className.substring(0, 60)}...`);
  });

  // 样式合并
  console.log('\n--- Style Composer ---');
  console.log('  Composed:', StyleComposer.compose('btn', 'btn-primary', undefined, 'btn-large'));
  console.log('  Conditional:', StyleComposer.conditional({ active: true, disabled: false, loading: true }));
}
