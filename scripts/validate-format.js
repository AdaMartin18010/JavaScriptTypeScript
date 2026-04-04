#!/usr/bin/env node

/**
 * 验证 README.md 格式是否符合规范
 * 
 * 检查项：
 * 1. 表格格式正确
 * 2. 每个项目都有 Stars 徽章
 * 3. 链接有效
 * 4. 描述长度合适
 */

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');
const CONTRIBUTING_PATH = path.join(__dirname, '..', 'CONTRIBUTING.md');

// 验证 README 格式
function validateReadme(content) {
  const errors = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // 检查表格行
    if (line.startsWith('|') && line.includes('github.com') && !line.includes('---')) {
      // 检查是否包含 Stars 徽章
      if (!line.includes('img.shields.io/github/stars')) {
        errors.push(`第 ${lineNum} 行: 缺少 Stars 徽章`);
      }
      
      // 检查 GitHub 链接格式
      const githubMatch = line.match(/\[([^\]]+)\]\(https:\/\/github\.com\/([^/\s]+)\/([^/\s)]+)\)/);
      if (!githubMatch) {
        errors.push(`第 ${lineNum} 行: GitHub 链接格式不正确`);
      }
      
      // 检查描述长度（中文字符算1个）
      const descMatch = line.match(/\|[^|]+\|([^|]+)\|/);
      if (descMatch) {
        const desc = descMatch[1].trim();
        const charCount = desc.replace(/[^\u4e00-\u9fa5]/g, 'aa').length / 2;
        if (charCount > 20) {
          errors.push(`第 ${lineNum} 行: 描述过长 (${Math.ceil(charCount)} 字符)，建议控制在 15 字以内`);
        }
      }
    }
  });
  
  return errors;
}

// 检查文件是否存在
function checkRequiredFiles() {
  const errors = [];
  const requiredFiles = [
    'README.md',
    'CONTRIBUTING.md',
    'LICENSE',
    '.github/workflows/update-stars.yml',
    '.github/workflows/validate-links.yml'
  ];
  
  const baseDir = path.join(__dirname, '..');
  
  requiredFiles.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`缺少必需文件: ${file}`);
    }
  });
  
  return errors;
}

async function main() {
  console.log('🔍 开始验证格式...\n');
  
  let hasErrors = false;
  
  // 检查必需文件
  console.log('📁 检查必需文件...');
  const fileErrors = checkRequiredFiles();
  if (fileErrors.length > 0) {
    fileErrors.forEach(err => console.error(`  ❌ ${err}`));
    hasErrors = true;
  } else {
    console.log('  ✅ 所有必需文件都存在');
  }
  
  // 验证 README
  console.log('\n📝 验证 README.md...');
  try {
    const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const readmeErrors = validateReadme(readmeContent);
    
    if (readmeErrors.length > 0) {
      readmeErrors.forEach(err => console.error(`  ❌ ${err}`));
      hasErrors = true;
    } else {
      console.log('  ✅ README 格式正确');
    }
  } catch (error) {
    console.error(`  ❌ 读取 README 失败: ${error.message}`);
    hasErrors = true;
  }
  
  console.log('\n' + (hasErrors ? '❌ 验证失败，请修复上述问题' : '✅ 所有检查通过！'));
  process.exit(hasErrors ? 1 : 0);
}

main();
