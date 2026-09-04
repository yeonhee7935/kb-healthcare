import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/context/AuthContext';

import SignInPage from './page';

function renderSignInPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <SignInPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SignInPage', () => {
  it('이메일과 비밀번호가 모두 유효해야 제출 버튼이 활성화된다', async () => {
    const user = userEvent.setup();
    renderSignInPage();

    const submitButton = screen.getByRole('button', { name: '로그인' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText('이메일'), 'test@kbhealthcare.com');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText('비밀번호'), 'test1234');
    expect(submitButton).toBeEnabled();
  });

  it('비밀번호 형식이 안 맞으면 에러 메시지를 보여준다', async () => {
    const user = userEvent.setup();
    renderSignInPage();

    await user.type(screen.getByLabelText('비밀번호'), 'short');
    await user.tab();

    expect(await screen.findByText('영문과 숫자로 구성된 8~24자여야 합니다.')).toBeInTheDocument();
  });
});
