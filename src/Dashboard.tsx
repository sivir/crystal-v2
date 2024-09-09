import {invoke} from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button"

export default function Dashboard({ lobby }: { lobby: string }) {
	return <>
		<Button onClick={() => invoke("lcu_help").then(x => console.log(x))}>LCU Help</Button>

		<Button onClick={() => {
			invoke("ws_init").then(x => console.log(x));
		}}>
			WS init
		</Button>
		<Button onClick={() => {
			invoke("lcu_post_request", {url: "/lol-challenges/v1/update-player-preferences", body: {"challengeIds": [301103,301103,301103]}}).then(x => console.log(x));
		}}>set buttons</Button>
		lobby: {lobby}
	</>
}