/**
 * 根组件
 * 管理应用全局状态：主题、侧边栏导航、当前视图
 */
import { useState, useEffect } from "react";
import TitleBar from "@components/TitleBar";
import Sidebar from "@components/Sidebar";
import FileExplorer from "@components/FileExplorer";
import SystemInfo from "@components/SystemInfo";
import ThemeToggle from "@components/ThemeToggle";

// 定义可用的视图类型
type ViewType = "explorer" | "system" | "settings";

export default function App(): JSX.Element {
  // 当前激活的视图
  const [currentView, setCurrentView] = useState<ViewType>("explorer");
  // 深色模式状态
  const [isDark, setIsDark] = useState<boolean>(false);

  // 初始化时读取系统主题偏好
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

  // 切换深色模式：在 html 元素上添加或移除 dark 类
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // 根据当前视图渲染对应内容
  const renderView = (): JSX.Element => {
    switch (currentView) {
      case "explorer":
        return <FileExplorer />;
      case "system":
        return <SystemInfo />;
      case "settings":
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">设置</h2>
            <p className="text-muted-foreground">应用设置面板（示例占位）</p>
          </div>
        );
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* 自定义标题栏 */}
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏导航 */}
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部工具栏 */}
          <div className="h-12 border-b border-border flex items-center justify-end px-4 gap-2">
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
          </div>

          {/* 视图内容 */}
          <div className="flex-1 overflow-auto">{renderView()}</div>
        </main>
      </div>
    </div>
  );
}
