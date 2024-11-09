import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChampionMap, SkinMap } from "@/lib/types.ts";
import { invoke } from "@tauri-apps/api/core";

type LootData = {
	playerLoot: {
		[id: string]: {
			parentStoreItemId: number;
			storeItemId: number;
		}
	}
}

type CurrentSummoner = {
	summonerId: number;
}

type MinimalSkins = {
	championId: number;
	id: number;
	isBase: boolean;
	ownership: {
		owned: boolean;
	}
}[];

export default function Skins({champion_map, skin_map}: {champion_map: ChampionMap, skin_map: SkinMap}) {
	const ItemSquare = ({ item }: { item: number }) => {
		const legacy = skin_map[item].isLegacy;
		const rarity = skin_map[item].rarity.substring(1);

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<div className={`w-12 h-12 border border-gray-300 flex items-center justify-center text-2xl font-bold relative`}>
							<img src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/${skin_map[item].tilePath.substring(29).toLowerCase()}`} alt={`${item}`} />
							{rarity !== "NoRarity" && (
								<div className="absolute bottom-0 left-0">
									<img className="w-4 h-4" src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/rarity-gem-icons/${rarity.toLowerCase()}.png`} alt="legacy" />
								</div>
							)}
							{legacy && (
								<div className="absolute bottom-0 right-0">
									<img className="w-4 h-4" src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-collections/global/default/images/skins-viewer/icon-legacy.png" alt="legacy" />
								</div>
							)}
						</div>
					</TooltipTrigger>
					<TooltipContent side="right" className="w-[500px] p-0">
						<div className="bg-white rounded-lg shadow-lg overflow-hidden">
							<img src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/${skin_map[item].uncenteredSplashPath.substring(29).toLowerCase()}`} alt={`${item}`} />
							<div className="p-4">
								<h3 className="font-bold mb-2">{skin_map[item].name}</h3>
								<p className="text-sm text-gray-600">{legacy ? "legacy" : ""} {rarity}</p>
							</div>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)
	}

	const ItemCell = ({items}: { items: number[] }) => (
		<div className="flex flex-wrap gap-2">
			{items.map((item, index) => (
				<ItemSquare key={index} item={item} />
			))}
		</div>
	)

	const [loot_data, setLootData] = useState<LootData>({ playerLoot: {} });
	const [skins_minimal, setSkinsMinimal] = useState<MinimalSkins>([]);

	useEffect(() => {
		invoke("lcu_get_request", { url: "/lol-loot/v2/player-loot-map" }).then(x => {
			setLootData(x as LootData);
		});

		invoke("lcu_get_request", { url: "/lol-summoner/v1/current-summoner" }).then(current_summoner_u => {
			const current_summoner = current_summoner_u as CurrentSummoner;
			invoke("lcu_get_request", { url: `/lol-champions/v1/inventories/${current_summoner.summonerId}/skins-minimal` }).then(x => {
				setSkinsMinimal(x as MinimalSkins);
			});
		});
	}, []);

	const champion_skin_data= useMemo(() => {
		if (Object.entries(skin_map).length === 0) {
			return [];
		}
		return Object.entries(champion_map).map(([id, _]) => {
			const champ_skins = skins_minimal.filter(skin => skin.championId === parseInt(id)&& !skin.isBase);
			return {
				id: id,
				owned: champ_skins.filter(skin => skin.ownership.owned).map(skin => skin.id),
				loot: Object.values(loot_data.playerLoot).filter(loot => loot.parentStoreItemId === parseInt(id)).map(loot => loot.storeItemId),
				not_owned: champ_skins.filter(skin => !skin.ownership.owned && Object.values(loot_data.playerLoot).find(loot => loot.storeItemId === skin.id) === undefined).map(skin => skin.id),
			}
		})
	}, [champion_map, loot_data, skins_minimal]);

	return (
		<div className="overflow-auto relative">
			<Table>
				<TableHeader className="sticky top-0 bg-background z-10">
					<TableRow>
						<TableHead className="w-[100px]">Name</TableHead>
						<TableHead>Owned</TableHead>
						<TableHead>In Loot</TableHead>
						<TableHead>Not Owned</TableHead>
						<TableHead className="w-[100px]">Summary</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{champion_skin_data.map((item) => (
						<TableRow key={item.id}>
							<TableCell className="py-2 font-medium">{champion_map[parseInt(item.id)].name}</TableCell>
							<TableCell className="py-2">
								<ItemCell items={item.owned} />
							</TableCell>
							<TableCell className="py-2">
								<ItemCell items={item.loot} />
							</TableCell>
							<TableCell className="py-2">
								<ItemCell items={item.not_owned} />
							</TableCell>
							<TableCell className="py-2">
								{item.owned.length} (+{item.loot.length}) / {item.owned.length + item.loot.length + item.not_owned.length}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}