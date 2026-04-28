/**
 * 文件浏览器组件
 * 通过 Tauri 后端命令调用操作系统文件系统 API，实现安全的文件浏览
 */
import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Folder,
  FileText,
  ChevronUp,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { cn, formatFileSize, formatDate } from "@lib/utils";
import type { FsEntry } from "@types/index";

export default function FileExplorer(): JSX.Element {
  // 当前目录路径
  const [currentPath, setCurrentPath] = useState<string>("");
  // 目录内容列表
  const [entries, setEntries] = useState<FsEntry[]>([]);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 错误信息
  const [error, setError] = useState<string>("");

  /**
   * 读取指定目录的内容
   * 调用 Tauri Rust 后端的 read_directory 命令
   */
  const readDirectory = useCallback(async (path: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await invoke<FsEntry[]>("read_directory", { path });
      // 排序：目录在前，文件在后，按名称排序
      const sorted = result.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      setEntries(sorted);
      setCurrentPath(path);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化：读取用户主目录（空路径表示主目录）
  useEffect(() => {
    readDirectory("");
  }, [readDirectory]);

  /** 进入子目录 */
  const enterDirectory = (name: string) => {
    const separator = currentPath ? "/" : "";
    readDirectory(`${currentPath}${separator}${name}`);
  };

  /** 返回上一级目录 */
  const goUp = () => {
    if (!currentPath) return;
    const lastSlash = currentPath.lastIndexOf("/");
    const parent = lastSlash > 0 ? currentPath.slice(0, lastSlash) : "";
    readDirectory(parent);
  };

  /** 刷新当前目录 */
  const refresh = () => {
    readDirectory(currentPath);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="h-12 border-b border-border flex items-center px-4 gap-2">
        <button
          onClick={goUp}
          disabled={!currentPath}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            currentPath
              ? "hover:bg-muted text-foreground"
              : "text-muted-foreground cursor-not-allowed"
          )}
          title="上级目录"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm text-foreground overflow-hidden">
          <HardDrive className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {currentPath || "主目录"}
          </span>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors disabled:opacity-50"
          title="刷新"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-3 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          读取失败: {error}
        </div>
      )}

      {/* 文件列表 */}
      <div className="flex-1 overflow-auto p-2">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">名称</th>
              <th className="px-3 py-2 font-medium w-28">大小</th>
              <th className="px-3 py-2 font-medium w-44">修改时间</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.name}
                onClick={() => entry.isDirectory && enterDirectory(entry.name)}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  entry.isDirectory
                    ? "hover:bg-muted cursor-pointer"
                    : "hover:bg-muted/50"
                )}
              >
                <td className="px-3 py-2.5 flex items-center gap-2">
                  {entry.isDirectory ? (
                    <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                  <span className="truncate">{entry.name}</span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {entry.isDirectory ? "—" : formatFileSize(entry.size)}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatDate(entry.modifiedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {entries.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Folder className="w-10 h-10 mb-2 opacity-40" />
            <p>目录为空</p>
          </div>
        )}
      </div>
    </div>
  );
}
