import React, { useEffect, useState, useCallback } from "react"
import styles from "./VideoPage.module.scss"
import FolderContentGrid from "../FolderContentGrid/FolderContentGrid"
import useFolderHistory from "../../hooks/useFolderHistory"
import useFolderContent from "../../hooks/useFolderContent"
import { createOpenFolderDialogHandler } from "../../handlers/videoPageHandlers"
import { useMovieData } from "../../hooks/useMovieData"
import MoviePage from "../MoviePage/MoviePage"
import BreadcrumbsBar from "./BreadcrumbsBar"
import electronApi from "../../services/electronApi"
import Button from "../ui/Button/Button"

interface FileEntry {
	type: "video" | "folder"
	name: string
	fullPath: string
	preview?: string
}

const VideoPage: React.FC = () => {
	const {
		currentPath: folderPath,
		setCurrentPath: setFolderPath,
		history,
		goToFolder,
		resetHistory,
		setHistoryAndPath,
	} = useFolderHistory(null)

	const { videos, subfolders, loading, error } = useFolderContent(folderPath)
	const { movieData } = useMovieData(folderPath || "")
	const [entries, setEntries] = useState<FileEntry[]>([])

	const openFolderDialog = createOpenFolderDialogHandler(
		setFolderPath,
		resetHistory
	)

	const onPlayFirstEpisode = useCallback(async (path: string) => {
		// Если это видео — открыть
		if (path.match(/\.(mp4|mkv|avi|mov|webm)$/i)) {
			electronApi.openExternalVideo(path)
			return
		}
		// Если это папка — загрузить видео и открыть первое
		const videos = await electronApi.getVideos(path)
		if (videos && videos.length > 0) {
			const firstVideoPath = `${path}/${videos[0]}`
			electronApi.openExternalVideo(firstVideoPath)
		}
	}, [])

	useEffect(() => {
		window.electronAPI.onLastFolder((path: string) => {
			setFolderPath(path)
		})
	}, [])

	useEffect(() => {
		let isMounted = true
		const loadPreviews = async () => {
			if (!folderPath) {
				setEntries([])
				return
			}
			const folderEntries: FileEntry[] = await Promise.all(
				subfolders.map(async (name) => {
					const fullPath = `${folderPath}/${name}`
					let preview: string | undefined
					try {
						preview = await electronApi.getFolderPreview(fullPath)
					} catch {
						preview = undefined
					}
					return {
						type: "folder" as const,
						name,
						fullPath,
						preview,
					}
				})
			)
			const videoEntries: FileEntry[] = await Promise.all(
				videos.map(async (file) => {
					const fullPath = `${folderPath}/${file}`
					let preview: string | undefined
					try {
						const previewPath = await electronApi.getPreview(fullPath)
						preview = previewPath
						if (previewPath) {
							preview = await electronApi.loadPreview(previewPath)
						}
					} catch {
						preview = undefined
					}
					return {
						type: "video" as const,
						name: file,
						fullPath,
						preview,
					}
				})
			)
			if (isMounted) setEntries([...folderEntries, ...videoEntries])
		}
		loadPreviews()
		return () => {
			isMounted = false
		}
	}, [videos, subfolders, folderPath])

	return (
		<div className={styles.container}>
			{folderPath && (
				<BreadcrumbsBar
					folderPath={folderPath}
					history={history}
					setHistoryAndPath={setHistoryAndPath}
					openFolderDialog={openFolderDialog}
					styles={styles}
				/>
			)}

			{!folderPath && (
				<div className={styles.placeholderBox}>
					<div className={styles.placeholderIcon}>📁</div>
					<h2 className={styles.placeholderTitle}>Папка не выбрана</h2>
					<p className={styles.placeholderText}>
						Выберите папку с видео, чтобы начать просмотр.
					</p>
					<Button onClick={openFolderDialog}>Выбрать папку</Button>
				</div>
			)}

			{loading && <div className={styles.loader}>Загрузка...</div>}
			{error && <div className={styles.error}>Ошибка загрузки: {error}</div>}

			{folderPath && !loading && !error && (
				<>
					{movieData && (
						<MoviePage
							movieData={movieData}
							path={folderPath}
							entries={entries}
							onPlayFirstEpisode={onPlayFirstEpisode}
						/>
					)}
					{(!movieData || movieData.type !== "фильм") && (
						<FolderContentGrid
							folderPath={folderPath}
							onNavigateToFolder={goToFolder}
							entries={entries}
							loading={loading}
							error={error}
						/>
					)}
				</>
			)}
		</div>
	)
}

export default VideoPage
