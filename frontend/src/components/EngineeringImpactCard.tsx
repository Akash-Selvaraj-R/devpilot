import { FilePlus, FileEdit, FileMinus, TestTube, CheckCircle, Shield, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { getScoreColor } from '../utils/format';
import type { DataLabel } from '../types';

interface EngineeringImpactCardProps {
  filesCreated: number;
  filesModified: number;
  filesRemoved: number;
  testsAdded: number;
  testsPassing: number;
  testsTotal: number;
  securityBefore?: number;
  securityAfter?: number;
  testingBefore?: number;
  testingAfter?: number;
  overallBefore?: number;
  overallAfter?: number;
  improvement?: number;
  dataLabel?: DataLabel;
}

export default function EngineeringImpactCard({
  filesCreated,
  filesModified,
  filesRemoved,
  testsAdded,
  testsPassing,
  testsTotal,
  securityBefore,
  securityAfter,
  testingBefore,
  testingAfter,
  overallBefore,
  overallAfter,
  improvement,
  dataLabel,
}: EngineeringImpactCardProps) {
  const stats = [
    { icon: FilePlus, label: 'created', value: filesCreated, color: 'text-emerald-400', prefix: '+' },
    { icon: FileEdit, label: 'modified', value: filesModified, color: 'text-amber-400', prefix: '~' },
    { icon: FileMinus, label: 'removed', value: filesRemoved, color: 'text-red-400', prefix: '-' },
    { icon: TestTube, label: 'tests', value: testsAdded, color: 'text-purple-400', prefix: '+' },
  ];

  return (
    <div className="rounded-xl glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-semibold text-surface-200">Engineering Impact</h3>
        </div>
        {dataLabel && (
          <span className="text-[10px] font-semibold text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
            {dataLabel}
          </span>
        )}
      </div>

      {/* File stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map(({ icon: Icon, label, value, color, prefix }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/30">
            <Icon className={clsx('w-4 h-4', color)} />
            <span className={clsx('text-sm font-semibold', color)}>
              {prefix}{value}
            </span>
            <span className="text-xs text-surface-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Test results */}
      {testsTotal > 0 && (
        <div className="px-3 py-2.5 rounded-lg bg-surface-800/30 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-surface-300">
                {testsPassing} / {testsTotal} passing
              </span>
            </div>
            {testsPassing === testsTotal && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ALL PASSING
              </span>
            )}
          </div>
        </div>
      )}

      {/* Score changes */}
      {(overallBefore !== undefined || securityBefore !== undefined) && (
        <div className="space-y-2 border-t border-surface-800/50 pt-4">
          {securityBefore !== undefined && securityAfter !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-surface-500" />
                <span className="text-xs text-surface-400">Security</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx('text-xs', getScoreColor(securityBefore))}>{securityBefore}</span>
                <span className="text-surface-600">→</span>
                <span className={clsx('text-xs font-bold', getScoreColor(securityAfter))}>{securityAfter}</span>
                {securityAfter > securityBefore && (
                  <span className="text-[10px] text-emerald-400">↑ Improved</span>
                )}
              </div>
            </div>
          )}

          {testingBefore !== undefined && testingAfter !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube className="w-3.5 h-3.5 text-surface-500" />
                <span className="text-xs text-surface-400">Testing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx('text-xs', getScoreColor(testingBefore))}>{testingBefore}</span>
                <span className="text-surface-600">→</span>
                <span className={clsx('text-xs font-bold', getScoreColor(testingAfter))}>{testingAfter}</span>
                {testingAfter > testingBefore && (
                  <span className="text-[10px] text-emerald-400">↑ Improved</span>
                )}
              </div>
            </div>
          )}

          {overallBefore !== undefined && overallAfter !== undefined && (
            <div className="flex items-center justify-between pt-2 border-t border-surface-800/30">
              <span className="text-xs font-semibold text-white">Overall Health</span>
              <div className="flex items-center gap-2">
                <span className={clsx('text-sm font-bold', getScoreColor(overallBefore))}>{overallBefore}</span>
                <span className="text-surface-600">→</span>
                <span className={clsx('text-sm font-bold', getScoreColor(overallAfter))}>{overallAfter}</span>
                {improvement !== undefined && improvement > 0 && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    +{improvement}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
