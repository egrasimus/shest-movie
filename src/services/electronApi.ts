const electronApi = {
	getVideos: (folderPath: string) => window.electronAPI.getVideos(folderPath),
	getSubfolders: (folderPath: string) =>
		window.electronAPI.getSubfolders(folderPath),
	getPreview: (filePath: string) => window.electronAPI.getPreview(filePath),
	loadPreview: (previewPath: string) =>
		window.electronAPI.loadPreview(previewPath),
	getFolderPreview: (folderPath: string) =>
		window.electronAPI.getFolderPreview(folderPath),
	getMarkdown: (folderPath: string) =>
		window.electronAPI.getMarkdown(folderPath),
	openExternalVideo: (filePath: string) =>
		window.electronAPI.openExternalVideo(filePath),
}

export default electronApi
