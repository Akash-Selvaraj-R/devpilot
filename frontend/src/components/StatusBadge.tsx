import {
  Clock,
  Search,
  Map,
  Code,
  FlaskConical,
  Bug,
  CheckCircle,
  XCircle,
  Loader,
  AlertTriangle,
  Circle,
  Check,
} from 'lucide-react';
import clsx from 'clsx';
import { getStatusColor } from '../utils/format';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  circle: Circle,
  clock: Clock,
  search: Search,
  map: Map,
  code: Code,
  'flask-conical': FlaskConical,
  bug: Bug,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  loader: Loader,
  'alert-triangle': AlertTriangle,
  check: Check,
};

function getIconForStatus(status: string): React.ComponentType<{ className?: string }> {
  const iconNames: Record<string, string> = {
    created: 'circle',
    pending: 'clock',
    analyzing: 'search',
    planning: 'map',
    implementing: 'code',
    testing: 'flask-conical',
    debugging: 'bug',
    completed: 'check-circle',
    failed: 'x-circle',
    running: 'loader',
    error: 'alert-triangle',
    success: 'check',
  };
  return iconMap[iconNames[status] || 'circle'] || Circle;
}

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const Icon = getIconForStatus(status);
  const colorClass = getStatusColor(status);

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        colorClass,
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-xs': size === 'md',
          'px-3 py-1.5 text-sm': size === 'lg',
        }
      )}
    >
      {showIcon && (
        <Icon
          className={clsx(
            'flex-shrink-0',
            status === 'running' && 'animate-spin',
            {
              'w-3 h-3': size === 'sm',
              'w-3.5 h-3.5': size === 'md',
              'w-4 h-4': size === 'lg',
            }
          )}
        />
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
}
