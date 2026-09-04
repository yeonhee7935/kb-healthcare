import { useMutation } from '@tanstack/react-query';

import { signIn } from '@/api/auth';

export function useSignIn() {
  return useMutation({ mutationFn: signIn });
}
