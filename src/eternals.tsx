import { useState, useMemo, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	flexRender
} from "@tanstack/react-table";
import { ChampionSummaryItem } from "@/lib/types.ts";
import { invoke } from "@tauri-apps/api/core";
import { format_number } from "@/lib/utils.ts";

type EternalsData = {
	itemId: number;
	name: string;
	statstones: {
		description: string;
		formattedValue: string;
		isRetired: boolean;
		name: string;
		playerRecord: {
			value: number;
		}
	}[];
	stonesOwned: number;
}[];

type EternalsMapData = {
	itemId: number;
	statstones: {
		milestones: number[];
	}[];
}[];

type EternalsRowData = {
	name: string;
	eternals: {
		description: string;
		name: string;
		value: number;
		formatted_value: string;
		max: number;
	}[];
};

const calculateTotalProgress = (items: any[]) => {
	if (items.length === 0) return 0;
	const total = items.reduce((sum, item) => sum + (item.value > item.max ? item.max : item.value) / item.max, 0);
	return total / items.length * 100;
};

export default function Component({ champion_map }: { champion_map: { [_: number]: ChampionSummaryItem } }) {
	const [hideCompleteRows, setHideCompleteRows] = useState(false);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [row_data, setRowData] = useState<{ id: string, name: string, series: EternalsRowData[] }[]>([]);
	const [eternals_map_data, setEternalsMapData] = useState<EternalsMapData>([]);
	const roles = ["tank", "mage", "marksman", "fighter", "support", "assassin"];
	const [selected_roles, setSelectedRoles] = useState<string[]>(roles);

	function load_eternals() {
		invoke("http_request", { url: "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/en_gb/v1/statstones.json" }).then(x => {
			const data = x as { statstoneData: EternalsMapData };
			console.log("eternals_data", data);
			setEternalsMapData(data.statstoneData);
		});
	}

	useEffect(() => {
		if (eternals_map_data.length === 0) return;
		Object.entries(champion_map).map(([key, value]) => {
			invoke("lcu_get_request", { url: `/lol-statstones/v2/player-statstones-self/${key}` }).then(x => {
				const eternals_data = x as EternalsData;
				console.log(key, eternals_data);
				const data = {
					id: key,
					name: value.name,
					series: eternals_data.map((eternal) => {
						return {
							name: eternal.name,
							eternals: eternal.stonesOwned === 0 ? [] :
							// 	eternal.statstones.filter(x => !x.isRetired).map((statstone, index) => {
							// 	//.log(eternals_map_data);
							// 	return {
							// 		description: statstone.description,
							// 		name: statstone.name,
							// 		value: statstone.playerRecord.value,
							// 		formatted_value: statstone.formattedValue,
							// 		max: eternals_map_data.find(x => x.itemId === eternal.itemId)?.statstones[index].milestones.slice(0, 5).reduce((x, y) => x + y, 0) ?? 1
							// 	};
							// })
							eternal.statstones.flatMap((statstone, index) => {
								if (statstone.isRetired) return [];
								else return [{
									description: statstone.description,
											name: statstone.name,
											value: statstone.playerRecord.value,
											formatted_value: statstone.formattedValue,
											max: eternals_map_data.find(x => x.itemId === eternal.itemId)?.statstones[index].milestones.slice(0, 5).reduce((x, y) => x + y, 0) ?? 1
								}];
							})
						};
					})
				};
				setRowData((prev) => {
					return prev.filter(x => x.id !== key).concat(data);
				});
			});
		});
	}, [champion_map, eternals_map_data]);

	useEffect(() => {
		console.log(row_data);
	}, [row_data]);

	const columns = useMemo(() => row_data[0] === undefined ? [] : [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }: { row: { original: { name: string, id: string } } }) => <div className="flex flex-col">
					<div>{row.original.name}</div>
					<div className="text-sm text-gray-500">{champion_map[parseInt(row.original.id)].roles}</div>
				</div>
			},
			...row_data[0].series.map((metric, index) => ({
				accessorKey: `series.${index}.name`,
				header: metric.name,
				cell: ({ row }: { row: { original: { series: EternalsRowData[] } } }) => (
					<div className="space-y-2">
						<div className="mb-2">
							<div className="flex items-center justify-between text-sm font-medium mb-1">
								<span>Total Progress</span>
								<span>{calculateTotalProgress(row.original.series[index].eternals).toFixed(2)}%</span>
							</div>
							<Progress
								value={calculateTotalProgress(row.original.series[index].eternals)}
								className="w-full h-2"
							/>
						</div>
						{row.original.series[index].eternals.map((item) => (
							<div key={item.name} className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span className="overflow-ellipsis whitespace-nowrap">{item.name}</span>
									<span className="whitespace-nowrap">{format_number(item.value)} / {format_number(item.max)}</span>
								</div>
								<div className="flex items-center space-x-2">
									<Progress value={item.value / item.max * 100} /*max={item.max}*/ className="w-full h-2" />
									<Tooltip>
										<TooltipTrigger>
											<HelpCircle className="h-4 w-4 text-muted-foreground" />
										</TooltipTrigger>
										<TooltipContent>
											<p>{item.description} ({item.formatted_value})</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</div>
						))}
					</div>
				),
				sortingFn: (rowA: { original: { series: EternalsRowData[] } }, rowB: { original: { series: EternalsRowData[] } }) => {
					const indexA = calculateTotalProgress(rowA.original.series[index].eternals);
					const indexB = calculateTotalProgress(rowB.original.series[index].eternals);
					return indexA - indexB;
				}
			}))
		],
		[row_data]
	);

	const filteredData = useMemo(() => {
		const filtered_data = row_data.filter(champion => champion_map[parseInt(champion.id)].roles.some(role => selected_roles.includes(role)));
		if (hideCompleteRows) {
			return filtered_data.filter(champion => !champion.series.some(series => calculateTotalProgress(series.eternals) >= 100));
		}
		return filtered_data;
	}, [hideCompleteRows, row_data, selected_roles]);

	const table = useReactTable({
		data: filteredData,
		columns,
		state: {
			sorting
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel()
	});

	return (
		<TooltipProvider>
			{/*{row_data.length > 0 && row_data.filter(champion => champion.series.length > 0).length < Object.keys(champion_map).length ? <>loading eternals data ({row_data.filter(champion => champion.series.length > 0).length} / {Object.keys(champion_map).length})</> :*/}
			<div className="space-y-4 p-8">
				<Button onClick={load_eternals}>Load Eternals</Button>
				loading eternals is very expensive and time consuming, pls try not to close the app or reload before all eternals are loaded
				<div className="flex items-center space-x-2">
					<Checkbox
						id="hide-complete"
						checked={hideCompleteRows}
						onCheckedChange={x => setHideCompleteRows(x === true)}
					/>
					<Label htmlFor="hide-complete">Hide champions with at least one rekindled eternal</Label>
				</div>
				<div className="flex items-center space-x-2">
					{roles.map(role => (
						<><Checkbox
							key={role}
							id={role}
							checked={selected_roles.includes(role)}
							onCheckedChange={x => setSelectedRoles(prev => x ? [...prev, role] : prev.filter(y => y !== role))}
						/>
						<Label htmlFor={role}>{role}</Label></>
					))}
				</div>
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id} className="w-[25%]">
											{header.isPlaceholder ? null : (
												<Button
													variant="ghost"
													onClick={header.column.getToggleSortingHandler()}
													className="flex items-center space-x-2"
												>
													<span>
							                            {flexRender(
								                            header.column.columnDef.header,
								                            header.getContext()
							                            )}
					                                </span>
													{header.column.getIsSorted() ? (
														header.column.getIsSorted() === "asc" ? (
															<ArrowUp className="h-4 w-4" />
														) : (
															<ArrowDown className="h-4 w-4" />
														)
													) : (
														<ArrowUpDown className="h-4 w-4" />
													)}
												</Button>
											)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		{/*}*/}
		</TooltipProvider>
	);
}