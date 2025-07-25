import { useState } from "react"

interface UseFolderHistoryResult {
	currentPath: string | null
	setCurrentPath: (path: string | null) => void
	history: string[]
	goToFolder: (newPath: string) => void
	resetHistory: () => void
}

function useFolderHistory(
	initialPath: string | null
): UseFolderHistoryResult & {
	setHistoryAndPath: (history: string[], path: string) => void
} {
	const [currentPath, setCurrentPath] = useState<string | null>(initialPath)
	const [history, setHistory] = useState<string[]>([])

	const goToFolder = (newPath: string) => {
		if (currentPath) {
			setHistory((prev) => [...prev, currentPath])
		}
		setCurrentPath(newPath)
	}

	const resetHistory = () => {
		setHistory([])
	}

	const setHistoryAndPath = (newHistory: string[], newPath: string) => {
		setHistory(newHistory)
		setCurrentPath(newPath)
	}

	return {
		currentPath,
		setCurrentPath,
		history,
		goToFolder,
		resetHistory,
		setHistoryAndPath,
	}
}

export default useFolderHistory
