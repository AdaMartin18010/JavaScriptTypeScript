/**
 * 主题切换器组件
 * 在浅色 / 深色模式之间切换
 */
import { Sun, Moon } from "lucide-react";
import { cn } from "@lib/utils";

interface ThemeToggleProps {
  /** 当前是否为深色模式 */
  isDark: boolean;
  /** 切换回调 */
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps): JSX.Element {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex items-center justify-center w-9 h-9 rounded-md border border-border",
        "bg-background text-foreground hover:bg-muted transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      title={isDark ? "浅色模式" : "深色模式"}
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
