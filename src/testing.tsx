"use client"

import React, { useState, useMemo } from "react"
import { Check, X, User, BarChart, Settings, Bell, Mail, ArrowUpDown, ArrowUp, ArrowDown, Search, RefreshCw, Cpu, HardDrive, Medal, Server } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table"

const iconSet = [User, BarChart, Settings, Bell, Mail]

const generateRandomIcons = (min: number, max: number) => {
	const count = Math.floor(Math.random() * (max - min + 1)) + min
	return Array.from({ length: count }, () => iconSet[Math.floor(Math.random() * iconSet.length)])
}

const generateCircledLetters = () => {
	const count = Math.floor(Math.random() * 4) + 2 // 2 to 5 letters
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	return Array.from({ length: count }, () => ({
		letter: letters[Math.floor(Math.random() * letters.length)],
		filled: Math.random() < 0.5
	}))
}

const generateRandomData = () => Array.from({ length: 20 }, (_, i) => ({
	id: i + 1,
	name: `Person ${i + 1}`,
	number: Math.floor(Math.random() * 99) + 1,
	progress: Math.floor(Math.random() * 101),
	icons: generateRandomIcons(3, 5),
	circledLetters: generateCircledLetters(),
	checks: Array.from({ length: 5 }, () => Math.random() > 0.5)
}))

const iconColumns = [
	{ icon: User, label: "User" },
	{ icon: BarChart, label: "Chart" },
	{ icon: Settings, label: "Settings" },
	{ icon: Bell, label: "Notifications" },
	{ icon: Mail, label: "Mail" }
]

