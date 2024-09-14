use irelia::{Error, RequestClient, rest::LcuClient};
use irelia::ws::types::{Event, EventKind};
use irelia::ws::{LcuWebSocket, Subscriber};
use serde_json::Value;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;

pub struct Data {
	pub request_client: RequestClient,
	pub lcu_client: LcuClient,
	pub ws_client: LcuWebSocket,
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

#[tauri::command]
async fn get_challenge_data(state: TauriState<'_>) -> Result<Value, String> {
	let data = state.lock().await;
	let lcu_client = &data.lcu_client;
	let request_client = &data.request_client;

	let json: Result<Option<Value>, Error> = lcu_client.get("/lol-champ-select/v1/session", request_client).await;
	match json {
		Ok(Some(json)) => Ok(json),
		_ => Ok(Value::Null),
	}
}

#[tauri::command]
async fn lcu_get_request(state: TauriState<'_>, url: String) -> Result<Value, String> {
	let data = state.lock().await;
	let lcu_client = &data.lcu_client;
	let request_client = &data.request_client;

	let json: Result<Value, Error> = lcu_client.get(&url, request_client).await;
	match json {
		Ok(json) => Ok(json),
		_ => Ok(Value::Null),
	}
}

#[tauri::command]
async fn lcu_put_request(state: TauriState<'_>, url: String, body: Value) -> Result<Value, String> {
	let data = state.lock().await;
	let lcu_client = &data.lcu_client;
	let request_client = &data.request_client;

	let json: Result<Value, Error> = lcu_client.put(&url, body, request_client).await;
	match json {
		Ok(json) => Ok(json),
		_ => Ok(Value::Null),
	}
}

#[tauri::command]
async fn lcu_post_request(state: TauriState<'_>, url: String, body: Value) -> Result<Value, String> {
	let data = state.lock().await;
	let lcu_client = &data.lcu_client;
	let request_client = &data.request_client;

	let json: Result<Value, Error> = lcu_client.post(&url, body, request_client).await;
	match json {
		Ok(json) => Ok(json),
		_ => Ok(Value::Null),
	}
}

#[tauri::command]
async fn ws_init(state: TauriState<'_>, app_handle: AppHandle) -> Result<(), String> {
	println!("ws_init");
	let mut data = state.lock().await;
	let ws_client = &mut data.ws_client;

	struct LobbyEventHandler {
		app_handle: AppHandle,
		lobby_members: Vec<String>,
	}

	impl Subscriber for LobbyEventHandler {
		fn on_event(&mut self, event: &Event, _: &mut bool) {
			if event.2.uri == "/lol-lobby/v2/lobby/members" {
				self.lobby_members = event.2.data.as_array().unwrap().iter().map(|x| x["summonerName"].as_str().unwrap().to_string()).collect();
				println!("{:?}", event.2.data);
				self.app_handle.emit("lobby", self.lobby_members.clone()).unwrap();
			}
			if event.2.event_type == "Delete" {
				self.lobby_members.clear();
				self.app_handle.emit("lobby", self.lobby_members.clone()).unwrap();
			}
		}
	}

	struct EventHandler;
	impl Subscriber for EventHandler {
		fn on_event(&mut self, event: &Event, _: &mut bool) {
			println!("{:?}", event);
		}
	}

	ws_client.subscribe(EventKind::JsonApiEventCallback("/lol-gameflow/v1/session".to_string()), EventHandler).unwrap();
	ws_client.subscribe(EventKind::JsonApiEventCallback("/lol-lobby/v2/lobby".to_string()), LobbyEventHandler { app_handle, lobby_members: Vec::new() }).unwrap();

	Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.manage(Mutex::new(Data {
			request_client: RequestClient::new(),
			lcu_client: LcuClient::new(false).unwrap(),
			ws_client: LcuWebSocket::new(),
		}))
		.plugin(tauri_plugin_shell::init())
		.invoke_handler(tauri::generate_handler![lcu_help, ws_init, lcu_get_request, lcu_put_request, lcu_post_request])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
