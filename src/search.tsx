import { useState, useMemo, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, ArrowLeft, ArrowRight, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { default_riot_challenge_data, LCUChallengeData, RiotChallengeData } from "@/lib/types.ts";

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
			{ id: 'e', name: "Draft proposal", progress: 20 }
		]
	}
];

const ComparisonProgress = ({ currentProgress, comparedProgress }: { currentProgress: number, comparedProgress: number }) => {
	const difference = currentProgress - comparedProgress;
	const differenceColor = difference > 0 ? "text-green-500" : difference < 0 ? "text-red-500" : "text-yellow-500";

	return (
		<div className="flex items-center space-x-2">
			<div className="w-5/12 flex items-center">
				<span className="text-xs font-semibold text-gray-700 w-12">{currentProgress}</span>
				<Progress value={currentProgress} className="h-2 flex-grow" />
			</div>
			<div className={`w-2/12 text-center text-sm font-bold ${differenceColor} flex justify-center items-center`}>
				{difference !== 0 && (
					difference > 0 ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />
				)}
				<span className="ml-1">{Math.abs(difference)}</span>
			</div>
			<div className="w-5/12 flex items-center">
				<Progress value={comparedProgress} className="h-2 flex-grow" />
				<span className="text-xs font-semibold text-gray-700 w-16 text-right">{comparedProgress}</span>
			</div>
		</div>
	);
};

