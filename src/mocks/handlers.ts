import { http, HttpResponse } from 'msw';

import { MOCK_CREDENTIALS, mockTasks, mockUserProfile } from './data';

const PAGE_SIZE = 10;
const ACCESS_TOKEN_TTL_SEC = 5 * 60;
const REFRESH_TOKEN_TTL_SEC = 60 * 60 * 24 * 7;
const REFRESH_COOKIE_NAME = 'token';

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** 실제 서명된 JWT는 아니고, "id/exp를 담은 payload" 형태만 스펙에 맞춘 것 */
function createToken(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  return `${header}.${body}.mock-signature`;
}

function issueTokens() {
  const now = Math.floor(Date.now() / 1000);
  return {
    accessToken: createToken({ id: 'mock-user-1', exp: now + ACCESS_TOKEN_TTL_SEC }),
    refreshToken: createToken({ id: 'mock-user-1', exp: now + REFRESH_TOKEN_TTL_SEC }),
  };
}

function authTokenResponse() {
  const { accessToken, refreshToken } = issueTokens();
  return HttpResponse.json(
    { accessToken, refreshToken },
    {
      headers: {
        'Set-Cookie': `${REFRESH_COOKIE_NAME}=${refreshToken}; Path=/; HttpOnly; SameSite=Lax`,
      },
    },
  );
}

function isAuthorized(request: Request): boolean {
  return Boolean(request.headers.get('authorization')?.startsWith('Bearer '));
}

function unauthorized() {
  return HttpResponse.json({ errorMessage: '인증이 필요합니다.' }, { status: 401 });
}

export const handlers = [
  http.post('/api/sign-in', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email !== MOCK_CREDENTIALS.email || body.password !== MOCK_CREDENTIALS.password) {
      return HttpResponse.json(
        { errorMessage: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 400 },
      );
    }
    return authTokenResponse();
  }),

  http.post('/api/refresh', ({ cookies }) => {
    if (!cookies[REFRESH_COOKIE_NAME]) {
      return HttpResponse.json({ errorMessage: '인증이 만료되었습니다.' }, { status: 401 });
    }
    return authTokenResponse();
  }),

  /** openapi.yaml에 없는 mock 전용 endpoint. 로그아웃 시 refreshToken 쿠키 무효화용. */
  http.post('/api/sign-out', () => {
    return HttpResponse.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        },
      },
    );
  }),

  http.get('/api/user', ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    return HttpResponse.json(mockUserProfile);
  }),

  http.get('/api/dashboard', ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const numOfTask = mockTasks.length;
    const numOfDoneTask = mockTasks.filter((task) => task.status === 'DONE').length;
    return HttpResponse.json({
      numOfTask,
      numOfRestTask: numOfTask - numOfDoneTask,
      numOfDoneTask,
    });
  }),

  /** openapi.yaml에 없는 mock 전용 endpoint. 할 일 추가 버튼용. */
  http.post('/api/task', async ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const body = (await request.json()) as { title: string; memo: string };
    const task = {
      id: String(Date.now()),
      title: body.title,
      memo: body.memo,
      status: 'TODO' as const,
      registerDatetime: new Date().toISOString(),
    };
    mockTasks.unshift(task);
    return HttpResponse.json(
      { id: task.id, title: task.title, memo: task.memo, status: task.status },
      { status: 201 },
    );
  }),

  /** openapi.yaml에 없는 mock 전용 endpoint. 체크박스 완료 토글용. */
  http.patch('/api/task/:id', async ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const task = mockTasks.find((item) => item.id === String(params.id));
    if (!task) {
      return HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다.' }, { status: 404 });
    }
    const body = (await request.json()) as { status: 'TODO' | 'DONE' };
    task.status = body.status;
    return HttpResponse.json({
      id: task.id,
      title: task.title,
      memo: task.memo,
      status: task.status,
    });
  }),

  http.get('/api/task', ({ request }) => {
    if (!isAuthorized(request)) return unauthorized();
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = mockTasks.slice(start, start + PAGE_SIZE);
    return HttpResponse.json({
      data: pageItems.map(({ id, title, memo, status }) => ({ id, title, memo, status })),
      hasNext: start + PAGE_SIZE < mockTasks.length,
    });
  }),

  http.get('/api/task/:id', ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const task = mockTasks.find((item) => item.id === String(params.id));
    if (!task) {
      return HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다.' }, { status: 404 });
    }
    return HttpResponse.json({
      title: task.title,
      memo: task.memo,
      registerDatetime: task.registerDatetime,
    });
  }),

  http.delete('/api/task/:id', ({ request, params }) => {
    if (!isAuthorized(request)) return unauthorized();
    const index = mockTasks.findIndex((task) => task.id === String(params.id));
    if (index === -1) {
      return HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다.' }, { status: 404 });
    }
    mockTasks.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),
];
