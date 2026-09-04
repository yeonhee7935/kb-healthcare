import { createPortal } from 'react-dom';

import styles from './Toast.module.css';

interface ToastItem {
  id: number;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
}

export function Toast({ toasts }: ToastProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.wrap} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <p key={toast.id} className={styles.toast}>
          {toast.message}
        </p>
      ))}
    </div>,
    document.body,
  );
}
