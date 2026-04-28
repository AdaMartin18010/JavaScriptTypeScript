import { connect, type NatsConnection, type JsonCodec, StringCodec, JSONCodec } from "nats";
import { logger } from "../../gateway/src/logger.js";

export interface PublishOptions {
  subject: string;
  payload: unknown;
  headers?: Record<string, string>;
}

export class EventPublisher {
  private nc?: NatsConnection;
  private jc: JsonCodec<unknown>;
  private sc = StringCodec();
  private natsUrl: string;

  constructor(natsUrl?: string) {
    this.natsUrl = natsUrl || process.env.NATS_URL || "nats://localhost:4222";
    this.jc = JSONCodec();
  }

  async connect(): Promise<void> {
    this.nc = await connect({ servers: this.natsUrl });
    logger.info({ servers: this.nc.getServer() }, "Connected to NATS");
  }

  async publish(options: PublishOptions): Promise<void> {
    if (!this.nc) {
      throw new Error("NATS connection not established. Call connect() first.");
    }

    const { subject, payload, headers } = options;
    const data = this.jc.encode(payload);

    const h = headers ? this.nc.headers() : undefined;
    if (h && headers) {
      for (const [key, value] of Object.entries(headers)) {
        h.append(key, value);
      }
    }

    await this.nc.publish(subject, data, { headers: h });
    logger.info({ subject, payload: typeof payload === "object" ? JSON.stringify(payload).slice(0, 200) : payload }, "Event published");
  }

  async close(): Promise<void> {
    if (this.nc) {
      await this.nc.drain();
      await this.nc.close();
      logger.info("NATS publisher connection closed");
    }
  }
}

export const publisher = new EventPublisher();
