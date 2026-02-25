// ============================================================================
//  CENTINELA — Status Badge
// ============================================================================

import type { ScoreStatus } from '@/types';

const statusColors: Record<string, string> = {
  critical: 'bg-danger-light text-danger-dark border border-danger/20',
  warning: 'bg-warning-light text-warning-dark border border-warning/20',
  optimal: 'bg-success-light text-success-dark border border-success/20',
  success: 'bg-success-light text-success-dark border border-success/20',
  new: 'bg-blue-50 text-primary-dark border border-primary/20',
  planned: 'bg-purple-50 text-purple-700 border border-purple-200',
  in_progress: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  pending_verification: 'bg-orange-50 text-orange-700 border border-orange-200',
  completed: 'bg-success-light text-success-dark border border-success/20',
  cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
  overdue: 'bg-danger-light text-danger-dark border border-danger/20',
};

interface StatusBadgeProps {
  status: ScoreStatus | string;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
  const colors = statusColors[status] || 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors} ${className}`}
    >
      {children}
    </span>
  );
}
