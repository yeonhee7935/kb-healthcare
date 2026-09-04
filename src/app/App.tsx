import { Navigate, Route, Routes } from 'react-router';

import DashboardPage from '@/pages/page';
import { Layout } from '@/components/Layout';
import { RequireAuth } from '@/components/RequireAuth';

import UserPage from '@/pages/user/page';
import TaskListPage from '@/pages/task/page';
import SignInPage from '@/pages/sign-in/page';
import TaskDetailPage from '@/pages/task/[id]/page';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/task" element={<TaskListPage />} />
          <Route path="/task/:id" element={<TaskDetailPage />} />
          <Route path="/user" element={<UserPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
