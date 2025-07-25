import React, { useEffect } from "react"
import styles from "./VideoPage.module.scss"
import FolderContentGrid from "../FolderContentGrid/FolderContentGrid"
import useFolderHistory from "../../hooks/useFolderHistory"
import useFolderContent from "../../hooks/useFolderContent"
import {
	createOpenFolderDialogHandler,
	createGoBackHandler,
} from "../../handlers/videoPageHandlers"

const VideoPage: React.FC = () => {
	const {
		currentPath: folderPath,
		setCurrentPath: setFolderPath,
		history,
		goToFolder,
		goBack,
		resetHistory,
	} = useFolderHistory(null)

	const { videos, subfolders, loading, error } = useFolderContent(folderPath)

	const openFolderDialog = createOpenFolderDialogHandler(
		setFolderPath,
		resetHistory
	)
	const goBackHandler = createGoBackHandler(goBack, history)

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
					onClick={goBackHandler}
					disabled={history.length === 0}
				>
					← Назад
				</button>
				<button className={styles.selectButton} onClick={openFolderDialog}>
					Выбрать папку
				</button>
			</div>

			{loading && <div className={styles.loader}>Загрузка...</div>}
			{error && <div className={styles.error}>Ошибка загрузки: {error}</div>}

			{/* <h2>{folderPath ?? "Папка не выбрана"}</h2> */}
			{folderPath && !loading && !error && (
				<FolderContentGrid
					folderPath={folderPath}
					onNavigateToFolder={goToFolder}
					videos={videos}
					subfolders={subfolders}
					loading={loading}
					error={error}
				/>
			)}
		</div>
	)
}

export default VideoPage
