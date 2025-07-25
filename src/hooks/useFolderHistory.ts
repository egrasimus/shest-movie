import { useState } from "react"

interface UseFolderHistoryResult {
	currentPath: string | null
	setCurrentPath: (path: string | null) => void
	history: string[]
	goToFolder: (newPath: string) => void
	goBack: () => void
	resetHistory: () => void
}

function useFolderHistory(initialPath: string | null): UseFolderHistoryResult {
	const [currentPath, setCurrentPath] = useState<string | null>(initialPath)
	const [history, setHistory] = useState<string[]>([])

	const goToFolder = (newPath: string) => {
		if (currentPath) {
			setHistory((prev) => [...prev, currentPath])
		}
		setCurrentPath(newPath)
	}

	const goBack = () => {
		if (history.length > 0) {
			const prevPath = history[history.length - 1]
			setHistory((prev) => prev.slice(0, -1))
			setCurrentPath(prevPath)
		}
	}

	const resetHistory = () => {
		setHistory([])
	}

	return {
		currentPath,
		setCurrentPath,
		history,
		goToFolder,
		goBack,
		resetHistory,
	}
}

export default useFolderHistory
