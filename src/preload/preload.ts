import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
	selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),
	getVideos: (folderPath: string) =>
		ipcRenderer.invoke("fs:getVideos", folderPath),
})
