import { Link, Outlet, useLocation } from 'react-router';

import { useAuth } from '@/context/AuthContext';

import { Button } from './Button';
import { EmptyState } from './EmptyState';
import styles from './RequireAuth.module.css';

export function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return null;
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return (
      <div className={styles.wrap}>
        <EmptyState
          message="로그인 후 이용하실 수 있습니다."
          action={
            <Link to="/sign-in" state={{ from }}>
              <Button type="button">로그인하기</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return <Outlet />;
}
