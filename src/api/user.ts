import type { UserResponse } from '@/types/api';

import { apiFetch } from './client';

export function getUser() {
  return apiFetch<UserResponse>('/api/user');
}
