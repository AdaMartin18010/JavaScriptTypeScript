import pino from "pino";

export const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  base: undefined,
};

export const logger = pino(loggerConfig);
