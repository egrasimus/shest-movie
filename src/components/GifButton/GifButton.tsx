import React from "react"
import styles from "./GifButton.module.scss"

const GifButton: React.FC = () => {
	const handleClick = () => {
		console.log("gifClick")
	}

	return (
		<button className={styles.fab} onClick={handleClick}>
			<span className={styles.plus}>+</span>
		</button>
	)
}

export default GifButton
