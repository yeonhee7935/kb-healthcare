import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { useSearchParams } from 'react-router';

import type { TaskItem } from '@/types/api';
import { useTasks } from '@/hooks/useTasks';
import { useCreateTask } from '@/hooks/useCreateTask';
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus';
import { Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';

import styles from './page.module.css';
import { useTaskListVirtualizer } from './_hooks/useTaskListVirtualizer';
import { TaskRow } from './_components/TaskRow';
import { AddTaskModal } from './_components/AddTaskModal';

type TaskFilter = 'ALL' | TaskItem['status'];

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'TODO', label: '할 일' },
  { value: 'DONE', label: '한 일' },
];

const EMPTY_MESSAGE: Record<TaskFilter, string> = {
  ALL: '아직 등록된 할 일이 없습니다.',
  TODO: '할 일이 없습니다.',
  DONE: '완료한 할 일이 없습니다.',
};

export default function TaskListPage() {
  // 데이터 조회
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateStatusMutation = useUpdateTaskStatus();

  // 필터 (URL 쿼리스트링 ?filter=와 동기화)
  const [searchParams, setSearchParams] = useSearchParams();
  const rawFilter = searchParams.get('filter');
  const filter: TaskFilter = rawFilter === 'TODO' || rawFilter === 'DONE' ? rawFilter : 'ALL';

  // 할 일 추가 모달
  const [isAddOpen, setIsAddOpen] = useState(false);

  // 가상 스크롤 + 무한 스크롤
  const tasks = data ? data.pages.flatMap((page) => page.data) : [];
  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter((task) => task.status === filter);
  const { scrollAreaRef, rowVirtualizer, virtualItems } = useTaskListVirtualizer({
    itemCount: filteredTasks.length,
    hasNextPage,
    isFetchingNextPage,
    onFetchNextPage: fetchNextPage,
  });

  // 핸들러
  const handleFilterChange = (value: TaskFilter) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('filter', value);
        return next;
      },
      { replace: true },
    );
  };

  const handleCreate = async (payload: { title: string; memo: string }) => {
    await createTaskMutation.mutateAsync(payload);
    setIsAddOpen(false);
  };

  if (isPending) return <Spinner />;
  if (isError || !data) return <p>할 일 목록을 불러오지 못했습니다.</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>할 일</h1>

      <div className={styles.tabs}>
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={filter === item.value ? styles.tabActive : styles.tab}
            onClick={() => handleFilterChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState message={EMPTY_MESSAGE[filter]} />
      ) : (
        <div ref={scrollAreaRef} className={styles.scrollArea}>
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {virtualItems.map((virtualItem) => {
              const isLoaderRow = virtualItem.index > filteredTasks.length - 1;
              const task = filteredTasks[virtualItem.index];

              return (
                <div
                  key={virtualItem.key}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualItem.index}
                  className={styles.virtualRow}
                  style={{ transform: `translateY(${virtualItem.start}px)` }}
                >
                  {isLoaderRow ? (
                    <div className={styles.loaderRow}>
                      <Spinner />
                    </div>
                  ) : (
                    <TaskRow
                      task={task}
                      onToggleStatus={() =>
                        updateStatusMutation.mutate({
                          id: task.id,
                          status: task.status === 'DONE' ? 'TODO' : 'DONE',
                        })
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.fabWrap}>
        <button
          type="button"
          className={styles.fab}
          onClick={() => setIsAddOpen(true)}
          aria-label="할 일 추가"
        >
          <FaPlus size={20} aria-hidden="true" />
        </button>
      </div>

      {isAddOpen && (
        <AddTaskModal
          onClose={() => setIsAddOpen(false)}
          onCreate={handleCreate}
          isSubmitting={createTaskMutation.isPending}
        />
      )}
    </div>
  );
}
