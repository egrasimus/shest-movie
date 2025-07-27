export type VideoFileName = string
export type SubfolderName = string
export type PreviewPath = string | null
export type PreviewDataUrl = string | null
export type MarkdownContent = string | null
export interface OpenExternalVideoResult {
	success: boolean
	error?: string
}

const electronApi = {
	getVideos: (folderPath: string): Promise<VideoFileName[]> =>
		window.electronAPI.getVideos(folderPath),
	getSubfolders: (folderPath: string): Promise<SubfolderName[]> =>
		window.electronAPI.getSubfolders(folderPath),
	getPreview: (filePath: string): Promise<PreviewPath> =>
		window.electronAPI.getPreview(filePath),
	loadPreview: (previewPath: string): Promise<PreviewDataUrl> =>
		window.electronAPI.loadPreview(previewPath),
	getFolderPreview: (folderPath: string): Promise<PreviewDataUrl> =>
		window.electronAPI.getFolderPreview(folderPath),
	getMarkdown: (folderPath: string): Promise<MarkdownContent> =>
		window.electronAPI.getMarkdown(folderPath),
	openExternalVideo: (
		filePath: string
	): Promise<string | OpenExternalVideoResult> =>
		window.electronAPI.openExternalVideo(filePath),
}

export default electronApi
