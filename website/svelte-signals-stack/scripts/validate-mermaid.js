#!/usr/bin/env node
/**
 * Mermaid 语法验证脚本
 * 提取所有 Markdown 文件中的 mermaid 代码块并尝试验证语法
 * 
 * 运行方式: node scripts/validate-mermaid.js
 */

const fs = require('fs');
const path = require('path');

const STACK_DIR = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(__dirname, 'mermaid-validation-report.json');

function findMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractMermaidBlocks(content) {
  const blocks = [];
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      startIndex: match.index,
      content: match[1].trim()
    });
  }
  return blocks;
}

// 基础语法检查（不依赖 mermaid-cli）
function validateSyntax(blockContent) {
  const errors = [];
  
  // 检查常见的语法问题
  const lines = blockContent.split('\n');
  
  // 检查未闭合的括号
  const openParens = (blockContent.match(/\(/g) || []).length;
  const closeParens = (blockContent.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`未闭合的括号: 开=${openParens}, 闭=${closeParens}`);
  }
  
  // 检查未闭合的方括号
  const openBrackets = (blockContent.match(/\[/g) || []).length;
  const closeBrackets = (blockContent.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`未闭合的方括号: 开=${openBrackets}, 闭=${closeBrackets}`);
  }
  
  // 检查未闭合的花括号
  const openBraces = (blockContent.match(/\{/g) || []).length;
  const closeBraces = (blockContent.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`未闭合的花括号: 开=${openBraces}, 闭=${closeBraces}`);
  }
  
  // 检查引号匹配
  const quotes = (blockContent.match(/"/g) || []).length;
  if (quotes % 2 !== 0) {
    errors.push(`未闭合的引号: 总数=${quotes}`);
  }
  
  // 检查 graph 声明
  const hasGraph = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|mindmap|pie|erDiagram)\b/m.test(blockContent);
  if (!hasGraph) {
    errors.push('缺少有效的图表类型声明');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function main() {
  console.log('\n🧜 Mermaid 语法验证器');
  console.log('=====================\n');
  
  const mdFiles = findMarkdownFiles(STACK_DIR);
  console.log(`📄 发现 ${mdFiles.length} 个 Markdown 文件\n`);
  
  const results = {
    generatedAt: new Date().toISOString(),
    totalFiles: mdFiles.length,
    totalDiagrams: 0,
    validDiagrams: 0,
    invalidDiagrams: 0,
    files: []
  };
  
  for (const file of mdFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const blocks = extractMermaidBlocks(content);
    
    if (blocks.length === 0) continue;
    
    const relativePath = path.relative(STACK_DIR, file);
    const fileResult = {
      file: relativePath,
      diagramCount: blocks.length,
      diagrams: []
    };
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const validation = validateSyntax(block.content);
      
      results.totalDiagrams++;
      if (validation.valid) {
        results.validDiagrams++;
      } else {
        results.invalidDiagrams++;
      }
      
      fileResult.diagrams.push({
        index: i + 1,
        valid: validation.valid,
        errors: validation.errors,
        preview: block.content.substring(0, 80).replace(/\n/g, ' ')
      });
    }
    
    results.files.push(fileResult);
    
    // 输出到控制台
    const status = fileResult.diagrams.every(d => d.valid) ? '✅' : '❌';
    console.log(`${status} ${relativePath} (${blocks.length} 个图表)`);
    
    for (const diag of fileResult.diagrams) {
      if (!diag.valid) {
        console.log(`   ❌ 图表 #${diag.index}: ${diag.errors.join(', ')}`);
      }
    }
  }
  
  // 保存报告
  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
  
  console.log(`\n📊 统计:`);
  console.log(`   总图表数: ${results.totalDiagrams}`);
  console.log(`   ✅ 有效: ${results.validDiagrams}`);
  console.log(`   ❌ 无效: ${results.invalidDiagrams}`);
  console.log(`\n📄 报告已保存: ${REPORT_PATH}\n`);
  
  if (results.invalidDiagrams > 0) {
    process.exit(1);
  }
}

main();
