#!/usr/bin/env node

/**
 * generate-toc.js
 * 
 * 功能：
 * - 根据 README.md 中的分类标题生成目录
 * - 自动更新 README.md 中的目录部分
 * 
 * 使用方法：
 *   node generate-toc.js [--check] [--output=<path>]
 * 
 * 选项：
 *   --check     检查目录是否需要更新（不写入文件）
 *   --output    指定输出文件路径（默认覆盖原 README.md）
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  readmePath: path.join(__dirname, '..', 'README.md'),
  tocStartMarker: '<!-- TOC START -->',
  tocEndMarker: '<!-- TOC END -->',
  maxDepth: 3, // 最大标题层级
};

// 解析命令行参数
function parseArgs() {
  const args = {
    check: process.argv.includes('--check'),
    output: null,
  };
  
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--output=')) {
      args.output = arg.split('=')[1];
    }
  });
  
  return args;
}

// 解析标题
function parseHeadings(content) {
  const headings = [];
  const lines = content.split('\n');
  
  // 匹配 Markdown 标题：### 标题 或 ### [标题](#锚点)
  const headingRegex = /^(#{2,4})\s+(.+)$/;
  
  lines.forEach((line, index) => {
    const match = line.match(headingRegex);
    if (match) {
      const level = match[1].length; // ## = 2, ### = 3, #### = 4
      const rawText = match[2].trim();
      
      // 跳过目录本身的标题
      if (rawText.includes('目录') || rawText.includes('Contents') || rawText.includes('Table of')) {
        return;
      }
      
      // 提取纯文本（移除链接）
      const text = rawText
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
        .replace(/<[^>]+>/g, '') // HTML 标签
        .trim();
      
      // 生成锚点 ID
      const anchor = generateAnchor(text);
      
      headings.push({
        level,
        text,
        anchor,
        raw: rawText,
        lineNumber: index + 1,
      });
    }
  });
  
  return headings;
}

// 生成锚点 ID（兼容 GitHub）
function generateAnchor(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除非字母数字字符
    .replace(/\s+/g, '-') // 空格转连字符
    .replace(/-+/g, '-') // 多个连字符合并
    .replace(/^-|-$/g, ''); // 移除首尾连字符
}

// 构建目录树
function buildTocTree(headings, maxDepth) {
  const root = { children: [], level: 0 };
  const stack = [root];
  
  headings.forEach(heading => {
    if (heading.level > maxDepth) return;
    
    const node = { ...heading, children: [] };
    
    // 找到正确的父节点
    while (stack.length > 1 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    
    // 添加到父节点的 children
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  
  return root.children;
}

// 生成目录 Markdown
function generateTocMarkdown(tree, baseIndent = 0) {
  let markdown = '';
  
  tree.forEach(node => {
    const indent = '  '.repeat(baseIndent);
    const emoji = extractEmoji(node.text);
    const displayText = node.text.replace(/^[^\w\s]+\s*/, ''); // 移除开头的 emoji
    
    markdown += `${indent}- [${node.text}](#${node.anchor})\n`;
    
    if (node.children && node.children.length > 0) {
      markdown += generateTocMarkdown(node.children, baseIndent + 1);
    }
  });
  
  return markdown;
}

// 提取 emoji
function extractEmoji(text) {
  const emojiRegex = /^(\p{Emoji}+)/u;
  const match = text.match(emojiRegex);
  return match ? match[1] : '';
}

// 生成带样式的目录（中文版本）
function generateChineseToc(tree) {
  let markdown = '### 📋 目录\n\n';
  markdown += generateTocMarkdown(tree);
  return markdown;
}

// 生成英文目录
function generateEnglishToc(tree) {
  let markdown = '### 📋 Contents\n\n';
  markdown += generateTocMarkdown(tree);
  return markdown;
}

// 检测 README 中的语言区域
function detectLanguageSections(content) {
  const sections = [];
  const lines = content.split('\n');
  
  let currentSection = null;
  let startLine = 0;
  
  lines.forEach((line, index) => {
    // 检测中文区域标记
    if (/^##\s+中文/.test(line) || /^##\s+简体中文/.test(line)) {
      if (currentSection) {
        currentSection.endLine = index;
      }
      currentSection = { language: 'zh', startLine: index, endLine: lines.length };
      sections.push(currentSection);
    }
    // 检测英文区域标记
    else if (/^##\s+English/.test(line)) {
      if (currentSection) {
        currentSection.endLine = index;
      }
      currentSection = { language: 'en', startLine: index, endLine: lines.length };
      sections.push(currentSection);
    }
  });
  
  // 如果没有明确的语言标记，假设整个文件是中文
  if (sections.length === 0) {
    sections.push({ language: 'zh', startLine: 0, endLine: lines.length });
  }
  
  return sections;
}

