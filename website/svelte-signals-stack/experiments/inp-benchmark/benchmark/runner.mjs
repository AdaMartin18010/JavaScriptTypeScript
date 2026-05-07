#!/usr/bin/env node
/**
 * INP Benchmark Runner
 * 
 * Uses Playwright to automate interactions and collect web-vitals data.
 * 
 * Usage:
 *   node runner.mjs --framework=svelte --scenario=counter --iterations=100
 *   node runner.mjs --framework=all --scenario=all --iterations=100
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse CLI arguments
const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [k, v] = arg.replace('--', '').split('=');
    return [k, v ?? true];
  })
);

const CONFIG = {
  frameworks: args.framework === 'all' ? ['svelte'] : [args.framework || 'svelte'],
  scenarios: args.scenario === 'all' ? ['counter', 'table', 'form'] : [args.scenario || 'counter'],
  iterations: parseInt(args.iterations) || 100,
  headless: args.headless !== 'false',
  port: 5173,
};

const SCENARIOS = {
  counter: {
    url: '/',
    actions: [
      { type: 'click', selector: '[data-testid="increment"]', times: 50 },
      { type: 'click', selector: '[data-testid="increment-10"]', times: 5 },
    ],
  },
  table: {
    url: '/',
    setup: async (page) => {
      await page.click('[data-testid="tab-table"]');
      await page.waitForTimeout(100);
    },
    actions: [
      { type: 'type', selector: '[data-testid="filter"]', text: 'Item 5', clear: true },
      { type: 'click', selector: 'button:has-text("Sort by Value")', times: 3 },
      { type: 'click', selector: 'button:has-text("Shuffle")', times: 5 },
    ],
  },
  form: {
    url: '/',
    setup: async (page) => {
      await page.click('[data-testid="tab-form"]');
      await page.waitForTimeout(100);
    },
    actions: [
      { type: 'type', selector: '[data-testid="name"]', text: 'Alice', clear: true },
      { type: 'type', selector: '[data-testid="email"]', text: 'alice@test.com', clear: true },
      { type: 'click', selector: 'button:has-text("Fill Random")', times: 3 },
      { type: 'click', selector: 'button:has-text("Reset")', times: 2 },
    ],
  },
};

async function runBenchmark(framework, scenarioKey) {
  const scenario = SCENARIOS[scenarioKey];
  const results = [];

  console.log(`\n📊 Benchmarking: ${framework} / ${scenarioKey}`);
  console.log(`   Iterations: ${CONFIG.iterations}`);

  const browser = await chromium.launch({ headless: CONFIG.headless });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  for (let i = 0; i < CONFIG.iterations; i++) {
    const page = await context.newPage();
    
    // Navigate to app
    await page.goto(`http://localhost:${CONFIG.port}${scenario.url}`);
    await page.waitForLoadState('networkidle');

    // Setup scenario (switch tabs, etc.)
    if (scenario.setup) {
      await scenario.setup(page);
    }

    // Reset benchmark data
    await page.evaluate(() => {
      window.__BENCHMARK_DATA__.inp = [];
    });

    // Perform actions
    for (const action of scenario.actions) {
      for (let t = 0; t < (action.times || 1); t++) {
        if (action.type === 'click') {
          await page.click(action.selector);
          await page.waitForTimeout(50);
        } else if (action.type === 'type') {
          if (action.clear) {
            await page.fill(action.selector, '');
          }
          await page.type(action.selector, action.text);
          await page.waitForTimeout(50);
        }
      }
    }

    // Collect data
    await page.waitForTimeout(500); // Allow final INP to report
    const data = await page.evaluate(() => window.getBenchmarkData());
    const parsed = JSON.parse(data);

    if (parsed.inp.length > 0) {
      const values = parsed.inp.map(d => d.value);
      results.push({
        iteration: i + 1,
        inpValues: values,
        inpMin: Math.min(...values),
        inpMax: Math.max(...values),
        inpMedian: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
        inpP95: values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)],
        entryCount: values.length,
      });
    }

    await page.close();

    if ((i + 1) % 10 === 0) {
      process.stdout.write(`  ${i + 1}/${CONFIG.iterations}\r`);
    }
  }

  await browser.close();

  // Compute aggregate stats
  const allMedians = results.map(r => r.inpMedian);
  const allP95s = results.map(r => r.inpP95);

  const summary = {
    framework,
    scenario: scenarioKey,
    iterations: CONFIG.iterations,
    successfulRuns: results.length,
    medianINP: Math.round(allMedians.sort((a, b) => a - b)[Math.floor(allMedians.length / 2)]),
    p95INP: Math.round(allP95s.sort((a, b) => a - b)[Math.floor(allP95s.length * 0.95)]),
    minINP: Math.round(Math.min(...allMedians)),
    maxINP: Math.round(Math.max(...allMedians)),
    rawResults: results,
  };

  console.log(`   ✅ Median INP: ${summary.medianINP}ms | P95 INP: ${summary.p95INP}ms`);
  return summary;
}

async function main() {
  console.log('🔥 INP Benchmark Runner');
  console.log('========================');

  const allResults = [];

  for (const framework of CONFIG.frameworks) {
    for (const scenario of CONFIG.scenarios) {
      try {
        const result = await runBenchmark(framework, scenario);
        allResults.push(result);
      } catch (err) {
        console.error(`   ❌ Error: ${err.message}`);
        allResults.push({
          framework,
          scenario,
          error: err.message,
        });
      }
    }
  }

  // Generate report
  const reportDir = join(__dirname, 'reports');
  mkdirSync(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = join(reportDir, `report-${timestamp}.json`);

  writeFileSync(reportPath, JSON.stringify({
    meta: {
      generatedAt: new Date().toISOString(),
      config: CONFIG,
    },
    results: allResults,
  }, null, 2));

  console.log(`\n📄 Report saved: ${reportPath}`);

  // Print summary table
  console.log('\n📋 Summary');
  console.log('Framework | Scenario | Median INP | P95 INP | Runs');
  console.log('----------|----------|------------|---------|-----');
  for (const r of allResults) {
    if (!r.error) {
      console.log(`${r.framework.padEnd(9)} | ${r.scenario.padEnd(8)} | ${String(r.medianINP).padStart(6)}ms    | ${String(r.p95INP).padStart(5)}ms  | ${r.successfulRuns}`);
    } else {
      console.log(`${r.framework.padEnd(9)} | ${r.scenario.padEnd(8)} | ERROR: ${r.error}`);
    }
  }
}

main().catch(console.error);
