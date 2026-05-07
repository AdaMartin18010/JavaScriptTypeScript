const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LEVELS = ['easy', 'medium', 'hard', 'extreme'];
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

function log(color, msg) {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function getTsFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.ts'))
    .map(f => path.join(dir, f))
    .sort();
}

function testFile(filePath) {
  try {
    execSync(`npx tsc --noEmit --skipLibCheck "${filePath}"`, {
      stdio: 'pipe',
      cwd: __dirname,
    });
    return { ok: true };
  } catch (err) {
    const stderr = err.stderr?.toString() || err.stdout?.toString() || '';
    const firstError = stderr.split('\n').find(l => l.includes('error TS')) || 'Unknown error';
    return { ok: false, error: firstError };
  }
}

function runLevel(level) {
  const dir = path.join(__dirname, level);
  if (!fs.existsSync(dir)) {
    log('yellow', `⚠️  ${level}: directory not found`);
    return { total: 0, passed: 0 };
  }

  const files = getTsFiles(dir);
  log('yellow', `\n📁 ${level.toUpperCase()} (${files.length} files)`);

  let passed = 0;
  for (const file of files) {
    const name = path.basename(file);
    const result = testFile(file);
    if (result.ok) {
      passed++;
      log('green', `  ✅ ${name}`);
    } else {
      log('red', `  ❌ ${name} → ${result.error}`);
    }
  }
  return { total: files.length, passed };
}

function main() {
  const target = process.argv[2];
  const levels = target && LEVELS.includes(target) ? [target] : LEVELS;

  console.log('🧪 TypeScript Type Challenges Runner');
  console.log('====================================');

  let total = 0;
  let passed = 0;

  for (const level of levels) {
    const result = runLevel(level);
    total += result.total;
    passed += result.passed;
  }

  console.log('\n====================================');
  if (passed === total) {
    log('green', `🎉 All ${total} tests passed!`);
    process.exit(0);
  } else {
    log('red', `⚠️  ${passed}/${total} passed (${total - passed} failed)`);
    process.exit(1);
  }
}

main();
