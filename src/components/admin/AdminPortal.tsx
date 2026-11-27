import { useState } from 'react';
import {
  AdminUserProfile,
  clearAdminSession,
  getStoredAdminSession,
  saveAdminSession,
} from '../../lib/adminApi';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

interface AdminPortalProps {
  onExitToApp: () => void;
}

export function AdminPortal({ onExitToApp }: AdminPortalProps) {
  const [session, setSession] = useState<{ token: string; admin: AdminUserProfile } | null>(() =>
    getStoredAdminSession(),
  );

  const handleLoginSuccess = (token: string, admin: AdminUserProfile) => {
    saveAdminSession(token, admin);
    setSession({ token, admin });
  };

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
  };

  if (!session) {
    return <AdminLogin onSuccess={handleLoginSuccess} onExit={onExitToApp} />;
  }

  return (
    <AdminDashboard
      token={session.token}
      admin={session.admin}
      onLogout={handleLogout}
      onExitToApp={onExitToApp}
    />
  );
}
