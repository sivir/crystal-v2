import { useState, useMemo, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChampionSummaryItem, LCUChallengeData } from "@/lib/types.ts";

function is_globe_or_harmony(challenge: any) {
	return challenge.capstoneGroupName === "Globetrotter" || challenge.capstoneGroupName === "Harmony" && challenge.isCapstone === false;
}

export default function TeamBuilder({ champion_map, lcu_challenge_data }: { champion_map: {[_: number]: ChampionSummaryItem}, lcu_challenge_data: LCUChallengeData }) {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])

	const [champions, setChampions] = useState<any[]>([]);
	const [filters, setFilters] = useState<any[]>([]);

	useEffect(() => {
		console.log(champions);
	}, [champions]);

	useEffect(() => {
		setChampions(Object.entries(champion_map).map(([key, value]) => {
			const challenges = Object.entries(lcu_challenge_data).filter(([_, value]) => is_globe_or_harmony(value) && value.availableIds.includes(parseInt(key))).map(([key, ]) => key);
			return {
				id: parseInt(key),
				name: value.name,
				categories: challenges.concat(value.roles.map(x => "role:" + x))
			}
		}));
	}, [champion_map]);

	useEffect(() => {
		setFilters(Object.entries(lcu_challenge_data).filter(([_, value]) => is_globe_or_harmony(value)).map(([key, value]) => ({
			id: key,
			label: value.name,
			group: value.capstoneGroupName,
		})));
	}, [lcu_challenge_data]);

	const handleCategoryChange = (category: string) => {
		setSelectedCategories(prev =>
			prev.includes(category)
				? prev.filter(c => c !== category)
				: [...prev, category]
		)
	}

	const isIconVisible = (iconCategories: string[]) => {
		if (selectedCategories.length === 0) return true
		return selectedCategories.every(category => iconCategories.includes(category))
	}

	const sortedIcons = useMemo(() => {
		return [...champions].sort((a, b) => {
			const aVisible = isIconVisible(a.categories)
			const bVisible = isIconVisible(b.categories)
			if (aVisible && !bVisible) return -1
			if (!aVisible && bVisible) return 1
			return 0
		})
	}, [champions, selectedCategories])

	useEffect(() => {
		console.log(sortedIcons);
	}, [sortedIcons]);

	return (
		<div className="flex p-6 gap-6">
			<div className="w-64 space-y-8">
				{['Harmony', 'Globetrotter'].map(group => (
					<div key={group}>
						<h2 className="text-lg font-semibold mb-4">{group}</h2>
						<div className="space-y-2">
							{filters
								.filter(category => category.group === group)
								.map(category => (
									<div key={category.id} className="flex items-center space-x-2">
										<Checkbox
											id={category.id}
											checked={selectedCategories.includes(category.id)}
											onCheckedChange={() => handleCategoryChange(category.id)}
										/>
										<Label htmlFor={category.id}>{category.label}</Label>
									</div>
								))}
						</div>
					</div>
				))}
			</div>
			<div className="flex-1">
				<div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16">
					{sortedIcons.map(icon => {
						const isVisible = isIconVisible(icon.categories)
						return (
							<div
								key={icon.name}
								className={`flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-30'}`}
							>
								<img src={"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/" + icon.id + ".png"} className="w-16 h-16" alt={icon.name} />
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}