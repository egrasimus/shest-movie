const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
	selectFolder: () => ipcRenderer.invoke("dialog:select-folder"),
	getVideos: (path) => ipcRenderer.invoke("get-videos", path),
	getSubfolders: (path) => ipcRenderer.invoke("get-subfolders", path),
	getPreview: (path) => ipcRenderer.invoke("fs:getPreview", path),
	loadPreview: (previewPath) =>
		ipcRenderer.invoke("fs:loadPreview", previewPath),
	openExternalVideo: (path) => ipcRenderer.invoke("open-external-video", path),
	readMarkdownFiles: (folderPath) =>
		ipcRenderer.invoke("read-md-files", folderPath),
	getMarkdown: (folderPath) => ipcRenderer.invoke("get-markdown", folderPath),
	getFolderPreview: (folderPath) =>
		ipcRenderer.invoke("get-folder-preview", folderPath),
	onLastFolder: (cb) => ipcRenderer.on("last-folder", (_, p) => cb(p)),
})
