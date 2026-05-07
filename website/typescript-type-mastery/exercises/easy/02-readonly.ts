// Exercise: Implement MyReadonly<T>
// From: type-challenges/questions/00007-easy-readonly

interface Todo {
  title: string;
  description: string;
}

type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Test cases
const todo: MyReadonly<Todo> = {
  title: 'Hey',
  description: 'foobar',
};

// @ts-expect-error — should not be able to mutate
todo.title = 'Hello';
