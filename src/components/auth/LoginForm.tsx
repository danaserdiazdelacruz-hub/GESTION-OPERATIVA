// ============================================================================
//  CENTINELA — Login Form
// ============================================================================

import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LOGO_URL =
  "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='eyeGrad' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFF;stop-opacity:1' /%3E%3Cstop offset='70%25' style='stop-color:%23007BFF;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230056b3;stop-opacity:1' /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='40' fill='url(%23eyeGrad)'/%3E%3Cellipse cx='50' cy='50' rx='25' ry='18' fill='%23FFF'/%3E%3Ccircle cx='50' cy='50' r='12' fill='%23007BFF'/%3E%3Ccircle cx='50' cy='50' r='6' fill='%230056b3'/%3E%3Ccircle cx='48' cy='47' r='2' fill='%23FFF'/%3E%3C/svg%3E";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Centinela Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-text">Iniciar Sesión</h1>
          <p className="text-text-secondary text-sm mt-1">Plataforma de Seguridad Operativa</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-text mb-1.5">
              Usuario
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-text
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-all"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-text mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-text
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold
              hover:bg-primary-dark transition-colors shadow-glow
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Accediendo...' : 'Acceder'}
          </button>

          {error && (
            <div className="bg-danger-light text-danger-dark border border-danger rounded-xl px-4 py-3 text-sm font-semibold text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
