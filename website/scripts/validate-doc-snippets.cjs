const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const DOCS_DIR = path.join(__dirname, '..');
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-doc-verify-'));

// 只扫描深度专题目录，避免全站扫描导致的超时
const TARGET_DIRS = [
  'typescript-type-mastery',
  'react-nextjs-app-router',
  'server-first-frontend',
  'lit-web-components',
  'edge-runtime',
  'database-layer',
  'ai-native-development',
  'mobile-cross-platform',
];

let totalBlocks = 0, passedBlocks = 0, failedBlocks = 0;
const failures = [];

function findMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractCodeBlocks(content) {
  const blocks = [];
  const regex = /```(typescript|ts|js|javascript)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const code = match[2];
    // 跳过明显是伪代码或片段的块
    if (code.trim().startsWith('//') && code.includes('...')) continue;
    if (code.trim().length < 10) continue;
    blocks.push({
      lang: match[1],
      code,
      line: content.substring(0, match.index).split('\n').length,
    });
  }
  return blocks;
}

function main() {
  const allBlocks = [];

  for (const target of TARGET_DIRS) {
    const targetDir = path.join(DOCS_DIR, target);
    if (!fs.existsSync(targetDir)) {
      console.log(`Skip missing dir: ${target}`);
      continue;
    }
    const mdFiles = findMarkdownFiles(targetDir);
    for (const file of mdFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const blocks = extractCodeBlocks(content);
      for (const block of blocks) {
        allBlocks.push({ ...block, file });
      }
    }
  }

  console.log(`Found ${allBlocks.length} code blocks to validate`);

  // 分离 TS 和 JS 块
  const tsBlocks = allBlocks.filter(b => b.lang.startsWith('ts'));
  const jsBlocks = allBlocks.filter(b => !b.lang.startsWith('ts'));

  // 批量验证 TS 块：写入单个文件，运行一次 tsc
  if (tsBlocks.length > 0) {
    const tsFile = path.join(TMP_DIR, 'all-blocks.ts');
    const markers = [];
    let tsContent = '';

    for (let i = 0; i < tsBlocks.length; i++) {
      const b = tsBlocks[i];
      const marker = `/*___BLOCK_${i}___*/`;
      markers.push({ index: i, block: b });
      const relFile = path.relative(DOCS_DIR, b.file);
      tsContent += `\n// File: ${relFile} Line: ${b.line}\n${marker}\n`;
      tsContent += b.code + '\n';
    }

    fs.writeFileSync(tsFile, tsContent);

    try {
      execSync(
        `npx tsc --noEmit --skipLibCheck --target ES2020 --moduleResolution node --jsx react --esModuleInterop "${tsFile}"`,
        { stdio: 'pipe', cwd: DOCS_DIR, timeout: 60000 }
      );
      passedBlocks += tsBlocks.length;
    } catch (err) {
      const stderr = err.stderr?.toString() || err.stdout?.toString() || '';
      const errorLines = stderr.split('\n');
      const failedIndices = new Set();

      for (const line of errorLines) {
        const m = line.match(/___BLOCK_(\d+)___/);
        if (m) failedIndices.add(parseInt(m[1], 10));
      }

      for (let i = 0; i < tsBlocks.length; i++) {
        if (failedIndices.has(i)) {
          failedBlocks++;
          const b = tsBlocks[i];
          const relFile = path.relative(DOCS_DIR, b.file);
          const relevantError = errorLines.find(l => l.includes(`___BLOCK_${i}___`) || l.includes(path.basename(tsFile)));
          failures.push({
            file: relFile,
            line: b.line,
            error: relevantError || 'TypeScript compilation error',
          });
        } else {
          passedBlocks++;
        }
      }
    }
  }

  // 验证 JS 块
  for (const b of jsBlocks) {
    totalBlocks++;
    const tmpFile = path.join(TMP_DIR, `js_${Date.now()}_${Math.random().toString(36).slice(2)}.js`);
    fs.writeFileSync(tmpFile, b.code);
    try {
      execSync(`node --check "${tmpFile}"`, { stdio: 'pipe', cwd: DOCS_DIR, timeout: 10000 });
      passedBlocks++;
    } catch (err) {
      failedBlocks++;
      const relFile = path.relative(DOCS_DIR, b.file);
      failures.push({
        file: relFile,
        line: b.line,
        error: (err.stderr?.toString() || err.stdout?.toString() || '').split('\n')[0] || 'Syntax error',
      });
    } finally {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }

  totalBlocks = allBlocks.length;
  console.log(`\nResults: ${passedBlocks}/${totalBlocks} passed, ${failedBlocks} failed`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures.slice(0, 20)) {
      console.log(`  ${f.file}:${f.line} -> ${f.error}`);
    }
    if (failures.length > 20) {
      console.log(`  ... and ${failures.length - 20} more`);
    }
    process.exit(1);
  }

  // 清理
  try {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  } catch {}

  console.log('All snippets validated successfully!');
}

main();
