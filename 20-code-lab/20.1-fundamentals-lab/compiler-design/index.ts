/**
 * @file 编译器设计模块
 * @module Compiler Design
 * @description
 * 编译器原理实现：
 * - 词法分析 (Lexer)
 * - 语法分析 (Parser)
 * - 抽象语法树 (AST)
 * - 代码生成 (Code Generator)
 */

export * as CompilerPipeline from './compiler-pipeline.js';
export * as Lexer from './lexer.js';
export * as Parser from './parser.js';
export * as AST from './ast.js';
export * as CodeGen from './code-gen.js';
