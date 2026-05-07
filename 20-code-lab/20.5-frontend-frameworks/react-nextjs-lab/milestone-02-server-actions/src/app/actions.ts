'use server';

let todos: { id: number; title: string }[] = [{ id: 1, title: 'Learn Server Actions' }];

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;
  if (!title) throw new Error('Title required');
  const newTodo = { id: Date.now(), title };
  todos.push(newTodo);
  return newTodo;
}

export async function getTodos() {
  return todos;
}

export async function deleteTodo(id: number) {
  todos = todos.filter(t => t.id !== id);
}
