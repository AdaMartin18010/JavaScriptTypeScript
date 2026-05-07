'use client';

import { useState } from 'react';

export function ClientCounter() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ marginTop: 24, padding: 16, border: '1px dashed #0070f3' }}>
      <p>Client Component</p>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}
