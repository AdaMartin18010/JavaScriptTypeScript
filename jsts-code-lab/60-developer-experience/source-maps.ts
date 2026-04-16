/**
 * @file Source Maps 处理
 * @category Developer Experience → Source Maps
 * @difficulty medium
 * @tags sourcemap, debugging, error-mapping
 *
 * @description
 * Source Map 生成与解析：将压缩/转换后的代码映射回原始源代码，
 * 用于调试和错误堆栈还原。
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface SourceMap {
  version: 3;
  sources: string[];
  names: string[];
  mappings: string;
  file?: string;
  sourceRoot?: string;
  sourcesContent?: string[];
}

export interface Mapping {
  generatedLine: number;
  generatedColumn: number;
  originalLine: number;
  originalColumn: number;
  source: string;
  name?: string;
}

export interface OriginalPosition {
  source: string;
  line: number;
  column: number;
  name?: string;
}

// ============================================================================
// Base64 VLQ 编码/解码
// ============================================================================

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function encodeVLQ(value: number): string {
  let encoded = '';
  let vlq = value < 0 ? ((-value) << 1) + 1 : value << 1;
  
  do {
    let digit = vlq & 0x1f;
    vlq >>>= 5;
    if (vlq > 0) {
      digit |= 0x20;
    }
    encoded += BASE64_CHARS[digit];
  } while (vlq > 0);
  
  return encoded;
}

export function decodeVLQ(encoded: string, index: number): { value: number; nextIndex: number } {
  let result = 0;
  let shift = 0;
  let continuation = true;

  while (continuation) {
    if (index >= encoded.length) {
      throw new Error('Invalid VLQ: unexpected end of input');
    }
    
    const char = encoded[index++];
    const digit = BASE64_CHARS.indexOf(char);
    
    if (digit === -1) {
      throw new Error(`Invalid VLQ: invalid character '${char}'`);
    }

    continuation = (digit & 0x20) !== 0;
    result += (digit & 0x1f) << shift;
    shift += 5;
  }

  const value = (result & 1) === 1 ? -(result >> 1) : result >> 1;
  return { value, nextIndex: index };
}

// ============================================================================
// Source Map 解析器
// ============================================================================

export class SourceMapParser {
  private mappings: Mapping[] = [];
  private sourceMap: SourceMap;

  constructor(sourceMap: SourceMap) {
    this.sourceMap = sourceMap;
    this.parseMappings();
  }

  /**
   * 解析 mappings 字符串
   */
  private parseMappings(): void {
    const mappings = this.sourceMap.mappings;
    const sources = this.sourceMap.sources;
    const names = this.sourceMap.names;

    let generatedLine = 1;
    let generatedColumn = 0;
    let sourceIndex = 0;
    let originalLine = 0;
    let originalColumn = 0;
    let nameIndex = 0;
    let index = 0;

    while (index < mappings.length) {
      const char = mappings[index];

      // 行分隔符
      if (char === ';') {
        generatedLine++;
        generatedColumn = 0;
        index++;
        continue;
      }

      // 跳过逗号
      if (char === ',') {
        index++;
        continue;
      }

      // 解码生成的列
      const genColResult = decodeVLQ(mappings, index);
      generatedColumn += genColResult.value;
      index = genColResult.nextIndex;

      // 检查是否有源信息
      if (index >= mappings.length || mappings[index] === ',' || mappings[index] === ';') {
        this.mappings.push({
          generatedLine,
          generatedColumn,
          originalLine: 0,
          originalColumn: 0,
          source: ''
        });
        continue;
      }

      // 解码源索引
      const srcIdxResult = decodeVLQ(mappings, index);
      sourceIndex += srcIdxResult.value;
      index = srcIdxResult.nextIndex;

      // 解码原始行
      const origLineResult = decodeVLQ(mappings, index);
      originalLine += origLineResult.value;
      index = origLineResult.nextIndex;

      // 解码原始列
      const origColResult = decodeVLQ(mappings, index);
      originalColumn += origColResult.value;
      index = origColResult.nextIndex;

      // 可选：解码名称索引
      if (index < mappings.length && mappings[index] !== ',' && mappings[index] !== ';') {
        const nameIdxResult = decodeVLQ(mappings, index);
        nameIndex += nameIdxResult.value;
        index = nameIdxResult.nextIndex;

        this.mappings.push({
          generatedLine,
          generatedColumn,
          originalLine,
          originalColumn,
          source: sources[sourceIndex],
          name: names[nameIndex]
        });
      } else {
        this.mappings.push({
          generatedLine,
          generatedColumn,
          originalLine,
          originalColumn,
          source: sources[sourceIndex]
        });
      }
    }
  }

  /**
   * 将生成的位置映射回原始位置
   */
  getOriginalPosition(generatedLine: number, generatedColumn: number): OriginalPosition | null {
    // 查找最接近的映射（简化实现）
    const mapping = this.mappings.find(m => 
      m.generatedLine === generatedLine && 
      m.generatedColumn <= generatedColumn
    );

    if (!mapping || !mapping.source) {
      return null;
    }

    return {
      source: mapping.source,
      line: mapping.originalLine,
      column: mapping.originalColumn,
      name: mapping.name
    };
  }

  /**
   * 获取所有映射
   */
  getMappings(): Mapping[] {
    return [...this.mappings];
  }
}

