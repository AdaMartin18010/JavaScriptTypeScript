/**
 * @file BPE Tokenizer 简化版
 * @category NLP Engineering → Tokenization
 * @difficulty hard
 * @tags byte-pair-encoding, bpe, subword-tokenization, vocabulary-merge
 *
 * @description
 * Byte Pair Encoding（BPE）是 modern NLP 中广泛使用的子词分词算法。
 * 本实现演示 BPE 的核心训练与编码流程：从字符级开始，迭代合并最频繁的字符对。
 */

export class BPETokenizer {
  private vocab = new Map<string, number>();
  private merges: [string, string][] = [];
  private readonly vocabSize: number;

  constructor(vocabSize = 50) {
    this.vocabSize = vocabSize;
  }

  /**
   * 在语料库上训练 BPE
   * @param corpus - 原始文本数组
   */
  train(corpus: string[]): void {
    // 初始化：每个词拆分为字符序列，末尾加 </w> 表示词尾
    let wordCounts = new Map<string, number>();
    for (const text of corpus) {
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      for (const word of words) {
        const key = word.split('').join(' ') + ' </w>';
        wordCounts.set(key, (wordCounts.get(key) || 0) + 1);
      }
    }

    // 构建初始字符词汇表
    for (const [word] of wordCounts) {
      for (const char of word.split(' ')) {
        if (!this.vocab.has(char)) {
          this.vocab.set(char, this.vocab.size);
        }
      }
    }

    // 迭代合并
    while (this.vocab.size < this.vocabSize) {
      const pairCounts = new Map<string, number>();
      for (const [word, count] of wordCounts) {
        const tokens = word.split(' ');
        for (let i = 0; i < tokens.length - 1; i++) {
          const pair = `${tokens[i]} ${tokens[i + 1]}`;
          pairCounts.set(pair, (pairCounts.get(pair) || 0) + count);
        }
      }

      if (pairCounts.size === 0) break;

      // 找到频率最高的 pair
      let bestPair = '';
      let bestCount = 0;
      for (const [pair, count] of pairCounts) {
        if (count > bestCount) {
          bestCount = count;
          bestPair = pair;
        }
      }

      if (bestCount === 0) break;

      const [a, b] = bestPair.split(' ');
      const merged = a + b;
      this.merges.push([a, b]);
      this.vocab.set(merged, this.vocab.size);

      // 更新语料表示
      const newWordCounts = new Map<string, number>();
      for (const [word, count] of wordCounts) {
        const newWord = word.split(' ').reduce((acc, token, idx, arr) => {
          if (idx > 0 && arr[idx - 1] === a && token === b) {
            return acc.slice(0, acc.lastIndexOf(a)) + merged;
          }
          return acc + (idx > 0 ? ' ' : '') + token;
        }, '');
        newWordCounts.set(newWord, (newWordCounts.get(newWord) || 0) + count);
      }
      wordCounts = newWordCounts;
    }
  }

  /**
   * 编码文本为子词 ID 序列
   */
  encode(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const ids: number[] = [];

    for (const word of words) {
      let tokens = word.split('').map(c => (this.vocab.has(c) ? c : '<unk>'));
      tokens.push('</w>');

      // 应用 merges
      for (const [a, b] of this.merges) {
        let i = 0;
        while (i < tokens.length - 1) {
          if (tokens[i] === a && tokens[i + 1] === b) {
            tokens.splice(i, 2, a + b);
          } else {
            i++;
          }
        }
      }

      for (const token of tokens) {
        ids.push(this.vocab.get(token) ?? this.vocab.get('<unk>') ?? 0);
      }
    }

    return ids;
  }

  /**
   * 将 ID 序列解码为文本（近似还原）
   */
  decode(ids: number[]): string {
    const idToToken = Array.from(this.vocab.entries()).sort((a, b) => a[1] - b[1]).map(([token]) => token);
    const tokens = ids.map(id => idToToken[id] ?? '<unk>');
    return tokens
      .join(' ')
      .replace(/\s*<\/w>\s*/g, ' ')
      .trim();
  }

  getVocabSize(): number {
    return this.vocab.size;
  }
}

export function demo(): void {
  console.log('=== BPE Tokenizer ===\n');

  const corpus = [
    'low lower lowest',
    'new newer newest',
    'wide wider widest'
  ];

  const tokenizer = new BPETokenizer(30);
  tokenizer.train(corpus);

  console.log('词汇表大小:', tokenizer.getVocabSize());

  const encoded = tokenizer.encode('lower widest');
  console.log('编码:', encoded);

  const decoded = tokenizer.decode(encoded);
  console.log('解码:', decoded);
}
