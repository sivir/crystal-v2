import React from 'react'
import { Card } from "@/components/ui/card"

const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve']
const columnCount = 15
const rowCount = 6

function generateRandomNumber() {
	return Math.floor(Math.random() * 20) + 1
}

function calculateColumnSum(column: number[]) {
	return column.reduce((sum, num) => sum + Math.min(num, 10), 0) / 5
}

export default function GridWithIcons() {
	// Generate random data
	const data = Array.from({ length: rowCount - 1 }, () =>
		Array.from({ length: columnCount }, generateRandomNumber)
	)

	// Calculate sums and sort columns
	const sums = data[0].map((_, colIndex) => calculateColumnSum(data.map(row => row[colIndex])))
	const sortedIndices = sums.map((_, index) => index).sort((a, b) => sums[a] - sums[b])

	return (
		<Card className="p-4 overflow-x-auto">
			<div className="grid grid-cols-[auto_repeat(15,minmax(60px,1fr))] gap-2">
				{/* Header row */}
				<div className="font-bold">Name</div>
				{sortedIndices.map(index => (
					<div key={`header-${index}`}></div> // Empty div to maintain grid structure
				))}

				{/* Data rows */}
				{names.map((name, rowIndex) => (
					<React.Fragment key={`row-${rowIndex}`}>
						<div className="font-semibold">{name}</div>
						{sortedIndices.map(colIndex => (
							<div key={`cell-${rowIndex}-${colIndex}`}>
								<div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto relative">
				                  <span className="absolute bottom-0 right-0 text-xs font-semibold bg-white/70 px-1 rounded-bl-md rounded-tr-md">
				                    {data[rowIndex][colIndex]}
				                  </span>
								</div>
							</div>
						))}
					</React.Fragment>
				))}

				{/* Sum row */}
				<div className="font-semibold">Sum / 5</div>
				{sortedIndices.map(colIndex => (
					<div key={`sum-${colIndex}`} className="text-center font-semibold">
						{sums[colIndex].toFixed(2)}
					</div>
				))}
			</div>
		</Card>
	)
}