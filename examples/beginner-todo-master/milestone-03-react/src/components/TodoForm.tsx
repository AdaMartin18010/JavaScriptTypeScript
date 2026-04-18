/**
 * TodoForm.tsx — 输入表单组件
 *
 * 职责：接收用户输入，提交时调用 onAdd 回调
 * 这是一个「受控组件」：input 的值由 React 状态管理
 */

import { useState, FormEvent } from 'react';

interface TodoFormProps {
  /** 添加 Todo 的回调函数 */
  onAdd: (text: string) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  // 本地状态：仅管理输入框的当前值
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setText(''); // 清空输入框
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
