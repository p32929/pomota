#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

use tauri::{AppHandle, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};
use tauri::{Manager, SystemTrayEvent};

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn show_app(app: &AppHandle) {
    let window = app.get_window("main").unwrap();
    window.unminimize().unwrap();
    window.show().unwrap();
    window.set_focus().unwrap();
    window.center().unwrap();
}

fn main() {
    // tauri::Builder::default()
    //     .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
    //         println!("{}, {argv:?}, {cwd}", app.package_info().name);
    //     }))
    //     .invoke_handler(tauri::generate_handler![greet])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");

    let show = CustomMenuItem::new("show".to_string(), "Show");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(tray)
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                println!("LCLick");
                show_app(&app);
            }
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                println!("DCLick");
                show_app(&app);
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    println!("Quit");
                    std::process::exit(0);
                }
                "show" => {
                    println!("Show");
                    show_app(&app);
                }
                _ => {}
            },
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
