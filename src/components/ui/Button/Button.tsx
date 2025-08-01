import React from "react"
import styles from "./Button.module.scss"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
	children,
	className = "",
	...props
}) => {
	return (
		<button className={`${styles.button} ${className}`} {...props}>
			{children}
		</button>
	)
}

export default Button
