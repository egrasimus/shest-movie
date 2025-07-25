import React, { useEffect, useState } from "react"
import styles from "./FolderContentGrid.module.scss"
import { FaFolder } from "react-icons/fa"
import VideoPlayer from "../VideoPlayer/VideoPlayer"
import matter from "gray-matter"
import MoviePage from "../MoviePage/MoviePage"

interface Props {
	folderPath: string
	videos: string[]
	subfolders: string[]
	loading: boolean
	error: string | null
	onNavigateToFolder: (path: string) => void
}

interface FileEntry {
	type: "video" | "folder"
	name: string
	fullPath: string
	preview?: string
}

const FolderContentGrid: React.FC<Props> = ({
	folderPath,
	videos,
	subfolders,
	loading,
	error,
	onNavigateToFolder,
}) => {
	const [selectedVideo, setSelectedVideo] = useState<{
		name: string
		path: string
		url: string
	} | null>(null)
	const [movieData, setMovieData] = useState<any>(null)
	const [entries, setEntries] = useState<FileEntry[]>([])

	// Загружаем Markdown файл (если есть)
	useEffect(() => {
		const loadMarkdown = async () => {
			try {
				const mdContent = await window.electronAPI.getMarkdown(folderPath)
				if (mdContent) {
					const parsed = matter(mdContent)
					console.log("Parsed markdown front matter:", parsed.data)
					setMovieData(parsed.data)
				} else {
					setMovieData(null)
				}
			} catch (e) {
				console.error("Ошибка при загрузке markdown:", e)
				setMovieData(null)
			}
		}
		loadMarkdown()
	}, [folderPath])

	// Формируем entries на основе videos и subfolders с превью
	useEffect(() => {
		let isMounted = true
		const loadPreviews = async () => {
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

	const handleClosePlayer = () => {
		setSelectedVideo(null)
	}

	if (loading) {
		return <div>Загрузка...</div>
	}
	if (error) {
		return <div style={{ color: "red" }}>{error}</div>
	}

	return (
		<>
			{movieData && <MoviePage movieData={movieData} path={folderPath} />}
			<div className={styles.grid}>
				{selectedVideo && (
					<VideoPlayer
						src={selectedVideo.url}
						videoPath={selectedVideo.path}
						onClose={handleClosePlayer}
					/>
				)}
				{entries.map((entry) => (
					<>
						{entry.type === "folder" ? (
							<div
								key={entry.fullPath}
								className={styles.folderCard}
								onClick={() => {
									onNavigateToFolder(entry.fullPath)
								}}
								title={entry.name}
							>
								<div className={styles.folderPreview}>
									{entry.preview ? (
										<img
											src={entry.preview}
											alt='preview'
											className={styles.folderPreview}
										/>
									) : (
										<FaFolder size={64} />
									)}
								</div>
								<div className={styles.name}>{entry.name}</div>
							</div>
						) : (
							<div
								key={entry.fullPath}
								className={styles.videoCard}
								onClick={() => {
									window.electronAPI.openExternalVideo(entry.fullPath)
								}}
								title={entry.name}
							>
								<img
									src={entry.preview || "/images/video-placeholder.png"}
									alt={entry.name}
									className={styles.videoPreview}
								/>
								<div className={styles.name}>{entry.name.split(".")[0]}</div>
							</div>
						)}
					</>
				))}
			</div>
		</>
	)
}

export default FolderContentGrid
