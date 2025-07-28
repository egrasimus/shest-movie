import React, { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import styles from "./ErrorBoundary.module.scss"
import Button from "../ui/Button/Button"

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
	errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
	}

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error, errorInfo: null }
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo)
		this.setState({
			error,
			errorInfo,
		})
	}

	private handleReload = () => {
		window.location.reload()
	}

	private handleGoHome = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		})
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className={styles.errorContainer}>
					<div className={styles.errorContent}>
						<div className={styles.errorIcon}>⚠️</div>
						<h1 className={styles.errorTitle}>Что-то пошло не так</h1>
						<p className={styles.errorMessage}>
							Произошла непредвиденная ошибка в приложении. Мы уже работаем над
							её исправлением.
						</p>

						{process.env.NODE_ENV === "development" && this.state.error && (
							<details className={styles.errorDetails}>
								<summary>Детали ошибки (только для разработки)</summary>
								<pre className={styles.errorStack}>
									{this.state.error.toString()}
									{this.state.errorInfo?.componentStack}
								</pre>
							</details>
						)}

						<div className={styles.errorActions}>
							<Button
								className={styles.reloadButton}
								onClick={this.handleReload}
							>
								Перезагрузить приложение
							</Button>
							<Button className={styles.homeButton} onClick={this.handleGoHome}>
								Вернуться к началу
							</Button>
						</div>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
