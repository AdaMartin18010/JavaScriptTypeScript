/**
 * 装饰器模式 (Decorator Pattern)
 *
 * 定义：动态地给一个对象添加一些额外的职责。
 *       就增加功能来说，装饰器模式比生成子类更为灵活。
 *
 * 适用场景：
 * - 需要在不影响其他对象的情况下，以动态、透明的方式给单个对象添加职责
 * - 需要动态撤销某些职责
 * - 当不能采用继承的方式扩展时（如类被 final 或继承会产生大量子类）
 */

// 组件接口：数据源
interface DataSource {
  read(): string;
  write(data: string): void;
}

// 具体组件：基础文件数据源
class FileDataSource implements DataSource {
  private content = '';

  read(): string {
    return this.content;
  }

  write(data: string): void {
    this.content = data;
    console.log(`[FileDataSource] 原始写入: ${data}`);
  }
}

// 抽象装饰器：数据源装饰器基类
abstract class DataSourceDecorator implements DataSource {
  protected wrappee: DataSource;

  constructor(source: DataSource) {
    this.wrappee = source;
  }

  read(): string {
    return this.wrappee.read();
  }

  write(data: string): void {
    this.wrappee.write(data);
  }
}

// 具体装饰器 1：加密装饰器
class EncryptionDecorator extends DataSourceDecorator {
  write(data: string): void {
    const encrypted = `enc(${btoa(data)})`;
    console.log(`[Encryption] 加密后: ${encrypted}`);
    super.write(encrypted);
  }

  read(): string {
    const encrypted = super.read();
    // 模拟解密
    const match = encrypted.match(/^enc\((.+)\)$/);
    if (match) {
      return atob(match[1]);
    }
    return encrypted;
  }
}

// 具体装饰器 2：压缩装饰器
class CompressionDecorator extends DataSourceDecorator {
  write(data: string): void {
    const compressed = `zip(${data.length})`; // 模拟压缩
    console.log(`[Compression] 压缩后: ${compressed}`);
    super.write(compressed);
  }

  read(): string {
    const compressed = super.read();
    // 模拟解压（这里为了演示直接返回原始内容）
    return compressed;
  }
}

// 具体装饰器 3：日志装饰器
class LoggingDecorator extends DataSourceDecorator {
  write(data: string): void {
    console.log(`[Logging] 准备写入，长度: ${data.length}`);
    super.write(data);
    console.log(`[Logging] 写入完成`);
  }

  read(): string {
    console.log(`[Logging] 准备读取`);
    const result = super.read();
    console.log(`[Logging] 读取完成，长度: ${result.length}`);
    return result;
  }
}

// ========== 使用示例 ==========

function demoDecorator() {
  console.log('=== 装饰器模式示例 ===\n');

  // 基础使用
  console.log('--- 基础数据源 ---');
  let source: DataSource = new FileDataSource();
  source.write('Hello World');
  console.log('读取:', source.read(), '\n');

  // 叠加装饰器：日志 + 加密 + 压缩
  console.log('--- 叠加装饰器（日志 → 加密 → 压缩）---');
  source = new FileDataSource();
  source = new LoggingDecorator(source);
  source = new EncryptionDecorator(source);
  source = new CompressionDecorator(source);

  source.write('Sensitive Data');

  console.log('\n优点：装饰器可以灵活组合、按需叠加，不需要为每种组合创建子类。');
}

demoDecorator();
