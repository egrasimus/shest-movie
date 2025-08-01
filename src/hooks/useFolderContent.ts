import { useEffect, useState } from "react"
import electronApi from "../services/electronApi"

interface UseFolderContentResult {
	videos: string[]
	subfolders: string[]
	loading: boolean
	error: string | null
}

function useFolderContent(folderPath: string | null): UseFolderContentResult {
	const [videos, setVideos] = useState<string[]>([])
	const [subfolders, setSubfolders] = useState<string[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!folderPath) {
			setVideos([])
			setSubfolders([])
			setError(null)
			setLoading(false)
			return
		}
		setLoading(true)
		setError(null)
		Promise.all([
			electronApi.getVideos(folderPath),
			electronApi.getSubfolders(folderPath),
		])
			.then(([videos, subfolders]) => {
				setVideos(videos)
				setSubfolders(subfolders)
			})
			.catch(() => {
				setError("Ошибка загрузки содержимого папки")
				setVideos([])
				setSubfolders([])
			})
			.finally(() => setLoading(false))
	}, [folderPath])

	return { videos, subfolders, loading, error }
}

export default useFolderContent
