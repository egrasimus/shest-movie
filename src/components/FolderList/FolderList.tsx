import React from "react"
import styles from "./FolderList.module.scss"

interface FolderListProps {
	folders: string[]
	selectedFolder: string | null
	onSelectFolder: (folder: string) => void
}

const FolderList: React.FC<FolderListProps> = ({
	folders,
	selectedFolder,
	onSelectFolder,
}) => {
	return (
		<ul className={styles.list}>
			{folders.map((folder) => {
				const folderName = folder.split(/[\\/]/).pop()
				const isActive = folder === selectedFolder

				return (
					<li
						key={folder}
						className={`${styles.item} ${isActive ? styles.active : ""}`}
						onClick={() => onSelectFolder(folder)}
						title={folder}
					>
						{folderName}
					</li>
				)
			})}
		</ul>
	)
}

export default FolderList
