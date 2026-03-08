/**
 * @file 设计令牌
 * @category Design System → Tokens
 * @difficulty medium
 * @tags design-system, tokens, theming
 */

export interface DesignTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
  breakpoints: Record<string, string>;
}

export class DesignTokenManager {
  private tokens: DesignTokens;
  private subscribers: Set<(tokens: DesignTokens) => void> = new Set();
  
  constructor(initialTokens: DesignTokens) {
    this.tokens = initialTokens;
  }
  
  getTokens(): DesignTokens {
    return { ...this.tokens };
  }
  
  updateTokens(updates: Partial<DesignTokens>): void {
    this.tokens = { ...this.tokens, ...updates };
    this.notifySubscribers();
  }
  
  // 生成CSS变量
  generateCSSVariables(): string {
    const lines: string[] = [':root {'];
    
    for (const [key, value] of Object.entries(this.tokens.colors)) {
      lines.push(`  --color-${key}: ${value};`);
    }
    
    for (const [key, value] of Object.entries(this.tokens.spacing)) {
      lines.push(`  --spacing-${key}: ${value};`);
    }
    
    lines.push('}');
    return lines.join('\n');
  }
  
  // 主题切换
  setTheme(theme: 'light' | 'dark'): void {
    const darkColors = {
      background: '#1a1a1a',
      text: '#ffffff',
      primary: '#3b82f6'
    };
    
    const lightColors = {
      background: '#ffffff',
      text: '#1a1a1a',
      primary: '#2563eb'
    };
    
    this.tokens.colors = theme === 'dark' ? darkColors : lightColors;
    this.notifySubscribers();
  }
  
  subscribe(callback: (tokens: DesignTokens) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  private notifySubscribers(): void {
    this.subscribers.forEach(cb => cb(this.tokens));
  }
}

export function demo(): void {
  console.log('=== 设计系统 ===\n');
  
  const tokens: DesignTokens = {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1a1a1a'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    typography: {
      fontFamily: {
        sans: 'system-ui, sans-serif',
        mono: 'monospace'
      },
      fontSize: {
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700
      }
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    }
  };
  
  const manager = new DesignTokenManager(tokens);
  console.log('CSS变量:');
  console.log(manager.generateCSSVariables());
}
