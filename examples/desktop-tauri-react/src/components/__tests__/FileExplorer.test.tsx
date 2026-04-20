/**
 * FileExplorer 组件单元测试
 * 使用 vitest + @testing-library/react 进行测试
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FileExplorer from "../FileExplorer";

// 模拟 Tauri invoke API
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

const mockedInvoke = invoke as unknown as ReturnType<typeof vi.fn>;

describe("FileExplorer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应渲染文件浏览器并显示加载状态", async () => {
    // 模拟延迟返回空目录
    mockedInvoke.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 10)));

    render(<FileExplorer />);

    // 验证工具栏存在
    expect(screen.getByTitle("上级目录")).toBeInTheDocument();
    expect(screen.getByTitle("刷新")).toBeInTheDocument();

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText("目录为空")).toBeInTheDocument();
    });
  });

  it("应正确渲染目录条目列表", async () => {
    const mockEntries = [
      { name: "docs", isDirectory: true, size: 0, modifiedAt: Date.now() },
      { name: "README.md", isDirectory: false, size: 1024, modifiedAt: Date.now() },
    ];

    mockedInvoke.mockResolvedValue(mockEntries);

    render(<FileExplorer />);

    await waitFor(() => {
      expect(screen.getByText("docs")).toBeInTheDocument();
      expect(screen.getByText("README.md")).toBeInTheDocument();
    });
  });

  it("点击目录应进入子目录", async () => {
    const rootEntries = [
      { name: "projects", isDirectory: true, size: 0, modifiedAt: Date.now() },
    ];

    const subEntries = [
      { name: "index.ts", isDirectory: false, size: 256, modifiedAt: Date.now() },
    ];

    mockedInvoke
      .mockResolvedValueOnce(rootEntries)
      .mockResolvedValueOnce(subEntries);

    render(<FileExplorer />);

    await waitFor(() => {
      expect(screen.getByText("projects")).toBeInTheDocument();
    });

    // 点击目录进入
    fireEvent.click(screen.getByText("projects"));

    await waitFor(() => {
      expect(screen.getByText("index.ts")).toBeInTheDocument();
    });
  });
});
