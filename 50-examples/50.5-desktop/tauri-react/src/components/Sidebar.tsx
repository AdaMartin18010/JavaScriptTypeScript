/**
 * 侧边栏导航组件
 * 提供应用主要视图的导航入口
 */
import { FolderOpen, MonitorCog, Settings } from "lucide-react";
import { cn } from "@lib/utils";

/** 视图类型 */
type ViewType = "explorer" | "system" | "settings";

interface SidebarProps {
  /** 当前激活的视图 */
  currentView: ViewType;
  /** 视图切换回调 */
  onViewChange: (view: ViewType) => void;
}

/** 导航配置项 */
const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: "explorer", label: "文件浏览", icon: <FolderOpen className="w-5 h-5" /> },
  { id: "system", label: "系统信息", icon: <MonitorCog className="w-5 h-5" /> },
  { id: "settings", label: "设置", icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar({ currentView, onViewChange }: SidebarProps): JSX.Element {
  return (
    <aside className="w-56 bg-card border-r border-border flex flex-col">
      {/* 导航标题 */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          导航
        </h3>
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              currentView === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 底部信息 */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Tauri v2 + React 19
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          跨平台桌面应用示例
        </p>
      </div>
    </aside>
  );
}
