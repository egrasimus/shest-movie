import React, { useEffect, useRef, useState, useCallback } from "react"
import styles from "./VideoPage.module.scss"
import FolderContentGrid from "../FolderContentGrid/FolderContentGrid"
import useFolderHistory from "../../hooks/useFolderHistory"
import useFolderContent from "../../hooks/useFolderContent"
import { createOpenFolderDialogHandler } from "../../handlers/videoPageHandlers"
import { useMovieData } from "../../hooks/useMovieData"
import MoviePage from "../MoviePage/MoviePage"

// Вспомогательная функция для построения массива путей для breadcrumbs
function getBreadcrumbs(history: string[], current: string | null) {
	const all = [...history]
	if (current) all.push(current)
	return all.map((fullPath, idx) => {
		const parts = fullPath.split(/[\\/]/).filter(Boolean)
		return {
			label: parts[parts.length - 1] || "Корень",
			fullPath,
			isLast: idx === all.length - 1,
		}
	})
}

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
			window.electronAPI.openExternalVideo(path)
			return
		}
		// Если это папка — загрузить видео и открыть первое
		const videos = await window.electronAPI.getVideos(path)
		if (videos && videos.length > 0) {
			const firstVideoPath = `${path}/${videos[0]}`
			window.electronAPI.openExternalVideo(firstVideoPath)
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
						preview = await window.electronAPI.getFolderPreview(fullPath)
					} catch (e) {
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
						const previewPath = await window.electronAPI.getPreview(fullPath)
						preview = previewPath
						if (previewPath) {
							preview = await window.electronAPI.loadPreview(previewPath)
						}
					} catch (e) {
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
			{/* Breadcrumbs */}

			<div className={styles.breadcrumbsContainer}>
				<div className={styles.breadcrumbsWrapper}>
					{folderPath ? (
						<nav className={styles.breadcrumbs} aria-label='Breadcrumbs'>
							{(() => {
								const crumbs = getBreadcrumbs(history, folderPath)
								return (
									<>
										{crumbs.map((crumb, idx) => (
											<span key={crumb.fullPath}>
												{!crumb.isLast ? (
													<a
														href='#'
														onClick={(e) => {
															e.preventDefault()
															const newHistory = crumbs
																.slice(0, idx)
																.map((c) => c.fullPath)
															const newPath = crumb.fullPath
															setHistoryAndPath(newHistory, newPath)
														}}
														className={styles.breadcrumbLink}
													>
														{crumb.label}
													</a>
												) : (
													<span className={styles.breadcrumbCurrent}>
														{crumb.label}
													</span>
												)}
												{idx < crumbs.length - 1 && (
													<span className={styles.breadcrumbSep}> / </span>
												)}
											</span>
										))}
									</>
								)
							})()}
						</nav>
					) : (
						<div></div>
					)}
					<div className={styles.controls}>
						<button className={styles.selectButton} onClick={openFolderDialog}>
							Выбрать папку
						</button>
					</div>
				</div>
			</div>

			{loading && <div className={styles.loader}>Загрузка...</div>}
			{error && <div className={styles.error}>Ошибка загрузки: {error}</div>}

			{/* <h2>{folderPath ?? "Папка не выбрана"}</h2> */}
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
					<FolderContentGrid
						folderPath={folderPath}
						onNavigateToFolder={goToFolder}
						entries={entries}
						loading={loading}
						error={error}
					/>
				</>
			)}
		</div>
	)
}

export default VideoPage
