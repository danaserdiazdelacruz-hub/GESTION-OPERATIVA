// ============================================================================
//  CENTINELA — App Root Component
// ============================================================================

import { useAuth } from '@/context/AuthContext';
import { LoadingOverlay } from '@/components/layout/LoadingOverlay';
import { AlertContainer } from '@/components/ui/AlertToast';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppShell } from '@/components/layout/AppShell';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <AlertContainer />
      {isAuthenticated ? <AppShell /> : <LoginForm />}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
