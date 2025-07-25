import React, { useEffect, useState } from "react"
import styles from "./VideoPlayer.module.scss"

interface Props {
	src: string
	videoPath?: string // Добавляем путь к видео файлу
	onClose: () => void
}

const VideoPlayer: React.FC<Props> = ({ src, videoPath, onClose }) => {
	const [videoUrl, setVideoUrl] = useState<string>(src)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		// Если передан videoPath, получаем правильный URL
		if (videoPath && window.electronAPI?.getVideoUrl) {
			window.electronAPI
				.getVideoUrl(videoPath)
				.then((url: string | null) => {
					if (url) {
						setVideoUrl(url)
					} else {
						setError("Не удалось получить URL видео")
					}
				})
				.catch((err: any) => {
					console.error("Error getting video URL:", err)
					setError("Ошибка при получении URL видео")
				})
		}
	}, [videoPath])

	const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
		const video = e.currentTarget
		console.error("Video error:", video.error)
		console.error("Video src:", video.src)
		console.error("Video networkState:", video.networkState)
		console.error("Video readyState:", video.readyState)

		setError(
			`Ошибка воспроизведения видео: ${
				video.error?.message || "Неизвестная ошибка"
			}`
		)
	}

	const handleVideoLoad = () => {
		console.log("Video loaded successfully")
		setError(null)
	}

	console.log("VideoPlayer props:", { src, videoPath, videoUrl })

	return (
		<div className={styles.overlay}>
			<div className={styles.playerContainer}>
				<button className={styles.closeButton} onClick={onClose}>
					×
				</button>

				{error ? (
					<div className={styles.errorMessage}>
						<p>{error}</p>
						<p>Исходный URL: {src}</p>
						<p>Видео URL: {videoUrl}</p>
						<p>Путь к файлу: {videoPath}</p>
					</div>
				) : (
					<video
						src={videoUrl}
						controls
						autoPlay
						className={styles.video}
						onError={handleVideoError}
						onLoadedData={handleVideoLoad}
						onLoadStart={() => console.log("Video load started")}
						preload='metadata'
					/>
				)}
			</div>
		</div>
	)
}

export default VideoPlayer
