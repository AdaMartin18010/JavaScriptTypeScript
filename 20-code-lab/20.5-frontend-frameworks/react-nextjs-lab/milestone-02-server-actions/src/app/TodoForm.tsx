'use client';

import { useRef } from 'react';
import { createTodo } from './actions';

export function TodoForm() {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await createTodo(formData);
        ref.current?.reset();
        window.location.reload();
      }}
      style={{ display: 'flex', gap: 8, marginBottom: 16 }}
    >
      <input name="title" placeholder="New todo" required style={{ flex: 1, padding: 8 }} />
      <button type="submit" style={{ padding: '8px 16px' }}>Add</button>
    </form>
  );
}
