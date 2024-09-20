"use client"

import React, { useState, useMemo } from "react"
import { Check, X, User, BarChart, Settings, Bell, Mail, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
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

const data = Array.from({ length: 20 }, (_, i) => ({
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

const tracked_challenges=["Mail", "Notifications", "Settings", "User", "Chart"];

export default function Dashboard() {
	const [sorting, setSorting] = useState<SortingState>([])
	const [progressSortType, setProgressSortType] = useState<'leftAsc' | 'leftDesc' | 'progressAsc' | 'progressDesc'>('leftAsc')
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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
			header: ({ column }) => <SortButton column={column}>Name</SortButton>,
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
			header: ({ column }) => <SortButton column={column}>Icons</SortButton>,
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
			header: ({ column }) => <SortButton column={column}>Circled Letters</SortButton>,
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
			accessorFn: (row) => row.checks[index],
			header: ({ column: tableColumn }) => (
				<SortButton column={tableColumn}>
					<column.icon size={16} />
				</SortButton>
			),
			cell: ({ row }) => (
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
		state: {
			sorting,
			columnVisibility,
		},
	})

	return (
		<div className="container mx-auto py-10">
			<div className="mb-4 sticky top-0 bg-background z-10 pb-4">
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
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
			<div className="rounded-md border overflow-hidden">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="sticky bg-background z-10">
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