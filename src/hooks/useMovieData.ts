import { useEffect, useState } from "react"
import matter from "gray-matter"
import electronApi from "../services/electronApi"

export function useMovieData(folderPath: string) {
	const [movieData, setMovieData] = useState<any>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!folderPath) {
			setMovieData(null)
			setError(null)
			setLoading(false)
			return
		}
		setLoading(true)
		setError(null)
		electronApi
			.getMarkdown(folderPath)
			.then((mdContent: string | null) => {
				if (mdContent) {
					const parsed = matter(mdContent)
					setMovieData(parsed.data)
				} else {
					setMovieData(null)
				}
			})
			.catch(() => {
				setError("Ошибка при загрузке markdown")
				setMovieData(null)
			})
			.finally(() => setLoading(false))
	}, [folderPath])

	return { movieData, loading, error }
}
