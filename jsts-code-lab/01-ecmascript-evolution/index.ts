/**
 * @file ECMAScript 演进模块入口
 * @description ES2020-2024 正式版 + ES2025 正式版 + ES2026 Stage 4 前瞻特性
 */

export * as Bigint from './es2020/bigint.js';
export * as NullishCoalescing from './es2020/nullish-coalescing.js';
export * as OptionalChaining from './es2020/optional-chaining.js';
export * as PromiseAllsettled from './es2020/promise-allsettled.js';

export * as PromiseAny from './es2021/promise-any.js';

export * as AtMethod from './es2022/at-method.js';
export * as ClassFields from './es2022/class-fields.js';
export * as ErrorCause from './es2022/error-cause.js';

export * as ArrayMethods from './es2023/array-methods.js';

export * as PromiseWithresolvers from './es2024/promise-withresolvers.js';

// ES2025 正式版 (ECMA-262, 16th edition, June 2025)
export * as IteratorHelpers from './es2025/iterator-helpers.js';
export * as SetMethods from './es2025/set-methods.js';
export * as PromiseTry from './es2025/promise-try.js';
export * as RegexpEscape from './es2025/regexp-escape.js';
export * as RegexpModifiers from './es2025/regexp-modifiers.js';
export * as Float16ArrayDemo from './es2025/float16array.js';
export * as ImportAttributes from './es2025/import-attributes.js';

// ES2025 Preview / ES2026 Preview (TC39 Stage 3/4)
export * as AtomicsPause from './es2025-preview/atomics-pause.js';

// ES2026 Stage 4 前瞻
export * as TemporalApi from './es2026-preview/temporal-api.js';
export * as ArrayFromAsync from './es2026-preview/array-from-async.js';
export * as ErrorIsError from './es2026-preview/error-is-error.js';
export * as ExplicitResourceManagement from './es2026-preview/explicit-resource-management.js';
