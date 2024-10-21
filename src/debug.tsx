import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input.tsx";
import { useState } from "react";
import { ChampionSummaryItem, RiotChallengeData } from "@/lib/types.ts";

export default function Debug({ lobby, gameflow_phase, champion_map, riot_challenge_data }: { lobby: string[], gameflow_phase: string, champion_map: { [_: number]: ChampionSummaryItem }, riot_challenge_data: RiotChallengeData }) {
	const [value, setValue] = useState("");

	return <>
		<div className="flex items-center gap-4">
			<Button onClick={() => invoke("lcu_help").then(x => console.log(x))}>LCU Help</Button>
			<Button onClick={() => {
				invoke("lcu_post_request", { url: "/lol-challenges/v1/update-player-preferences", body: { ...riot_challenge_data.playerPreferences, "challengeIds": [0, 1, 0] } }).then(x => console.log(x));
			}}>set buttons</Button>
			<Button onClick={() => {
				console.log(champion_map);
				Object.keys(champion_map).map(key => {
					console.log("sending " + key);
					invoke("lcu_get_request", { url: `/lol-statstones/v2/player-statstones-self/${key}` }).then(x => console.log(key, x));
				});
			}}>eternals data</Button>
			<Input placeholder="get request url" onChange={e => setValue(e.target.value)}/>
			<Button onClick={() => invoke("lcu_get_request", { url: value }).then(x => console.log(x))}>get request</Button>
		</div>

		lobby: {lobby}
		<br />
		gameflow: {gameflow_phase}
		<br />
		champion map: {JSON.stringify(champion_map)}
	</>
}