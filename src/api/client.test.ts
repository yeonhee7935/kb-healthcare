import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiFetch, refreshAccessToken } from './client';
import { setAccessToken } from './tokenStore';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiFetch', () => {
  beforeEach(() => {
    setAccessToken(null);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('토큰이 있으면 Authorization 헤더를 붙인다', async () => {
    setAccessToken('token-abc');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch('/api/dashboard');

    const [, requestInit] = vi.mocked(fetch).mock.calls[0];
    expect((requestInit?.headers as Record<string, string>).Authorization).toBe('Bearer token-abc');
  });

  it('토큰이 없으면 Authorization 헤더를 안 붙인다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch('/api/dashboard');

    const [, requestInit] = vi.mocked(fetch).mock.calls[0];
    expect((requestInit?.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('401이 아닌 에러는 서버 메시지로 ApiError를 던진다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ errorMessage: '잘못된 요청입니다.' }, 400),
    );

    await expect(apiFetch('/api/task')).rejects.toMatchObject({
      status: 400,
      message: '잘못된 요청입니다.',
    });
  });

  it('401이면 refresh 후 원요청을 한 번 재시도한다', async () => {
    setAccessToken('expired-token');
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ errorMessage: '인증이 필요합니다.' }, 401)) // 원요청
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'fresh-token', refreshToken: 'r' })) // refresh
      .mockResolvedValueOnce(jsonResponse({ numOfTask: 1, numOfRestTask: 1, numOfDoneTask: 0 })); // 재시도

    const result = await apiFetch('/api/dashboard');

    expect(result).toEqual({ numOfTask: 1, numOfRestTask: 1, numOfDoneTask: 0 });
    expect(fetch).toHaveBeenCalledTimes(3);
    const [, retryInit] = vi.mocked(fetch).mock.calls[2];
    expect((retryInit?.headers as Record<string, string>).Authorization).toBe('Bearer fresh-token');
  });

  it('refresh도 실패하면 무한 재시도 없이 ApiError를 던진다', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ errorMessage: '인증이 필요합니다.' }, 401))
      .mockResolvedValueOnce(jsonResponse({ errorMessage: '인증이 만료되었습니다.' }, 401)); // refresh 실패

    await expect(apiFetch('/api/dashboard')).rejects.toMatchObject({
      status: 401,
      message: '인증이 필요합니다.',
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('동시 요청이어도 refresh는 한 번만 호출된다', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ accessToken: 'a', refreshToken: 'b' }));

    const [first, second] = await Promise.all([refreshAccessToken(), refreshAccessToken()]);

    expect(first).toBe('a');
    expect(second).toBe('a');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
