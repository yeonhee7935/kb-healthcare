import { NavLink } from 'react-router';
import { RiDashboardFill } from 'react-icons/ri';
import { FaListCheck, FaRightToBracket, FaUser } from 'react-icons/fa6';

import { useAuth } from '@/context/AuthContext';

import styles from './Nav.module.css';

function navItemClass({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.item} ${styles.itemActive}` : styles.item;
}

export function Nav() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className={styles.nav} aria-label="주요 메뉴">
      <NavLink to="/" end className={navItemClass}>
        <RiDashboardFill size={20} className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>대시보드</span>
      </NavLink>
      <NavLink to="/task" className={navItemClass}>
        <FaListCheck size={20} className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>할 일</span>
      </NavLink>
      {isAuthenticated ? (
        <NavLink to="/user" className={navItemClass}>
          <FaUser size={20} className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>회원정보</span>
        </NavLink>
      ) : (
        <NavLink to="/sign-in" className={navItemClass}>
          <FaRightToBracket size={20} className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>로그인</span>
        </NavLink>
      )}
    </nav>
  );
}