// ============================================================================
// Source Map 生成器
// ============================================================================

export class SourceMapGenerator {
  private mappings: Array<{
    generated: { line: number; column: number };
    original?: { line: number; column: number; source: string; name?: string };
  }> = [];
  private sources: Set<string> = new Set();
  private names: Set<string> = new Set();

  /**
   * 添加映射
   */
  addMapping(options: {
    generated: { line: number; column: number };
    original?: { line: number; column: number; source: string; name?: string };
  }): void {
    this.mappings.push(options);

    if (options.original) {
      this.sources.add(options.original.source);
      if (options.original.name) {
        this.names.add(options.original.name);
      }
    }
  }

  /**
   * 生成 Source Map
   */
  generate(file?: string): SourceMap {
    const sources = Array.from(this.sources);
    const names = Array.from(this.names);

    // 按行和列排序映射
    this.mappings.sort((a, b) => {
      if (a.generated.line !== b.generated.line) {
        return a.generated.line - b.generated.line;
      }
      return a.generated.column - b.generated.column;
    });

    const mappings = this.encodeMappings(sources, names);

    return {
      version: 3,
      sources,
      names,
      mappings,
      file,
      sourcesContent: []
    };
  }

  /**
   * 编码 mappings
   */
  private encodeMappings(sources: string[], names: string[]): string {
    const groups: typeof this.mappings[] = [];
    
    // 按行分组
    for (const mapping of this.mappings) {
      const line = mapping.generated.line - 1;
      while (groups.length <= line) {
        groups.push([]);
      }
      groups[line].push(mapping);
    }

    const lines: string[] = [];
    let prevGenColumn = 0;
    let prevSourceIdx = 0;
    let prevOrigLine = 0;
    let prevOrigCol = 0;
    let prevNameIdx = 0;

    for (const group of groups) {
      const segments: string[] = [];
      
      for (const mapping of group) {
        const genColDelta = mapping.generated.column - prevGenColumn;
        prevGenColumn = mapping.generated.column;

        let segment = encodeVLQ(genColDelta);

        if (mapping.original) {
          const sourceIdx = sources.indexOf(mapping.original.source);
          const sourceIdxDelta = sourceIdx - prevSourceIdx;
          prevSourceIdx = sourceIdx;

          const origLineDelta = mapping.original.line - prevOrigLine;
          prevOrigLine = mapping.original.line;

          const origColDelta = mapping.original.column - prevOrigCol;
          prevOrigCol = mapping.original.column;

          segment += encodeVLQ(sourceIdxDelta);
          segment += encodeVLQ(origLineDelta);
          segment += encodeVLQ(origColDelta);

          if (mapping.original.name) {
            const nameIdx = names.indexOf(mapping.original.name);
            const nameIdxDelta = nameIdx - prevNameIdx;
            prevNameIdx = nameIdx;
            segment += encodeVLQ(nameIdxDelta);
          }
        }

        segments.push(segment);
      }

      lines.push(segments.join(','));
      prevGenColumn = 0;
    }

    return lines.join(';');
  }
}

