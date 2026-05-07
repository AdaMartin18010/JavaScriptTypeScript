// Exercise: Implement UnionToIntersection<U>
// From: type-challenges/questions/00055-hard-union-to-intersection

type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

// Test cases
type I = UnionToIntersection<{ foo: any } | { bar: any }>;
// Expected: { foo: any } & { bar: any }

const result: I = { foo: 1, bar: 2 };
