import type { AuthTokenResponse, SignInRequest } from '@/types/api';

import { apiFetch } from './client';

export function signIn(payload: SignInRequest) {
  return apiFetch<AuthTokenResponse>('/api/sign-in', { method: 'POST', body: payload });
}

/** openapi.yaml에 없는 endpoint. refreshToken 쿠키를 서버에서 무효화하기 위해 추가 */
export function signOut() {
  return apiFetch<{ success: boolean }>('/api/sign-out', { method: 'POST' });
}
