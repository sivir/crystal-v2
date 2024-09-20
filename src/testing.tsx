import { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Circle, Search, User, ArrowLeft, ArrowRight, X, Filter, ChevronDown, ChevronUp } from "lucide-react"

const tasksData = [
	{
		id: 1,
		name: "Complete project proposal",
		description: "Draft and finalize the project proposal document",
		currentUserProgress: 75,
		comparedUserProgress: 60,
		category: "Planning",
		subtasks: [
			{ id: 'a', name: "Research market trends", progress: 100 },
			{ id: 'b', name: "Define project scope", progress: 80 },
			{ id: 'c', name: "Estimate resources", progress: 60 },
			{ id: 'd', name: "Create timeline", progress: 40 },
			{ id: 'e', name: "Draft proposal", progress: 20 },
		]
	},
	{ id: 2, name: "Review code changes", description: "Go through recent pull requests and provide feedback", currentUserProgress: 30, comparedUserProgress: 80, category: "Development" },
	{ id: 3, name: "Update documentation", description: "Revise and update the API documentation", currentUserProgress: 100, comparedUserProgress: 40, category: "Documentation" },
	{ id: 4, name: "Fix bug in login flow", description: "Investigate and resolve the issue with user authentication", currentUserProgress: 50, comparedUserProgress: 90, category: "Development" },
	{
		id: 5,
		name: "Implement new feature",
		description: "Develop the user profile customization feature",
		currentUserProgress: 20,
		comparedUserProgress: 15,
		category: "Development",
		subtasks: [
			{ id: 'a', name: "Design UI mockups", progress: 100 },
			{ id: 'b', name: "Implement frontend", progress: 60 },
			{ id: 'c', name: "Develop backend API", progress: 40 },
			{ id: 'd', name: "Write unit tests", progress: 20 },
			{ id: 'e', name: "Perform integration testing", progress: 0 },
		]
	},
	{ id: 6, name: "Optimize database queries", description: "Improve performance of slow database operations", currentUserProgress: 80, comparedUserProgress: 70, category: "Development" },
	{ id: 7, name: "Write unit tests", description: "Increase test coverage for core modules", currentUserProgress: 60, comparedUserProgress: 55, category: "Testing" },
	{ id: 8, name: "Refactor legacy code", description: "Modernize and improve maintainability of old codebase", currentUserProgress: 40, comparedUserProgress: 30, category: "Development" },
	{ id: 9, name: "Create user guide", description: "Write comprehensive guide for new system features", currentUserProgress: 90, comparedUserProgress: 95, category: "Documentation" },
	{ id: 10, name: "Set up CI/CD pipeline", description: "Implement automated testing and deployment workflow", currentUserProgress: 70, comparedUserProgress: 85, category: "DevOps" },
	{ id: 11, name: "Conduct security audit", description: "Perform thorough security check of the application", currentUserProgress: 25, comparedUserProgress: 20, category: "Security" },
	{ id: 12, name: "Design mobile UI", description: "Create responsive designs for mobile app version", currentUserProgress: 55, comparedUserProgress: 50, category: "Design" },
	{ id: 13, name: "Implement data analytics", description: "Set up data collection and analysis for user behavior", currentUserProgress: 35, comparedUserProgress: 45, category: "Analytics" },
	{ id: 14, name: "Localize application", description: "Add multi-language support to the application", currentUserProgress: 15, comparedUserProgress: 10, category: "Localization" },
]

const ComparisonProgress = ({ currentProgress, comparedProgress }) => {
	const difference = currentProgress - comparedProgress
	const differenceColor = difference > 0 ? "text-green-500" : difference < 0 ? "text-red-500" : "text-yellow-500"

	return (
		<div className="flex items-center space-x-2">
			<div className="w-5/12 flex items-center">
				<span className="text-xs font-semibold text-gray-700 w-12">You: {currentProgress}%</span>
				<Progress value={currentProgress} className="h-2 flex-grow" />
			</div>
			<div className={`w-2/12 text-center text-sm font-bold ${differenceColor} flex justify-center items-center`}>
				{difference !== 0 && (
					difference > 0 ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />
				)}
				<span className="ml-1">{Math.abs(difference)}%</span>
			</div>
			<div className="w-5/12 flex items-center">
				<Progress value={comparedProgress} className="h-2 flex-grow" />
				<span className="text-xs font-semibold text-gray-700 w-16 text-right">Other: {comparedProgress}%</span>
			</div>
		</div>
	)
}

