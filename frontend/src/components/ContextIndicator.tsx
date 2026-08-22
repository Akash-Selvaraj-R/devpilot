import { useState } from 'react';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface ContextIndicatorProps {
  contextUsed: {
    current_code: boolean;
    repo_context: boolean;
    language: string | null;
    personality: string;
    personality_id?: string;
    developer_memory: number;
    previous_session: boolean;
    memory_categories?: string[];
    relevant_memory_ids?: string[];
    session_message_count?: number;
  };
}

interface ContextItem {
  label: string;
  detail: string;
  active: boolean;
}

export default function ContextIndicator({ contextUsed }: ContextIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  const sessionMsgCount = contextUsed.session_message_count ?? 0;

  const activeCount = [
    contextUsed.current_code,
    contextUsed.repo_context,
    !!contextUsed.language,
    true,
    contextUsed.developer_memory > 0,
    contextUsed.previous_session,
  ].filter(Boolean).length;

  const categories = contextUsed.memory_categories || [];
  const categorySummary = categories.length > 0
    ? [...new Set(categories)].map(c => c.replace('_', ' ')).join(', ')
    : 'none';

  const items: ContextItem[] = [
    {
      label: 'Current code',
      detail: contextUsed.current_code
        ? 'Code was provided in this request and included in the AI prompt'
        : 'No code was provided — response is based on general knowledge',
      active: contextUsed.current_code,
    },
    {
      label: 'Repository context',
      detail: contextUsed.repo_context
        ? 'Repository analysis summary was included to give the AI project-level context'
        : 'No repository analysis available — run Analyze to enable repository-aware responses',
      active: contextUsed.repo_context,
    },
    {
      label: contextUsed.language || 'Language',
      detail: contextUsed.language
        ? `Detected ${contextUsed.language} — memories and prompts tailored for this language`
        : 'No language detected — run Analyze or select a language',
      active: !!contextUsed.language,
    },
    {
      label: `${contextUsed.personality} personality`,
      detail: `System instructions, tone, and response style configured for ${contextUsed.personality} mode`,
      active: true,
    },
    {
      label: `${contextUsed.developer_memory} relevant memories`,
      detail: contextUsed.developer_memory > 0
        ? `${contextUsed.developer_memory} memories matched this request (${categorySummary}) and were injected into the AI prompt`
        : 'No relevant memories found for this request',
      active: contextUsed.developer_memory > 0,
    },
    {
      label: contextUsed.previous_session ? `Session history (${sessionMsgCount} messages)` : 'Previous session',
      detail: contextUsed.previous_session
        ? `${sessionMsgCount} previous messages from this session were included for continuity`
        : 'No previous session history available',
      active: contextUsed.previous_session,
    },
  ];

  return (
    <div className="glass rounded-lg border border-surface-700/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-800/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
            Context Used
          </span>
          <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded">
            {activeCount}/6
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-surface-500" />
        ) : (
          <ChevronRight className="w-3 h-3 text-surface-500" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-1.5">
          {items.map(item => (
            <div key={item.label} className="group">
              <div className="flex items-center gap-2 text-xs">
                {item.active ? (
                  <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-surface-700 flex-shrink-0" />
                )}
                <span className={clsx(item.active ? 'text-surface-300' : 'text-surface-600')}>
                  {item.label}
                </span>
              </div>
              <p className="text-[10px] text-surface-600 ml-5 mt-0.5 leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      )}

      {!expanded && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {items.filter(i => i.active).map(item => (
            <span key={item.label} className="text-[9px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
