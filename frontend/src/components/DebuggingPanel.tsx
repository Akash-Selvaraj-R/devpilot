import { useState } from 'react';
import { Bug, Search, FileCode, AlertTriangle, CheckCircle, Loader2, Wrench } from 'lucide-react';
import clsx from 'clsx';

interface DebuggingPanelProps {
  diagnosis: any;
  isRunning?: boolean;
  onApplyFix?: () => void;
  fixApplied?: boolean;
}

export default function DebuggingPanel({ diagnosis, isRunning, onApplyFix, fixApplied }: DebuggingPanelProps) {
  const [activeTab, setActiveTab] = useState<'cause' | 'fix' | 'files'>('cause');

  if (isRunning) {
    return (
      <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
        <div className="px-4 py-3 bg-surface-800/30 border-b border-surface-800/50">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Debugging Agent
            </span>
            <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
              ACTIVE
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {['Test output', 'Stack trace', 'Source files', 'Recent changes'].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                <div className={clsx(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  i < 2 ? 'bg-emerald-500/10' : 'bg-surface-800/50'
                )}>
                  {i < 2 ? (
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-3 h-3 text-surface-500 animate-spin" />
                  )}
                </div>
                <span className={clsx(
                  'text-sm',
                  i < 2 ? 'text-surface-300' : 'text-surface-500'
                )}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
        <div className="px-4 py-3 bg-surface-800/30 border-b border-surface-800/50">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-surface-500" />
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Debugging Agent
            </span>
          </div>
        </div>
        <div className="text-center py-8">
          <Bug className="w-8 h-8 text-surface-700 mx-auto mb-2" />
          <p className="text-sm text-surface-500">No debugging data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-surface-800/30 border-b border-surface-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Debugging Agent
            </span>
            {fixApplied ? (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                FIX APPLIED
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                COMPLETE
              </span>
            )}
          </div>
          {diagnosis.confidence && (
            <span className="text-[10px] text-surface-500">
              AI Assessment
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-800/50">
        {[
          { key: 'cause' as const, label: 'Root Cause', icon: Search },
          { key: 'fix' as const, label: 'Recommended Fix', icon: Wrench },
          { key: 'files' as const, label: 'Affected Files', icon: FileCode },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
              activeTab === key
                ? 'border-brand-500 text-white bg-surface-800/30'
                : 'border-transparent text-surface-500 hover:text-surface-300'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'cause' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Root Cause
              </span>
            </div>
            <p className="text-sm text-surface-300 leading-relaxed">
              {diagnosis.root_cause || 'No root cause identified'}
            </p>
          </div>
        )}

        {activeTab === 'fix' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                Recommended Fix
              </span>
            </div>
            <p className="text-sm text-surface-300 leading-relaxed">
              {diagnosis.suggested_fix || 'No fix suggested'}
            </p>
            {onApplyFix && !fixApplied && (
              <button
                onClick={onApplyFix}
                className="mt-3 text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-lg transition-colors"
              >
                Apply Fix
              </button>
            )}
            {fixApplied && (
              <div className="flex items-center gap-2 mt-3 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Fix applied successfully</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Affected Files
            </span>
            <div className="space-y-1">
              {(diagnosis.affected_files || []).map((file: string, i: number) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/30">
                  <FileCode className="w-3.5 h-3.5 text-surface-500" />
                  <span className="text-sm font-mono text-surface-300">{file}</span>
                </div>
              ))}
              {(!diagnosis.affected_files || diagnosis.affected_files.length === 0) && (
                <p className="text-sm text-surface-500">No files affected</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confidence */}
      {diagnosis.confidence && (
        <div className="px-4 py-2.5 bg-surface-800/20 border-t border-surface-800/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-surface-500">Confidence</span>
            <span className={clsx(
              'text-xs font-semibold',
              diagnosis.confidence >= 0.8 ? 'text-emerald-400' :
              diagnosis.confidence >= 0.5 ? 'text-amber-400' :
              'text-red-400'
            )}>
              {typeof diagnosis.confidence === 'number'
                ? `${Math.round(diagnosis.confidence * 100)}%`
                : diagnosis.confidence}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
