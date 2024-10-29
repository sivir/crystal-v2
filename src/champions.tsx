import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Column, ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, Row, SortingState, useReactTable } from "@tanstack/react-table";
import { ChampionSummaryItem, LCUChallengeData, MasteryData } from "@/lib/types.ts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { format_number, format_number_comma, rank_index, rank_order } from "@/lib/utils.ts";

type RowData = {
	id: number;
	name: string;
	level: number;
	points: number;
	prev_progress: number;
	next_progress: number;
	icons: number;
	grades: { letter: string; filled: boolean }[];
	checks: boolean[];
};

const default_mastery_data = {
	championId: 0,
	championLevel: 0,
	championPoints: 0,
	championPointsSinceLastLevel: 0,
	championPointsUntilNextLevel: 0,
	markRequiredForNextLevel: 0,
	milestoneGrades: [],
	nextSeasonMilestone: {
		requireGradeCounts: {}
	},
	tokensEarned: 0
};

export default function Champions({ mastery_data, champion_map, lcu_challenge_data }: { mastery_data: MasteryData, champion_map: { [_: number]: ChampionSummaryItem }, lcu_challenge_data: LCUChallengeData }) {
	const tracked_challenges = [101301, 120002, 202303, 210001, 210002, 401106, 505001];
	const [sorting, setSorting] = useState<SortingState>([{id: "mastery", desc: true}]);
	const [mastery_sort, setMasterySort] = useState<'level_asc' | 'level_desc' | 'points_asc' | 'points_desc'>('level_asc');
	const mastery_challenges = [401101, 401102, 401103, 401104];
	const classes = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];
	const mastery_class_challenges_7 = [401201, 401202, 401203, 401204, 401205, 401206];
	const mastery_class_challenges_10 = [401207, 401208, 401209, 401210, 401211, 401212];

	const [data, setData] = useState<RowData[]>([]);

	useEffect(() => {
		setData(Object.entries(champion_map).map(([key, value]) => {
			const current_champion_mastery = mastery_data.find((mastery) => mastery.championId === parseInt(key)) || default_mastery_data;
			const grades = Object.entries(current_champion_mastery.nextSeasonMilestone.requireGradeCounts).flatMap(([key, value]) => Array(value).fill(key));
			return {
				id: parseInt(key),
				name: value.name,
				level: current_champion_mastery.championLevel,
				points: current_champion_mastery.championPoints,
				prev_progress: current_champion_mastery.championPointsSinceLastLevel,
				next_progress: current_champion_mastery.championPointsUntilNextLevel,
				icons: current_champion_mastery.tokensEarned,
				grades: grades.map((letter: string) => ({ letter: letter[0], filled: Math.random() < 0.5 })),
				checks: tracked_challenges.map(x => lcu_challenge_data[x].completedIds.includes(parseInt(key)))
			};
		}));
	}, [mastery_data]);

	const SortButton = ({ column, children }: { column: any; children: React.ReactNode }) => {
		return (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-transparent pl-0">
				{children}
				{column.getIsSorted() === "asc" ? (
					<ArrowUp className="ml-2 h-4 w-4" />
				) : column.getIsSorted() === "desc" ? (
					<ArrowDown className="ml-2 h-4 w-4" />
				) : (
					<ArrowUpDown className="ml-2 h-4 w-4" />
				)}
			</Button>
		);
	};

	const columns = useMemo<ColumnDef<RowData>[]>(() => [
		{
			accessorKey: "name",
			header: ({ column }) => <SortButton column={column}>Name</SortButton>
		},
		{
			accessorFn: (row) => ({ level: row.level, points: row.points }),
			id: "mastery",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => {
						const nextSortType = {
							level_asc: 'level_desc',
							level_desc: 'points_asc',
							points_asc: 'points_desc',
							points_desc: 'level_asc'
						}[mastery_sort] as typeof mastery_sort;
						setMasterySort(nextSortType);
						column.toggleSorting(nextSortType.endsWith('desc'));
					}}
					className="hover:bg-transparent pl-0 w-[150px] justify-start"
				>
					Mastery
					{!column.getIsSorted() ? <ArrowUpDown className="ml-2 h-4 w-4" /> : <>
						{mastery_sort === 'level_asc' && <> (level) <ArrowUp className="ml-2 h-4 w-4" /></>}
						{mastery_sort === 'level_desc' && <> (level) <ArrowDown className="ml-2 h-4 w-4" /></>}
						{mastery_sort === 'points_asc' && <> (points) <ArrowUp className="ml-2 h-4 w-4" /></>}
						{mastery_sort === 'points_desc' && <> (points) <ArrowDown className="ml-2 h-4 w-4" /></>}
					</>}
				</Button>
			),
			sortingFn: (a, b) => {
				const aValue = a.getValue("mastery") as { points: number; level: number };
				const bValue = b.getValue("mastery") as { points: number; level: number };
				console.log(mastery_sort);
				if (mastery_sort.startsWith('level') && aValue.level !== bValue.level) {
					return aValue.level - bValue.level;
				} else {
					return aValue.points - bValue.points;
				}
			},
			cell: ({ row }) => (
				<div className="flex items-center space-x-2">
					<span className="text-sm font-medium w-6">{row.original.level}</span>
					<div className="flex-grow">
						<div className="flex justify-between mb-1">
							<span className="text-sm font-medium">{row.original.points} (+{row.original.next_progress > 0 ? row.original.next_progress : "ready to level"})</span>
						</div>
						<Progress value={row.original.points / (row.original.points + row.original.next_progress) * 100} className="w-full h-1" />
					</div>
				</div>
			)
		},
		{
			accessorKey: "icons",
			header: ({ column }) => <SortButton column={column}>Marks</SortButton>,
			cell: ({ row }) => (
				<div className="flex space-x-1">
					{[...Array(row.original.icons)].map((_e, index) => (
						<img src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-collections/global/default/images/mastery-header/mark-token.svg" alt="mark of mastery" key={index} width={24} />
					))}
				</div>
			)
		},
		{
			accessorKey: "grades",
			header: ({ column }) => <SortButton column={column}>Grades</SortButton>,
			cell: ({ row }) => (
				<div className="flex space-x-1">
					{row.original.grades.map((item, index) => (
						<div
							key={index}
							className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
								item.filled
									? 'bg-primary text-primary-foreground'
									: 'border border-primary text-primary'
							}`}
						>
							{item.letter}
						</div>
					))}
				</div>
			)
		},
		...tracked_challenges.map((column, index) => ({
			id: column.toString(),
			accessorFn: (row: { checks: boolean[] }) => row.checks[index],
			header: ({ column: tableColumn }: { column: Column<RowData> }) => (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<SortButton column={tableColumn}>
								<img
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/challenges/` + lcu_challenge_data[column]?.levelToIconPath[lcu_challenge_data[column].currentLevel].substring(40).toLowerCase() || ""}
									alt="icon" className="w-6 h-6" />
							</SortButton>
						</TooltipTrigger>
						<TooltipContent>
							{`${(lcu_challenge_data[column]?.description)} (${lcu_challenge_data[column]?.currentValue} / ${lcu_challenge_data[column]?.thresholds["MASTER"].value})`}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

			),
			cell: ({ row }: { row: Row<RowData> }) => (
				<div className="flex justify-center">
					{row.original.checks[index] ? (
						<Check size={16} className="text-green-500" />
					) : (
						<X size={16} className="text-red-500" />
					)}
				</div>
			)
		}))
	], [mastery_sort, lcu_challenge_data]);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting
		}
	});

	return (
		<div className="container mx-auto">
			<div className="grid gap-4 md:grid-cols-2 mb-6">
				<Card>
					<CardHeader>
						<CardTitle>Mastery Challenges</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-2 gap-x-4 gap-y-8">
						{mastery_challenges.map((resource, index) => (
							<div key={index} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<img
											src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/challenges/` + lcu_challenge_data[resource]?.levelToIconPath[lcu_challenge_data[resource].currentLevel].substring(40).toLowerCase() || ""}
											alt="icon" width={16} height={16} />
										<p className="text-sm font-medium">{lcu_challenge_data[resource].name}</p>
									</div>
									<span className="text-sm font-medium">{format_number_comma(lcu_challenge_data[resource].currentValue)}</span>
								</div>
								<div className="relative">
									<Progress value={lcu_challenge_data[resource].currentValue / lcu_challenge_data[resource].thresholds["MASTER"].value * 100} className="h-2" />
									<div
										className="absolute top-0 w-px h-3 bg-black"
										style={{ left: `${lcu_challenge_data[resource].thresholds[rank_order[rank_index(lcu_challenge_data[resource].currentLevel) - 1]].value / lcu_challenge_data[resource].thresholds["MASTER"].value * 100}%` }}
									>
										<span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
											{format_number(lcu_challenge_data[resource].thresholds[rank_order[rank_index(lcu_challenge_data[resource].currentLevel) - 1]].value)}
										</span>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Mastery Class Challenges</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-2 gap-4">
						{Array.from({ length: 6 }).map((_, index) => {
							const v1 = lcu_challenge_data[mastery_class_challenges_10[index]].currentValue;
							const v2 = lcu_challenge_data[mastery_class_challenges_7[index]].currentValue - v1;
							const masters_threshold = lcu_challenge_data[mastery_class_challenges_7[index]].thresholds["MASTER"].value;
							if (masters_threshold != lcu_challenge_data[mastery_class_challenges_10[index]].thresholds["MASTER"].value) {
								console.log("mismatched thresholds");
							}
							const class_champions = Object.values(champion_map).filter(champion => champion.roles.includes(classes[index].toLowerCase())).length;
							return (
								<div key={index} className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium">{classes[index]} Mastery</p>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="text-xs text-muted-foreground">
														{v1} / {v2} / {masters_threshold} / {class_champions}
													</span>
												</TooltipTrigger>
												<TooltipContent>
													<span>m10: {v1} m7: {v2} masters threshold: {masters_threshold} total champs in class: {class_champions}</span>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<div className="flex h-2 rounded-full overflow-hidden">
										<div
											className="bg-blue-500"
											style={{ width: `${v1 / lcu_challenge_data[mastery_class_challenges_7[index]].thresholds["MASTER"].value * 100}%` }}
										/>
										<div
											className="bg-green-500"
											style={{ width: `${v2 / lcu_challenge_data[mastery_class_challenges_10[index]].thresholds["MASTER"].value * 100}%` }}
										/>
									</div>
								</div>
							);
						})}
					</CardContent>
				</Card>
			</div>
			<div className="mb-4">
				<h2 className="text-lg font-semibold mb-2">Show/Hide Columns</h2>
				<div className="flex flex-wrap gap-4">
					{table.getAllLeafColumns().map(column => {
						if (isNaN(parseInt(column.id))) {
							return null;
						}
						return (
							<div key={column.id} className="flex items-center space-x-2">
								<Checkbox
									id={`column-${column.id}`}
									checked={column.getIsVisible()}
									onCheckedChange={() => column.toggleVisibility()}
								/>
								<label
									htmlFor={`column-${column.id}`}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{lcu_challenge_data[parseInt(column.id)]?.name || "loading"}
								</label>
							</div>
						);
					})}
				</div>
			</div>
			{lcu_challenge_data ?
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										const isIconColumn = tracked_challenges.some(col => col.toString() === header.id);
										return (
											<TableHead key={header.id} className={`${isIconColumn ? 'px-0 w-[60px]' : 'px-2'}`}>
												{header.isPlaceholder
													? null
													: flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="px-2">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div> : <></>}
		</div>
	);
}