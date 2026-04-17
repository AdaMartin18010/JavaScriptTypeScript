import * as React from 'react';

/**
 * 客户端计数器组件
 *
 * 此组件完全在浏览器端运行，使用 React 的 useState 管理状态。
 * 它演示了 TanStack Start 中客户端交互组件的写法。
 */
export function Counter() {
  const [count, setCount] = React.useState(0);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={decrement}
        className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-lg font-medium transition hover:bg-gray-50 active:scale-95"
        aria-label="减少"
      >
        −
      </button>

      <div className="min-w-[4rem] text-center">
        <span
          className={`text-2xl font-bold transition-colors ${
            count > 0 ? 'text-green-600' : count < 0 ? 'text-red-600' : 'text-gray-900'
          }`}
        >
          {count}
        </span>
      </div>

      <button
        onClick={increment}
        className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-lg font-medium transition hover:bg-gray-50 active:scale-95"
        aria-label="增加"
      >
        +
      </button>

      <button
        onClick={reset}
        className="ml-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 active:scale-95"
      >
        重置
      </button>
    </div>
  );
}
