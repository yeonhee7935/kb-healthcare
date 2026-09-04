import { useState } from 'react';

import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';

import styles from './AddTaskModal.module.css';

// 480px 고정 폭 리스트에서 제목이 한 줄을 넘지 않도록 제한
const TITLE_MAX_LENGTH = 20;
const MEMO_MAX_LENGTH = 300;

interface AddTaskModalProps {
  onClose: () => void;
  onCreate: (payload: { title: string; memo: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function AddTaskModal({ onClose, onCreate, isSubmitting }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  const handleCreate = async () => {
    await onCreate({ title: title.trim(), memo: memo.trim() });
  };

  return (
    <Modal title="할 일 추가" onClose={onClose}>
      <div className={styles.addForm}>
        <FormField
          label="제목"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
        />
        <FormField
          label="메모"
          multiline
          rows={4}
          value={memo}
          maxLength={MEMO_MAX_LENGTH}
          onChange={(event) => setMemo(event.target.value)}
        />
        <Button disabled={title.trim().length === 0 || isSubmitting} onClick={handleCreate}>
          추가
        </Button>
      </div>
    </Modal>
  );
}
