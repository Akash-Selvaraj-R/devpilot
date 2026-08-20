import { Brain, Map, Code, FlaskConical, Bug, FileText, Check, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { WorkflowPhase } from '../types';

interface WorkflowIndicatorProps {
  currentPhase: WorkflowPhase;
  completedPhases: WorkflowPhase[];
  failedPhase?: WorkflowPhase | null;
}

const phases: { key: WorkflowPhase; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'think', label: 'THINK', description: 'Repository Analysis', icon: Brain },
  { key: 'plan', label: 'PLAN', description: 'Implementation Strategy', icon: Map },
  { key: 'act', label: 'ACT', description: 'Code Changes', icon: Code },
  { key: 'verify', label: 'VERIFY', description: 'Tests', icon: FlaskConical },
  { key: 'recover', label: 'RECOVER', description: 'Debugging', icon: Bug },
  { key: 'ship', label: 'SHIP', description: 'Engineering Report', icon: FileText },
];

export default function WorkflowIndicator({ currentPhase, completedPhases, failedPhase }: WorkflowIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {phases.map((phase, index) => {
        const Icon = phase.icon;
        const isCompleted = completedPhases.includes(phase.key);
        const isCurrent = currentPhase === phase.key;
        const isFailed = failedPhase === phase.key;
        const isPending = !isCompleted && !isCurrent && !isFailed;

        return (
          <div key={phase.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-emerald-500/20 border border-emerald-500/30',
                  isCurrent && 'bg-brand-500/20 border border-brand-500/40 animate-agent-pulse',
                  isFailed && 'bg-red-500/20 border border-red-500/30',
                  isPending && 'bg-surface-800/50 border border-surface-700/30'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                ) : isFailed ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <Icon className="w-5 h-5 text-surface-500" />
                )}
              </div>
              <div className="text-center">
                <p
                  className={clsx(
                    'text-xs font-semibold tracking-wider',
                    isCompleted && 'text-emerald-400',
                    isCurrent && 'text-brand-400',
                    isFailed && 'text-red-400',
                    isPending && 'text-surface-500'
                  )}
                >
                  {phase.label}
                </p>
                <p className="text-[10px] text-surface-600 hidden sm:block mt-0.5">
                  {phase.description}
                </p>
              </div>
            </div>
            {index < phases.length - 1 && (
              <div className="flex-1 mx-2 mt-[-20px]">
                <div
                  className={clsx(
                    'h-0.5 w-full rounded-full transition-all duration-500',
                    isCompleted ? 'bg-emerald-500/40' : 'bg-surface-800/50'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
