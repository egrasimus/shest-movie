import React from "react"
import styles from "./FolderContentGrid.module.scss"

interface FileEntry {
	type: "video" | "folder"
	name: string
	fullPath: string
	preview?: string
}

interface VideoCardProps {
	entry: FileEntry
	onClick: (entry: FileEntry) => void
}

const VideoCard: React.FC<VideoCardProps> = ({ entry, onClick }) => (
	<div
		className={styles.videoCard}
		onClick={() => onClick(entry)}
		title={entry.name}
	>
		<img
			src={entry.preview || "/images/video-placeholder.png"}
			alt={entry.name}
			className={styles.videoPreview}
		/>
		<div className={styles.name}>{entry.name.split(".")[0]}</div>
	</div>
)

export default VideoCard
