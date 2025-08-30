#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

use tauri::{AppHandle, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};
use tauri::{Manager, SystemTrayEvent, State};
use parking_lot::Mutex;
use std::sync::Arc;
use tokio::time::{interval, Duration};

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

// Simple timer state - just tracks if timer is running
#[derive(Default)]
struct TimerState {
    is_running: bool,
}

type TimerStateArc = Arc<Mutex<TimerState>>;

// Simple timer commands that emit tick events
#[tauri::command]
async fn start_background_timer(
    timer_state: State<'_, TimerStateArc>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut state = timer_state.lock();
    if state.is_running {
        return Err("Timer already running".to_string());
    }
    state.is_running = true;
    
    let timer_state_clone = timer_state.inner().clone();
    let app_handle_clone = app_handle.clone();
    
    drop(state); // Release lock before spawning task

    tokio::spawn(async move {
        let mut tick_interval = interval(Duration::from_secs(1));
        
        loop {
            tick_interval.tick().await;
            
            let should_continue = {
                let state = timer_state_clone.lock();
                state.is_running
            };

            if !should_continue {
                break;
            }

            // Emit tick event to frontend - let frontend handle all logic
            let _ = app_handle_clone.emit_all("timer-tick", ());
        }
    });

    Ok(())
}

#[tauri::command]
async fn stop_background_timer(timer_state: State<'_, TimerStateArc>) -> Result<(), String> {
    let mut state = timer_state.lock();
    state.is_running = false;
    Ok(())
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
        .manage(TimerStateArc::default())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .invoke_handler(tauri::generate_handler![
            start_background_timer,
            stop_background_timer
        ])
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
