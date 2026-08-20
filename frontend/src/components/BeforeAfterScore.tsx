import { ArrowRight, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import type { EngineeringHealth } from '../types';
import { getScoreColor } from '../utils/format';

interface BeforeAfterScoreProps {
  before: EngineeringHealth;
  after: EngineeringHealth;
  dataLabel?: string;
}

const categories = [
  { key: 'security' as const, label: 'Security' },
  { key: 'testing' as const, label: 'Testing' },
  { key: 'code_quality' as const, label: 'Code Quality' },
  { key: 'architecture' as const, label: 'Architecture' },
  { key: 'documentation' as const, label: 'Documentation' },
];

export default function BeforeAfterScore({ before, after, dataLabel }: BeforeAfterScoreProps) {
  const overallImprovement = after.overall - before.overall;

  return (
    <div className="rounded-xl glass p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-surface-200">Engineering Impact</h3>
        </div>
        {dataLabel && (
          <span className="text-[10px] font-semibold text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
            {dataLabel}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 px-3 text-xs text-surface-500 font-medium">
          <span>Category</span>
          <span className="text-center">Before</span>
          <span className="text-center">After</span>
        </div>

        {/* Categories */}
        {categories.map(({ key, label }) => {
          const beforeVal = before[key] || 0;
          const afterVal = after[key] || 0;
          const improvement = afterVal - beforeVal;

          return (
            <div key={key} className="grid grid-cols-3 gap-4 items-center px-3 py-2 rounded-lg bg-surface-800/20">
              <span className="text-xs text-surface-300">{label}</span>
              <div className="text-center">
                <span className={clsx('text-sm font-medium', getScoreColor(beforeVal))}>
                  {beforeVal}
                </span>
              </div>
              <div className="text-center flex items-center justify-center gap-2">
                <ArrowRight className="w-3 h-3 text-surface-600" />
                <span className={clsx('text-sm font-bold', getScoreColor(afterVal))}>
                  {afterVal}
                </span>
                {improvement > 0 && (
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    +{improvement}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Overall */}
        <div className="grid grid-cols-3 gap-4 items-center px-3 py-3 rounded-lg bg-brand-500/5 border border-brand-500/20 mt-2">
          <span className="text-sm font-semibold text-white">Overall</span>
          <div className="text-center">
            <span className={clsx('text-lg font-bold', getScoreColor(before.overall))}>
              {before.overall}
            </span>
          </div>
          <div className="text-center flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4 text-brand-400" />
            <span className={clsx('text-lg font-bold', getScoreColor(after.overall))}>
              {after.overall}
            </span>
            {overallImprovement > 0 && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                +{overallImprovement}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-surface-600 mt-3 text-center">
        DevPilot Engineering Health — an AI-assisted project assessment
      </p>
    </div>
  );
}
