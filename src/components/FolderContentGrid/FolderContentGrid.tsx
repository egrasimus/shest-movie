import React, { useEffect, useState } from "react"
import styles from "./FolderContentGrid.module.scss"
import { FaFolder } from "react-icons/fa"
import VideoPlayer from "../VideoPlayer/VideoPlayer"
import matter from "gray-matter"
import MoviePage from "../MoviePage/MoviePage"

interface Props {
	folderPath: string
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
	onNavigateToFolder,
}) => {
	const [entries, setEntries] = useState<FileEntry[]>([])
	const [selectedVideo, setSelectedVideo] = useState<{
		name: string
		path: string
		url: string
	} | null>(null)

	const [movieData, setMovieData] = useState<any>(null)

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

	// Загружаем видеофайлы и подпапки (с превью)
	useEffect(() => {
		const loadContent = async () => {
			try {
				const [videoFiles, subfolders] = await Promise.all([
					window.electronAPI.getVideos(folderPath),
					window.electronAPI.getSubfolders(folderPath),
				])

				const videoEntries: FileEntry[] = await Promise.all(
					videoFiles.map(async (file: string) => {
						const fullPath = `${folderPath}/${file}`
						let previewPath: string | undefined = undefined
						try {
							console.log({ fullPath })
							previewPath = await window.electronAPI.getPreview(fullPath)
							console.log({ previewPath })
						} catch (e) {
							console.error("Ошибка получения превью:", e)
						}
						return {
							type: "video",
							name: file,
							fullPath,
							preview: previewPath
								? await window.electronAPI.loadPreview(previewPath)
								: undefined,
						}
					})
				)

				const folderEntries: FileEntry[] = await Promise.all(
					subfolders.map(async (name: string) => {
						const fullPath = `${folderPath}/${name}`
						let preview: string | undefined
						try {
							preview = await window.electronAPI.getFolderPreview(fullPath)
						} catch (e) {
							console.error("Не удалось загрузить превью папки", e)
						}
						return {
							type: "folder",
							name,
							fullPath,
							preview,
						}
					})
				)

				setEntries([...folderEntries, ...videoEntries])
			} catch (err) {
				console.error("Ошибка загрузки содержимого папки:", err)
				setEntries([])
			}
		}

		loadContent()
	}, [folderPath])

	const handleClosePlayer = () => {
		setSelectedVideo(null)
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
