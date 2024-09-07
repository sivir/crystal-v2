import "./App.css";
import {useEffect, useState} from "react";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {listen} from "@tauri-apps/api/event";
import Dashboard from "./Dashboard.tsx";

const current_window = getCurrentWindow();

/*
function App() {
	enum Page {
		Home,
		Settings,
		About,
	}

	const [lobby, setLobby] = useState("");
	const [page, setPage] = useState(Page.Home);

	useEffect(() => {
		const unlisten = listen("lobby", (event) => {
			setLobby(JSON.stringify(event.payload));
			console.log(event);
		});
		return () => {
			unlisten.then(f => f());
		}
	}, []);

	return (
		<>
			<div id="sidebar">
				<div id="logo" data-tauri-drag-region="true">
					<img src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/challenge-mini-crystal/challenger.svg" width="75" height="75" alt="crystal"/>
					crystal
				</div>
				<div id="sidebar-buttons-container">
					<div id="sidebar-buttons">
						<div className="sidebar-button" onClick={() => setPage(Page.Home)}>
							Home
						</div>
						<div className="sidebar-button" onClick={() => setPage(Page.Settings)}>
							Settings
						</div>
						<div className="sidebar-button" onClick={() => setPage(Page.About)}>
							About
						</div>
					</div>
				</div>
			</div>
			<div id="content">
				<div data-tauri-drag-region="true" id="titlebar">
					<div className="titlebar-button" id="titlebar-minimize">
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
							<path fill="white" d="M20 14H4v-4h16"/>
						</svg>
					</div>
					<div className="titlebar-button" id="titlebar-maximize">
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
							<path fill="white" d="M4 4h16v16H4zm2 4v10h12V8z"/>
						</svg>
					</div>
					<div className="titlebar-button" id="titlebar-close">
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
							<path fill="white"
							      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
						</svg>
					</div>
				</div>
				<div id="inner-content">
					{page === Page.Home && <>
						<Dashboard lobby={lobby} />
					</>}
					{page === Page.Settings && <>
						Settings
					</>}
					{page === Page.About && <>
						About
					</>}
				</div>
			</div>
		</>
	);
}

export default App;
*/

"use client";

import { Button } from "@/components/ui/button"
import { HomeIcon, SettingsIcon, UserIcon, HelpCircleIcon, MinusIcon, SquareIcon, XIcon } from "lucide-react"

// Placeholder components for each section
const Home = () => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		console.log('Component mounted');
		return () => console.log('Component unmounted');
	}, []);

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Home</h1>
			<p>Welcome to the home page!</p>
			<p>Count: {count}</p>
			<Button onClick={() => setCount(count + 1)}>Increment</Button>
		</div>
	)
}

const Profile = () => {
	const [name, setName] = useState('')
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Profile</h1>
			<p>This is your profile page.</p>
			<input
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Enter your name"
				className="border p-2 mt-2"
			/>
			<p>Hello, {name}!</p>
		</div>
	)
}

const Settings = () => {
	const [theme, setTheme] = useState('light')
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold">Settings</h1>
			<p>Adjust your settings here.</p>
			<select
				value={theme}
				onChange={(e) => setTheme(e.target.value)}
				className="border p-2 mt-2"
			>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
			<p>Current theme: {theme}</p>
		</div>
	)
}

const Help = () => <div className="p-4"><h1 className="text-2xl font-bold">Help</h1><p>Need help? You're in the right place!</p></div>

export default function Layout() {
	const [activeContent, setActiveContent] = useState('home')

	const navItems = [
		{ icon: HomeIcon, text: 'Home', id: 'home' },
		{ icon: UserIcon, text: 'Profile', id: 'profile' },
		{ icon: SettingsIcon, text: 'Settings', id: 'settings' },
		{ icon: HelpCircleIcon, text: 'Debug', id: 'help' },
	]

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<div className="fixed top-0 right-0 m-4 flex space-x-2 z-50">
				<Button
					variant="ghost"
					size="icon"
					className="w-3 h-3 bg-yellow-400 rounded-full hover:bg-yellow-500 focus:outline-none"
					onClick={() => current_window.minimize()}
				>
					<MinusIcon className="h-2 w-2 text-yellow-800" />
					<span className="sr-only">Minimize</span>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="w-3 h-3 bg-green-400 rounded-full hover:bg-green-500 focus:outline-none"
					onClick={() => current_window.toggleMaximize()}
				>
					<SquareIcon className="h-2 w-2 text-green-800" />
					<span className="sr-only">Maximize</span>
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="w-3 h-3 bg-red-400 rounded-full hover:bg-red-500 focus:outline-none"
					onClick={() => current_window.close()}
				>
					<XIcon className="h-2 w-2 text-red-800" />
					<span className="sr-only">Close</span>
				</Button>
			</div>

			<div className="flex">
				<aside className="fixed top-0 left-0 z-40 w-64 h-screen">
					<div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
						<div className="flex items-center pl-2.5 mb-5">
							<img
								src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/challenge-mini-crystal/grandmaster.svg"
								width="32" height="32" alt="crystal"/>
							<span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">crystal</span>
						</div>
						<ul className="space-y-2 font-medium">
							{navItems.map((item) => (
								<li key={item.id}>
									<Button
										variant="ghost"
										className={`w-full justify-start ${activeContent === item.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
											onClick={() => setActiveContent(item.id)}
										>
											<item.icon className="w-5 h-5 mr-3" />
											{item.text}
										</Button>
									</li>
								))}
							</ul>
					</div>
				</aside>

				<div className="flex-1 ml-64">
					<div className="h-16" data-tauri-drag-region="true"></div>
					<main className="p-4">
						<div className="mt-4">
							<div hidden={activeContent !== 'home'}><Home /></div>
							<div hidden={activeContent !== 'profile'}><Profile /></div>
							<div hidden={activeContent !== 'settings'}><Settings /></div>
							<div hidden={activeContent !== 'help'}><Dashboard lobby={""} /></div>
						</div>
					</main>
				</div>
			</div>
		</div>
	)
}