import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterBar from './components/FilterBar';
import { useTodo } from './context';
import { selectFilteredTodos } from './reducer';

export default function App() {
  const { state, dispatch } = useTodo();

  const filteredTodos = selectFilteredTodos(state);
  const activeCount = state.todos.filter((t) => !t.completed).length;
  const completedCount = state.todos.length - activeCount;

  return (
    <div className="container">
      <h1>📝 Todo Master</h1>
      <p className="subtitle">里程碑 5：测试驱动开发</p>

      <TodoForm />
      <FilterBar />
      <TodoList todos={filteredTodos} />

      <footer className="stats">
        <span>{activeCount} 个待办 / 共 {state.todos.length} 项</span>
        {completedCount > 0 && (
          <button
            className="clear-btn"
            onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}
          >
            清除已完成
          </button>
        )}
      </footer>
    </div>
  );
}
