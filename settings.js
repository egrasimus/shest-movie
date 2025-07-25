import { app } from "electron"
import fs from "fs"
import path from "path"

const settingsPath = path.join(app.getPath("userData"), "settings.json")

function loadSettings() {
	try {
		return JSON.parse(fs.readFileSync(settingsPath, "utf-8"))
	} catch {
		return {}
	}
}

function saveSettings(data) {
	fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2))
}

export { loadSettings, saveSettings }
