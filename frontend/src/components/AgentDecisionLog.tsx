import { Brain, FileCode, Clock, ChevronRight, CheckCircle, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import type { AgentDecision } from '../types';

interface AgentDecisionLogProps {
  decision: AgentDecision;
}

export default function AgentDecisionLog({ decision }: AgentDecisionLogProps) {
  return (
    <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-800/30 border-b border-surface-800/50">
        <Brain className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          Agent Decision
        </span>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Title */}
        <h4 className="text-sm font-semibold text-white">{decision.title}</h4>

        {/* Reasoning */}
        <div>
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Why?</span>
          <p className="mt-1 text-sm text-surface-300 leading-relaxed">{decision.reasoning}</p>
        </div>

        {/* Evidence */}
        {decision.evidence.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Evidence
            </span>
            <ul className="mt-1 space-y-1">
              {decision.evidence.map((file) => (
                <li key={file} className="flex items-center gap-1.5 text-xs text-surface-400">
                  <FileCode className="w-3 h-3 text-surface-500" />
                  <span className="font-mono">{file}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Affected Files */}
        {decision.affectedFiles.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Affected Files
            </span>
            <ul className="mt-1 space-y-1">
              {decision.affectedFiles.map((file) => (
                <li key={file} className="flex items-center gap-1.5 text-xs text-surface-400">
                  <ChevronRight className="w-3 h-3 text-surface-600" />
                  <span className="font-mono">{file}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Outcome */}
        <div>
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            Decision
          </span>
          <div className="mt-1 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm text-surface-300 leading-relaxed">{decision.outcome}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-800/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-brand-400">{decision.agent}</span>
            <div className="flex items-center gap-1 text-surface-600">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-mono text-surface-600">
                {new Date(decision.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {decision.diffLink && (
            <a
              href={decision.diffLink}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium',
                'bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors'
              )}
            >
              <ExternalLink className="w-3 h-3" />
              View Diff
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
