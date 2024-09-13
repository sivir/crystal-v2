import { Check, X, User, BarChart, Settings, Bell, Mail } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

const iconSet = [User, BarChart, Settings, Bell, Mail]

const generateRandomIcons = (min: number, max: number) => {
	const count = Math.floor(Math.random() * (max - min + 1)) + min
	return Array.from({ length: count }, () => iconSet[Math.floor(Math.random() * iconSet.length)])
}

const data = Array.from({ length: 5 }, (_, i) => ({
	id: i + 1,
	name: `Person ${i + 1}`,
	progress: Math.floor(Math.random() * 100),
	icons: generateRandomIcons(3, 5),
	checks: Array.from({ length: 5 }, () => Math.random() > 0.5)
}))

export default function Champions() {
	return (
		<div className="container mx-auto py-10">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Progress</TableHead>
						<TableHead>Icons</TableHead>
						<TableHead><User size={16} /></TableHead>
						<TableHead><BarChart size={16} /></TableHead>
						<TableHead><Settings size={16} /></TableHead>
						<TableHead><Bell size={16} /></TableHead>
						<TableHead><Mail size={16} /></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((row) => (
						<TableRow key={row.id}>
							<TableCell>{row.name}</TableCell>
							<TableCell>
								<div className="w-[100px]">
									<div className="flex justify-between mb-1">
										<span className="text-sm font-medium">{row.progress}%</span>
									</div>
									<Progress value={row.progress} className="w-full h-2" />
								</div>
							</TableCell>
							<TableCell>
								<div className="flex space-x-1">
									{row.icons.map((Icon, index) => (
										<Icon key={index} size={16} />
									))}
								</div>
							</TableCell>
							{row.checks.map((check, index) => (
								<TableCell key={index}>
									{check ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}