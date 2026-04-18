import { connect, type NatsConnection, type Subscription, type Msg, JSONCodec } from "nats";
import { logger } from "../../gateway/src/logger.js";

export type EventHandler = (payload: unknown, msg: Msg) => Promise<void> | void;

export interface SubscribeOptions {
  subject: string;
  queue?: string;
  handler: EventHandler;
  maxRetries?: number;
}

export class EventSubscriber {
  private nc?: NatsConnection;
  private jc = JSONCodec();
  private subscriptions: Subscription[] = [];
  private natsUrl: string;

  constructor(natsUrl?: string) {
    this.natsUrl = natsUrl || process.env.NATS_URL || "nats://localhost:4222";
  }

  async connect(): Promise<void> {
    this.nc = await connect({ servers: this.natsUrl });
    logger.info({ servers: this.nc.getServer() }, "Event subscriber connected to NATS");
  }

  async subscribe(options: SubscribeOptions): Promise<void> {
    if (!this.nc) throw new Error("NATS connection not established. Call connect() first.");
    const { subject, queue, handler } = options;
    const sub = queue ? this.nc.subscribe(subject, { queue }) : this.nc.subscribe(subject);
    this.subscriptions.push(sub);
    logger.info({ subject, queue }, "Subscribed to subject");

    (async () => {
      for await (const msg of sub) {
        try {
          const payload = this.jc.decode(msg.data);
          logger.info({ subject: msg.subject, payload: JSON.stringify(payload).slice(0, 200) }, "Event received");
          await handler(payload, msg);
        } catch (err) {
          logger.error({ err, subject: msg.subject, payload: msg.data?.toString() }, "Event handler failed");
        }
      }
    })();
  }

  async close(): Promise<void> {
    for (const sub of this.subscriptions) sub.unsubscribe();
    if (this.nc) {
      await this.nc.drain();
      await this.nc.close();
      logger.info("Event subscriber connections closed");
    }
  }
}

export const subscriber = new EventSubscriber();
