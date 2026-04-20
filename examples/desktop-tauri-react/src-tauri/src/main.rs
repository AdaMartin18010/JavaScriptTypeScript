// Prevents additional console window on Windows in release mode
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    // 初始化 Tauri 应用
    tauri::Builder::default()
        // 注册自定义命令
        .invoke_handler(tauri::generate_handler![
            desktop_tauri_react::read_directory,
            desktop_tauri_react::get_system_info,
            desktop_tauri_react::write_clipboard,
            desktop_tauri_react::send_notification,
        ])
        // 插件初始化（v2 必需显式注册）
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_log::Builder::default().build())
        // 窗口创建完成后的回调
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            log::info!("Tauri 应用启动成功");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用时发生错误");
}
