/**
 * 自定义标题栏组件
 * 使用 Tauri v2 的窗口 API 实现原生窗口控制（最小化、最大化、关闭）
 * 需要在 Tauri 配置中设置 decorations: false 以隐藏系统默认标题栏
 */
import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

export default function TitleBar(): JSX.Element {
  // 获取当前窗口实例
  const appWindow = getCurrentWindow();

  /** 最小化窗口 */
  const handleMinimize = useCallback(async () => {
    await appWindow.minimize();
  }, [appWindow]);

  /** 最大化 / 还原窗口 */
  const handleMaximize = useCallback(async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  }, [appWindow]);

  /** 关闭窗口 */
  const handleClose = useCallback(async () => {
    await appWindow.close();
  }, [appWindow]);

  return (
    <div
      data-tauri-drag-region
      className="h-9 bg-card border-b border-border flex items-center justify-between select-none"
    >
      {/* 左侧：应用图标与标题 */}
      <div className="flex items-center gap-2 px-3" data-tauri-drag-region>
        <div className="w-4 h-4 rounded-sm bg-primary flex items-center justify-center">
          <span className="text-[10px] text-primary-foreground font-bold">T</span>
        </div>
        <span className="text-sm font-medium text-card-foreground">Tauri React App</span>
      </div>

      {/* 右侧：窗口控制按钮 */}
      <div className="flex items-center h-full">
        <button
          onClick={handleMinimize}
          className="h-full w-11 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          aria-label="最小化"
          title="最小化"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full w-11 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          aria-label="最大化"
          title="最大化"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="h-full w-11 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="关闭"
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
