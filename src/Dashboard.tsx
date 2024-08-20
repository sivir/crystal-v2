import {invoke} from "@tauri-apps/api/core";

export default function Dashboard({ lobby }: { lobby: string }) {
	return <>
		<button type="button" onClick={() => {
			invoke("lcu_help").then(x => console.log(x));
		}}>
			LCU Help
		</button>
		<button type="button" onClick={() => {
			invoke("ws_init").then(x => console.log(x));
		}}>
			WS init
		</button>
		lobby: {lobby}
	</>
}