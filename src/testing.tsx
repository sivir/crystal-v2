"use client"

import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

// Generate sample data
const generateData = (count: number) => {
	return Array.from({ length: count }, (_, i) => ({
		id: i + 1,
		name: `Person ${i + 1}`,
		picture: "/placeholder.svg",
		numbers: [
			Math.floor(Math.random() * 100),
			Math.floor(Math.random() * 10000000)
		]
	}))
}

export default function Component() {
	const [tableData, setTableData] = useState(generateData(50))

	const handleRefresh = (id: number) => {
		setTableData(prevData =>
			prevData.map(item =>
				item.id === id
					? { ...item, numbers: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 10000000)] }
					: item
			)
		)
	}

	return (
		<div className="container mx-auto p-4">
			<div className="border rounded-lg overflow-hidden">
				<div className="max-h-[600px] overflow-auto">
					<table className="w-full">
						<thead className="bg-gray-100 sticky top-0">
						<tr>
							<th className="p-3 text-left">Profile</th>
							<th className="p-3 text-left" colSpan={2}>Numbers</th>
							<th className="p-3 w-20"></th>
						</tr>
						</thead>
						<tbody>
						{tableData.map((item) => (
							<tr key={item.id} className="border-t">
								<td className="p-3">
									<div className="flex items-center space-x-3">
										<img
											src={item.picture}
											alt={`${item.name}'s profile`}
											width={40}
											height={40}
											className="rounded-full"
										/>
										<span>{item.name}</span>
									</div>
								</td>
								<td className="p-3 pr-0 w-16">
									<span className="font-semibold">{item.numbers[0]}</span>
								</td>
								<td className="p-3 pl-2">
									<span className="font-semibold">{item.numbers[1].toLocaleString()}</span>
								</td>
								<td className="p-3">
									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleRefresh(item.id)}
										aria-label={`Refresh numbers for ${item.name}`}
									>
										<RefreshCw className="h-4 w-4" />
									</Button>
								</td>
							</tr>
						))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}