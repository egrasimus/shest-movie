import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
	plugins: [react()],
	root: "",
	base: "./",
	build: {
		outDir: resolve(__dirname, "dist"),
		emptyOutDir: true,
		sourcemap: true,
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "src/renderer"),
		},
	},
})