const TaskList = ({ tasks, showComparison }) => {
	const [expandedTasks, setExpandedTasks] = useState({})

	const toggleTaskExpansion = (taskId) => {
		setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
	}

	return (
		<div className="space-y-3">
			{tasks.map((task) => (
				<div key={task.id} className="bg-white shadow rounded-lg p-3 m-1">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center">
							{task.currentUserProgress === 100 ? (
								<CheckCircle className="text-green-500 flex-shrink-0 mr-2" size={24} />
							) : (
								<Circle className="text-blue-500 flex-shrink-0 mr-2" size={24} />
							)}
							<div>
								<h2 className="text-sm font-semibold">{task.name}</h2>
								<p className="text-xs text-gray-600">{task.description}</p>
							</div>
						</div>
						<div className="flex items-center">
							<span className="text-xs font-medium text-gray-500 mr-2">{task.category}</span>
							{task.subtasks && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => toggleTaskExpansion(task.id)}
									className="text-xs"
								>
									{expandedTasks[task.id] ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
									{expandedTasks[task.id] ? 'Hide' : 'Show More'}
								</Button>
							)}
						</div>
					</div>
					{showComparison ? (
						<ComparisonProgress
							currentProgress={task.currentUserProgress}
							comparedProgress={task.comparedUserProgress}
						/>
					) : (
						<div className="flex items-center">
							<span className="text-xs font-semibold text-gray-700 w-16">Progress: {task.currentUserProgress}%</span>
							<Progress value={task.currentUserProgress} className="h-2 flex-grow" />
						</div>
					)}
					{task.subtasks && expandedTasks[task.id] && (
						<div className="mt-2 space-y-2">
							{task.subtasks.map(subtask => (
								<div key={subtask.id} className="flex items-center text-sm">
									<span className="w-1/3 truncate">{subtask.name}</span>
									<Progress value={subtask.progress} className="h-2 flex-grow mx-2" />
									<span className="text-xs font-semibold text-gray-700 w-12">{subtask.progress}%</span>
								</div>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	)
}

export default function Component() {
	const [tasks, setTasks] = useState(tasksData)
	const [currentUser, setCurrentUser] = useState("")
	const [compareUser, setCompareUser] = useState("")
	const [taskSearch, setTaskSearch] = useState("")
	const [isComparing, setIsComparing] = useState(false)
	const [filters, setFilters] = useState({
		Development: { Planning: false, Development: false, Testing: false },
		Documentation: { Documentation: false },
		Management: { DevOps: false, Security: false },
		Design: { Design: false },
		Other: { Analytics: false, Localization: false },
	})
	const [sortBy, setSortBy] = useState("name")

	const handleCompare = () => {
		if (compareUser.trim() !== "") {
			setIsComparing(true)
		}
	}

	const handleCancelComparison = () => {
		setIsComparing(false)
		setCompareUser("")
	}

	const handleFilterChange = (category, subcategory) => {
		setFilters(prev => ({
			...prev,
			[category]: {
				...prev[category],
				[subcategory]: !prev[category][subcategory]
			}
		}))
	}

	const filteredTasks = useMemo(() => {
		return tasks.filter(task =>
			(task.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
				task.description.toLowerCase().includes(taskSearch.toLowerCase())) &&
			(Object.values(filters).every(category => Object.values(category).every(v => !v)) ||
				Object.values(filters).some(category => category[task.category]))
		).sort((a, b) => {
			if (sortBy === "name") return a.name.localeCompare(b.name)
			if (sortBy === "progress") return b.currentUserProgress - a.currentUserProgress
			if (sortBy === "category") return a.category.localeCompare(b.category)
			return 0
		})
	}, [tasks, taskSearch, filters, sortBy])

	return (
		<div className="container mx-auto p-4 max-w-7xl">
			<div className="sticky top-0 bg-gray-100 z-10 pb-4">
				<h1 className="text-2xl font-bold mb-4">User Tasks</h1>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div>
						<label htmlFor="currentUser" className="text-sm font-medium text-gray-700 mb-1 block">
							Current User
						</label>
						<div className="flex">
							<div className="relative flex-grow">
								<User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
								<Input
									id="currentUser"
									type="text"
									placeholder="Enter current username..."
									value={currentUser}
									onChange={(e) => setCurrentUser(e.target.value)}
									className="pl-8"
								/>
							</div>
							<Button onClick={() => setCurrentUser(currentUser)} className="ml-2">
								Search
							</Button>
						</div>
					</div>
					<div>
						<label htmlFor="compareUser" className="text-sm font-medium text-gray-700 mb-1 block">
							Compare with User
						</label>
						<div className="flex">
							<div className="relative flex-grow">
								<User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
								<Input
									id="compareUser"
									type="text"
									placeholder="Enter username to compare..."
									value={compareUser}
									onChange={(e) => setCompareUser(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && handleCompare()}
									className="pl-8"
								/>
							</div>
							<Button onClick={handleCompare} className="ml-2">
								Compare
							</Button>
						</div>
					</div>
					<div>
						<label htmlFor="taskSearch" className="text-sm font-medium text-gray-700 mb-1 block">
							Search Tasks
						</label>
						<div className="relative">
							<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
							<Input
								id="taskSearch"
								type="text"
								placeholder="Search tasks..."
								value={taskSearch}
								onChange={(e) => setTaskSearch(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>
				</div>
			</div>

			{currentUser ? (
				<div className="flex flex-col md:flex-row gap-6">
					<div className="md:w-3/4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Tasks for {currentUser} {isComparing && `(compared to ${compareUser})`}</h2>
							{isComparing && (
								<Button onClick={handleCancelComparison} variant="outline" size="sm">
									<X className="w-4 h-4 mr-2" />
									Cancel Comparison
								</Button>
							)}
						</div>
						<div className="overflow-y-auto max-h-[calc(100vh-300px)]">
							<TaskList tasks={filteredTasks} showComparison={isComparing} />
						</div>
					</div>
					<div className="md:w-1/4">
						<div className="sticky top-[220px]">
							<h3 className="text-lg font-semibold mb-2 flex items-center">
								<Filter className="w-5 h-5 mr-2" />
								Filters
							</h3>
							<div className="mb-4">
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger>
										<SelectValue placeholder="Sort by..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="name">Sort by Name</SelectItem>
										<SelectItem value="progress">Sort by Progress</SelectItem>
										<SelectItem value="category">Sort by Category</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-4">
								{Object.entries(filters).map(([category, subcategories]) => (
									<div key={category}>
										<h4 className="font-medium mb-2">{category}</h4>
										<div className="space-y-2">
											{Object.entries(subcategories).map(([subcategory, isChecked]) => (
												<div key={subcategory} className="flex items-center">
													<Checkbox
														id={`${category}-${subcategory}`}
														checked={isChecked}
														onCheckedChange={() => handleFilterChange(category, subcategory)}
													/>
													<label htmlFor={`${category}-${subcategory}`} className="ml-2 text-sm font-medium text-gray-700">
														{subcategory}
													</label>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="text-center text-gray-500 mt-8">
					Please select a user to view tasks.
				</div>
			)}

			{isComparing && (
				<div className="mt-6">
					<h3 className="text-md font-semibold mb-2">Progress Comparison Legend</h3>
					<div className="flex space-x-4 text-sm">
						<div className="flex items-center">
							<div className="w-4 h-2 bg-blue-500 mr-2"></div>
							<span>Your progress</span>
						</div>
						<div className="flex items-center">
							<div className="w-4 h-2 bg-blue-500 mr-2"></div>
							<span>Other user's progress</span>
						</div>
						<div className="flex items-center">
							<ArrowLeft className="w-4 h-4 text-green-500 mr-1" />
							<span>You're ahead</span>
						</div>
						<div className="flex items-center">
							<ArrowRight className="w-4 h-4 text-red-500 mr-1" />
							<span>You're behind</span>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}