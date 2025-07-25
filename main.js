import ffmpeg from "fluent-ffmpeg"
import log from "electron-log"
import {
	app,
	BrowserWindow,
	screen,
	ipcMain,
	dialog,
	protocol,
	shell,
	nativeTheme,
} from "electron"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { loadSettings, saveSettings } from "./settings.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let mainWindow = null

function createWindow() {
	nativeTheme.themeSource = "dark" // 'light' | 'dark' | 'system'

	mainWindow = new BrowserWindow({
		backgroundColor: "#1e1e1e",
		icon: path.join(__dirname, "assets/icons/icon.png"),
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: path.join(__dirname, "preload.js"),
			webSecurity: false, // Временно отключаем для разработки
		},
	})

	mainWindow.maximize()

	mainWindow.loadURL("http://localhost:5173")
	// Для продакшена:
	// mainWindow.loadFile(path.join(__dirname, "dist/index.html"))
}

app.whenReady().then(() => {
	createWindow()

	const settings = loadSettings()

	if (settings?.lastFolder && fs.existsSync(settings.lastFolder)) {
		mainWindow?.webContents.once("did-finish-load", () => {
			mainWindow?.webContents.send("last-folder", settings.lastFolder)
		})
	}
})

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit()
})

ipcMain.handle("dialog:select-folder", async () => {
	const result = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	})
	if (result.canceled || result.filePaths.length === 0) return null
	const folder = result.filePaths[0]

	const current = loadSettings()
	saveSettings({ ...current, lastFolder: folder })

	return folder
})

ipcMain.handle("get-videos", async (_event, folderPath) => {
	const videoExtensions = [".mp4", ".mkv", ".avi", ".mov", ".webm"]
	const files = await fs.promises.readdir(folderPath)
	return files.filter((file) =>
		videoExtensions.includes(path.extname(file).toLowerCase())
	)
})

ipcMain.handle("get-subfolders", async (_event, folderPath) => {
	const excludedFolders = new Set([
		".obsidian",
		"Rus",
		"Eng",
		"templates",
		"subtitles",
		"ENG SUB",
		"RUS SUB",
	]) // список папок для исключения

	const items = await fs.promises.readdir(folderPath, { withFileTypes: true })
	return items
		.filter((item) => item.isDirectory() && !excludedFolders.has(item.name))
		.map((dir) => dir.name)
})

const ffmpegPath = path.join(
	app.getAppPath().replace("app.asar", "app.asar.unpacked"),
	"node_modules",
	"@ffmpeg-installer",
	"win32-x64",
	"ffmpeg.exe"
)

const ffprobePath = path.join(
	app.getAppPath().replace("app.asar", "app.asar.unpacked"),
	"node_modules",
	"@ffprobe-installer",
	"win32-x64",
	"ffprobe.exe"
)

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

ipcMain.handle("fs:getPreview", async (_event, videoPath) => {
	if (!videoPath) return null

	const previewsDir = path.join(app.getPath("userData"), "video-previews")

	if (!fs.existsSync(previewsDir)) {
		try {
			fs.mkdirSync(previewsDir, { recursive: true })
		} catch (err) {
			log.error("Ошибка создания папки для превью:", err)
			return null
		}
	}

	const previewFilename = `${path.basename(videoPath)}.jpg`
	const previewPath = path.join(previewsDir, previewFilename)

	// Кеш
	if (fs.existsSync(previewPath)) {
		return previewPath
	}

	return new Promise((resolve) => {
		ffmpeg(videoPath)
			.screenshots({
				count: 1,
				filename: previewFilename,
				folder: previewsDir,
				size: "426x240",
			})
			.on("end", () => resolve(previewPath))
			.on("error", (err) => {
				log.error("ffmpeg error", err)
				resolve(null)
			})
	})
})

ipcMain.handle("fs:loadPreview", async (_event, previewPath) => {
	try {
		const buffer = fs.readFileSync(previewPath)
		const base64 = buffer.toString("base64")
		return `data:image/jpeg;base64,${base64}`
	} catch (e) {
		console.error("Ошибка при загрузке превью", e)
		return null
	}
})

// Добавляем обработчик для получения URL видео
ipcMain.handle("fs:getVideoUrl", async (_event, videoPath) => {
	if (!videoPath || !fs.existsSync(videoPath)) {
		return null
	}
	return `local-video://${encodeURIComponent(videoPath)}`
})

ipcMain.handle("open-external-video", async (_, filePath) => {
	try {
		await shell.openPath(filePath)
		return { success: true }
	} catch (err) {
		console.error("Ошибка при открытии видеофайла:", err)
		return { success: false, error: err.message }
	}
})

ipcMain.handle("read-md-files", async (_event, folderPath) => {
	try {
		const files = await fs.promises.readdir(folderPath)
		const mdFiles = files.filter((f) => f.endsWith(".md"))

		const contents = await Promise.all(
			mdFiles.map(async (filename) => {
				const fullPath = path.join(folderPath, filename)
				const content = await fs.promises.readFile(fullPath, "utf-8")
				return {
					filename,
					fullPath,
					content,
				}
			})
		)

		return contents
	} catch (err) {
		console.error("Ошибка при чтении .md файлов:", err)
		throw err
	}
})

ipcMain.handle("get-markdown", async (_, folderPath) => {
	const files = fs.readdirSync(folderPath)
	const mdFile = files.find((file) => file.endsWith(".md"))
	console.log("hello")
	if (!mdFile) return null
	const fullPath = path.join(folderPath, mdFile)
	const content = fs.readFileSync(fullPath, "utf-8")
	return content
})

ipcMain.handle("get-folder-preview", async (event, folderPath) => {
	try {
		const files = await fs.promises.readdir(folderPath)
		const previewFile = files.find((file) =>
			/^preview\.(jpg|jpeg|png|webp)$/i.test(file)
		)
		if (previewFile) {
			const fullPath = path.join(folderPath, previewFile)
			const buffer = await fs.promises.readFile(fullPath)
			const ext = path.extname(previewFile).slice(1)
			const base64 = buffer.toString("base64")
			return `data:image/${ext};base64,${base64}`
		}
		return null
	} catch (error) {
		console.error("Ошибка в get-folder-preview:", error)
		return null
	}
})
