// ============================================================================
//  CENTINELA — Loading Overlay
// ============================================================================

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  visible: boolean;
}

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader2 className="h-12 w-12 text-primary animate-spin-slow" />
    </div>
  );
}
