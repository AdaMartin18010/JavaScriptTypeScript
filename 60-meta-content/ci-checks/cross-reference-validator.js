#!/usr/bin/env node

/**
 * 交叉引用验证器
 *
 * 1. 扫描所有 THEORY.md，验证其中引用的关联文件/目录是否真实存在。
 * 2. 验证 20-code-lab/ 下的每个模块目录是否都有 THEORY.md。
 * 3. 输出理论-实践闭环完整性报告。
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const CODE_LAB_DIR = path.join(PROJECT_ROOT, '20-code-lab');

const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.vitepress',
  'dist',
  'build',
  '.azure',
  '_playground',
  '_shared',
  '_tests',
  // 旧备份目录
  'jsts-code-lab',
  'docs',
  'JSTS全景综述',
  'examples',
  'awesome-jsts-ecosystem',
  'jsts-language-core-system',
  'website',
  'view',
];

/**
 * 递归查找所有 THEORY.md 文件
 */
function findAllTheoryFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;
      findAllTheoryFiles(fullPath, files);
    } else if (entry.isFile() && entry.name === 'THEORY.md') {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 提取 THEORY.md 中的引用路径
 * 匹配模式：
 *   - `path/to/file` 或 `path/to/file.md`
 *   - `path/to/dir/` （目录引用）
 *   - > **关联**：`path1` | `path2`
 *   - 扩展阅读中的路径引用
 */
function extractReferences(content, baseDir) {
  const refs = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 匹配反引号中的路径引用（可能包含文件扩展名或目录结构）
    // 例如 `10-fundamentals/10.1-language-semantics/` 或 `type-coercion.ts`
    const backtickRegex = /`([^`\n]+)`/g;
    let match;
    while ((match = backtickRegex.exec(line)) !== null) {
      const ref = match[1].trim();

      // 过滤掉明显不是路径的内容
      if (ref.length < 2) continue;
      if (ref.includes(' ')) continue;
      // 跳过纯代码片段（不含 / 且不是已知文件扩展名）
      if (!ref.includes('/') && !/\.(ts|js|tsx|jsx|md|json|yaml|yml)$/.test(ref)) continue;
      // 跳过已知的非路径关键词
      if (/^(true|false|null|undefined|console|window|document|import|export|return|const|let|var|function|class|interface|type|enum)$/.test(ref)) continue;
      // 跳过常见配置文件名（单独出现时通常是代码中的字符串，而非路径引用）
      if (/^package\.json$/.test(ref)) continue;
      // 跳过 npm 包名模式（@scope/name）
      if (/^@[a-z0-9-]+\//.test(ref)) continue;
      // 跳过 API 端点路径（以 / 开头且包含典型路由模式）
      if (/^\/(graphql|users|posts|v\d+|api|health|webhook|auth|login|logout|callback)/.test(ref)) continue;
      // 跳过包含 HTML/URL 查询参数的内容
      if (/\?.*=/.test(ref) || /<script|alert\(/.test(ref)) continue;
      // 跳过 Cookie 属性
      if (/SameSite=/.test(ref)) continue;
      // 跳过示例域名
      if (/[a-z]+\.com\//.test(ref)) continue;
      // 跳过代码调用模式（如 func.call/apply, Reflect.get/set）
      if (/^[A-Za-z_]+\.[a-z]+\/[a-z]+$/.test(ref) || /^[A-Za-z_]+\.[a-z]+\/[a-z]+\(/.test(ref)) continue;

      refs.push({ line: lineNum, text: ref, raw: match[0] });
    }
  }

  return refs;
}

/**
 * 验证引用路径是否存在
 */
function findModuleRoot(filePath) {
  // 对于 jsts-code-lab 或 20-code-lab 中的文件，返回对应模块根目录
  const normalized = path.normalize(filePath);
  const parts = normalized.split(path.sep);

  const jstsIdx = parts.findIndex(p => p === 'jsts-code-lab');
  if (jstsIdx >= 0) {
    return parts.slice(0, jstsIdx + 1).join(path.sep);
  }

  const codeLabIdx = parts.findIndex(p => p === '20-code-lab');
  if (codeLabIdx >= 0) {
    return parts.slice(0, codeLabIdx + 1).join(path.sep);
  }

  return null;
}

function validateReference(baseDir, ref, filePath) {
  const possiblePaths = [];

  // 直接路径
  possiblePaths.push(path.resolve(baseDir, ref));
  // 相对于项目根目录
  possiblePaths.push(path.resolve(PROJECT_ROOT, ref));

  // 如果引用没有扩展名，尝试添加 .md
  if (!path.extname(ref)) {
    possiblePaths.push(path.resolve(baseDir, ref + '.md'));
    possiblePaths.push(path.resolve(PROJECT_ROOT, ref + '.md'));
  }

  // 如果引用以 / 结尾（目录），尝试 index.md 和 README.md
  if (ref.endsWith('/')) {
    const dirPath1 = path.resolve(baseDir, ref);
    const dirPath2 = path.resolve(PROJECT_ROOT, ref);
    possiblePaths.push(path.join(dirPath1, 'index.md'));
    possiblePaths.push(path.join(dirPath1, 'README.md'));
    possiblePaths.push(path.join(dirPath2, 'index.md'));
    possiblePaths.push(path.join(dirPath2, 'README.md'));
  }

  // 对于 code-lab 内的文件，也尝试从模块根目录解析
  const moduleRoot = findModuleRoot(filePath);
  if (moduleRoot) {
    possiblePaths.push(path.resolve(moduleRoot, ref));
    if (!path.extname(ref)) {
      possiblePaths.push(path.resolve(moduleRoot, ref + '.md'));
    }
    if (ref.endsWith('/')) {
      possiblePaths.push(path.join(path.resolve(moduleRoot, ref), 'index.md'));
      possiblePaths.push(path.join(path.resolve(moduleRoot, ref), 'README.md'));
    }
  }

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return { exists: true, resolved: p };
    }
  }

  return { exists: false, tried: possiblePaths.slice(0, 3) };
}

/**
 * 检查 20-code-lab 下的模块目录是否都有 THEORY.md
 */
function checkTheoryCoverage() {
  const modulesWithoutTheory = [];
  const moduleDirs = [];

  const entries = fs.readdirSync(CODE_LAB_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

    const fullPath = path.join(CODE_LAB_DIR, entry.name);
    moduleDirs.push(entry.name);

    // 检查该模块目录下是否有 THEORY.md（可能在子目录中）
    const hasTheory = findAllTheoryFiles(fullPath).length > 0;
    if (!hasTheory) {
      modulesWithoutTheory.push(entry.name);
    }
  }

  return { moduleDirs, modulesWithoutTheory };
}

function runCrossReferenceValidation() {
  console.log('📚 开始交叉引用验证...\n');

  const theoryFiles = findAllTheoryFiles(PROJECT_ROOT);
  const brokenRefs = [];
  const validRefs = [];

  // 1. 验证每个 THEORY.md 中的引用
  for (const theoryPath of theoryFiles) {
    const content = fs.readFileSync(theoryPath, 'utf-8');
    const baseDir = path.dirname(theoryPath);
    const relativePath = path.relative(PROJECT_ROOT, theoryPath);

    const refs = extractReferences(content, baseDir);
    const seen = new Set();

    for (const ref of refs) {
      const key = `${relativePath}:${ref.line}:${ref.text}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const result = validateReference(baseDir, ref.text, theoryPath);

      if (result.exists) {
        validRefs.push({
          file: relativePath,
          line: ref.line,
          ref: ref.text,
        });
      } else {
        brokenRefs.push({
          file: relativePath,
          line: ref.line,
          ref: ref.text,
          context: content.split('\n')[ref.line - 1]?.trim().substring(0, 120) || '',
        });
      }
    }
  }

  // 2. 检查 20-code-lab 的 THEORY.md 覆盖
  const coverage = checkTheoryCoverage();

  // 输出报告
  console.log(`📄 扫描 THEORY.md: ${theoryFiles.length} 个`);
  console.log(`🔗 有效引用: ${validRefs.length} 个`);
  console.log(`❌ 断裂引用: ${brokenRefs.length} 个`);

  if (brokenRefs.length > 0) {
    console.log(`\n❌ 发现 ${brokenRefs.length} 个断裂引用:\n`);
    brokenRefs.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.file}:${item.line}`);
      console.log(`     引用: "${item.ref}"`);
      if (item.context) {
        console.log(`     上下文: ${item.context}`);
      }
    });
  }

  console.log(`\n📂 20-code-lab 模块总数: ${coverage.moduleDirs.length}`);
  console.log(`✅ 有 THEORY.md 的模块: ${coverage.moduleDirs.length - coverage.modulesWithoutTheory.length}`);

  if (coverage.modulesWithoutTheory.length > 0) {
    console.log(`⚠️  缺少 THEORY.md 的模块 (${coverage.modulesWithoutTheory.length}):`);
    coverage.modulesWithoutTheory.forEach(name => {
      console.log(`     - ${name}`);
    });
  } else {
    console.log('✅ 所有模块都有 THEORY.md！');
  }

  const hasErrors = brokenRefs.length > 0 || coverage.modulesWithoutTheory.length > 0;
  const hasWarnings = brokenRefs.length > 0 && coverage.modulesWithoutTheory.length === 0;

  const report = {
    timestamp: new Date().toISOString(),
    totalTheoryFiles: theoryFiles.length,
    validReferences: validRefs.length,
    brokenReferences: brokenRefs,
    brokenCount: brokenRefs.length,
    codeLabCoverage: {
      totalModules: coverage.moduleDirs.length,
      coveredModules: coverage.moduleDirs.length - coverage.modulesWithoutTheory.length,
      missingTheory: coverage.modulesWithoutTheory,
    },
    passed: !hasErrors,
  };

  const reportPath = path.join(__dirname, 'cross-reference-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n📁 报告已保存: ${path.relative(PROJECT_ROOT, reportPath)}`);

  return report;
}

if (require.main === module) {
  const report = runCrossReferenceValidation();
  let exitCode = 0;
  if (report.brokenCount > 0) exitCode = 2;
  else if (report.codeLabCoverage.missingTheory.length > 0) exitCode = 1;
  process.exit(exitCode);
}

module.exports = { runCrossReferenceValidation };
