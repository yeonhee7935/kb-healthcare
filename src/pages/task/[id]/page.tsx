import { useState } from 'react';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Link, useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/client';
import { formatDateTime } from '@/lib/formatDateTime';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { useTaskDetail } from '@/hooks/useTaskDetail';

import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { FormField } from '@/components/FormField';
import { EmptyState } from '@/components/EmptyState';

import styles from './page.module.css';

export default function TaskDetailPage() {
  // 라우트 파라미터 / 네비게이션
  const { id } = useParams<{ id: string }>();
  const taskId = id ?? '';
  const navigate = useNavigate();

  // 데이터 조회
  const { data, isPending, isError, error } = useTaskDetail(taskId);
  const deleteMutation = useDeleteTask();

  // 삭제 확인 모달
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  if (isPending) return <Spinner />;

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          message="할 일을 찾을 수 없습니다."
          action={
            <Link to="/task">
              <Button type="button">목록으로</Button>
            </Link>
          }
        />
      );
    }
    return <p>할 일 정보를 불러오지 못했습니다.</p>;
  }

  if (!data) return null;

  const closeConfirm = () => {
    setIsConfirmOpen(false);
    setConfirmInput('');
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(taskId);
    navigate('/task', { replace: true });
  };

  return (
    <div className={styles.page}>
      <Link to="/task" className={styles.backButton} aria-label="목록으로">
        <HiOutlineArrowLeft size={20} aria-hidden="true" />
      </Link>
      <Card>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.memo}>{data.memo}</p>
        <p className={styles.date}>{formatDateTime(data.registerDatetime)}</p>
      </Card>
      <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
        삭제
      </Button>

      {isConfirmOpen && (
        <Modal title="할 일 삭제" onClose={closeConfirm}>
          <div className={styles.confirmForm}>
            <p className={styles.confirmDescription}>
              삭제하려면 ID(<strong>{taskId}</strong>)를 정확히 입력해주세요.
            </p>
            <FormField
              label="ID 확인"
              value={confirmInput}
              onChange={(event) => setConfirmInput(event.target.value)}
            />
            <Button
              variant="danger"
              disabled={confirmInput !== taskId || deleteMutation.isPending}
              onClick={handleDelete}
            >
              삭제 확인
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
