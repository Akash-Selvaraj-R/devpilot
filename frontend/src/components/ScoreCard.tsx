import { Award, Shield, TestTube, Layers, Code, FileText } from 'lucide-react';
import clsx from 'clsx';
import type { EngineeringScore } from '../types';
import { getScoreColor, getScoreBarColor } from '../utils/format';

interface ScoreCardProps {
  score: EngineeringScore;
}

const scoreCategories = [
  { key: 'code_quality' as const, label: 'Code Quality', icon: Code },
  { key: 'architecture' as const, label: 'Architecture', icon: Layers },
  { key: 'test_coverage' as const, label: 'Testing', icon: TestTube },
  { key: 'security' as const, label: 'Security', icon: Shield },
  { key: 'documentation' as const, label: 'Documentation', icon: FileText },
];

export default function ScoreCard({ score }: ScoreCardProps) {
  const allAbove85 = scoreCategories.every(
    (cat) => (score[cat.key] || 0) >= 85
  );

  return (
    <div className="rounded-xl glass p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-semibold text-surface-200">Engineering Score</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('text-2xl font-bold', getScoreColor(score.overall))}>
            {score.overall}
          </span>
          <span className="text-xs text-surface-500">/100</span>
        </div>
      </div>

      {allAbove85 && (
        <div className="mb-5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm font-medium text-emerald-400 text-center">
            READY TO SHIP
          </p>
        </div>
      )}

      <div className="space-y-3">
        {scoreCategories.map(({ key, label, icon: Icon }) => {
          const value = score[key] || 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-surface-500" />
                  <span className="text-xs text-surface-400">{label}</span>
                </div>
                <span className={clsx('text-xs font-medium', getScoreColor(value))}>
                  {value}
                </span>
              </div>
              <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500', getScoreBarColor(value))}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
