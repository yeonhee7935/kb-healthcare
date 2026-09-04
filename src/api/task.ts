import type {
  DeleteTaskResponse,
  TaskDetailResponse,
  TaskItem,
  TaskListResponse,
} from '@/types/api';

import { apiFetch } from './client';

export function getTasks(page: number) {
  return apiFetch<TaskListResponse>(`/api/task?page=${page}`);
}

export function getTaskDetail(id: string) {
  return apiFetch<TaskDetailResponse>(`/api/task/${id}`);
}

export function deleteTask(id: string) {
  return apiFetch<DeleteTaskResponse>(`/api/task/${id}`, { method: 'DELETE' });
}

export interface CreateTaskRequest {
  title: string;
  memo: string;
}

/** openapi.yaml에 없는 endpoint  */
export function createTask(payload: CreateTaskRequest) {
  return apiFetch<TaskItem>('/api/task', { method: 'POST', body: payload });
}

/** openapi.yaml에 없는 endpoint */
export function updateTaskStatus(id: string, status: TaskItem['status']) {
  return apiFetch<TaskItem>(`/api/task/${id}`, { method: 'PATCH', body: { status } });
}
