import fs from "fs"
import path from "path"

const videoExtensions = [".mp4", ".avi", ".mkv", ".mov", ".webm", ".flv"]

export function getFolders(dirPath: string): string[] {
	try {
		return fs
			.readdirSync(dirPath, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => path.join(dirPath, dirent.name))
	} catch {
		return []
	}
}

export function getVideoFiles(dirPath: string): string[] {
	try {
		return fs
			.readdirSync(dirPath, { withFileTypes: true })
			.filter(
				(dirent) =>
					dirent.isFile() &&
					videoExtensions.includes(path.extname(dirent.name).toLowerCase())
			)
			.map((dirent) => path.join(dirPath, dirent.name))
	} catch {
		return []
	}
}
