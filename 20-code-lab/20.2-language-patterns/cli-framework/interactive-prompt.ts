/**
 * @file 交互式提示
 * @category CLI → Interactive
 * @difficulty medium
 * @tags cli, readline, interactive, prompt, stdin
 *
 * @description
 * 基于 Node.js readline 的交互式提示组件，支持文本输入、确认、单选和密码输入。
 */

import * as readline from 'node:readline';

/** 选项定义 */
export interface ChoiceOption {
  /** 显示标签 */
  label: string;
  /** 选项值 */
  value: string;
}

/** 交互式提示 */
export class InteractivePrompt {
  private rl: readline.Interface | null = null;

  private getInterface(): readline.Interface {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
    return this.rl;
  }

  /**
   * 关闭 readline 接口
   */
  close(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * 文本输入提示
   * @param message - 提示信息
   * @param defaultValue - 默认值
   * @returns 用户输入或默认值
   */
  async text(message: string, defaultValue?: string): Promise<string> {
    const prompt = defaultValue !== undefined ? `${message} (${defaultValue}): ` : `${message}: `;
    const rl = this.getInterface();
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim() || defaultValue || '');
      });
    });
  }

  /**
   * 确认提示
   * @param message - 提示信息
   * @param defaultValue - 默认值
   * @returns 是否确认
   */
  async confirm(message: string, defaultValue = false): Promise<boolean> {
    const suffix = defaultValue ? ' [Y/n]' : ' [y/N]';
    const answer = await this.text(message + suffix, defaultValue ? 'Y' : 'N');
    return /^y(es)?/i.test(answer);
  }

  /**
   * 单选提示
   * @param message - 提示信息
   * @param choices - 选项列表
   * @returns 选中的选项值
   */
  async select(message: string, choices: ChoiceOption[]): Promise<string> {
    if (choices.length === 0) {
      throw new Error('Choices array must not be empty');
    }

    console.log(message);
    for (let i = 0; i < choices.length; i++) {
      console.log(`  ${i + 1}) ${choices[i].label}`);
    }

    const rl = this.getInterface();
    return new Promise((resolve) => {
      const ask = (): void => {
        rl.question('Select: ', (answer) => {
          const index = Number(answer) - 1;
          if (index >= 0 && index < choices.length) {
            resolve(choices[index].value);
          } else {
            console.log('Invalid choice, please try again.');
            ask();
          }
        });
      };
      ask();
    });
  }

  /**
   * 多选提示（简化版）
   * @param message - 提示信息
   * @param choices - 选项列表
   * @returns 选中的选项值列表
   */
  async multiselect(message: string, choices: ChoiceOption[]): Promise<string[]> {
    if (choices.length === 0) {
      throw new Error('Choices array must not be empty');
    }

    console.log(message);
    for (let i = 0; i < choices.length; i++) {
      console.log(`  ${i + 1}) ${choices[i].label}`);
    }
    console.log('  0) Done');

    const rl = this.getInterface();
    const selected = new Set<number>();

    return new Promise((resolve) => {
      const ask = (): void => {
        rl.question('Select (0 to finish): ', (answer) => {
          const index = Number(answer) - 1;
          if (answer === '0') {
            resolve(Array.from(selected).map(i => choices[i].value));
          } else if (index >= 0 && index < choices.length) {
            if (selected.has(index)) {
              selected.delete(index);
              console.log(`  Deselected: ${choices[index].label}`);
            } else {
              selected.add(index);
              console.log(`  Selected: ${choices[index].label}`);
            }
            ask();
          } else {
            console.log('Invalid choice, please try again.');
            ask();
          }
        });
      };
      ask();
    });
  }
}
