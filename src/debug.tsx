import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input.tsx";
import { useState } from "react";
import { ChampionSummaryItem, RiotChallengeData } from "@/lib/types.ts";

export default function Debug({ lobby, gameflow_phase, champion_map, riot_challenge_data }: { lobby: string[], gameflow_phase: string, champion_map: { [_: number]: ChampionSummaryItem }, riot_challenge_data: RiotChallengeData }) {
	const [get_url, setGetUrl] = useState("");
	const [post_url, setPostUrl] = useState("");
	const [post_body, setPostBody] = useState("");

	return <>
		<div className="flex flex-col gap-4">
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
			</div>
			<div className="flex gap-4">
				<Input placeholder="get request url" onChange={e => setGetUrl(e.target.value)} />
				<Button onClick={() => invoke("lcu_get_request", { url: get_url }).then(x => console.log(x))}>get request</Button>
			</div>
			<div className="flex gap-4">
				<Input placeholder="post request url" onChange={e => setPostUrl(e.target.value)} />
				<Input placeholder="post request body" onChange={e => setPostBody(e.target.value)} />
				<Button onClick={() => invoke("lcu_get_request", { url: post_url, body: JSON.parse(post_body) }).then(x => console.log(x))}>post request</Button>
			</div>
			<span>lobby: {lobby}</span>
			<span>gameflow: {gameflow_phase}</span>
		</div>
	</>;
}