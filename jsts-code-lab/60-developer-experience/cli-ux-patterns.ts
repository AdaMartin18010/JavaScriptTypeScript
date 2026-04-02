/**
 * @file CLI 交互模式
 * @category Developer Experience → CLI UX
 * @difficulty medium
 * @tags cli, ux, progress-bar, spinner, prompt
 *
 * @description
 * 纯 TypeScript 模拟实现常见的命令行交互组件：
 * - 进度条（progress bar）
 * - 旋转等待指示器（spinner）
 * - 单选/多选提示
 * - 表格输出格式化
 * 不依赖外部库，便于理解终端渲染原理。
 */

// ============================================================================
// 1. 进度条
// ============================================================================

export interface ProgressBarOptions {
  total: number;
  width?: number;
  label?: string;
}

export class ProgressBar {
  private current = 0;
  private readonly total: number;
  private readonly width: number;
  private readonly label: string;

  constructor(options: ProgressBarOptions) {
    this.total = options.total;
    this.width = options.width ?? 30;
    this.label = options.label ?? 'Progress';
  }

  update(value: number): void {
    this.current = Math.min(value, this.total);
    this.render();
  }

  increment(step = 1): void {
    this.current = Math.min(this.current + step, this.total);
    this.render();
  }

  private render(): void {
    const ratio = this.total === 0 ? 1 : this.current / this.total;
    const filled = Math.floor(ratio * this.width);
    const empty = this.width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.round(ratio * 100);
    process.stdout.write(`\r${this.label} [${bar}] ${percent}% (${this.current}/${this.total})`);
    if (this.current >= this.total) {
      process.stdout.write('\n');
    }
  }
}

// ============================================================================
// 2. Spinner
// ============================================================================

export interface SpinnerOptions {
  text?: string;
  frames?: string[];
  interval?: number;
}

export class Spinner {
  private text: string;
  private frames: string[];
  private intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private frameIndex = 0;

  constructor(options: SpinnerOptions = {}) {
    this.text = options.text ?? 'Loading...';
    this.frames = options.frames ?? ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.intervalMs = options.interval ?? 80;
  }

  start(): this {
    if (this.timer) return this;
    this.timer = setInterval(() => {
      const frame = this.frames[this.frameIndex % this.frames.length];
      process.stdout.write(`\r${frame} ${this.text}`);
      this.frameIndex++;
    }, this.intervalMs);
    return this;
  }

  succeed(message?: string): void {
    this.stop(`✔ ${message ?? this.text}`);
  }

  fail(message?: string): void {
    this.stop(`✖ ${message ?? this.text}`);
  }

  private stop(finalText: string): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    process.stdout.write(`\r${finalText}\n`);
  }
}

// ============================================================================
// 3. 提示组件（单选/多选）
// ============================================================================

export interface Choice<T> {
  label: string;
  value: T;
}

export class PromptSimulator {
  /**
   * 单选提示：模拟用户从列表中选择一项。
   * 在真实 CLI 中会监听 stdin 的上下箭头事件；此处用随机选择演示。
   */
  singleSelect<T>(message: string, choices: Choice<T>, simulateIndex: number): T;
  singleSelect<T>(message: string, choices: Choice<T>[], simulateIndex: number): T {
    const list = Array.isArray(choices) ? choices : [choices];
    const idx = Math.max(0, Math.min(simulateIndex, list.length - 1));
    const selected = list[idx];
    console.log(`? ${message}`);
    list.forEach((c, i) => {
      const marker = i === idx ? '>' : ' ';
      console.log(`  ${marker} ${c.label}`);
    });
    return selected.value;
  }

  /**
   * 多选提示：模拟用户勾选多项。
   */
  multiSelect<T>(message: string, choices: Choice<T>[], simulateIndexes: number[]): T[] {
    const selected = simulateIndexes
      .filter(i => i >= 0 && i < choices.length)
      .map(i => choices[i]);
    console.log(`? ${message}`);
    choices.forEach((c, i) => {
      const checked = simulateIndexes.includes(i);
      console.log(`  ${checked ? '[x]' : '[ ]'} ${c.label}`);
    });
    return selected.map(s => s.value);
  }
}

