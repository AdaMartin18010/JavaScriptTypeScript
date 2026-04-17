/**
 * @file 错误遮罩层
 * @category Developer Experience → Error Overlay
 * @difficulty medium
 * @tags error-overlay, debugging, dev-tools
 *
 * @description
 * 开发时错误遮罩层：在页面上显示编译错误和运行时错误，
 * 帮助开发者快速定位问题。类似 React Error Boundary 和 Vite 错误遮罩。
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ErrorInfo {
  id: string;
  type: 'compile' | 'runtime' | 'syntax';
  message: string;
  stack?: string;
  source?: string;
  location?: {
    file: string;
    line: number;
    column: number;
  };
  frame?: string; // 代码片段
  severity: 'error' | 'warning';
  timestamp: number;
}

export interface FrameLine {
  lineNumber: number;
  content: string;
  isError?: boolean;
}

// ============================================================================
// 错误解析器
// ============================================================================

export class ErrorParser {
  /**
   * 从错误对象解析错误信息
   */
  parse(error: Error, source?: string): ErrorInfo {
    const stack = error.stack || '';
    const location = this.extractLocation(stack);
    
    return {
      id: this.generateId(),
      type: 'runtime',
      message: error.message,
      stack,
      source,
      location,
      severity: 'error',
      timestamp: Date.now()
    };
  }

  /**
   * 解析编译错误
   */
  parseCompileError(message: string, file: string, line: number, column: number): ErrorInfo {
    return {
      id: this.generateId(),
      type: 'compile',
      message,
      location: { file, line, column },
      severity: 'error',
      timestamp: Date.now()
    };
  }

  /**
   * 解析语法错误
   */
  parseSyntaxError(error: SyntaxError, code: string): ErrorInfo {
    const stack = error.stack || '';
    const location = this.extractLocation(stack);
    
    // 生成代码帧
    const frame = location 
      ? this.generateCodeFrame(code, location.line, location.column)
      : undefined;

    return {
      id: this.generateId(),
      type: 'syntax',
      message: error.message,
      stack,
      location,
      frame,
      severity: 'error',
      timestamp: Date.now()
    };
  }

  /**
   * 从堆栈提取位置信息
   */
  private extractLocation(stack: string): ErrorInfo['location'] | undefined {
    // 匹配文件路径:行号:列号
    const match = /\s+at\s+.*?\s*\((.+?):(\d+):(\d+)\)/.exec(stack);
    
    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10)
      };
    }

    // 尝试直接匹配 file:line:column
    const directMatch = /(\S+?):(\d+):(\d+)/.exec(stack);
    if (directMatch) {
      return {
        file: directMatch[1],
        line: parseInt(directMatch[2], 10),
        column: parseInt(directMatch[3], 10)
      };
    }

    return undefined;
  }

  /**
   * 生成代码帧（显示错误周围代码）
   */
  generateCodeFrame(code: string, line: number, column: number, contextLines = 3): string {
    const lines = code.split('\n');
    const start = Math.max(0, line - contextLines - 1);
    const end = Math.min(lines.length, line + contextLines);

    const result: string[] = [];
    const maxLineNum = end.toString().length;

    for (let i = start; i < end; i++) {
      const lineNum = (i + 1).toString().padStart(maxLineNum, ' ');
      const isError = i === line - 1;
      const prefix = isError ? '> ' : '  ';
      
      result.push(`${prefix}${lineNum} | ${lines[i]}`);
      
      // 在错误行下方添加指针
      if (isError && column > 0) {
        const pointer = ' '.repeat(maxLineNum + 5 + column - 1) + '^';
        result.push(pointer);
      }
    }

    return result.join('\n');
  }

  /**
   * 清理堆栈（移除内部帧）
   */
  cleanStack(stack: string): string {
    return stack
      .split('\n')
      .filter(line => {
        // 过滤掉内部帧
        return !line.includes('node_modules') && 
               !line.includes('internal/') &&
               !line.includes('Error: ');
      })
      .join('\n');
  }

  private generateId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

// ============================================================================
// 错误遮罩层管理器
// ============================================================================

export class ErrorOverlayManager {
  private errors = new Map<string, ErrorInfo>();
  private listeners = new Set<(errors: ErrorInfo[]) => void>();

  /**
   * 添加错误
   */
  addError(error: ErrorInfo): void {
    this.errors.set(error.id, error);
    this.notifyListeners();
  }

  /**
   * 移除错误
   */
  removeError(id: string): void {
    this.errors.delete(id);
    this.notifyListeners();
  }

