/**
 * @file 命名实体识别（规则基础版）
 * @category NLP Engineering → NER
 * @difficulty easy
 * @tags named-entity-recognition, regex, pattern-matching, information-extraction
 *
 * @description
 * 基于正则表达式的轻量级命名实体识别器，支持常见实体类型：
 * 人名、组织、邮箱、URL、电话、日期。
 */

export interface NamedEntity {
  text: string;
  type: string;
  start: number;
  end: number;
}

export class NamedEntityRecognizer {
  private patterns = new Map<string, RegExp>([
    ['PERSON', /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g],
    ['ORG', /\b[A-Z][a-z]* (Inc|Corp|LLC|Ltd|Company)\b/g],
    ['EMAIL', /\b[\w.-]+@[\w.-]+\.\w+\b/g],
    ['URL', /https?:\/\/[^\s]+/g],
    ['PHONE', /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g],
    ['DATE', /\b\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}\b/g]
  ]);

  /** 从文本中提取实体 */
  extract(text: string): NamedEntity[] {
    const entities: NamedEntity[] = [];
    for (const [type, pattern] of this.patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          entities.push({
            text: match[0],
            type,
            start: match.index,
            end: match.index + match[0].length
          });
        }
      }
    }
    return entities.sort((a, b) => a.start - b.start);
  }

  /** 注册自定义模式 */
  addPattern(type: string, pattern: RegExp): void {
    this.patterns.set(type, pattern);
  }
}

export function demo(): void {
  console.log('=== 命名实体识别 ===\n');
  const ner = new NamedEntityRecognizer();
  const text = 'Contact John Smith at john.smith@example.com or visit https://example.com. Call 555-123-4567.';
  const entities = ner.extract(text);
  console.log('识别的实体:');
  for (const e of entities) {
    console.log(`  [${e.type}] ${e.text}`);
  }
}
