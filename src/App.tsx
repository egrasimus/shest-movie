import React from "react"
import VideoPage from "./components/VideoPage/VideoPage"
import { Buffer } from "buffer"
import "./App.css"

const App: React.FC = () => {
	window.Buffer = Buffer

	return <VideoPage />
}

export default App
