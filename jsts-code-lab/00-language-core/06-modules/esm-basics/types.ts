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
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== ESM Types Demo ===");
  
  // 创建 Config 对象
  const config: Config = {
    debug: true,
    port: 3000,
    host: "localhost"
  };
  console.log("Config:", config);
  
  // 创建 User 对象
  const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
  };
  console.log("User:", user);
  
  // ID 类型
  const id1: ID = "abc123";
  const id2: ID = 456;
  console.log("String ID:", id1);
  console.log("Number ID:", id2);
  
  // DeepPartial 示例
  type PartialUser = DeepPartial<User>;
  const partial: PartialUser = { name: "Bob" };
  console.log("Partial user:", partial);
  
  console.log("=== End of Demo ===\n");
}
