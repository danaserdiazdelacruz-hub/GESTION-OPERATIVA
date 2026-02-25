// ============================================================================
//  CENTINELA — Header
// ============================================================================

import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/config/constants';

const LOGO_URL =
  "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='eyeGrad' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFF;stop-opacity:1' /%3E%3Cstop offset='70%25' style='stop-color:%23007BFF;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230056b3;stop-opacity:1' /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='40' fill='url(%23eyeGrad)'/%3E%3Cellipse cx='50' cy='50' rx='25' ry='18' fill='%23FFF'/%3E%3Ccircle cx='50' cy='50' r='12' fill='%23007BFF'/%3E%3Ccircle cx='50' cy='50' r='6' fill='%230056b3'/%3E%3Ccircle cx='48' cy='47' r='2' fill='%23FFF'/%3E%3C/svg%3E";

export function Header() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const initials = (
    currentUser.displayName
      .split(' ')
      .map((n) => n[0])
      .join('') || currentUser.username[0]
  ).toUpperCase();

  const roleName = ROLE_LABELS[currentUser.role] || currentUser.role;

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-white rounded-2xl p-4 shadow-md mb-4">
      {/* Logo */}
      <div className="flex items-center">
        <button onClick={() => location.reload()} className="focus:outline-none">
          <img src={LOGO_URL} alt="Centinela Logo" className="h-14 w-14 object-contain" />
        </button>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-text">Centinela</h1>
        <p className="text-sm text-text-secondary">Plataforma de Seguridad Operativa GS</p>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 justify-end">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-sm font-semibold text-text">{currentUser.displayName}</div>
          <div className="text-xs text-text-light">{roleName}</div>
        </div>
        <button
          onClick={logout}
          title="Cerrar Sesión"
          className="p-2 rounded-lg text-text-light hover:bg-danger-light hover:text-danger transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
