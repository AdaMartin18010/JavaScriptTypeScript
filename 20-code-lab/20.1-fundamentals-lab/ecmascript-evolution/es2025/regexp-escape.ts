/**
 * @file RegExp.escape (ES2025)
 * @category ECMAScript Evolution → ES2025
 * @difficulty easy
 * @tags regexp, security, es2025
 * @description
 * 演示 ES2025 RegExp.escape 静态方法：将字符串中的正则元字符安全转义，
 * 使其可作为字面量文本用于动态构建正则表达式，避免注入风险。
 */

// ES2025 类型补丁：RegExp.escape 尚未进入所有 TypeScript lib 定义
declare global {
  interface RegExpConstructor {
    escape(string: string): string;
  }
}

/** 基础字符串转义 */
export function basicEscapeDemo(): string {
  return RegExp.escape('(*)'); // "\\(\\*\\)"
}

/** 用户输入安全处理 */
export function safeUserInputDemo(userInput: string): RegExp {
  const safe = RegExp.escape(userInput);
  return new RegExp(safe, 'g');
}

/** 动态正则构建：搜索高亮 */
export function searchHighlightDemo(text: string, keyword: string): string {
  const safeKeyword = RegExp.escape(keyword);
  const regex = new RegExp(`(${safeKeyword})`, 'gi');
  return text.replace(regex, '**$1**');
}

/** 处理换行符与特殊空白 */
export function specialCharsDemo(): {
  newline: string;
  tab: string;
  slash: string;
} {
  return {
    newline: RegExp.escape('\n'),
    tab: RegExp.escape('\t'),
    slash: RegExp.escape('/'),
  };
}

/** Unicode 字符处理 */
export function unicodeDemo(): string {
  return RegExp.escape('你好🚀');
}
