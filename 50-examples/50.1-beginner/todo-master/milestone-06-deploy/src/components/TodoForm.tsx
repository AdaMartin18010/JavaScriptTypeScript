import { useState, FormEvent } from 'react';
import { useTodo } from '../context';

export default function TodoForm() {
  const { dispatch } = useTodo();
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    dispatch({ type: 'ADD_TODO', payload: trimmed });
    setText('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="输入待办事项，按回车添加..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
      />
      <button type="submit">添加</button>
    </form>
  );
}
