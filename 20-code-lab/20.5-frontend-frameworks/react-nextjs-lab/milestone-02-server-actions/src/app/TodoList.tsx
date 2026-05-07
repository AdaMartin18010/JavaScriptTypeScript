import { getTodos, deleteTodo } from './actions';

export async function TodoList() {
  const todos = await getTodos();

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map(todo => (
        <li key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eaeaea' }}>
          <span>{todo.title}</span>
          <form action={async () => {
            'use server';
            await deleteTodo(todo.id);
          }}>
            <button type="submit" style={{ color: 'red' }}>Delete</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
