import styles from './Spinner.module.css';

export function Spinner() {
  return <div className={styles.spinner} role="status" aria-label="로딩 중" />;
}
