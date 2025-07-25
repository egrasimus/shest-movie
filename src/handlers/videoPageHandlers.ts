export function createOpenFolderDialogHandler(
	setFolderPath: (path: string) => void,
	resetHistory: () => void
) {
	return async () => {
		const selected = await window.electronAPI.selectFolder()
		if (selected) {
			setFolderPath(selected)
			resetHistory()
		}
	}
}

export function createGoBackHandler(goBack: () => void, history: string[]) {
	return () => {
		if (history.length > 0) {
			goBack()
		}
	}
}
