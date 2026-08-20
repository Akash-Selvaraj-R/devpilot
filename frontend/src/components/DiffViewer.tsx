import { useState } from 'react';
import { FileCode, Copy, Check, Info, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import CodeDiff from './CodeDiff';
import type { CodeChange } from '../types';

interface DiffViewerProps {
  changes: CodeChange[];
  onExplain?: (change: CodeChange) => void;
  explainLoading?: boolean;
  explainResult?: string | null;
}

export default function DiffViewer({ changes, onExplain, explainLoading, explainResult }: DiffViewerProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showWhy, setShowWhy] = useState<Record<number, boolean>>({});

  if (changes.length === 0) {
    return (
      <div className="text-center py-8">
        <FileCode className="w-8 h-8 text-surface-700 mx-auto mb-2" />
        <p className="text-sm text-surface-500">No code changes yet</p>
      </div>
    );
  }

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleWhy = (index: number) => {
    setShowWhy((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const currentChange = changes[activeFile];
  const stats = {
    created: changes.filter((c) => c.operation === 'create').length,
    modified: changes.filter((c) => c.operation === 'modify').length,
    removed: changes.filter((c) => c.operation === 'remove').length,
  };

  return (
    <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
      {/* Header with file impact summary */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-800/30 border-b border-surface-800/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            Files Changed
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            {stats.created > 0 && (
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{stats.created} created
              </span>
            )}
            {stats.modified > 0 && (
              <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                ~{stats.modified} modified
              </span>
            )}
            {stats.removed > 0 && (
              <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                -{stats.removed} removed
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] text-surface-600">
          {changes.length} file{changes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* File tabs */}
      <div className="flex overflow-x-auto border-b border-surface-800/50 bg-surface-900/50">
        {changes.map((change, index) => {
          const fileName = change.file_path.split('/').pop() || change.file_path;
          const isActive = index === activeFile;

          return (
            <button
              key={index}
              onClick={() => setActiveFile(index)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-mono border-b-2 transition-colors whitespace-nowrap',
                isActive
                  ? 'border-brand-500 text-white bg-surface-800/50'
                  : 'border-transparent text-surface-500 hover:text-surface-300 hover:bg-surface-800/30'
              )}
            >
              <FileCode className={clsx(
                'w-3 h-3 flex-shrink-0',
                change.operation === 'create' ? 'text-emerald-400' :
                change.operation === 'modify' ? 'text-amber-400' : 'text-red-400'
              )} />
              <span>{fileName}</span>
            </button>
          );
        })}
      </div>

      {/* Diff content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-surface-400">{currentChange.file_path}</span>
            <span className={clsx(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded',
              currentChange.operation === 'create' ? 'text-emerald-400 bg-emerald-500/10' :
              currentChange.operation === 'modify' ? 'text-amber-400 bg-amber-500/10' :
              'text-red-400 bg-red-500/10'
            )}>
              {currentChange.operation.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCopy(currentChange.content, activeFile)}
              className="p-1.5 rounded-md text-surface-500 hover:text-white hover:bg-surface-800/50 transition-colors"
              title="Copy content"
            >
              {copiedIndex === activeFile ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            {onExplain && (
              <button
                onClick={() => onExplain(currentChange)}
                disabled={explainLoading}
                className="p-1.5 rounded-md text-surface-500 hover:text-white hover:bg-surface-800/50 transition-colors disabled:opacity-50"
                title="Explain this change"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {currentChange.diff ? (
          <CodeDiff diff={currentChange.diff} language={currentChange.language} />
        ) : currentChange.content ? (
          <pre className="font-mono text-sm text-surface-300 bg-surface-900 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
            {currentChange.content}
          </pre>
        ) : (
          <p className="text-sm text-surface-500">No diff available</p>
        )}

        {/* Why This Change section for current file */}
        {(currentChange.why || currentChange.impact) && (
          <div className="mt-3">
            <button
              onClick={() => toggleWhy(activeFile)}
              className="flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              Why this change?
              {showWhy[activeFile] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showWhy[activeFile] && (
              <div className="mt-2 p-3 rounded-lg bg-surface-800/20 border border-surface-800/30 space-y-2">
                {currentChange.why && (
                  <div>
                    <span className="text-[10px] font-semibold text-surface-500 uppercase">Reason</span>
                    <p className="text-sm text-surface-300 leading-relaxed mt-1">{currentChange.why}</p>
                  </div>
                )}
                {currentChange.impact && (
                  <div>
                    <span className="text-[10px] font-semibold text-surface-500 uppercase">Impact</span>
                    <p className="text-sm text-emerald-400 mt-1">{currentChange.impact}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explain panel */}
      {explainResult && (
        <div className="border-t border-surface-800/50 px-4 py-3 bg-surface-800/20">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
              Why This Change?
            </span>
          </div>
          <p className="text-sm text-surface-300 leading-relaxed">{explainResult}</p>
        </div>
      )}

      {explainLoading && (
        <div className="border-t border-surface-800/50 px-4 py-3 bg-surface-800/20">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-surface-400">Analyzing change...</span>
          </div>
        </div>
      )}
    </div>
  );
}
