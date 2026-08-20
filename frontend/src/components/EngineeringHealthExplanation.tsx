import { X, Shield, TestTube, Code, Layers, FileText, Award, Info } from 'lucide-react';
import clsx from 'clsx';
import type { EngineeringHealth } from '../types';
import { getScoreColor } from '../utils/format';

interface Props {
  health: EngineeringHealth;
  onClose: () => void;
}

const categories = [
  { key: 'code_quality' as const, label: 'Code Quality', icon: Code, factors: ['complexity', 'duplication', 'maintainability'] },
  { key: 'architecture' as const, label: 'Architecture', icon: Layers, factors: ['separation of concerns', 'dependency structure', 'layering'] },
  { key: 'testing' as const, label: 'Testing', icon: TestTube, factors: ['test coverage', 'test results', 'regression protection'] },
  { key: 'security' as const, label: 'Security', icon: Shield, factors: ['authentication', 'authorization', 'common vulnerabilities'] },
  { key: 'documentation' as const, label: 'Documentation', icon: FileText, factors: ['README', 'API documentation', 'code comments'] },
];

const getBarColor = (score: number) =>
  score >= 90 ? 'bg-emerald-500' : score >= 80 ? 'bg-brand-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500';

export default function EngineeringHealthExplanation({ health, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-xl border border-surface-800/50 bg-surface-950 max-w-lg w-full mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-semibold text-surface-100">Engineering Health</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className={clsx('text-5xl font-bold', getScoreColor(health.overall))}>{health.overall}</div>
          <div className="text-sm text-surface-500 mt-1">Overall Score</div>
        </div>

        <div className="space-y-4 mb-6">
          {categories.map(({ key, label, icon: Icon, factors }) => {
            const value = health[key] || 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-surface-400" />
                    <span className="text-sm font-medium text-surface-300">{label}</span>
                  </div>
                  <span className={clsx('text-sm font-semibold', getScoreColor(value))}>{value}</span>
                </div>
                <div className="h-2 bg-surface-800 rounded-full overflow-hidden mb-1.5">
                  <div className={clsx('h-full rounded-full transition-all duration-500', getBarColor(value))} style={{ width: `${value}%` }} />
                </div>
                <p className="text-xs text-surface-500">Based on: {factors.join(', ')}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-900/50 border border-surface-800/30">
          <Info className="w-4 h-4 text-surface-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-surface-500">DevPilot Engineering Health — an AI-assisted project assessment.</p>
        </div>
      </div>
    </div>
  );
}
