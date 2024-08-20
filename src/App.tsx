import "./App.css";
import {useEffect, useState} from "react";
import {listen} from "@tauri-apps/api/event";
import Dashboard from "./Dashboard.tsx";

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
