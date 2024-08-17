import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import {useEffect, useState} from "react";
import {listen} from "@tauri-apps/api/event";

function App() {
	const [lobby, setLobby] = useState("");

	useEffect(() => {
		const unlisten = listen("lobby", (event) => {
			setLobby(JSON.stringify(event.payload));
			console.log(event);
		});
		return () => {
			unlisten.then(f => f());
		}
	}, []);

	return (
		<div className="container">
			<div>
				<button type="button" onClick={() => {invoke("lcu_help").then(x => console.log(x));}}>
					LCU Help
				</button>
				<button type="button" onClick={() => {invoke("ws_init").then(x => console.log(x));}}>
					WS init
				</button>
			</div>
			{lobby}
		</div>
	);
}

export default App;
