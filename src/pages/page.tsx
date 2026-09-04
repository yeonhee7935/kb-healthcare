import { Link } from 'react-router';

import { Card } from '@/components/Card';
import { Spinner } from '@/components/Spinner';
import { useDashboard } from '@/hooks/useDashboard';

import styles from './page.module.css';

export default function DashboardPage() {
  const { data, isPending, isError } = useDashboard();

  if (isPending) return <Spinner />;
  if (isError || !data) return <p>대시보드 정보를 불러오지 못했습니다.</p>;

  const items = [
    { label: '일', value: data.numOfTask, filter: 'ALL' },
    { label: '해야 할 일', value: data.numOfRestTask, filter: 'TODO' },
    { label: '한 일', value: data.numOfDoneTask, filter: 'DONE' },
  ] as const;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>대시보드</h1>
      <div className={styles.grid}>
        {items.map((item) => (
          <Link key={item.label} to={`/task?filter=${item.filter}`} className={styles.cardLink}>
            <Card>
              <p className={styles.label}>{item.label}</p>
              <p className={styles.value}>{item.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
