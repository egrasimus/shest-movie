import React from "react"
import "./App.css"
import VideoPage from "./components/VideoPage/VideoPage"
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary"
import { Buffer } from "buffer"
import GifButton from "./components/GifButton/GifButton"

function App() {
	window.Buffer = Buffer

	return (
		<ErrorBoundary>
			<div className='App'>
				<VideoPage />
				<GifButton />
			</div>
		</ErrorBoundary>
	)
}

export default App
