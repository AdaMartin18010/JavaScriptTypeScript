/**
 * @file Error.isError (ES2026 Preview)
 * @category ECMAScript Evolution → ES2026 Preview
 * @difficulty easy
 * @tags error, reliability, es2026
 * @description
 * 演示 ES2026 已确认 Stage 4 的 Error.isError 静态方法：
 * 提供一种跨 realm、跨 iframe 的可靠方式检测一个值是否为 Error 实例。
 * 解决了 `instanceof Error` 在不同执行上下文中失效的问题。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ErrorIsError = (Error as any).isError as ((value: unknown) => boolean) | undefined;

/** 检查运行时是否支持 Error.isError */
export function isErrorIsErrorSupported(): boolean {
  return typeof ErrorIsError === 'function';
}

/** 基础检测：真 Error 实例 */
export function detectRealError(): boolean | string {
  if (!ErrorIsError) return 'Error.isError not supported';
  return ErrorIsError(new Error('test'));
}

/** 跨 Realm 检测：在不同 iframe/realm 中创建的 Error */
export function crossRealmDetection(): boolean | string {
  if (!ErrorIsError) return 'Error.isError not supported';
  // 模拟跨 realm 场景：通过 Object.create 创建的类 Error 对象不会被 instanceof 识别
  const fakeError = Object.create(Error.prototype);
  return ErrorIsError(fakeError); // 应为 false
}

/** 常见误报的对比：instanceof vs Error.isError */
export function comparisonDemo(): {
  realErrorInstanceof: boolean;
  realErrorIsError: boolean | string;
  plainObjectInstanceof: boolean;
  plainObjectIsError: boolean | string;
} {
  const realError = new TypeError('type mismatch');
  const plainObject = { message: 'not an error' };

  return {
    realErrorInstanceof: realError instanceof Error,
    realErrorIsError: ErrorIsError ? ErrorIsError(realError) : 'not supported',
    plainObjectInstanceof: plainObject instanceof Error,
    plainObjectIsError: ErrorIsError ? ErrorIsError(plainObject) : 'not supported',
  };
}

/** 子类检测 */
export function subclassDetection(): {
  typeError: boolean | string;
  rangeError: boolean | string;
  syntaxError: boolean | string;
} {
  if (!ErrorIsError) {
    return { typeError: 'not supported', rangeError: 'not supported', syntaxError: 'not supported' };
  }
  return {
    typeError: ErrorIsError(new TypeError()),
    rangeError: ErrorIsError(new RangeError()),
    syntaxError: ErrorIsError(new SyntaxError()),
  };
}