export default function Dashboard() {
	const [data, setData] = useState(generateRandomData())
	const [sorting, setSorting] = useState<SortingState>([])
	const [progressSortType, setProgressSortType] = useState<'leftAsc' | 'leftDesc' | 'progressAsc' | 'progressDesc'>('leftAsc')
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const refreshData = () => {
		setData(generateRandomData())
	}

	const SortButton = ({ column, children }: { column: any; children: React.ReactNode }) => {
		return (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="hover:bg-transparent"
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
		)
	}

	const columns = useMemo<ColumnDef<typeof data[0]>[]>(() => [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<SortButton column={column}>Name</SortButton>
						</TooltipTrigger>
						<TooltipContent>
							<p>Sort by name</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
		},
		{
			accessorFn: (row) => ({ left: row.number, progress: row.progress }),
			id: "progress",
			header: ({ column }) => (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								onClick={() => {
									const nextSortType = {
										leftAsc: 'leftDesc',
										leftDesc: 'progressAsc',
										progressAsc: 'progressDesc',
										progressDesc: 'leftAsc'
									}[progressSortType] as typeof progressSortType
									setProgressSortType(nextSortType)
									column.toggleSorting(nextSortType.endsWith('Asc'))
								}}
								className="hover:bg-transparent"
							>
								Progress
								{progressSortType === 'leftAsc' && <ArrowUp className="ml-2 h-4 w-4" />}
								{progressSortType === 'leftDesc' && <ArrowDown className="ml-2 h-4 w-4" />}
								{progressSortType === 'progressAsc' && <ArrowUp className="ml-2 h-4 w-4" />}
								{progressSortType === 'progressDesc' && <ArrowDown className="ml-2 h-4 w-4" />}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Sort by left number or progress</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
			sortingFn: (a, b) => {
				const aValue = a.getValue("progress") as { left: number; progress: number }
				const bValue = b.getValue("progress") as { left: number; progress: number }
				if (progressSortType.startsWith('left')) {
					return progressSortType === 'leftAsc' ? aValue.left - bValue.left : bValue.left - aValue.left
				} else {
					return progressSortType === 'progressAsc' ? aValue.progress - bValue.progress : bValue.progress - aValue.progress
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
			),
		},
		{
			accessorKey: "icons",
			header: ({ column }) => (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<SortButton column={column}>Icons</SortButton>
						</TooltipTrigger>
						<TooltipContent>
							<p>Sort by number of icons</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
			cell: ({ row }) => (
				<div className="flex space-x-1">
					{row.original.icons.map((Icon, index) => (
						<Icon key={index} size={16} />
					))}
				</div>
			),
		},
		{
			accessorKey: "circledLetters",
			header: ({ column }) => (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<SortButton column={column}>Circled Letters</SortButton>
						</TooltipTrigger>
						<TooltipContent>
							<p>Sort by number of circled letters</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
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
			),
		},
		...iconColumns.map((column, index) => ({
			id: column.label,
			accessorFn: (row: {checks: boolean[]}) => row.checks[index],
			header: ({ column: tableColumn }: {column: any}) => (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<SortButton column={tableColumn}>
								<column.icon size={16} />
							</SortButton>
						</TooltipTrigger>
						<TooltipContent>
							<p>Sort by {column.label} status</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
			cell: ({ row }: {row: {original: {checks: boolean[]}}}) => (
				<div className="flex justify-center">
					{row.original.checks[index] ? (
						<Check size={16} className="text-green-500" />
					) : (
						<X size={16} className="text-red-500" />
					)}
				</div>
			),
		})),
	], [progressSortType])

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnVisibility,
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
	})

	return (
		<div className="container mx-auto py-10">
			<div className="grid gap-4 md:grid-cols-2 mb-6">
				<Card>
					<CardHeader>
						<CardTitle>System Resources</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center space-x-4">
							<Cpu className="h-4 w-4 text-muted-foreground" />
							<div className="space-y-2 flex-1">
								<p className="text-sm font-medium">CPU Usage</p>
								<Progress value={75} className="h-2" />
							</div>
							<span className="text-sm font-medium">75%</span>
						</div>
						<div className="flex items-center space-x-4">
							<Medal className="h-4 w-4 text-muted-foreground" />
							<div className="space-y-2 flex-1">
								<p className="text-sm font-medium">Memory Usage</p>
								<Progress value={60} className="h-2" />
							</div>
							<span className="text-sm font-medium">60%</span>
						</div>
						<div className="flex items-center space-x-4">
							<HardDrive className="h-4 w-4 text-muted-foreground" />
							<div className="space-y-2 flex-1">
								<p className="text-sm font-medium">Disk Usage</p>
								<Progress value={40} className="h-2" />
							</div>
							<span className="text-sm font-medium">40%</span>
						</div>
						<div className="flex items-center space-x-4">
							<Server className="h-4 w-4 text-muted-foreground" />
							<div className="space-y-2 flex-1">
								<p className="text-sm font-medium">Network Usage</p>
								<Progress value={85} className="h-2" />
							</div>
							<span className="text-sm font-medium">85%</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Project Progress</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{Array.from({ length: 6 }).map((_, index) => {
							const value1 = Math.floor(Math.random() * 101)
							const value2 = Math.floor(Math.random() * (101 - value1))
							return (
								<div key={index} className="space-y-2">
									<p className="text-sm font-medium">Project {index + 1}</p>
									<div className="flex h-2 rounded-full overflow-hidden">
										<div
											className="bg-blue-500"
											style={{ width: `${value1}%` }}
										/>
										<div
											className="bg-green-500"
											style={{ width: `${value2}%` }}
										/>
									</div>
								</div>
							)
						})}
					</CardContent>
				</Card>
			</div>
			<div className="mb-4 sticky top-0 bg-background z-20 pb-4">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
					<div>
						<h2 className="text-lg font-semibold mb-2">Show/Hide Columns</h2>
						<div className="flex flex-wrap gap-4">
							{table.getAllLeafColumns().map((column) => {
								return (
									<div key={column.id} className="flex items-center space-x-2">
										<Checkbox
											id={`column-${column.id}`}
											checked={column.getIsVisible()}
											onCheckedChange={(value) => column.toggleVisibility(!!value)}
										/>
										<label
											htmlFor={`column-${column.id}`}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowe
d peer-disabled:opacity-70"
										>
											{column.id === "progress" ? (
												"Progress"
											) : column.id === "circledLetters" ? (
												"Circled Letters"
											) : column.id === "icons" ? (
												"Icons"
											) : iconColumns.find(ic => ic.label === column.id) ? (
												<span className="flex items-center">
                          {iconColumns.find(ic => ic.label === column.id)?.icon &&
	                          React.createElement(iconColumns.find(ic => ic.label === column.id)!.icon, { size: 16, className: "mr-1" })}
													{column.id}
                        </span>
											) : (
												column.id
											)}
										</label>
									</div>
								)
							})}
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Search className="h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search names..."
							value={globalFilter ?? ''}
							onChange={(event) => setGlobalFilter(event.target.value)}
							className="max-w-sm"
						/>
						<Button onClick={refreshData} variant="outline" size="icon">
							<RefreshCw className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
			<div className="rounded-md border">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="sticky top-[165px] bg-background z-10">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										const isIconColumn = iconColumns.some(col => col.label === header.id)
										return (
											<TableHead key={header.id} className={`px-2 ${isIconColumn ? 'w-[100px]' : ''}`}>
												{header.isPlaceholder
													? null
													: flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
											</TableHead>
										)
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
		</div>
	)
}