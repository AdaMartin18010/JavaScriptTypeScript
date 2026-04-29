# Rust 后端源码目录 (src-tauri/src)

> **路径**: `50-examples/50.5-desktop/tauri-react/src-tauri/src/`

## 概述

此目录包含 Tauri v2 桌面应用的**Rust 后端源码**。在 Tauri 架构中，前端是一个普通的 Web 应用（React + Vite），而后端由 Rust 编写，负责提供系统级能力：文件系统访问、原生通知、剪贴板操作、系统信息读取等。前后端通过 Tauri 的 IPC（`invoke` / `emit`）机制通信，Rust 代码的安全性、性能与跨平台能力是桌面应用的核心竞争力。

## 文件说明

| 文件 | 说明 |
|------|------|
| `main.rs` | 应用入口文件，初始化 Tauri Builder、注册命令处理器、加载插件、启动事件循环 |
| `lib.rs` | 核心业务逻辑，定义所有暴露给前端的 `#[tauri::command]` 函数、数据模型与平台特定实现 |

## 核心模块详解

### 1. 命令系统 (`#[tauri::command]`)

Tauri 通过 Rust 宏自动将函数暴露给前端 JavaScript/TypeScript。前端通过 `invoke('command_name', args)` 调用：

```rust
#[command]
pub fn read_directory(path: String) -> Result<Vec<FsEntry>, String> {
    // Rust 实现...
}
```

前端调用示例：

```ts
import { invoke } from '@tauri-apps/api/core';
const entries = await invoke('read_directory', { path: '/home/user' });
```

**安全模型**：Tauri v2 引入了基于 Capabilities 的权限系统。每个命令必须在 `capabilities/*.json` 中显式声明，前端才能调用。这有效防止了恶意脚本滥用系统 API。

### 2. 数据模型 (`struct` 定义)

Rust struct 使用 `serde` 进行序列化/反序列化，实现与前端 JavaScript 对象的自动转换：

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct FsEntry {
    pub name: String,
    pub is_directory: bool,
    pub size: u64,
    pub modified_at: u64,
}
```

字段命名采用 Rust 惯用的 `snake_case`，前端对应接口使用 `camelCase`。建议在类型注释中维护前后端字段映射表，避免协作时的理解偏差。

### 3. 平台特定代码 (`#[cfg(target_os = "...")]`)

本示例中的 `get_total_memory_mb()` 函数展示了 Rust 条件编译的强大能力：

- **macOS**：通过 `libc::sysctl` 读取硬件内存大小
- **Linux**：解析 `/proc/meminfo` 伪文件系统
- **Windows**：调用 `windows_sys` crate 提供的 `GetPhysicallyInstalledSystemMemory`

这种写法将跨平台差异收敛到同一函数名下，调用方无需关心底层实现。

### 4. 插件生态

`main.rs` 中初始化了一系列 Tauri 官方插件：

| 插件 | 作用 |
|------|------|
| `tauri-plugin-clipboard-manager` | 读写系统剪贴板 |
| `tauri-plugin-notification` | 发送桌面原生通知 |
| `tauri-plugin-os` | 获取操作系统信息 |
| `tauri-plugin-shell` | 执行外部命令、打开文件/URL |
| `tauri-plugin-fs` | 安全地读写文件系统 |
| `tauri-plugin-log` | 统一的日志记录与文件持久化 |

插件扩展了 Tauri 核心能力，同时保持权限模型的统一性。

### 5. 开发工具集成

```rust
.setup(|app| {
    #[cfg(debug_assertions)]
    {
        let window = app.get_webview_window("main").unwrap();
        window.open_devtools(); // 调试模式自动打开 DevTools
    }
    Ok(())
})
```

通过条件编译（`debug_assertions`），仅在开发构建中启用 DevTools，生产构建则遵循 `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` 隐藏控制台窗口。

## 开发规范

1. **错误处理**：所有命令函数返回 `Result<T, String>`，将 Rust 的 `?` 传播与 `map_err` 结合，向前端提供人类可读的错误信息。
2. **路径安全**：处理用户传入路径时，使用 `std::fs::canonicalize` 或限制访问范围，防止目录遍历攻击。
3. **异步命令**：涉及 IO 或网络的操作应标记为 `async`，避免阻塞 Tauri 的主事件循环。
4. **文档注释**：为每个 `#[command]` 函数编写 Rust Doc（`///`），说明用途、参数、返回值与安全注意事项。

## 扩展方向

- **状态管理**：使用 `tauri::State` 在命令间共享运行时数据（如数据库连接池、缓存）
- **后台任务**：集成 `tokio` 运行时处理耗时操作，通过 Channel 向前端推送进度
- **自定义协议**：注册 `tauri://` 或自定义 URL Scheme，实现 Deep Link 唤醒
- **更新机制**：集成 `tauri-plugin-updater`，实现自动检查与安装更新

---

*此目录是桌面应用的"系统内核"，Rust 的内存安全与并发模型为应用提供了坚实可靠的底层能力，是 Tauri 技术栈区别于纯 Electron 方案的核心优势所在。*
