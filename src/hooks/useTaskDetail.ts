import { useQuery } from '@tanstack/react-query';

import { getTaskDetail } from '@/api/task';
import { ApiError } from '@/api/client';
import type { TaskDetailResponse } from '@/types/api';

export function useTaskDetail(id: string) {
  return useQuery<TaskDetailResponse, ApiError>({
    queryKey: ['task', id],
    queryFn: () => getTaskDetail(id),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}