const TaskList = ({ tasks, showComparison }) => {
	const [expandedTasks, setExpandedTasks] = useState({});

	const toggleTaskExpansion = (taskId) => {
		setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
	};

	return (
		<div className="space-y-3 m-0.5">
			{tasks.map((task) => (
				<div key={task.id} className="bg-white shadow rounded-lg p-3">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center">
							<img src={`https://raw.communitydragon.org/latest/game/assets/challenges/config/${task.id}/tokens/${task.current_level.toLowerCase()}.png`} alt="icon" width="32" className="mr-2" />
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
							currentProgress={task.current_progression}
							comparedProgress={task.comparedUserProgress}
						/>
					) : (
						<div className="flex items-center">
							<span className="text-xs font-semibold text-gray-700 w-16">{task.current_progression}</span>
							<Progress value={task.current_progression} className="h-2 flex-grow" />
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
	);
};

export default function Profile({ supabase, lcu_challenge_data }: { supabase: SupabaseClient, lcu_challenge_data: LCUChallengeData }) {
	//const [tasks, setTasks] = useState(tasksData);
	const [current_user_search, setUserSearch] = useState("");
	const [current_user, setCurrentUser] = useState("");
	const [current_user_data, setCurrentUserData] = useState<{ riot_data: RiotChallengeData }>({ riot_data: default_riot_challenge_data });
	const [compare_user_search, setCompareUserSearch] = useState("");
	const [compare_user, setCompareUser] = useState("");
	const [compare_user_data, setCompareUserData] = useState<{ riot_data: RiotChallengeData }>({ riot_data: default_riot_challenge_data });
	const [data, setData] = useState<any[]>([]);
	const [challenge_search, setChallengeSearch] = useState("");
	const isComparing = useMemo(() => compare_user !== "", [compare_user]);
	const [categories, setCategories] = useState<string[]>([]);
	const [current_filters, setCurrentFilters] = useState([]);
	const [filters, setFilters] = useState({
		Development: { Planning: false, Development: false, Testing: false },
		Documentation: { Documentation: false },
		Management: { DevOps: false, Security: false },
		Design: { Design: false },
		Other: { Analytics: false, Localization: false }
	});
	const [sortBy, setSortBy] = useState("id");

	useEffect(() => {
		if (current_user !== "") {
			supabase.functions.invoke("get-user", { body: { riot_id: current_user } }).then(({ data }) => {
				setCurrentUserData(JSON.parse(data));
			});
		}
	}, [current_user]);

	useEffect(() => {
		if (compare_user !== "") {
			supabase.functions.invoke("get-user", { body: { riot_id: compare_user } }).then(({ data }) => {
				setCompareUserData(JSON.parse(data));
			});
		}
	}, [compare_user]);

	useEffect(() => {
		if (current_user_data.riot_data) {
			setData(Object.entries(lcu_challenge_data).map(([key, value]) => {
				const current_challenge_data = current_user_data.riot_data.challenges.find(x => x.challengeId === parseInt(key));
				return { ...value, id: key, current_progression: current_challenge_data?.value || 0, current_level: current_challenge_data?.level || "IRON" };
			}));
		} else {
			setData([]);
		}
	}, [current_user_data, lcu_challenge_data]);

	useEffect(() => {
		if (data.length > 0 && compare_user_data.riot_data) {
			setData(data.map(challenge => {
				const current_challenge_data = compare_user_data.riot_data.challenges.find(x => x.challengeId === parseInt(challenge.id));
				return { ...challenge, comparedUserProgress: current_challenge_data?.value || 0 };
			}));
		}
	}, [compare_user_data, lcu_challenge_data]);

	const handleFilterChange = (category, subcategory) => {
		setFilters(prev => ({
			...prev,
			[category]: {
				...prev[category],
				[subcategory]: !prev[category][subcategory]
			}
		}));
	};

	const filtered_data = useMemo(() => {
		return data.filter(challenge =>
			(challenge.name.toLowerCase().includes(challenge_search.toLowerCase()) || challenge.description.toLowerCase().includes(challenge_search.toLowerCase())) &&
			(Object.values(filters).every(category => Object.values(category).every(v => !v)) || Object.values(filters).some(category => category[challenge.category]))
		).sort((a, b) => {
			if (sortBy === "name") return a.name.localeCompare(b.name);
			if (sortBy === "progress_desc") return b.current_progression - a.current_progression;
			if (sortBy === "progress_asc") return a.current_progression - b.current_progression;
			if (sortBy === "category") return a.category.localeCompare(b.category);
			if (sortBy === "id") return a.id - b.id;
			if (sortBy === "diff_asc") return (b.current_progression - b.comparedUserProgress) - (a.current_progression - a.comparedUserProgress);
			if (sortBy === "diff_desc") return (a.current_progression - a.comparedUserProgress) - (b.current_progression - b.comparedUserProgress);
			return 0;
		});
	}, [data, challenge_search, filters, sortBy]);

	return (
		<div className="container mx-auto p-4 max-w-7xl">
			<div className="sticky top-0 z-10 pb-4">
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
									placeholder="enter a riot id..."
									value={current_user_search}
									onChange={(e) => setUserSearch(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && setCurrentUser(current_user_search)}
									className="pl-8"
								/>
							</div>
							<Button onClick={() => setCurrentUser(current_user_search)} className="ml-2">
								Search
							</Button>
						</div>
					</div>
					{current_user ? <>
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
										placeholder="enter a riot id to compare with..."
										value={compare_user_search}
										onChange={(e) => setCompareUserSearch(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && setCompareUser(compare_user_search)}
										className="pl-8"
									/>
								</div>
								<Button onClick={() => setCompareUser(compare_user_search)} className="ml-2">
									Compare
								</Button>
							</div>
						</div>
						<div>
							<label htmlFor="taskSearch" className="text-sm font-medium text-gray-700 mb-1 block">
								Search Challenges
							</label>
							<div className="relative">
								<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
								<Input
									id="taskSearch"
									type="text"
									placeholder="Search challenges..."
									value={challenge_search}
									onChange={(e) => setChallengeSearch(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
					</> : <></>}
				</div>
			</div>

			{current_user ? current_user_data ? (
				<div className="flex flex-col md:flex-row gap-6">
					<div className="md:w-3/4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Challenge progress for {current_user} {isComparing && `(compared to ${compare_user})`}</h2>
							{isComparing && (
								<Button onClick={() => setCompareUser("")} variant="outline" size="sm">
									<X className="w-4 h-4 mr-2" />
									Cancel Comparison
								</Button>
							)}
						</div>
						<div className="overflow-y-auto max-h-[calc(100vh-300px)]">
							<TaskList tasks={filtered_data} showComparison={isComparing} />
						</div>
					</div>
					<div className="md:w-1/4">
						<div className="sticky top-[120px]">
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
										<SelectItem value="id">Default Sort (ID)</SelectItem>
										<SelectItem value="name">Sort by Name</SelectItem>
										<SelectItem value="progress_asc">Sort by Progress (Ascending)</SelectItem>
										<SelectItem value="progress_desc">Sort by Progress (Descending)</SelectItem>
										<SelectItem value="category">Sort by Category</SelectItem>
										{isComparing && <SelectItem value="diff_asc">Sort by Difference (Ascending)</SelectItem>}
										{isComparing && <SelectItem value="diff_desc">Sort by Difference (Descending)</SelectItem>}
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
			) : <div className="text-center text-gray-500 mt-8">
				loading
			</div> : (
				<div className="text-center text-gray-500 mt-8">
					select a user to view challenges
				</div>
			)}
		</div>
	);
}