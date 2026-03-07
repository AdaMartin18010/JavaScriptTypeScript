/**
 * @file 快速开始入口
 * @description 项目快速体验入口
 */

import { roughlyEqual } from '../../00-language-core/01-types/primitives.js';
import { configurePort, greet } from '../../01-ecmascript-evolution/es2020/nullish-coalescing.js';

console.log('🚀 JSTS Code Lab - Quick Start\n');

console.log('=== 1. 原始类型示例 ===');
console.log('0.1 + 0.2 === 0.3?', 0.1 + 0.2 === 0.3);
console.log('使用 roughlyEqual:', roughlyEqual(0.1 + 0.2, 0.3));

console.log('\n=== 2. 空值合并示例 ===');
console.log('Port (undefined):', configurePort(undefined));
console.log('Port (0):', configurePort(0));
console.log(greet('Alice'));
console.log(greet(undefined));

console.log('\n✅ Quick start completed!');
