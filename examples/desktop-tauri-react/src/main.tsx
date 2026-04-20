/**
 * 应用入口文件
 * 负责渲染 React 根组件并挂载到 DOM
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

// 使用 React 19 的 createRoot API
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
