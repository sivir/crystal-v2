import { useState } from 'react';
import { ChevronRight, CreditCard, Wallet, Banknote, PiggyBank, Coins, Receipt, ShoppingCart, Briefcase, TrendingUp, Gift, Percent, Tag } from "lucide-react";

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
import { LCUChallengeData, RiotChallengeData } from "@/lib/types.ts";

const iconOptions = [
	{ icon: CreditCard, label: 'Credit Card' },
	{ icon: Wallet, label: 'Wallet' },
	{ icon: Banknote, label: 'Banknote' },
	{ icon: PiggyBank, label: 'Savings' },
	{ icon: Coins, label: 'Coins' },
	{ icon: Receipt, label: 'Receipt' },
	{ icon: ShoppingCart, label: 'Shopping' },
	{ icon: Briefcase, label: 'Business' },
	{ icon: TrendingUp, label: 'Trending' },
	{ icon: Gift, label: 'Gift' },
	{ icon: Percent, label: 'Discount' },
	{ icon: Tag, label: 'Tag' }
];

const level_colors: { [level: string]: string } = {
	MASTER: "text-purple-500",
	DIAMOND: "text-blue-500"
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

export default function Dashboard(props: { riot_id: string[], riot_challenge_data: RiotChallengeData, lcu_challenge_data: LCUChallengeData }) {
	const { riot_id, riot_challenge_data, lcu_challenge_data } = props;
	const [selectedIcons, setSelectedIcons] = useState([
		iconOptions[0],
		iconOptions[1],
		iconOptions[2]
	]);
	const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);

	const handleIconChange = (index: number, newIcon: typeof iconOptions[0]) => {
		const newSelectedIcons = [...selectedIcons];
		newSelectedIcons[index] = newIcon;
		setSelectedIcons(newSelectedIcons);
		setOpenDialogIndex(null);
	};

	return (
		 <div className="flex flex-col">{ Object.keys(lcu_challenge_data).length === 0 ? <></> :
			<main className="flex-1 p-6 md:p-10">
				<h2 className="text-2xl font-semibold mb-6 -mt-10 ">Hello, <span className="font-bold bg-gradient-to-r from-blue-600 to-pink-500 inline-block text-transparent bg-clip-text">{riot_id[0]}#{riot_id[1]}</span></h2>
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
										{selectedIcons.map((IconObj, index) => (
											<Dialog key={index} open={openDialogIndex === index} onOpenChange={(open: any) => setOpenDialogIndex(open ? index : null)}>
												<DialogTrigger asChild>
													<Button variant="outline" size="icon" className="h-16 w-16">
														<IconObj.icon className="h-8 w-8" />
													</Button>
												</DialogTrigger>
												<DialogContent className="sm:max-w-[425px]">
													<DialogHeader>
														<DialogTitle>Choose an icon</DialogTitle>
														<DialogDescription>
															Select a new icon to represent this category.
														</DialogDescription>
													</DialogHeader>
													<div className="grid grid-cols-4 gap-4 py-4">
														{iconOptions.map((option, optionIndex) => (
															<Button
																key={optionIndex}
																variant="outline"
																className="h-12 w-12 p-0"
																onClick={() => handleIconChange(index, option)}
															>
																<option.icon className="h-6 w-6" />
															</Button>
														))}
													</div>
												</DialogContent>
											</Dialog>
										))}
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
						<CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
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
									<Progress value={lcu_challenge_data[401107].currentValue / lcu_challenge_data[401107].thresholds["MASTER"].value * 100} className="h-2 [&>*]:bg-red-500" />
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium leading-none">Mastery 7</p>
										<p className="text-sm font-medium">{lcu_challenge_data[401105].currentValue}/{lcu_challenge_data[401105].thresholds["MASTER"].value}</p>
									</div>
									<Progress value={lcu_challenge_data[401105].currentValue / lcu_challenge_data[401105].thresholds["MASTER"].value * 100} className="h-2 [&>*]:bg-indigo-700" />
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium leading-none">Mastery 5</p>
										<p className="text-sm font-medium">{lcu_challenge_data[401104].currentValue}/{lcu_challenge_data[401104].thresholds["MASTER"].value}</p>
									</div>
									<Progress value={lcu_challenge_data[401104].currentValue / lcu_challenge_data[401104].thresholds["MASTER"].value * 100} className="h-2 [&>*]:bg-blue-400" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>}
		</div>
);
}