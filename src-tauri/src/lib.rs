use irelia::{Error, RequestClient, rest::LcuClient};
use serde_json::Value;
use tokio::sync::Mutex;

pub struct Data {
    pub request_client: RequestClient,
    pub lcu_client: LcuClient,
}

type TauriState<'a> = tauri::State<'a, Mutex<Data>>;

#[tauri::command]
async fn lcu_help(state: TauriState<'_>) -> Result<Value, String> {
    let data = state.lock().await;
    let lcu_client = &data.lcu_client;
    let request_client = &data.request_client;

    let json: Result<Option<Value>, Error> = lcu_client.get("/help", request_client).await;
    match json {
        Ok(Some(json)) => Ok(json),
        _ => Ok(Value::Null),
    }
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(Data {
            request_client: RequestClient::new(),
            lcu_client: LcuClient::new(false).unwrap(),
        }))
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, lcu_help])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
