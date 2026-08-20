import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import clsx from 'clsx';
import type { EventStreamEntry } from '../types';

interface EventStreamPanelProps {
  events: EventStreamEntry[];
  collapsed?: boolean;
  onToggle?: () => void;
}

const typeColors: Record<string, string> = {
  info: 'text-surface-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

const agentColors: Record<string, string> = {
  analyzer: 'text-blue-400',
  planner: 'text-purple-400',
  implementer: 'text-brand-400',
  tester: 'text-amber-400',
  debugger: 'text-orange-400',
  evaluator: 'text-emerald-400',
  system: 'text-surface-500',
};

export default function EventStreamPanel({ events, collapsed = false, onToggle }: EventStreamPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const toggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  return (
    <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-800/30 hover:bg-surface-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-surface-400" />
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            Event Stream
          </span>
          <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded">
            {events.length}
          </span>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-surface-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-surface-500" />
        )}
      </button>

      {!isCollapsed && (
        <div className="max-h-64 overflow-y-auto font-mono text-xs">
          {events.length === 0 ? (
            <div className="px-4 py-6 text-center text-surface-600">
              No events yet. Start an agent to see the stream.
            </div>
          ) : (
            <div className="divide-y divide-surface-800/30">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 px-4 py-2 hover:bg-surface-800/20 transition-colors"
                >
                  <span className="text-surface-600 flex-shrink-0 mt-0.5">
                    {event.timestamp}
                  </span>
                  <span
                    className={clsx(
                      'flex-shrink-0 font-semibold w-24 text-right',
                      agentColors[event.agent] || 'text-surface-400'
                    )}
                  >
                    {event.agent}
                  </span>
                  <span className={clsx('flex-1', typeColors[event.type] || 'text-surface-400')}>
                    {event.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
