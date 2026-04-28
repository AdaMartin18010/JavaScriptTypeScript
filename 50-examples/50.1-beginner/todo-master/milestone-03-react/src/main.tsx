/**
 * main.tsx — React 应用入口
 *
 * React 18 使用 createRoot API，支持并发特性（Concurrent Features）。
 * StrictMode 会在开发模式下双重调用某些函数，帮助检测副作用。
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('找不到 root 元素，请检查 index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
