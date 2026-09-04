import { FaUser } from 'react-icons/fa6';
import { useNavigate } from 'react-router';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';

import { useUser } from '@/hooks/useUser';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';

import styles from './page.module.css';

export default function UserPage() {
  // 데이터 조회
  const { data, isPending, isError } = useUser();

  // 로그아웃 (인증 상태 초기화 + 로그인 화면으로 이동)
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in', { replace: true });
  };

  if (isPending) return <Spinner />;
  if (isError || !data) return <p>회원정보를 불러오지 못했습니다.</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>회원정보</h1>
      <div className={styles.profileRow}>
        <div className={styles.avatar}>
          <FaUser size={28} aria-hidden="true" />
        </div>
        <div className={styles.profileInfo}>
          <p className={styles.name}>{data.name}</p>
          <p className={styles.memo}>{data.memo}</p>
        </div>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="로그아웃"
        >
          <HiOutlineArrowRightOnRectangle size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