// 查找现有的目录位置
function findExistingToc(content) {
  const tocPatterns = [
    /(##\s+📋\s*目录[\s\S]*?)(?=\n##\s+)/,
    /(###\s+📋\s*目录[\s\S]*?)(?=\n###\s+|\n##\s+)/,
    /(##\s+📋\s*Contents[\s\S]*?)(?=\n##\s+)/,
    /(###\s+📋\s*Contents[\s\S]*?)(?=\n###\s+|\n##\s+)/,
  ];
  
  for (const pattern of tocPatterns) {
    const match = content.match(pattern);
    if (match) {
      return {
        found: true,
        start: match.index,
        end: match.index + match[1].length,
        content: match[1],
      };
    }
  }
  
  return { found: false };
}

// 插入或更新目录
function insertOrUpdateToc(content, tocMarkdown) {
  // 首先尝试查找现有的目录
  const existingToc = findExistingToc(content);
  
  if (existingToc.found) {
    // 更新现有目录
    return content.slice(0, existingToc.start) + tocMarkdown + content.slice(existingToc.end);
  }
  
  // 查找合适的位置插入目录（通常是第一个 ## 标题之后）
  const firstHeadingMatch = content.match(/\n(##\s+[^\n]+)\n/);
  if (firstHeadingMatch) {
    const insertPos = firstHeadingMatch.index + firstHeadingMatch[0].length;
    return content.slice(0, insertPos) + '\n' + tocMarkdown + '\n' + content.slice(insertPos);
  }
  
  // 如果没找到标题，在文件开头添加
  return tocMarkdown + '\n\n' + content;
}

// 验证目录是否最新
function validateToc(content, expectedToc) {
  const existingToc = findExistingToc(content);
  
  if (!existingToc.found) {
    return { valid: false, reason: '未找到现有目录' };
  }
  
  // 标准化内容进行比较（移除多余空格和换行）
  const normalize = (str) => str.replace(/\s+/g, ' ').trim();
  
  if (normalize(existingToc.content) === normalize(expectedToc)) {
    return { valid: true };
  }
  
  return { valid: false, reason: '目录内容不匹配' };
}

// 生成完整目录（支持多语言）
function generateFullToc(content) {
  const sections = detectLanguageSections(content);
  let result = '';
  
  sections.forEach(section => {
    const sectionContent = content.split('\n').slice(section.startLine, section.endLine).join('\n');
    const headings = parseHeadings(sectionContent);
    const tree = buildTocTree(headings, CONFIG.maxDepth);
    
    if (tree.length > 0) {
      if (section.language === 'zh') {
        result += generateChineseToc(tree) + '\n';
      } else {
        result += generateEnglishToc(tree) + '\n';
      }
    }
  });
  
  return result.trim();
}

// 主函数
async function main() {
  console.log('🚀 开始生成目录...\n');
  
  const args = parseArgs();
  
  // 读取 README.md
  console.log(`📖 读取 ${CONFIG.readmePath}...`);
  if (!fs.existsSync(CONFIG.readmePath)) {
    console.error(`❌ 错误：找不到文件 ${CONFIG.readmePath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(CONFIG.readmePath, 'utf-8');
  
  // 解析标题
  console.log('🔍 解析文档标题...');
  const headings = parseHeadings(content);
  console.log(`   找到 ${headings.length} 个标题\n`);
  
  if (headings.length === 0) {
    console.log('⚠️  未找到任何标题');
    return;
  }
  
  // 显示找到的标题
  console.log('📋 标题列表：');
  headings.forEach(h => {
    const indent = '  '.repeat(h.level - 2);
    console.log(`   ${indent}${'#'.repeat(h.level)} ${h.text}`);
  });
  console.log('');
  
  // 生成目录
  console.log('📝 生成目录...');
  const tocMarkdown = generateFullToc(content);
  
  if (!tocMarkdown) {
    console.log('⚠️  未能生成目录');
    return;
  }
  
  // 检查模式
  if (args.check) {
    const validation = validateToc(content, tocMarkdown);
    if (validation.valid) {
      console.log('✅ 目录已是最新');
      process.exit(0);
    } else {
      console.log(`❌ 目录需要更新: ${validation.reason}`);
      process.exit(1);
    }
  }
  
  // 插入或更新目录
  const updatedContent = insertOrUpdateToc(content, tocMarkdown);
  
  // 写入文件
  const outputPath = args.output ? path.resolve(args.output) : CONFIG.readmePath;
  
  if (updatedContent !== content) {
    fs.writeFileSync(outputPath, updatedContent, 'utf-8');
    console.log(`✅ 目录已更新并保存到 ${outputPath}`);
  } else {
    console.log('ℹ️  目录没有变化');
  }
  
  // 显示生成的目录预览
  console.log('\n📄 生成的目录预览：');
  console.log('─'.repeat(50));
  console.log(tocMarkdown);
  console.log('─'.repeat(50));
  
  console.log('\n✨ 完成！');
}

// 错误处理
main().catch(error => {
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