// ============================================================================
// 堆栈跟踪解析器
// ============================================================================

export class StackTraceParser {
  /**
   * 解析堆栈跟踪字符串
   */
  parse(stackTrace: string): Array<{
    functionName: string;
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  }> {
    const lines = stackTrace.split('\n');
    const frames: ReturnType<typeof this.parse>[number][] = [];

    const regex = /at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        frames.push({
          functionName: match[1] || '<anonymous>',
          fileName: match[2],
          lineNumber: parseInt(match[3], 10),
          columnNumber: parseInt(match[4], 10)
        });
      }
    }

    return frames;
  }

  /**
   * 使用 Source Map 还原堆栈
   */
  remapStackTrace(stackTrace: string, sourceMap: SourceMap): string {
    const parser = new SourceMapParser(sourceMap);
    const frames = this.parse(stackTrace);

    const remapped = frames.map(frame => {
      const original = parser.getOriginalPosition(frame.lineNumber, frame.columnNumber);
      
      if (original) {
        return `    at ${frame.functionName} (${original.source}:${original.line}:${original.column})`;
      }
      
      return `    at ${frame.functionName} (${frame.fileName}:${frame.lineNumber}:${frame.columnNumber})`;
    });

    return remapped.join('\n');
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Source Maps 演示 ===\n');

  // 1. 创建一个简单的 Source Map
  console.log('--- 生成 Source Map ---');
  const generator = new SourceMapGenerator();
  
  // 模拟 minified.js 第1行第0列映射到 original.ts 第1行第0列
  generator.addMapping({
    generated: { line: 1, column: 0 },
    original: { line: 1, column: 0, source: 'original.ts' }
  });
  
  // minified.js 第1行第10列映射到 original.ts 第2行第4列，函数名 greet
  generator.addMapping({
    generated: { line: 1, column: 10 },
    original: { line: 2, column: 4, source: 'original.ts', name: 'greet' }
  });
  
  // minified.js 第1行第20列映射到 original.ts 第3行第8列
  generator.addMapping({
    generated: { line: 1, column: 20 },
    original: { line: 3, column: 8, source: 'original.ts' }
  });

  const sourceMap = generator.generate('minified.js');
  console.log('Generated Source Map:');
  console.log(JSON.stringify(sourceMap, null, 2));

  // 2. 解析 Source Map
  console.log('\n--- 解析 Source Map ---');
  const parser = new SourceMapParser(sourceMap);
  
  console.log('All mappings:');
  parser.getMappings().forEach(m => {
    console.log(`  Generated: ${m.generatedLine}:${m.generatedColumn} -> Original: ${m.source}:${m.originalLine}:${m.originalColumn}`);
  });

  // 3. 查找原始位置
  console.log('\n--- 查找原始位置 ---');
  const pos1 = parser.getOriginalPosition(1, 0);
  console.log(`Generated (1:0) -> Original:`, pos1);
  
  const pos2 = parser.getOriginalPosition(1, 15);
  console.log(`Generated (1:15) -> Original:`, pos2);

  // 4. VLQ 编解码测试
  console.log('\n--- VLQ 编解码 ---');
  const testValues = [0, 1, -1, 16, -16, 100, -100];
  testValues.forEach(val => {
    const encoded = encodeVLQ(val);
    const { value: decoded } = decodeVLQ(encoded, 0);
    console.log(`  ${val} -> "${encoded}" -> ${decoded}`);
  });

  // 5. 堆栈跟踪还原
  console.log('\n--- 堆栈跟踪还原 ---');
  const stackTraceParser = new StackTraceParser();
  const sampleStack = `
Error: Something went wrong
    at greet (minified.js:1:10)
    at main (minified.js:1:20)
    at <anonymous> (minified.js:1:30)
`;
  console.log('Original stack:');
  console.log(sampleStack);
  
  const frames = stackTraceParser.parse(sampleStack);
  console.log('Parsed frames:');
  frames.forEach(f => {
    console.log(`  ${f.functionName} at ${f.fileName}:${f.lineNumber}:${f.columnNumber}`);
  });
}
