// ============================================================================
//  CENTINELA — Metric Card
// ============================================================================

import type { ReactNode } from 'react';

type MetricVariant = 'default' | 'success' | 'warning' | 'critical';

const variantStyles: Record<MetricVariant, string> = {
  default: 'bg-white border border-gray-100',
  success: 'bg-success-light border border-success/20',
  warning: 'bg-warning-light border border-warning/20',
  critical: 'bg-danger-light border border-danger/20',
};

interface MetricCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  suffix?: string;
  variant?: MetricVariant;
}

export function MetricCard({
  icon,
  value,
  label,
  suffix,
  variant = 'default',
}: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm text-center ${variantStyles[variant]}`}
    >
      <div className="flex justify-center mb-2 text-text-light">{icon}</div>
      <div className="text-3xl font-extrabold text-text">
        {value}
        {suffix && <span className="text-lg">{suffix}</span>}
      </div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </div>
  );
}
