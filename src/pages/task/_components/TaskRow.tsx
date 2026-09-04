import { Link } from 'react-router';
import { FaCircleCheck, FaRegCircle } from 'react-icons/fa6';

import type { TaskItem } from '@/types/api';

import styles from './TaskRow.module.css';

interface TaskRowProps {
  task: TaskItem;
  onToggleStatus: () => void;
}

export function TaskRow({ task, onToggleStatus }: TaskRowProps) {
  const isDone = task.status === 'DONE';

  return (
    <div className={styles.itemRow}>
      <button
        type="button"
        className={styles.checkboxButton}
        onClick={onToggleStatus}
        aria-label={isDone ? '완료 취소' : '완료로 표시'}
      >
        {isDone ? (
          <FaCircleCheck size={20} className={styles.checkboxDone} aria-hidden="true" />
        ) : (
          <FaRegCircle size={20} className={styles.checkbox} aria-hidden="true" />
        )}
      </button>
      <Link to={`/task/${task.id}`} className={styles.itemLink}>
        <p className={isDone ? styles.cardTitleDone : styles.cardTitle}>{task.title}</p>
        <p className={styles.cardMemo}>{task.memo}</p>
      </Link>
    </div>
  );
}
