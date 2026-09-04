import { Outlet } from 'react-router';

import { Nav } from './Nav';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.shell}>
      <Nav />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
