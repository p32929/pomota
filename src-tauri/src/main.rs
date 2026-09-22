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

fn open_url(app: &AppHandle, url: &str) {
    let _ = tauri::api::shell::open(&app.shell_scope(), url.to_string(), None);
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
    let support = CustomMenuItem::new("support".to_string(), "Support this app ☕");
    let hire = CustomMenuItem::new("hire".to_string(), "Need a custom build?");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(support)
        .add_item(hire)
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
                "support" => {
                    open_url(&app, "https://www.buymeacoffee.com/p32929");
                }
                "hire" => {
                    open_url(&app, "https://p32929.github.io/hire/");
                }
                _ => {}
            },
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
