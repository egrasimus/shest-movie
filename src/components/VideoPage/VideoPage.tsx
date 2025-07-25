import React, { useEffect, useRef, useState } from "react"
import styles from "./VideoPage.module.scss"
import FolderContentGrid from "../FolderContentGrid/FolderContentGrid"
import useFolderHistory from "../../hooks/useFolderHistory"
import useFolderContent from "../../hooks/useFolderContent"
import { createOpenFolderDialogHandler } from "../../handlers/videoPageHandlers"

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

	const openFolderDialog = createOpenFolderDialogHandler(
		setFolderPath,
		resetHistory
	)

	useEffect(() => {
		window.electronAPI.onLastFolder((path) => {
			setFolderPath(path)
		})
	}, [])

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
