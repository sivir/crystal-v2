import "./App.css";
import {useEffect, useState} from "react";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {listen} from "@tauri-apps/api/event";
import Dashboard from "./Dashboard.tsx";

"use client";

const current_window = getCurrentWindow();

import { Button } from "@/components/ui/button"
import { HomeIcon, SettingsIcon, UserIcon, HelpCircleIcon, MinusIcon, SquareIcon, XIcon } from "lucide-react"

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

export default function Layout() {
	const [activeContent, setActiveContent] = useState('home');

	const [lobby, setLobby] = useState("");

	useEffect(() => {
		const unlisten = listen("lobby", (event) => {
			setLobby(JSON.stringify(event.payload));
			console.log(event);
		});
		return () => {
			unlisten.then(f => f());
		}
	}, []);

	const navItems = [
		{ icon: HomeIcon, text: 'Home', id: 'home' },
		{ icon: UserIcon, text: 'Profile', id: 'profile' },
		{ icon: SettingsIcon, text: 'Settings', id: 'settings' },
		{ icon: HelpCircleIcon, text: 'Debug', id: 'help' },
	];

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
							<div hidden={activeContent !== 'help'}><Dashboard lobby={lobby} /></div>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}