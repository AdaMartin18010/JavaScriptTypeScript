/**
 * @myorg/utils - 工具函数库
 * 
 * 提供常用的工具函数
 */

// 字符串工具
export {
  capitalize,
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  escapeHtml,
} from './string';

// 日期工具
export {
  formatDate,
  parseDate,
  addDays,
  isValidDate,
} from './date';

// 对象工具
export {
  deepClone,
  deepMerge,
  pick,
  omit,
  isEmpty,
} from './object';

// 函数工具
export {
  debounce,
  throttle,
  memoize,
  once,
} from './function';

// 类型守卫
export {
  isString,
  isNumber,
  isObject,
  isArray,
  isFunction,
  isDate,
} from './guards';
