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
async fn http_request(url: &str) -> Result<Value, String> {
	let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
	let json = response.json().await.map_err(|e| e.to_string())?;
	Ok(json)
}

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

static mut WS_INITIALIZED: bool = false;

#[tauri::command]
async fn ws_init(state: TauriState<'_>, app_handle: AppHandle) -> Result<(), String> {
	println!("ws_init");
	unsafe {
		if WS_INITIALIZED {
			return Ok(());
		}
		WS_INITIALIZED = true;
	}
	println!("started");
	let mut data = state.lock().await;
	let ws_client = &mut data.ws_client;

	struct LobbyEventHandler {
		app_handle: AppHandle,
		lobby_members: Vec<String>,
	}

	impl Subscriber for LobbyEventHandler {
		fn on_event(&mut self, event: &Event, _: &mut bool) {
			if event.2.uri == "/lol-lobby/v2/lobby/members" {
				self.lobby_members = event.2.data.as_array().unwrap().iter().map(|x| x["puuid"].as_str().unwrap().to_string()).collect();
				println!("{:?}", self.lobby_members);
				self.app_handle.emit("lobby", self.lobby_members.clone()).unwrap();
			}
			if event.2.event_type == "Delete" {
				self.lobby_members.clear();
				self.app_handle.emit("lobby", self.lobby_members.clone()).unwrap();
			}
		}
	}

	struct GameflowEventHandler {
		app_handle: AppHandle
	}

	impl Subscriber for GameflowEventHandler {
		fn on_event(&mut self, event: &Event, _: &mut bool) {
			self.app_handle.emit("gameflow", event.2.data.clone()).unwrap();
		}
	}

	struct EventHandler;
	impl Subscriber for EventHandler {
		fn on_event(&mut self, event: &Event, _: &mut bool) {
			println!("{:?}", event);
		}
	}

	//ws_client.subscribe(EventKind::JsonApiEventCallback("/lol-gameflow/v1/session".to_string()), EventHandler).unwrap();
	ws_client.subscribe(EventKind::JsonApiEventCallback("/lol-gameflow/v1/gameflow-phase".to_string()), GameflowEventHandler { app_handle: app_handle.clone() }).unwrap();
	ws_client.subscribe(EventKind::JsonApiEventCallback("/lol-lobby/v2/lobby".to_string()), LobbyEventHandler { app_handle: app_handle.clone(), lobby_members: Vec::new() }).unwrap();

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
		.invoke_handler(tauri::generate_handler![lcu_help, ws_init, lcu_get_request, lcu_put_request, lcu_post_request, http_request])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
