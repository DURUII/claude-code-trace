#![allow(dead_code)]

mod commands;
mod convert;
mod http_api;
mod parser;
mod settings;
mod state;
mod watcher;

use tauri::Manager;

pub fn run() {
    let web_only = std::env::args().any(|a| a == "--web");

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(state::AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::session::load_session,
            commands::session::get_session_meta,
            commands::session::watch_session,
            commands::session::unwatch_session,
            commands::session::get_project_dirs,
            commands::picker::discover_sessions,
            commands::picker::watch_picker,
            commands::picker::unwatch_picker,
            commands::git::get_git_info,
            commands::debug::get_debug_log,
            commands::settings::get_settings,
            commands::settings::set_projects_dir,
            switch_to_browser,
        ])
        .setup(move |app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(http_api::start_http_server(handle));

            if web_only {
                eprintln!("Web-only mode: opening http://localhost:1420 in your browser...");
                let _ = tauri_plugin_opener::open_url("http://localhost:1420", None::<&str>);
            } else {
                // Show the main window (hidden by default in tauri.conf.json).
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Open the web UI in the default browser and hide the desktop window.
#[tauri::command]
async fn switch_to_browser(app: tauri::AppHandle) -> Result<(), String> {
    tauri_plugin_opener::open_url("http://localhost:1420", None::<&str>)
        .map_err(|e| e.to_string())?;

    if let Some(w) = app.get_webview_window("main") {
        let _ = w.hide();
    }

    Ok(())
}
