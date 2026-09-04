import type { DashboardResponse } from '@/types/api';

import { apiFetch } from './client';

export function getDashboard() {
  return apiFetch<DashboardResponse>('/api/dashboard');
}
