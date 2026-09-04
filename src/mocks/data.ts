import type { TaskItem, UserResponse } from '@/types/api';

export const MOCK_CREDENTIALS = {
  email: 'test@kbhealthcare.com',
  password: 'test1234',
};

export const mockUserProfile: UserResponse = {
  name: '정연희',
  memo: '프론트엔드 개발자입니다!',
};

interface MockTask extends TaskItem {
  registerDatetime: string;
}

export const mockTasks: MockTask[] = Array.from({ length: 5 }, (_, index) => {
  const id = String(index + 1);
  const status: TaskItem['status'] = index % 3 === 0 ? 'DONE' : 'TODO';
  return {
    id,
    title: `할 일 ${id}`,
    memo: `할 일 ${id}에 대한 메모입니다.`,
    status,
    registerDatetime: new Date(Date.now() - index * 86_400_000).toISOString(),
  };
});
