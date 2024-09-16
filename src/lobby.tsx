import React, { useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { SupabaseClient } from "@supabase/supabase-js";
import { LCUChallengeData, RiotChallengeData } from "@/lib/types.ts";

function is_globe_or_harmony(challenge: any) {
	return (challenge.capstoneGroupName === "Globetrotter" || challenge.capstoneGroupName === "Harmony") && challenge.isCapstone == false;
}

function calculateColumnSum(column: number[]) {
	return column.reduce((sum, num) => sum + Math.min(num, 10), 0) / 5;
}

export default function Lobby({ lobby, supabase, lcu_challenge_data }: { lobby: string[], supabase: SupabaseClient, lcu_challenge_data: LCUChallengeData }) {
	const memoized_lobby = React.useMemo(() => lobby, [lobby]);
	const [data, setData] = React.useState<number[][]>([[]]);

	useEffect(() => {
		console.log("lobby change:" + memoized_lobby);
		Promise.all(lobby.map(riot_id =>
			supabase.functions.invoke("get-user", { body: { riot_id } }).then(({ data }) => {
				const json_data = JSON.parse(data);
				return json_data.riot_data;
			})
		)).then((r: RiotChallengeData[]) => {
			console.log("goh", Object.entries(lcu_challenge_data).filter(([, value]) => is_globe_or_harmony(value)));
			if (r.length === 0) {
				setData([[]]);
			} else
				setData(r.map(challenge_data => Object.entries(lcu_challenge_data).filter(([, value]) => is_globe_or_harmony(value)).map(([key]) => challenge_data.challenges.find((x: any) => x.challengeId === parseInt(key))?.value || 0)));
		});
	}, [memoized_lobby, lcu_challenge_data]);

	useEffect(() => {
		console.log("Data after update:", data);
	}, [data]);

	const sums = useMemo(() => {
		return data[0].map((_, colIndex) => calculateColumnSum(data.map(row => row[colIndex])));
	}, [data]);
	const sortedIndices = useMemo(() => sums.map((_, index) => index).sort((a, b) => sums[a] - sums[b]), [sums]);

	return (
		<Card className="p-4 overflow-x-auto">
			<div className={`grid grid-cols-[auto_repeat(25,1fr)]`}>
				<div className="font-bold">Name</div>
				{sortedIndices.map(index => (
					<div key={`header-${index}`}></div> // Empty div to maintain grid structure
				))}

				{memoized_lobby.map((name, rowIndex) => (
					<React.Fragment key={`row-${rowIndex}`}>
						<div className="font-semibold">{name}</div>
						{sortedIndices.map(colIndex => (
							<div key={`cell-${rowIndex}-${colIndex}`} className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto relative bg-cover" style={{backgroundImage: "url(https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/challenges-shared/icon-challenger-crown-blue.png)"}}>
				                  <span className="absolute bottom-0 right-0 text-xs font-semibold bg-white/70 px-1 rounded-bl-md rounded-tr-md">
				                    {data[rowIndex][colIndex]}
				                  </span>
							</div>
						))}
					</React.Fragment>
				))}

				<div className="font-semibold">Progression</div>
				{sortedIndices.map(colIndex => (
					<div key={`sum-${colIndex}`} className="text-center font-semibold">
						{sums[colIndex].toFixed(2)}
					</div>
				))}
			</div>
		</Card>
	);
}