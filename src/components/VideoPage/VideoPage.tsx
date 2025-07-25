import React, { useState, useEffect } from "react"
import styles from "./VideoPage.module.scss"
import FolderContentGrid from "../FolderContentGrid/FolderContentGrid"
import useFolderHistory from "../../hooks/useFolderHistory"

const VideoPage: React.FC = () => {
	const {
		currentPath: folderPath,
		setCurrentPath: setFolderPath,
		history,
		goToFolder,
		goBack,
		resetHistory,
	} = useFolderHistory(null)
	const [, setVideos] = useState<string[]>([])
	const [, setSubfolders] = useState<string[]>([])

	// Выбор новой папки из диалога
	const openFolderDialog = async () => {
		const selected = await window.electronAPI.selectFolder()
		console.log("sad")
		if (selected) {
			setFolderPath(selected)
			resetHistory() // Очистить историю при новом выборе
		}
	}

	// Получение содержимого при смене папки
	useEffect(() => {
		if (!folderPath) {
			setVideos([])
			setSubfolders([])
			return
		}

		// Логирование для отладки
		console.log("Загружаем содержимое папки:", folderPath)

		// Получаем видео и папки из текущей папки
		window.electronAPI.getVideos(folderPath).then(setVideos)
		window.electronAPI.getSubfolders(folderPath).then(setSubfolders)
	}, [folderPath])

	// Получение содержимого при смене папки
	useEffect(() => {
		window.electronAPI.onLastFolder((path) => {
			setFolderPath(path)
		})
	}, [])

	return (
		<div className={styles.container}>
			<div className={styles.controls}>
				<button
					className={styles.backButton}
					onClick={goBack}
					disabled={history.length === 0}
				>
					← Назад
				</button>
				<button className={styles.selectButton} onClick={openFolderDialog}>
					Выбрать папку
				</button>
			</div>

			{/* <h2>{folderPath ?? "Папка не выбрана"}</h2> */}
			{folderPath && (
				<FolderContentGrid
					folderPath={folderPath}
					onNavigateToFolder={goToFolder}
				/>
			)}
		</div>
	)
}

export default VideoPage
