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

								{/* Additional Actions */}
								{/* <div className={styles.actionsGrid}>
									<button className={styles.actionButton}>
										<div className={styles.actionButtonContent}>
											<svg
												className={styles.actionIcon}
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
												/>
											</svg>
											В избранное
										</div>
									</button>
									<button className={styles.actionButton}>
										<div className={styles.actionButtonContent}>
											<svg
												className={styles.actionIcon}
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
												/>
											</svg>
											Поделиться
										</div>
									</button>
									<button className={styles.actionButton}>
										<div className={styles.actionButtonContent}>
											<svg
												className={styles.actionIcon}
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
												/>
											</svg>
											Позже
										</div>
									</button>
								</div> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MoviePage
