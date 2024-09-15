import { useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChampionSummaryItem, LCUChallengeData } from "@/lib/types.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Copy, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

function is_globe_or_harmony(challenge: any) {
	return (challenge.capstoneGroupName === "Globetrotter" || challenge.capstoneGroupName === "Harmony") && challenge.isCapstone == false;
}

export default function TeamBuilder({ champion_map, lcu_challenge_data }: { champion_map: { [_: number]: ChampionSummaryItem }, lcu_challenge_data: LCUChallengeData }) {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [champions, setChampions] = useState<any[]>([]);
	const [filters, setFilters] = useState<any[]>([]);
	const [shapeSubCategory, setShapeSubCategory] = useState('assassin');
	const text_area_ref = useRef<HTMLTextAreaElement>(null);

	const copy_champs_to_clipboard = () => {
		if (text_area_ref.current) {
			navigator.clipboard.writeText(text_area_ref.current.value).then(r => console.log(r));
		}
	}

	useEffect(() => {
		setChampions(Object.entries(champion_map).map(([key, value]) => {
			const challenges = Object.entries(lcu_challenge_data).filter(([_, value]) => is_globe_or_harmony(value) && value.availableIds.includes(parseInt(key))).map(([key]) => key);
			return {
				id: parseInt(key),
				name: value.name,
				categories: challenges.concat(value.roles.map(x => "role:" + x))
			};
		}));
	}, [champion_map]);

	useEffect(() => {
		setFilters(Object.entries(lcu_challenge_data).filter(([_, value]) => is_globe_or_harmony(value)).map(([key, value]) => ({
			id: key,
			label: value.name,
			group: value.capstoneGroupName,
			subCategories: key === "303408" ? ["assassin", "mage", "marksman", "tank", "support", "fighter"] : []
		})));
	}, [lcu_challenge_data]);

	const handleCategoryChange = (category: string) => {
		setSelectedCategories(prev =>
			prev.includes(category)
				? prev.filter(c => c !== category)
				: [...prev, category]
		);
	};

	const isIconVisible = (iconCategories: string[]) => {
		if (selectedCategories.length === 0) return true;
		return selectedCategories.every(category => iconCategories.includes(category) || category === "303408" && iconCategories.includes("role:" + shapeSubCategory));
	};

	const sortedIcons = useMemo(() => {
		return [...champions].sort((a, b) => {
			const aVisible = isIconVisible(a.categories);
			const bVisible = isIconVisible(b.categories);
			if (aVisible && !bVisible) return -1;
			if (!aVisible && bVisible) return 1;
			return 0;
		});
	}, [champions, selectedCategories, shapeSubCategory]);

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
										<div className="text-right flex items-center space-x-2">
											{category.subCategories.length > 0 ? (
												<Select value={shapeSubCategory} onValueChange={setShapeSubCategory}>
													<SelectTrigger className="h-7 text-xs px-2 py-0">
														<SelectValue placeholder="Type" />
													</SelectTrigger>
													<SelectContent>
														{category.subCategories.map(subCategory => (
															<SelectItem value={subCategory}>{subCategory}</SelectItem>
														))}
													</SelectContent>
												</Select>
											) : (
												<span className="text-xs text-gray-500">{category.description}</span>
											)}
											<Filter className="w-4 h-4 text-gray-400" />
										</div>
									</div>
								))}
						</div>
					</div>
				))}
			</div>
			<div className="flex-1">
				<div className="mb-4">
					<Textarea
						ref={text_area_ref}
						value={selectedCategories.length > 0 ? sortedIcons.filter(icon => isIconVisible(icon.categories)).map(icon => icon.name).join(', ') : ''}
						readOnly
						placeholder="selected champions will appear here"
						className="w-full h-20 mb-2"
					/>
					<Button onClick={copy_champs_to_clipboard} className="w-full" disabled={selectedCategories.length === 0}>
						<Copy className="w-4 h-4 mr-2" />
						Copy to Clipboard
					</Button>
				</div>
				<div className="grid justify-start" style={{ gridTemplateColumns: `repeat(auto-fit, 64px)` }}>
					{sortedIcons.map(icon => {
						const isVisible = isIconVisible(icon.categories);
						return (
							<div key={icon.name} className={`flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-30'}`}>
								<img src={"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/" + icon.id + ".png"} className="w-16 h-16" alt={icon.name} />
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}