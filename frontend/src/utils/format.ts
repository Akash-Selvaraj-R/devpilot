export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    created: 'bg-surface-600 text-surface-200',
    pending: 'bg-surface-600 text-surface-200',
    analyzing: 'bg-blue-500/20 text-blue-400',
    planning: 'bg-purple-500/20 text-purple-400',
    implementing: 'bg-brand-500/20 text-brand-400',
    testing: 'bg-amber-500/20 text-amber-400',
    debugging: 'bg-orange-500/20 text-orange-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
    running: 'bg-brand-500/20 text-brand-400',
    error: 'bg-red-500/20 text-red-400',
    success: 'bg-emerald-500/20 text-emerald-400',
  };
  return colors[status] || 'bg-surface-600 text-surface-200';
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
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
  return icons[status] || 'circle';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-brand-400';
  if (score >= 70) return 'text-amber-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
}

export function getScoreBarColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 80) return 'bg-brand-500';
  if (score >= 70) return 'bg-amber-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}
