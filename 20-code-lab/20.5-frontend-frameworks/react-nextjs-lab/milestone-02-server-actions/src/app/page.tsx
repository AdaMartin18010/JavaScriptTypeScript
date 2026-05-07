import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';

export default async function Page() {
  return (
    <main>
      <h1>M2: Server Actions</h1>
      <p>表单提交无 API 路由，直接调用服务端函数。</p>
      <TodoForm />
      <TodoList />
    </main>
  );
}
