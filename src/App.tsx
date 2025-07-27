import React from "react"
import "./App.css"
import VideoPage from "./components/VideoPage/VideoPage"
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary"
import { Buffer } from "buffer"

function App() {
	window.Buffer = Buffer

	return (
		<ErrorBoundary>
			<div className='App'>
				<VideoPage />
			</div>
		</ErrorBoundary>
	)
}

export default App
