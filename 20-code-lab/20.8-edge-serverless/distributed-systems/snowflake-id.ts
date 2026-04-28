/**
 * @file Snowflake 分布式 ID 生成器
 * @category Distributed Systems → ID Generation
 * @difficulty medium
 * @tags snowflake, distributed-id, unique-identifier, twitter-snowflake
 *
 * @description
 * Snowflake 是 Twitter 提出的分布式唯一 ID 生成算法，生成的 64-bit 整数按时间有序，
 * 适合高并发场景下的主键生成。
 *
 * ID 结构（64-bit）：
 * - 1 bit：符号位（始终为 0）
 * - 41 bits：时间戳（毫秒级，相对于自定义纪元）
 * - 5 bits：数据中心 ID
 * - 5 bits：工作节点 ID
 * - 12 bits：同一毫秒内的序列号
 */

export interface SnowflakeId {
  timestamp: number;
  datacenterId: number;
  workerId: number;
  sequence: number;
}

export interface SnowflakeOptions {
  /** 数据中心 ID（0~31） */
  datacenterId?: number;
  /** 工作节点 ID（0~31） */
  workerId?: number;
  /** 自定义纪元（毫秒时间戳），默认 2024-01-01 */
  epoch?: number;
}

export class SnowflakeIdGenerator {
  private static readonly EPOCH_DEFAULT = Date.UTC(2024, 0, 1);
  private static readonly TIMESTAMP_BITS = 41;
  private static readonly DATACENTER_BITS = 5;
  private static readonly WORKER_BITS = 5;
  private static readonly SEQUENCE_BITS = 12;

  private static readonly MAX_DATACENTER = (1 << SnowflakeIdGenerator.DATACENTER_BITS) - 1;
  private static readonly MAX_WORKER = (1 << SnowflakeIdGenerator.WORKER_BITS) - 1;
  private static readonly MAX_SEQUENCE = (1 << SnowflakeIdGenerator.SEQUENCE_BITS) - 1;

  private readonly epoch: number;
  private readonly datacenterId: number;
  private readonly workerId: number;

  private lastTimestamp = -1;
  private sequence = 0;

  constructor(options: SnowflakeOptions = {}) {
    const dc = options.datacenterId ?? 0;
    const wk = options.workerId ?? 0;

    if (dc < 0 || dc > SnowflakeIdGenerator.MAX_DATACENTER) {
      throw new Error(`datacenterId must be between 0 and ${SnowflakeIdGenerator.MAX_DATACENTER}`);
    }
    if (wk < 0 || wk > SnowflakeIdGenerator.MAX_WORKER) {
      throw new Error(`workerId must be between 0 and ${SnowflakeIdGenerator.MAX_WORKER}`);
    }

    this.datacenterId = dc;
    this.workerId = wk;
    this.epoch = options.epoch ?? SnowflakeIdGenerator.EPOCH_DEFAULT;
  }

  /**
   * 生成下一个 Snowflake ID
   * @returns 64-bit 唯一 ID（以 bigint 表示）
   */
  nextId(): bigint {
    let timestamp = Date.now();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate id');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & SnowflakeIdGenerator.MAX_SEQUENCE;
      if (this.sequence === 0) {
        // 当前毫秒的序列号已用完，等待下一毫秒
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    const delta = BigInt(timestamp - this.epoch);
    const id =
      (delta << BigInt(SnowflakeIdGenerator.DATACENTER_BITS + SnowflakeIdGenerator.WORKER_BITS + SnowflakeIdGenerator.SEQUENCE_BITS)) |
      (BigInt(this.datacenterId) << BigInt(SnowflakeIdGenerator.WORKER_BITS + SnowflakeIdGenerator.SEQUENCE_BITS)) |
      (BigInt(this.workerId) << BigInt(SnowflakeIdGenerator.SEQUENCE_BITS)) |
      BigInt(this.sequence);

    return id;
  }

  /**
   * 解析 Snowflake ID 为结构化对象
   * @param id - Snowflake ID
   */
  parseId(id: bigint): SnowflakeId {
    const sequence = Number(id & BigInt(SnowflakeIdGenerator.MAX_SEQUENCE));
    const workerId = Number((id >> BigInt(SnowflakeIdGenerator.SEQUENCE_BITS)) & BigInt(SnowflakeIdGenerator.MAX_WORKER));
    const datacenterId = Number((id >> BigInt(SnowflakeIdGenerator.WORKER_BITS + SnowflakeIdGenerator.SEQUENCE_BITS)) & BigInt(SnowflakeIdGenerator.MAX_DATACENTER));
    const timestamp = Number(id >> BigInt(SnowflakeIdGenerator.DATACENTER_BITS + SnowflakeIdGenerator.WORKER_BITS + SnowflakeIdGenerator.SEQUENCE_BITS)) + this.epoch;

    return { timestamp, datacenterId, workerId, sequence };
  }

  private waitNextMillis(last: number): number {
    let ts = Date.now();
    while (ts <= last) {
      ts = Date.now();
    }
    return ts;
  }
}

export function demo(): void {
  console.log('=== Snowflake ID 生成器 ===\n');

  const generator = new SnowflakeIdGenerator({ datacenterId: 1, workerId: 2 });

  const ids: bigint[] = [];
  for (let i = 0; i < 5; i++) {
    ids.push(generator.nextId());
  }

  console.log('生成的 ID:');
  for (const id of ids) {
    const parsed = generator.parseId(id);
    console.log(`  ${id} -> timestamp=${parsed.timestamp}, dc=${parsed.datacenterId}, worker=${parsed.workerId}, seq=${parsed.sequence}`);
  }

  // 验证单调递增
  let monotonic = true;
  for (let i = 1; i < ids.length; i++) {
    if (ids[i] <= ids[i - 1]) {
      monotonic = false;
      break;
    }
  }
  console.log('\n单调递增:', monotonic);
}
