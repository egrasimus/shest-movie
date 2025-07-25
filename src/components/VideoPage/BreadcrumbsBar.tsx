import React from "react"

interface BreadcrumbsBarProps {
	folderPath: string | null
	history: string[]
	setHistoryAndPath: (history: string[], path: string) => void
	openFolderDialog: () => void
	styles: { [key: string]: string }
}

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

const BreadcrumbsBar: React.FC<BreadcrumbsBarProps> = ({
	folderPath,
	history,
	setHistoryAndPath,
	openFolderDialog,
	styles,
}) => (
	<div className={styles.breadcrumbsContainer}>
		<div className={styles.breadcrumbsWrapper}>
			{folderPath ? (
				<nav className={styles.breadcrumbs} aria-label='Breadcrumbs'>
					{getBreadcrumbs(history, folderPath).map((crumb, idx, arr) => (
						<span key={crumb.fullPath}>
							{!crumb.isLast ? (
								<a
									href='#'
									onClick={(e) => {
										e.preventDefault()
										const newHistory = arr.slice(0, idx).map((c) => c.fullPath)
										const newPath = crumb.fullPath
										setHistoryAndPath(newHistory, newPath)
									}}
									className={styles.breadcrumbLink}
								>
									{crumb.label}
								</a>
							) : (
								<span className={styles.breadcrumbCurrent}>{crumb.label}</span>
							)}
							{idx < arr.length - 1 && (
								<span className={styles.breadcrumbSep}> / </span>
							)}
						</span>
					))}
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
)

export default BreadcrumbsBar
