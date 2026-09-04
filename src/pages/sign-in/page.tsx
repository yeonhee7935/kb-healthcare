import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { ApiError } from '@/api/client';
import { useSignIn } from '@/hooks/useSignIn';
import { useAuth } from '@/context/AuthContext';

import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';

import styles from './page.module.css';

const signInSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .regex(/^[A-Za-z0-9]{8,24}$/, '영문과 숫자로 구성된 8~24자여야 합니다.'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  // 인증 / 로그인 요청
  const { setAccessToken } = useAuth();
  const signInMutation = useSignIn();

  // 라우팅 (로그인 성공 시 원래 접근하려던 경로로 복귀)
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 실패 모달
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 폼
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await signInMutation.mutateAsync(values);
      setAccessToken(result.accessToken);
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? '/', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '로그인에 실패했습니다.');
    }
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>로그인</h1>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <FormField
          label="이메일"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" disabled={!isValid || signInMutation.isPending}>
          로그인
        </Button>
      </form>

      {errorMessage && (
        <Modal title="로그인 실패" onClose={() => setErrorMessage(null)}>
          <div className={styles.modalBody}>
            <p>{errorMessage}</p>
            <Button type="button" onClick={() => setErrorMessage(null)}>
              확인
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
