import {
  Search,
  Map,
  Code,
  FlaskConical,
  Bug,
  FileText,
  Loader,
  AlertCircle,
  MessageSquare,
  FileCode,
} from 'lucide-react';
import clsx from 'clsx';
import type { AgentEvent } from '../types';
import { formatDate } from '../utils/format';

interface AgentTimelineProps {
  events: AgentEvent[];
  currentStatus?: string;
}

const eventIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  message: MessageSquare,
  code_change: FileCode,
  test_output: FlaskConical,
  error: AlertCircle,
  status: AlertCircle,
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  analyze: Search,
  plan: Map,
  implement: Code,
  test: FlaskConical,
  debug: Bug,
  report: FileText,
};

function getEventType(event: AgentEvent): string {
  return event.type || event.event_type || 'message';
}

function getEventContent(event: AgentEvent): string {
  if (event.content) return event.content;
  if (event.message) return event.message;
  try {
    const parsed = JSON.parse(event.data);
    return parsed.message || parsed.summary || JSON.stringify(parsed);
  } catch {
    return event.data || '';
  }
}

function getEventIcon(event: AgentEvent): React.ComponentType<{ className?: string }> {
  const metadata = event.metadata;
  if (metadata?.step) {
    return statusIcons[metadata.step as string] || MessageSquare;
  }
  return eventIcons[getEventType(event)] || MessageSquare;
}

export default function AgentTimeline({ events, currentStatus }: AgentTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-surface-800" />

      <div className="space-y-4">
        {currentStatus && (
          <div className="relative flex items-start gap-3 animate-in">
            <div className="relative z-10 w-8 h-8 rounded-full bg-brand-500/20 border-2 border-brand-500 flex items-center justify-center">
              <Loader className="w-4 h-4 text-brand-400 animate-spin" />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-brand-400 capitalize">
                {currentStatus}...
              </p>
              <p className="text-xs text-surface-500 mt-0.5">In progress</p>
            </div>
          </div>
        )}

        {sortedEvents.map((event, index) => {
          const Icon = getEventIcon(event);
          const eventType = getEventType(event);
          const content = getEventContent(event);
          const isLast = index === sortedEvents.length - 1;

          return (
            <div
              key={event.id}
              className="relative flex items-start gap-3 animate-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={clsx(
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center',
                  eventType === 'error'
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : eventType === 'code_change'
                    ? 'bg-emerald-500/20 border-2 border-emerald-500'
                    : 'bg-surface-800 border-2 border-surface-700'
                )}
              >
                <Icon
                  className={clsx(
                    'w-4 h-4',
                    eventType === 'error'
                      ? 'text-red-400'
                      : eventType === 'code_change'
                      ? 'text-emerald-400'
                      : 'text-surface-400'
                  )}
                />
              </div>

              <div className={clsx('flex-1 pt-1', !isLast && 'pb-2')}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-surface-200">
                    {eventType === 'code_change'
                      ? (event.metadata?.file_path as string) || 'Code change'
                      : eventType === 'test_output'
                      ? 'Test output'
                      : eventType === 'error'
                      ? 'Error'
                      : event.event_type || 'Update'}
                  </p>
                  <span className="text-xs text-surface-600">
                    {formatDate(event.created_at)}
                  </span>
                </div>
                <p className="text-sm text-surface-400 mt-1 whitespace-pre-wrap break-words">
                  {content}
                </p>
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && !currentStatus && (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-surface-700 mx-auto mb-3" />
            <p className="text-sm text-surface-500">
              No activity yet. Start an action to see updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
