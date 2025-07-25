import React, { useEffect, useState } from "react"
import styles from "./MoviePage.module.scss"

interface MovieData {
	type: string
	aliases: string[]
	coverUrl: string
	description: string
	[key: string]: any
}

interface FileEntry {
	type: "video" | "folder"
	name: string
	fullPath: string
	preview?: string
}

interface MoviePageProps {
	movieData: MovieData
	path: string
	entries: FileEntry[]
	onPlayFirstEpisode: (path: string) => void
}

const MoviePage: React.FC<MoviePageProps> = ({
	movieData,
	path,
	entries,
	onPlayFirstEpisode,
}) => {
	const [preview, setPreview] = useState<string>()
	const [isLoading, setIsLoading] = useState(true)

	console.log({ movieData })

	useEffect(() => {
		const loadContent = async () => {
			try {
				setPreview(await window.electronAPI.getFolderPreview(path))
				// setPreview(movieData.coverUrl)
			} catch (error) {
				console.error("Error loading preview:", error)
			} finally {
				setIsLoading(false)
			}
		}
		loadContent()
	}, [])

	const handleImageLoad = () => {
		setIsLoading(false)
	}

	const playButtonText =
		movieData.type === "сериал" ? "Смотреть с 1 серии" : "Смотреть"

	// Универсальный infoGrid
	const baseFields = [
		"type",
		"aliases",
		"coverUrl",
		"description",
		"Название",
		"Каталог",
		"Статус",
		"Рейтинг",
	]
	const infoFields = Object.entries(movieData)
		.filter(
			([key, value]) =>
				!baseFields.includes(key) && value && typeof value !== "object"
		)
		.map(([key, value]) => ({ label: key, value }))

	return (
		<div className={styles.moviePage}>
			{/* Header */}

			{/* Main Content */}
			<div className={styles.content}>
				<div className={styles.header}>
					<div className={styles.headerContent}>
						<h1 className={styles.title}>{movieData.aliases[0]}</h1>
						{movieData.aliases[1] && (
							<h1
								className={styles.alternativeTitle}
							>{`(${movieData.aliases[1]})`}</h1>
						)}
					</div>
				</div>
				<div className={styles.container}>
					<div className={styles.contentGrid}>
						{/* Poster Section */}
						<div className={styles.posterSection}>
							<div className={styles.posterWrapper}>
								<div className={styles.posterContainer}>
									{isLoading && (
										<div className={styles.loadingPlaceholder}></div>
									)}
									<img
										src={preview || movieData.coverUrl}
										alt={movieData.aliases[0]}
										className={styles.posterImage}
										onLoad={handleImageLoad}
									/>
									<div className={styles.posterOverlay}></div>
								</div>

								{/* Rating Badge */}
								{movieData["Рейтинг"] && (
									<div className={styles.ratingBadge}>
										{movieData["Рейтинг"]}
									</div>
								)}

								{/* Play Button */}
								<button
									className={styles.playButton}
									onClick={() => {
										// Найти первый видеофайл (в текущей папке или первой подпапке)
										const firstVideo = entries.find((e) => e.type === "video")
										if (firstVideo) {
											onPlayFirstEpisode(firstVideo.fullPath)
											return
										}
										if (movieData.type === "сериал") {
											const firstFolder = entries.find(
												(e) => e.type === "folder"
											)
											if (firstFolder) {
												// Здесь можно реализовать рекурсивный поиск, но для простоты — открыть первую папку
												onPlayFirstEpisode(firstFolder.fullPath)
											}
										}
									}}
								>
									<div className={styles.playButtonContent}>
										<div className={styles.playIcon}></div>
										{playButtonText}
									</div>
								</button>
							</div>
						</div>

						{/* Details Section */}
						<div className={styles.detailsSection}>
							<div className={styles.detailsContainer}>
								{/* Movie Details */}
								<div className={styles.infoCard}>
									<h2 className={styles.cardTitle}>Информация</h2>
									<div className={styles.infoGrid}>
										{infoFields.length > 0 ? (
											infoFields.map((f) => (
												<div className={styles.infoItem} key={f.label}>
													<span className={styles.infoLabel}>{f.label}: </span>
													<span className={styles.infoValue}>
														{typeof f.value === "string"
															? f.value.replaceAll("[", "").replaceAll("]", "")
															: f.value}
													</span>
												</div>
											))
										) : (
											<div className={styles.infoItem}>
												<span className={styles.infoLabel}>
													Информация отсутствует
												</span>
											</div>
										)}
									</div>
								</div>

								{/* Description */}
								<div className={styles.descriptionCard}>
									<h2 className={styles.cardTitle}>Описание</h2>
									<p className={styles.description}>
										{movieData.description || "Описание отсутствует"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MoviePage
