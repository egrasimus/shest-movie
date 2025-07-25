import React, { useState } from "react"
import styles from "./FolderContentGrid.module.scss"
import VideoPlayer from "../VideoPlayer/VideoPlayer"
import VideoCard from "./VideoCard"
import FolderCard from "./FolderCard"

interface Props {
	folderPath: string
	entries: FileEntry[]
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
	entries,
	loading,
	error,
	onNavigateToFolder,
}) => {
	const [selectedVideo, setSelectedVideo] = useState<{
		name: string
		path: string
		url: string
	} | null>(null)

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
		<div className={styles.grid}>
			{selectedVideo && (
				<VideoPlayer
					src={selectedVideo.url}
					videoPath={selectedVideo.path}
					onClose={handleClosePlayer}
				/>
			)}
			{entries.map((entry) => (
				<React.Fragment key={entry.fullPath}>
					{entry.type === "folder" ? (
						<FolderCard
							entry={entry}
							onClick={() => onNavigateToFolder(entry.fullPath)}
						/>
					) : (
						<VideoCard
							entry={entry}
							onClick={() =>
								window.electronAPI.openExternalVideo(entry.fullPath)
							}
						/>
					)}
				</React.Fragment>
			))}
		</div>
	)
}

export default FolderContentGrid
