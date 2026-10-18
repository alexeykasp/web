import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.root}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.text}>Страница не найдена</p>
      <Link href="/" className={styles.link}>
        Вернуться на главную
      </Link>
    </main>
  );
}
