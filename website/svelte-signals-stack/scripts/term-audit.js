#!/usr/bin/env node
/**
 * Terminology Consistency Audit
 *
 * Scans all markdown files for inconsistent use of key terms.
 * Run: node scripts/term-audit.js
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DOCS_DIR = join(__dirname, '..');

// Terminology definitions: [preferred, ...alternatives]
const TERMS = [
  ['$state', ['\\$state', 'useState', 'createSignal']],
  ['$derived', ['\\$derived', 'computed', 'useMemo']],
  ['$effect', ['\\$effect', 'useEffect', 'createEffect']],
  ['$props', ['\\$props', 'props']],
  ['Runes', ['runes', '符文']],
  ['Signal', ['signal', 'signals']],
  ['flushSync', ['flushsync', 'flush']],
  ['SvelteKit', ['sveltekit', 'Svelte kit']],
  ['TypeScript', ['Typescript', 'typescript', 'TS']],
  ['Vite', ['vite']],
  ['SSR', ['ssr', 'server-side rendering']],
];

function* walkDir(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
      yield* walkDir(fullPath);
    } else if (stat.isFile() && entry.endsWith('.md')) {
      yield fullPath;
    }
  }
}

function auditFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];
  const lines = content.split('\n');

  for (const [preferred, patterns] of TERMS) {
    for (const pattern of patterns) {
      const regex = new RegExp(`(?<![\\w$])${pattern}(?![\\w])`, 'g');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip code blocks
        if (line.startsWith('```')) continue;
        
        if (regex.test(line) && !line.includes(preferred)) {
          issues.push({
            line: i + 1,
            found: pattern.replace(/\\/g, ''),
            preferred,
            context: line.trim().slice(0, 80),
          });
        }
      }
    }
  }

  return issues;
}

function main() {
  console.log('🔍 Terminology Consistency Audit');
  console.log('=================================\n');

  let totalIssues = 0;
  let filesChecked = 0;

  for (const filePath of walkDir(DOCS_DIR)) {
    const relPath = relative(DOCS_DIR, filePath);
    // Skip archive, node_modules
    if (relPath.startsWith('archive') || relPath.startsWith('node_modules')) continue;

    const issues = auditFile(filePath);
    filesChecked++;

    if (issues.length > 0) {
      console.log(`\n📄 ${relPath} (${issues.length} issues)`);
      for (const issue of issues) {
        console.log(`   Line ${issue.line}: "${issue.found}" → use "${issue.preferred}"`);
        console.log(`      ${issue.context}`);
        totalIssues++;
      }
    }
  }

  console.log(`\n=================================`);
  console.log(`Files checked: ${filesChecked}`);
  console.log(`Total issues: ${totalIssues}`);
  console.log(totalIssues === 0 ? '✅ All terms consistent!' : `⚠️  ${totalIssues} inconsistencies found`);
  process.exit(totalIssues > 0 ? 1 : 0);
}

main();
