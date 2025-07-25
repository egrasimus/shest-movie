import React from "react"
import styles from "./FolderContentGrid.module.scss"
import { FaFolder } from "react-icons/fa"

interface FileEntry {
	type: "video" | "folder"
	name: string
	fullPath: string
	preview?: string
}

interface FolderCardProps {
	entry: FileEntry
	onClick: (entry: FileEntry) => void
}

const FolderCard: React.FC<FolderCardProps> = ({ entry, onClick }) => (
	<div
		className={styles.folderCard}
		onClick={() => onClick(entry)}
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
)

export default FolderCard
