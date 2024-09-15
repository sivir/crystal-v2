import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, BarChart, Bell, Check, Mail, Settings, User, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Column, ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, Row, SortingState, useReactTable } from "@tanstack/react-table";
import { ChampionSummaryItem, MasteryData } from "@/lib/types.ts";

type RowData = {
	id: number;
	name: string;
	number: number;
	progress: number;
	icons: number;
	circledLetters: { letter: string; filled: boolean }[];
	checks: boolean[];
};

const iconColumns = [
	{ icon: User, label: "User" },
	{ icon: BarChart, label: "Chart" },
	{ icon: Settings, label: "Settings" },
	{ icon: Bell, label: "Notifications" },
	{ icon: Mail, label: "Mail" }
];

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

export default function Dashboard({ mastery_data, champion_map }: { mastery_data: MasteryData, champion_map: any }) {
	const [visibleColumns, setVisibleColumns] = useState(iconColumns.map(() => true));
	const [sorting, setSorting] = useState<SortingState>([]);
	const [progressSortType, setProgressSortType] = useState<'leftAsc' | 'leftDesc' | 'progressAsc' | 'progressDesc'>('leftAsc');

	const [data, setData] = useState<RowData[]>([]);

	useEffect(() => {
		setData(Object.entries(champion_map).map(([key, value]) => {
			const current_champion_mastery = mastery_data.find((mastery) => mastery.championId === parseInt(key)) || default_mastery_data;
			const grades = Object.entries(current_champion_mastery.nextSeasonMilestone.requireGradeCounts).flatMap(([key, value]) => Array(value).fill(key));
			//console.log(grades);
			const v = value as ChampionSummaryItem;
			return {
				id: parseInt(key),
				name: v.name,
				number: current_champion_mastery.championLevel,
				progress: current_champion_mastery.championPoints,
				//next_progress: 10,
				icons: current_champion_mastery.tokensEarned,
				circledLetters: grades.map((letter: string) => ({ letter: letter[0], filled: Math.random() < 0.5 })),
				checks: Array.from({ length: 5 }, () => Math.random() > 0.5)
			};
		}));
	}, [mastery_data]);

	const toggleColumn = (index: number) => {
		setVisibleColumns(prev => prev.map((value, i) => i === index ? !value : value));
	};

	const SortButton = ({ column, children }: { column: any; children: React.ReactNode }) => {
		return (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="hover:bg-transparent pl-0"
			>
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
			accessorFn: (row) => ({ left: row.number, progress: row.progress }),
			id: "progress",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => {
						const nextSortType = {
							leftAsc: 'leftDesc',
							leftDesc: 'progressAsc',
							progressAsc: 'progressDesc',
							progressDesc: 'leftAsc'
						}[progressSortType] as typeof progressSortType;
						setProgressSortType(nextSortType);
						column.toggleSorting(nextSortType.endsWith('Desc'));
					}}
					className="hover:bg-transparent pl-0 w-[150px] justify-start"
				>
					Mastery
					{!column.getIsSorted() ? <ArrowUpDown className="ml-2 h-4 w-4" /> : <>{progressSortType === 'leftAsc' && <ArrowUp className="ml-2 h-4 w-4" />}
						{progressSortType === 'leftDesc' && <ArrowDown className="ml-2 h-4 w-4" />}
						{progressSortType === 'progressAsc' && <> (points) <ArrowUp className="ml-2 h-4 w-4" /></>}
						{progressSortType === 'progressDesc' && <> (points) <ArrowDown className="ml-2 h-4 w-4" /></>}</>}


				</Button>
			),
			sortingFn: (a, b) => {
				const aValue = a.getValue("progress") as { left: number; progress: number };
				const bValue = b.getValue("progress") as { left: number; progress: number };
				if (progressSortType.startsWith('left')) {
					return aValue.left - bValue.left;
				} else {
					return aValue.progress - bValue.progress;
				}
			},
			cell: ({ row }) => (
				<div className="flex items-center space-x-2">
					<span className="text-sm font-medium w-6">{row.original.number}</span>
					<div className="flex-grow">
						<div className="flex justify-between mb-1">
							<span className="text-sm font-medium">{row.original.progress}/100</span>
						</div>
						<Progress value={row.original.progress} className="w-full h-1" />
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
			accessorKey: "circledLetters",
			header: ({ column }) => <SortButton column={column}>Grades</SortButton>,
			cell: ({ row }) => (
				<div className="flex space-x-1">
					{row.original.circledLetters.map((item, index) => (
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
		...iconColumns.map((column, index) => ({
			id: column.label,
			accessorFn: (row: { checks: boolean[] }) => row.checks[index],
			header: ({ column: tableColumn }: { column: Column<RowData> }) => (
				<SortButton column={tableColumn}>
					<column.icon size={16} />
				</SortButton>
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
	], [progressSortType]);

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
		<div className="container mx-auto py-10">
			<div className="mb-4">
				<h2 className="text-lg font-semibold mb-2">Show/Hide Columns</h2>
				<div className="flex flex-wrap gap-4">
					{iconColumns.map((column, index) => (
						<div key={index} className="flex items-center space-x-2">
							<Checkbox
								id={`column-${index}`}
								checked={visibleColumns[index]}
								onCheckedChange={() => toggleColumn(index)}
							/>
							<label
								htmlFor={`column-${index}`}
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								<column.icon className="inline-block mr-1" size={16} />
								{column.label}
							</label>
						</div>
					))}
				</div>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const isIconColumn = iconColumns.some(col => col.label === header.id);
									return (
										<TableHead key={header.id} className={`${isIconColumn ? 'px-0 w-[30px]' : 'px-2'}`}>
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
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
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
			</div>
		</div>
	);
}