  /**
   * 清除所有错误
   */
  clear(): void {
    this.errors.clear();
    this.notifyListeners();
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorInfo[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 按类型获取错误
   */
  getErrorsByType(type: ErrorInfo['type']): ErrorInfo[] {
    return this.getErrors().filter(e => e.type === type);
  }

  /**
   * 订阅错误变化
   */
  subscribe(listener: (errors: ErrorInfo[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const errors = this.getErrors();
    this.listeners.forEach(listener => { listener(errors); });
  }
}

// ============================================================================
// 控制台错误处理器
// ============================================================================

export class ConsoleErrorHandler {
  private originalError: typeof console.error;
  private onError: (error: Error) => void;

  constructor(onError: (error: Error) => void) {
    this.originalError = console.error;
    this.onError = onError;
  }

  /**
   * 拦截 console.error
   */
  intercept(): void {
    console.error = (...args: unknown[]) => {
      // 调用原始方法
      this.originalError.apply(console, args);

      // 提取错误对象
      const error = args.find(arg => arg instanceof Error);
      if (error) {
        this.onError(error);
      }
    };
  }

  /**
   * 恢复原始 console.error
   */
  restore(): void {
    console.error = this.originalError;
  }
}

// ============================================================================
// 运行时错误处理器
// ============================================================================

export class RuntimeErrorHandler {
  private onError: (error: ErrorInfo) => void;
  private parser = new ErrorParser();

  constructor(onError: (error: ErrorInfo) => void) {
    this.onError = onError;
  }

  /**
   * 监听全局错误
   */
  listen(): void {
    if (typeof window !== 'undefined') {
      // 浏览器环境
      window.addEventListener('error', (event) => {
        const errorInfo = this.parser.parse(event.error);
        errorInfo.location = {
          file: event.filename,
          line: event.lineno,
          column: event.colno
        };
        this.onError(errorInfo);
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        if (reason instanceof Error) {
          this.onError(this.parser.parse(reason));
        } else {
          this.onError({
            id: this.generateId(),
            type: 'runtime',
            message: String(reason),
            severity: 'error',
            timestamp: Date.now()
          });
        }
      });
    } else if (typeof process !== 'undefined') {
      // Node.js 环境
      process.on('uncaughtException', (error) => {
        if (error instanceof Error) {
          this.onError(this.parser.parse(error));
        }
      });

      process.on('unhandledRejection', (reason) => {
        if (reason instanceof Error) {
          this.onError(this.parser.parse(reason));
        }
      });
    }
  }

  private generateId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

// ============================================================================
// 格式化输出
// ============================================================================

export class ErrorFormatter {
  /**
   * 格式化错误为字符串
   */
  format(error: ErrorInfo): string {
    const parts: string[] = [];
    
    parts.push(`[${error.type.toUpperCase()}] ${error.message}`);
    
    if (error.location) {
      parts.push(`  at ${error.location.file}:${error.location.line}:${error.location.column}`);
    }
    
    if (error.frame) {
      parts.push('');
      parts.push(error.frame);
    }
    
    if (error.stack) {
      parts.push('');
      parts.push('Stack trace:');
      parts.push(error.stack.split('\n').slice(1, 4).join('\n'));
    }

    return parts.join('\n');
  }

  /**
   * 格式化为 HTML（用于浏览器显示）
   */
  formatToHTML(error: ErrorInfo): string {
    const bgColor = error.severity === 'error' ? '#ff5555' : '#ffaa00';
    
    return `
<div style="
  background: ${bgColor};
  color: white;
  padding: 20px;
  font-family: monospace;
  border-radius: 8px;
  margin: 10px 0;
">
  <h3 style="margin: 0 0 10px 0;">🐛 ${escapeHtml(error.message)}</h3>
  ${error.location ? `<p style="margin: 5px 0;">${escapeHtml(error.location.file)}:${error.location.line}:${error.location.column}</p>` : ''}
  ${error.frame ? `<pre style="background: rgba(0,0,0,0.2); padding: 10px; overflow-x: auto;">${escapeHtml(error.frame)}</pre>` : ''}
</div>
    `.trim();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 错误遮罩层演示 ===\n');

  const parser = new ErrorParser();
  const overlay = new ErrorOverlayManager();
  const formatter = new ErrorFormatter();

  // 订阅错误变化
  overlay.subscribe((errors) => {
    console.log(`[Overlay] 当前有 ${errors.length} 个错误`);
  });

  // 1. 解析运行时错误
  console.log('--- 运行时错误 ---');
  try {
    throw new Error('Something went wrong!');
  } catch (e) {
    if (e instanceof Error) {
      const errorInfo = parser.parse(e);
      overlay.addError(errorInfo);
      console.log(formatter.format(errorInfo));
    }
  }

  // 2. 解析编译错误
  console.log('\n--- 编译错误 ---');
  const compileError = parser.parseCompileError(
    "Cannot find module 'missing-module'",
    '/src/app.ts',
    10,
    15
  );
  overlay.addError(compileError);
  console.log(formatter.format(compileError));

  // 3. 生成代码帧
  console.log('\n--- 代码帧 ---');
  const sampleCode = `
function greet(name: string) {
  if (!name) {
    throw new Error('Name is required');
  }
  return \`Hello, \${name}!\`;
}

console.log(greet(null));
`.trim();

  const codeFrame = parser.generateCodeFrame(sampleCode, 6, 2);
  console.log(codeFrame);

  // 4. 创建语法错误
  console.log('\n--- 语法错误 ---');
  try {
    // 故意制造语法错误
    new Function('return {')();
  } catch (e) {
    if (e instanceof SyntaxError) {
      // 由于无法捕获具体语法错误的位置，创建一个模拟的
      const syntaxError: ErrorInfo = {
        id: 'syntax-1',
        type: 'syntax',
        message: 'Unexpected end of input',
        frame: parser.generateCodeFrame('function test() {', 1, 17),
        location: { file: 'script.js', line: 1, column: 17 },
        severity: 'error',
        timestamp: Date.now()
      };
      overlay.addError(syntaxError);
      console.log(formatter.format(syntaxError));
    }
  }

  // 5. 显示所有错误
  console.log('\n--- 所有错误 ---');
  const allErrors = overlay.getErrors();
  allErrors.forEach((err, idx) => {
    console.log(`${idx + 1}. [${err.type}] ${err.message}`);
  });

  // 6. HTML 格式（浏览器环境）
  console.log('\n--- HTML 格式 ---');
  if (typeof document !== 'undefined') {
    console.log('Would render HTML overlay in browser');
  } else {
    console.log('HTML format (Node.js preview):');
    console.log(formatter.formatToHTML(allErrors[0]).substring(0, 200) + '...');
  }
}
