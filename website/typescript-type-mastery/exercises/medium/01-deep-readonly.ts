// Exercise: Implement DeepReadonly<T>
// From: type-challenges/questions/00009-medium-deep-readonly

type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Test cases
interface X {
  x: {
    a: 1;
    b: 'hi';
  };
  y: 'hey';
}

type Expected = DeepReadonly<X>;

const test: Expected = {
  x: {
    a: 1,
    b: 'hi',
  },
  y: 'hey',
};

// @ts-expect-error — nested property should be readonly
test.x.a = 2;
