import { useState, useMemo, useRef, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import * as LucideIcons from 'lucide-react'
import { Copy, Info, Filter } from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"

const categories = [
	{ id: 'arrows', label: 'Arrows', group: 'Shapes', description: 'Directional icons', tooltip: 'Icons representing directional arrows' },
	{ id: 'shapes', label: 'Shapes', group: 'Shapes', subCategories: ['basic', 'complex'], tooltip: 'Basic and complex geometric shapes' },
	{ id: 'communication', label: 'Communication', group: 'Function', description: 'Messaging icons', tooltip: 'Icons related to communication and messaging' },
	{ id: 'files', label: 'Files', group: 'Function', description: 'Document-related icons', tooltip: 'Icons representing files and documents' },
	{ id: 'navigation', label: 'Navigation', group: 'Function', description: 'Wayfinding icons', tooltip: 'Icons used for navigation and wayfinding' },
	{ id: 'media', label: 'Media', group: 'Function', description: 'Multimedia icons', tooltip: 'Icons related to multimedia and playback' },
]

const icons = [
	{ name: 'ArrowUp', categories: ['arrows', 'navigation'] },
	{ name: 'ArrowDown', categories: ['arrows', 'navigation'] },
	{ name: 'ArrowLeft', categories: ['arrows', 'navigation'] },
	{ name: 'ArrowRight', categories: ['arrows', 'navigation'] },
	{ name: 'Circle', categories: ['shapes:basic'] },
	{ name: 'Square', categories: ['shapes:basic'] },
	{ name: 'Triangle', categories: ['shapes:basic'] },
	{ name: 'Hexagon', categories: ['shapes:complex'] },
	{ name: 'Pentagon', categories: ['shapes:complex'] },
	{ name: 'Octagon', categories: ['shapes:complex'] },
	{ name: 'Mail', categories: ['communication'] },
	{ name: 'MessageCircle', categories: ['communication', 'shapes:basic'] },
	{ name: 'Phone', categories: ['communication'] },
	{ name: 'Send', categories: ['communication', 'arrows'] },
	{ name: 'File', categories: ['files'] },
	{ name: 'FileText', categories: ['files'] },
	{ name: 'Folder', categories: ['files'] },
	{ name: 'Save', categories: ['files', 'media'] },
	{ name: 'Play', categories: ['media', 'shapes:basic'] },
	{ name: 'Pause', categories: ['media'] },
	{ name: 'Map', categories: ['navigation'] },
	{ name: 'Compass', categories: ['navigation', 'shapes:complex'] },
]

export default function Component() {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [shapeSubCategory, setShapeSubCategory] = useState('basic')
	const [columns, setColumns] = useState(4)
	const textAreaRef = useRef<HTMLTextAreaElement>(null)
	const gridRef = useRef<HTMLDivElement>(null)

	const handleCategoryChange = (category: string) => {
		setSelectedCategories(prev =>
			prev.includes(category)
				? prev.filter(c => c !== category)
				: [...prev, category]
		)
	}

	const handleShapeSubCategoryChange = (value: string) => {
		setShapeSubCategory(value)
	}

	const isIconVisible = (iconCategories: string[]) => {
		if (selectedCategories.length === 0) return true
		return selectedCategories.every(category =>
			iconCategories.includes(category) ||
			(category === 'shapes' && iconCategories.includes(`shapes:${shapeSubCategory}`))
		)
	}

	const visibleIcons = useMemo(() => {
		return icons.filter(icon => isIconVisible(icon.categories))
	}, [selectedCategories, shapeSubCategory])

	const categoryIconCounts = useMemo(() => {
		return categories.reduce((acc, category) => {
			if (category.id === 'shapes') {
				acc[category.id] = visibleIcons.filter(icon =>
					icon.categories.some(c => c.startsWith('shapes:'))
				).length
			} else {
				acc[category.id] = visibleIcons.filter(icon =>
					icon.categories.includes(category.id)
				).length
			}
			return acc
		}, {} as Record<string, number>)
	}, [visibleIcons])

	const totalIconCounts = useMemo(() => {
		return categories.reduce((acc, category) => {
			if (category.id === 'shapes') {
				acc[category.id] = icons.filter(icon =>
					icon.categories.some(c => c.startsWith('shapes:'))
				).length
			} else {
				acc[category.id] = icons.filter(icon =>
					icon.categories.includes(category.id)
				).length
			}
			return acc
		}, {} as Record<string, number>)
	}, [])

	const copyToClipboard = () => {
		if (textAreaRef.current) {
			textAreaRef.current.select()
			document.execCommand('copy')
		}
	}

	useEffect(() => {
		const handleResize = () => {
			if (gridRef.current) {
				const gridWidth = gridRef.current.offsetWidth
				const iconSize = 64 // 16px * 4 (w-16 class)
				const gap = 8 // 2px * 4 (gap-2 class)
				const newColumns = Math.floor((gridWidth + gap) / (iconSize + gap))
				setColumns(Math.max(1, newColumns))
			}
		}

		handleResize()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return (
		<div className="flex flex-col p-6 gap-6">
			<div className="flex gap-6">
				<div className="w-[28rem] space-y-8">
					{['Shapes', 'Function'].map(group => (
						<div key={group}>
							<h2 className="text-lg font-semibold mb-4">{group}</h2>
							<div className="space-y-2">
								{categories
									.filter(category => category.group === group)
									.map(category => (
										<div key={category.id} className="flex items-center space-x-2">
					                      <span className="w-12 text-xs text-gray-500 text-right">
					                        {categoryIconCounts[category.id]}/{totalIconCounts[category.id]}
					                      </span>
											<Checkbox
												id={category.id}
												checked={selectedCategories.includes(category.id)}
												onCheckedChange={() => handleCategoryChange(category.id)}
											/>
											<div className="flex items-center justify-between flex-1 min-w-0">
												<div className="flex items-center space-x-2">
													<Label htmlFor={category.id} className="flex-shrink-0">{category.label}</Label>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Info className="w-4 h-4 text-gray-400" />
															</TooltipTrigger>
															<TooltipContent>
																<p>{category.tooltip}</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
												<div className="text-right flex items-center space-x-2">
													{category.id === 'shapes' ? (
														<Select value={shapeSubCategory} onValueChange={handleShapeSubCategoryChange}>
															<SelectTrigger className="h-7 text-xs px-2 py-0">
																<SelectValue placeholder="Type" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="basic">Basic</SelectItem>
																<SelectItem value="complex">Complex</SelectItem>
															</SelectContent>
														</Select>
													) : (
														<span className="text-xs text-gray-500">{category.description}</span>
													)}
													<Filter className="w-4 h-4 text-gray-400" />
												</div>
											</div>
										</div>
									))}
							</div>
						</div>
					))}
				</div>
				<div className="flex-1">
					<div className="mb-4">
						<Textarea
							ref={textAreaRef}
							value={selectedCategories.length > 0 ? visibleIcons.map(icon => icon.name).join(', ') : ''}
							readOnly
							placeholder="Selected icons will appear here"
							className="w-full h-20 mb-2"
						/>
						<Button onClick={copyToClipboard} className="w-full" disabled={selectedCategories.length === 0}>
							<Copy className="w-4 h-4 mr-2" />
							Copy to Clipboard
						</Button>
					</div>
					<h2 className="text-lg font-semibold mb-4">Icons</h2>
					<div
						ref={gridRef}
						className={`grid gap-2`}
						style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
					>
						{visibleIcons.map(icon => {
							const IconComponent = LucideIcons[icon.name as keyof typeof LucideIcons]
							return (
								<div
									key={icon.name}
									className="flex items-center justify-center p-2 border rounded w-16 h-16"
									title={icon.name}
								>
									<IconComponent className="w-8 h-8" aria-label={icon.name} />
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}