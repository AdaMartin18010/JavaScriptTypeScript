/**
 * @file 类型定义
 */

export interface Config {
  debug: boolean;
  port: number;
  host: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export type ID = string | number;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
