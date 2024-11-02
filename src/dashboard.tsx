import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ChevronRight, Check, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { ChallengeSummary, LCUChallengeData, RiotChallengeData } from "@/lib/types.ts";
import { challenge_icon } from "@/lib/utils.ts";

const level_colors: { [level: string]: string } = {
	CHALLENGER: "text-cyan-500",
	GRANDMASTER: "text-red-500",
	MASTER: "text-purple-500",
	DIAMOND: "text-blue-500",
	PLATINUM: "text-blue-300",
	GOLD: "text-yellow-500",
	SILVER: "text-gray-500",
	BRONZE: "text-orange-500",
	IRON: "text-gray-300"
};

const CircleProgress = ({ progress, level }: { progress: number, level: string }) => (
	<div className="relative w-32 h-32">
		<svg className="w-32 h-32" viewBox="0 0 100 100">
			<circle
				className="text-muted stroke-current"
				strokeWidth="8"
				cx="50"
				cy="50"
				r="40"
				fill="transparent"
			></circle>
			<circle
				className={`${level_colors[level]} stroke-current`}
				strokeWidth="8"
				strokeLinecap="round"
				cx="50"
				cy="50"
				r="40"
				fill="transparent"
				strokeDasharray={`${2 * Math.PI * 40}`}
				strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
				transform="rotate(-90 50 50)"
			></circle>
		</svg>
		<div className="absolute inset-0 flex items-center justify-center mt-1">
			<img
				src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/challenges-shared/crystal_${level.toLowerCase()}.png`}
				alt="Progress icon"
				width={80}
				height={80}
				className="rounded-full"
			/>
		</div>
	</div>
);


const TickedProgressBar = ({ value, color }: { value: number, color: string }) => {
	const [tickPositions, setTickPositions] = useState<number[]>([]);

	useEffect(() => {
		setTickPositions([
			Math.random() * 100,
			Math.random() * 100,
			Math.random() * 100
		].sort((a, b) => a - b));
	}, []);

	return (
		<div className={`space-y-1 h-2`}>
			<div className="h-2 bg-muted rounded-full overflow-hidden relative">
				<div className={`h-full ${color} absolute top-0 left-0`} style={{ width: `${value}%` }} />
				<div className="absolute inset-0 flex items-center">
					{tickPositions.map((position, index) => (
						<div key={index} className="h-3 flex items-center" style={{ left: `${position}%`, position: 'absolute' }}>
							<div className="w-px h-full bg-background"></div>
						</div>
					))}
				</div>
			</div>
			<div className="relative h-5">
				{tickPositions.map((position, index) => (
					<div key={index} className="absolute" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
						<img
							src={`https://placehold.co/20?text=${index + 1}`}
							alt={`Placeholder ${index + 1}`}
							width={20}
							height={20}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default function Dashboard(props: { riot_id: string[], riot_challenge_data: RiotChallengeData, lcu_challenge_data: LCUChallengeData, setPage: Dispatch<SetStateAction<string>>, challenge_summary: ChallengeSummary }) {
	const { riot_id, riot_challenge_data, lcu_challenge_data, setPage, challenge_summary } = props;
	const [selected_icons, ss] = useState([0, 0, 0]);
	const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);

	const [searchTerm, setSearchTerm] = useState("");
	const filtered_icons = useMemo(() => {
		return Object.entries(challenge_summary.challenges).filter(([_, challenge]) => challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) || challenge.description.toLowerCase().includes(searchTerm.toLowerCase())).map(([id, _]) => parseInt(id));
	}, [challenge_summary.challenges]);

	function handle_icon_change(index: number, new_icon: number) {
		const new_selected_icons = selected_icons;
		new_selected_icons[index] = new_icon;
		ss(new_selected_icons);
		setOpenDialogIndex(null);
		setSearchTerm("");
	}

	useEffect(() => {
		if (riot_challenge_data && riot_challenge_data.playerPreferences) {
			ss(riot_challenge_data.playerPreferences.challengeIds);
		}
	}, [riot_challenge_data]);

	return (
		<div className="flex flex-col">{Object.keys(lcu_challenge_data).length === 0 ? <></> :
			<main className="flex-1 p-6 md:p-10">
				<h2 className="text-2xl font-semibold mb-6 -mt-10 ">Hello, <span className="font-bold bg-gradient-to-r from-cyan-400 to-pink-400 inline-block text-transparent bg-clip-text">{riot_id[0]}#{riot_id[1]}</span></h2>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
					<Card className="flex flex-col">
						<CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
							<CardTitle className="flex items-center justify-between">
								Challenge Overview <ChevronRight className="h-4 w-4 text-muted-foreground" />
							</CardTitle>
						</CardHeader>
						<CardContent className="flex-1">
							<div className="flex items-center justify-between">
								<div className="flex flex-col items-start space-y-4">
									<div className="flex items-center">
										<img className="h-8 w-8 mr-2" src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/challenge-mini-crystal/${riot_challenge_data.totalPoints.level.toLowerCase()}.svg`}
										     alt="icon" />
										<div className="text-3xl font-bold">{riot_challenge_data.totalPoints.current}</div>
										<div className="text-3xl ml-1">pts</div>
									</div>
									<div className="flex space-x-4">
										<TooltipProvider>
											{selected_icons.map((IconObj, index) => (
												<Tooltip key={index}>
													<TooltipTrigger asChild>
														<Dialog open={openDialogIndex === index} onOpenChange={(open) => setOpenDialogIndex(open ? index : null)}>
															<DialogTrigger asChild>
																<Button variant="outline" size="icon" className="h-16 w-16">
																	<img alt="icon" src={challenge_icon(lcu_challenge_data, IconObj)} className="h-8 w-8" />
																</Button>
															</DialogTrigger>
															<DialogContent className="sm:max-w-[425px]">
																<DialogHeader>
																	<DialogTitle>Choose a token</DialogTitle>
																	<DialogDescription>
																		Select a new challenge token.
																	</DialogDescription>
																</DialogHeader>
																<div>
																	<div className="flex items-center space-x-2 mb-4">
																		<Search className="w-4 h-4 text-muted-foreground" />
																		<Input
																			placeholder="Search tokens..."
																			value={searchTerm}
																			onChange={(e) => setSearchTerm(e.target.value)}
																			className="flex-1"
																		/>
																	</div>
																	<ScrollArea className="h-[200px] w-full rounded-md border p-4">
																		<div className="grid grid-cols-5 gap-4">
																			{filtered_icons.map((option, optionIndex) => (
																				<div className="flex justify-center">
																				<Button
																					key={optionIndex}
																					variant="outline"
																					className="h-12 w-12 p-0"
																					onClick={() => handle_icon_change(index, option)}
																				>
																					<img src={challenge_icon(lcu_challenge_data, option)} alt="icon" className="h-6 w-6" />
																				</Button></div>
																			))}
																		</div>
																	</ScrollArea>
																</div>
															</DialogContent>
														</Dialog>
													</TooltipTrigger>
													<TooltipContent>
														<p>{challenge_summary.challenges[IconObj].name}</p>
													</TooltipContent>
												</Tooltip>
											))}
										</TooltipProvider>
										<Button variant="outline" size="icon" className="h-16 w-16">
											<Check className="h-8 w-8" />
										</Button>
									</div>
								</div>
								<CircleProgress progress={riot_challenge_data.totalPoints.current / riot_challenge_data.totalPoints.max * 100} level={riot_challenge_data.totalPoints.level} />
							</div>
						</CardContent>
					</Card>
					<Card className="flex flex-col">
						<CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
							<CardTitle className="flex items-center justify-between">
								2024 Split 2 Seasonal <ChevronRight className="h-4 w-4 text-muted-foreground" />
							</CardTitle>
						</CardHeader>
						<CardContent className="flex-1">
							<div className="space-y-4">
								<div>
									<div className="flex justify-between mb-2">
										<span className="text-sm font-medium">Overall Progress</span>
										<span className="text-sm font-medium">82%</span>
									</div>
									<Progress value={82} className="h-2" />
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">Challenges</h4>
									<div className="grid grid-cols-4 gap-4">
										<div className="flex flex-col items-center">
											<img src="https://raw.communitydragon.org/latest/game/assets/challenges/config/2024201/tokens/diamond.png" height={64} width={64} alt="Challenger" />
										</div>
										<div className="flex flex-col items-center">
											<img src="https://raw.communitydragon.org/latest/game/assets/challenges/config/2024202/tokens/diamond.png" height={64} width={64} alt="Challenger" />
										</div>
										<div className="flex flex-col items-center">
											<img src="https://raw.communitydragon.org/latest/game/assets/challenges/config/2024203/tokens/master.png" height={64} width={64} alt="Challenger" />
										</div>
										<div className="flex flex-col items-center">
											<img src="https://raw.communitydragon.org/latest/game/assets/challenges/config/2024204/tokens/master.png" height={64} width={64} alt="Challenger" />
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="flex flex-col">
						<CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
							<CardTitle className="flex items-center justify-between">
								Eternals or Globes <ChevronRight className="h-4 w-4 text-muted-foreground" />
							</CardTitle>
						</CardHeader>
						<CardContent className="flex-1">
							<div className="space-y-4">
								{[1, 2, 3].map((item) => (
									<div key={item} className="flex items-center">
										<div className="w-9 h-9 rounded-full bg-muted mr-4" />
										<div className="flex-1 space-y-1">
											<p className="text-sm font-medium leading-none">Order #{item}00</p>
											<p className="text-sm text-muted-foreground">2 hours ago</p>
										</div>
										<div className="font-medium">$25.00</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
					<Card className="flex flex-col">
						<CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setPage("champions")}>
							<CardTitle className="flex items-center justify-between">
								Mastery <ChevronRight className="h-4 w-4 text-muted-foreground" />
							</CardTitle>
						</CardHeader>
						<CardContent className="flex-1">
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium leading-none">Mastery 10</p>
										<p className="text-sm font-medium">{lcu_challenge_data[401107].currentValue}/{lcu_challenge_data[401107].thresholds["MASTER"].value}</p>
									</div>
									<TickedProgressBar value={lcu_challenge_data[401107].currentValue / lcu_challenge_data[401107].thresholds["MASTER"].value * 100} color="bg-red-500" />
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium leading-none">Mastery 7</p>
										<p className="text-sm font-medium">{lcu_challenge_data[401105].currentValue}/{lcu_challenge_data[401105].thresholds["MASTER"].value}</p>
									</div>
									<TickedProgressBar value={lcu_challenge_data[401105].currentValue / lcu_challenge_data[401105].thresholds["MASTER"].value * 100} color="bg-indigo-700" />
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium leading-none">Mastery 5</p>
										<p className="text-sm font-medium">{lcu_challenge_data[401104].currentValue}/{lcu_challenge_data[401104].thresholds["MASTER"].value}</p>
									</div>
									<TickedProgressBar value={lcu_challenge_data[401104].currentValue / lcu_challenge_data[401104].thresholds["MASTER"].value * 100} color="bg-blue-400" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>}
		</div>
	);
}