"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star, Shield, Zap, Sword } from "lucide-react"

type InventoryItem = {
	id: number
	name: string
	owned: number
	inLoot: number
	notOwned: number
	description: string
}

const inventoryData: InventoryItem[] = [
	{ id: 1, name: "Sword", owned: 2, inLoot: 1, notOwned: 7, description: "A sharper blade for close combat" },
	{ id: 2, name: "Shield", owned: 3, inLoot: 0, notOwned: 7, description: "Protective gear to block attacks" },
	{ id: 3, name: "Potion", owned: 5, inLoot: 2, notOwned: 3, description: "Magical elixir for healing" },
	{ id: 4, name: "Armor", owned: 1, inLoot: 3, notOwned: 6, description: "Heavy-duty protection for your body" },
	{ id: 5, name: "Bow", owned: 0, inLoot: 1, notOwned: 9, description: "Ranged weapon for precise attacks" },
]

const icons = [
	{ component: Star, label: "Starred item" },
	{ component: Shield, label: "Protected item" },
	{ component: Zap, label: "Powered item" },
	{ component: Sword, label: "Enchanted item" },
]

const ItemSquare = ({ item, status }: { item: InventoryItem; status: 'owned' | 'inLoot' | 'notOwned' }) => {
	const [leftIcon, setLeftIcon] = useState<typeof icons[number] | null>(null)
	const [rightIcon, setRightIcon] = useState<typeof icons[number] | null>(null)

	useEffect(() => {
		// Randomly decide if we should have a left icon, right icon, both, or neither
		const hasLeftIcon = Math.random() < 0.5
		const hasRightIcon = Math.random() < 0.5

		if (hasLeftIcon) {
			setLeftIcon(icons[Math.floor(Math.random() * icons.length)])
		}
		if (hasRightIcon) {
			setRightIcon(icons[Math.floor(Math.random() * icons.length)])
		}
	}, [])

	const colors = {
		owned: 'bg-green-200',
		inLoot: 'bg-yellow-200',
		notOwned: 'bg-red-200'
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<div className={`w-12 h-12 ${colors[status]} border border-gray-300 flex items-center justify-center text-2xl font-bold relative`}>
						{item.name[0]}
						{leftIcon && (
							<div className="absolute bottom-0 left-0 p-0.5 bg-white rounded-tr">
								<leftIcon.component size={12} aria-label={leftIcon.label} />
							</div>
						)}
						{rightIcon && (
							<div className="absolute bottom-0 right-0 p-0.5 bg-white rounded-tl">
								<rightIcon.component size={12} aria-label={rightIcon.label} />
							</div>
						)}
					</div>
				</TooltipTrigger>
				<TooltipContent side="right" className="w-64 p-0">
					<div className="bg-white rounded-lg shadow-lg overflow-hidden">
						<div className="bg-gray-200 h-32 flex items-center justify-center">
							<span className="text-4xl font-bold text-gray-500">{item.name}</span>
						</div>
						<div className="p-4">
							<h3 className="font-bold mb-2">{item.name}</h3>
							<p className="text-sm text-gray-600">{item.description}</p>
						</div>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

const ItemCell = ({ item, count, status }: { item: InventoryItem; count: number; status: 'owned' | 'inLoot' | 'notOwned' }) => (
	<div className="flex flex-wrap gap-2">
		{Array.from({ length: count }).map((_, index) => (
			<ItemSquare key={index} item={item} status={status} />
		))}
	</div>
)

export default function Component() {
	return (
		<div className="overflow-auto max-h-[80vh] relative">
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
					{inventoryData.map((item) => (
						<TableRow key={item.id}>
							<TableCell className="py-2 font-medium">{item.name}</TableCell>
							<TableCell className="py-2">
								<ItemCell item={item} count={item.owned} status="owned" />
							</TableCell>
							<TableCell className="py-2">
								<ItemCell item={item} count={item.inLoot} status="inLoot" />
							</TableCell>
							<TableCell className="py-2">
								<ItemCell item={item} count={item.notOwned} status="notOwned" />
							</TableCell>
							<TableCell className="py-2">
								{item.owned} + ({item.inLoot}) / {item.owned + item.inLoot + item.notOwned}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
