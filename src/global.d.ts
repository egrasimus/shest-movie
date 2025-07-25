export {}

declare global {
	interface Window {
		electronAPI: {
			selectFolder: () => Promise<string | null>
			onLastFolder: (callback: any) => Promise<string | null>
			getVideos: (folderPath: string) => Promise<string[]>
			getVideoUrl: (folderPath: string) => Promise<string>
			getPreview: (folderPath: string) => Promise<string>
			getFolderPreview: (folderPath: string) => Promise<string>
			openExternalVideo: (folderPath: string) => Promise<string>
			loadPreview: (folderPath: string) => Promise<string>
			getSubfolders: (folderPath: string) => Promise<string[]>
			getMarkdown: (folderPath: string) => Promise<any>
		}
	}
}
