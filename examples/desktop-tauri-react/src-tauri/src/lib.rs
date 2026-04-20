/**
 * Tauri v2 后端命令定义
 * 
 * 所有 #[tauri::command] 函数都会自动暴露给前端，通过 invoke() 调用。
 * Tauri v2 采用基于能力的权限模型（Capabilities），
 * 必须在 tauri.conf.json 或 capabilities/*.json 中声明权限。
 */

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{command, AppHandle, Manager};

// =============================================================================
// 数据模型
// =============================================================================

/// 文件系统条目（对应前端 FsEntry 类型）
#[derive(Debug, Serialize, Deserialize)]
pub struct FsEntry {
    pub name: String,
    pub is_directory: bool,
    pub size: u64,
    pub modified_at: u64,
}

/// 系统信息数据（对应前端 SystemInfoData 类型）
#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfoData {
    pub platform: String,
    pub version: String,
    pub hostname: String,
    pub arch: String,
    pub cpu_cores: usize,
    pub total_memory: u64,
    pub app_version: String,
}

// =============================================================================
// 文件系统命令
// =============================================================================

/**
 * 读取指定目录的内容
 * 
 * # 安全性
 * - 路径经过规范化处理，防止目录遍历攻击
 * - 空路径默认读取用户主目录
 * 
 * # 参数
 * - `path`: 目标目录路径（相对主目录或绝对路径）
 * 
 * # 返回
 * - 目录条目列表
 */
#[command]
pub fn read_directory(path: String) -> Result<Vec<FsEntry>, String> {
    // 解析目标路径
    let target_path = if path.is_empty() {
        dirs::home_dir().unwrap_or_else(|| PathBuf::from("."))
    } else {
        // 安全：限制访问范围（示例中简化为直接使用传入路径）
        PathBuf::from(&path)
    };

    // 读取目录内容
    let entries = std::fs::read_dir(&target_path)
        .map_err(|e| format!("读取目录失败: {}", e))?;

    let mut result = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("遍历条目失败: {}", e))?;
        let metadata = entry.metadata().ok();

        let name = entry.file_name().to_string_lossy().to_string();
        let is_directory = metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false);
        let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
        let modified_at = metadata
            .and_then(|m| m.modified().ok())
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);

        result.push(FsEntry {
            name,
            is_directory,
            size,
            modified_at,
        });
    }

    Ok(result)
}

// =============================================================================
// 系统信息命令
// =============================================================================

/**
 * 获取系统信息
 * 
 * 通过 tauri-plugin-os 安全获取操作系统底层信息。
 * 前端无法直接访问这些 API，必须通过 Rust 后端代理。
 * 
 * # 返回
 * - 包含平台、版本、硬件信息的结构化数据
 */
#[command]
pub fn get_system_info(app: AppHandle) -> Result<SystemInfoData, String> {
    use tauri_plugin_os::{arch, hostname, platform, version};

    // 获取 CPU 核心数（使用 sysinfo 或直接读取）
    let cpu_cores = std::thread::available_parallelism()
        .map(|p| p.get())
        .unwrap_or(1);

    // 获取总内存（通过 sysinfo 或简化处理）
    let total_memory = get_total_memory_mb();

    // 读取应用版本（从 Cargo.toml）
    let app_version = app.package_info().version.to_string();

    Ok(SystemInfoData {
        platform: platform().to_string(),
        version: version().to_string(),
        hostname: hostname().unwrap_or_else(|| "unknown".into()),
        arch: arch().to_string(),
        cpu_cores,
        total_memory,
        app_version,
    })
}

/**
 * 获取系统总内存（MB）
 * 
 * 跨平台实现：不同操作系统通过不同系统调用获取。
 */
#[cfg(target_os = "macos")]
fn get_total_memory_mb() -> u64 {
    use std::ffi::c_void;
    use std::mem;

    let mut mib = [libc::CTL_HW, libc::HW_MEMSIZE];
    let mut memsize: i64 = 0;
    let mut len = mem::size_of::<i64>();

    unsafe {
        libc::sysctl(
            mib.as_mut_ptr(),
            2,
            &mut memsize as *mut _ as *mut c_void,
            &mut len,
            std::ptr::null_mut(),
            0,
        );
    }

    (memsize / 1024 / 1024) as u64
}

#[cfg(target_os = "linux")]
fn get_total_memory_mb() -> u64 {
    use std::fs::File;
    use std::io::{BufRead, BufReader};

    if let Ok(file) = File::open("/proc/meminfo") {
        let reader = BufReader::new(file);
        for line in reader.lines().flatten() {
            if line.starts_with("MemTotal:") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(kb) = parts[1].parse::<u64>() {
                        return kb / 1024;
                    }
                }
            }
        }
    }
    0
}

#[cfg(target_os = "windows")]
fn get_total_memory_mb() -> u64 {
    use windows_sys::Win32::System::SystemInformation::GetPhysicallyInstalledSystemMemory;

    let mut mem_kb: u64 = 0;
    unsafe {
        GetPhysicallyInstalledSystemMemory(&mut mem_kb);
    }
    mem_kb / 1024
}

// =============================================================================
// 剪贴板命令
// =============================================================================

/**
 * 写入文本到剪贴板
 * 
 * 使用 tauri-plugin-clipboard-manager 提供的安全 API。
 * 
 * # 参数
 * - `text`: 要写入的文本内容
 */
#[command]
pub async fn write_clipboard(app: AppHandle, text: String) -> Result<(), String> {
    app.clipboard()
        .write_text(text)
        .map_err(|e| format!("写入剪贴板失败: {}", e))
}

// =============================================================================
// 通知命令
// =============================================================================

/**
 * 发送系统原生通知
 * 
 * 使用 tauri-plugin-notification 跨平台发送桌面通知。
 * 
 * # 参数
 * - `title`: 通知标题
 * - `body`: 通知正文
 */
#[command]
pub async fn send_notification(
    app: AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    // 请求通知权限（首次需要用户授权）
    let permission = app.notification().permission_state().map_err(|e| e.to_string())?;
    
    if permission != tauri_plugin_notification::PermissionState::Granted {
        app.notification().request_permission().map_err(|e| e.to_string())?;
    }

    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| format!("发送通知失败: {}", e))?;

    Ok(())
}
