import { useTodo } from '../context';
import { FilterType } from '../types';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

export default function FilterBar() {
  const { state, dispatch } = useTodo();

  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <button
          key={f.key}
          className={state.filter === f.key ? 'active' : ''}
          onClick={() => dispatch({ type: 'SET_FILTER', payload: f.key })}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