// ============================================================================
// 4. 表格格式化
// ============================================================================

export interface TableColumn {
  header: string;
  align?: 'left' | 'right';
  width?: number;
}

export class TableFormatter {
  /**
   * 基于终端字符宽度的简单表格渲染。
   * 中文字符按宽度 2 计算，保证列对齐。
   */
  format(rows: string[][], columns: TableColumn[]): string {
    // 计算每列实际所需宽度
    const colWidths = columns.map((col, idx) => {
      const headerWidth = this.stringWidth(col.header);
      const maxCellWidth = rows.reduce((max, row) => {
        const cell = row[idx] ?? '';
        return Math.max(max, this.stringWidth(cell));
      }, 0);
      return Math.max(col.width ?? 0, headerWidth, maxCellWidth) + 2; // +2 padding
    });

    const hr = '+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+';

    const buildRow = (cells: string[]): string => {
      return '|' + cells.map((cell, idx) => {
        const width = colWidths[idx];
        const align = columns[idx].align ?? 'left';
        const pad = width - this.stringWidth(cell) - 2;
        if (align === 'right') {
          return ' ' + ' '.repeat(pad) + cell + ' ';
        }
        return ' ' + cell + ' '.repeat(pad) + ' ';
      }).join('|') + '|';
    };

    const lines: string[] = [hr];
    lines.push(buildRow(columns.map(c => c.header)));
    lines.push(hr);
    for (const row of rows) {
      lines.push(buildRow(row));
    }
    lines.push(hr);

    return lines.join('\n');
  }

  private stringWidth(str: string): number {
    let width = 0;
    for (const char of str) {
      // 简单 heuristic：中文字符及全角符号宽度为 2
      width += char.charCodeAt(0) > 127 ? 2 : 1;
    }
    return width;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== CLI 交互模式演示 ===\n');

  // 进度条
  console.log('--- 进度条 ---');
  const bar = new ProgressBar({ total: 10, width: 20, label: 'Building' });
  for (let i = 0; i <= 10; i++) {
    bar.update(i);
    // 模拟耗时
    const start = Date.now();
    while (Date.now() - start < 5) { /* busy wait for demo */ }
  }

  // Spinner（仅做瞬时演示，避免阻塞太久）
  console.log('\n--- Spinner ---');
  const spinner = new Spinner({ text: 'Installing dependencies...', interval: 50 });
  spinner.start();
  const start = Date.now();
  while (Date.now() - start < 300) { /* busy wait */ }
  spinner.succeed('Dependencies installed');

  // 单选/多选
  console.log('\n--- 单选提示 ---');
  const prompt = new PromptSimulator();
  const framework = prompt.singleSelect('Pick a framework', [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Svelte', value: 'svelte' }
  ], 1);
  console.log('Selected:', framework);

  console.log('\n--- 多选提示 ---');
  const features = prompt.multiSelect('Select features', [
    { label: 'TypeScript', value: 'ts' },
    { label: 'ESLint', value: 'eslint' },
    { label: 'Prettier', value: 'prettier' },
    { label: 'Vitest', value: 'vitest' }
  ], [0, 2]);
  console.log('Selected:', features.join(', '));

  // 表格
  console.log('\n--- 表格输出 ---');
  const table = new TableFormatter();
  const output = table.format(
    [
      ['build', '1.2s', 'success'],
      ['type-check', '3.4s', 'success'],
      ['lint', '0.8s', 'warning']
    ],
    [
      { header: 'Task', align: 'left' },
      { header: 'Duration', align: 'right' },
      { header: 'Status', align: 'left' }
    ]
  );
  console.log(output);
}
