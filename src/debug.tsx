import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input.tsx";
import { useState } from "react";

export default function Debug({ lobby }: { lobby: string[] }) {
	const [value, setValue] = useState("");

	return <>
		<div className="flex items-center gap-4">
			<Button onClick={() => invoke("lcu_help").then(x => console.log(x))}>LCU Help</Button>
			<Button onClick={() => {
				invoke("lcu_post_request", { url: "/lol-challenges/v1/update-player-preferences", body: { "challengeIds": [301103, 301103, 301103] } }).then(x => console.log(x));
			}}>set buttons</Button>
			<Input placeholder="get request url" onChange={e => setValue(e.target.value)}/>
			<Button onClick={() => invoke("lcu_get_request", { url: value }).then(x => console.log(x))}>get request</Button>
		</div>

		lobby: {lobby}
	</>
}