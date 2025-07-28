import React, { useState } from "react"
import styles from "./GifButton.module.scss"

const gifModules = import.meta.glob("../../assets/gif/*.gif", {
	eager: true,
	as: "url",
})
const gifs = Object.values(gifModules) as string[]

const GifButton: React.FC = () => {
	const [show, setShow] = useState(false)
	const [gif, setGif] = useState<string | null>(null)

	const handleClick = () => {
		if (gifs.length === 0) return
		const randomGif = gifs[Math.floor(Math.random() * gifs.length)]
		setGif(randomGif)
		setShow(true)
	}

	const handleClose = () => setShow(false)

	return (
		<>
			<button className={styles.fab} onClick={handleClick}>
				<span className={styles.plus}>gif</span>
			</button>
			{show && gif && (
				<div className={styles.overlay} onClick={handleClose}>
					<img src={gif} alt='Random gif' className={styles.gifImg} />
				</div>
			)}
		</>
	)
}

export default GifButton
