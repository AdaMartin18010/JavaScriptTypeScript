// Exercise: Implement MyPick<T, K>
// From: type-challenges/questions/00004-easy-pick

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Test cases
type TodoPreview = MyPick<Todo, 'title' | 'completed'>;

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false,
};

// @ts-expect-error — description should not exist
todo.description;
