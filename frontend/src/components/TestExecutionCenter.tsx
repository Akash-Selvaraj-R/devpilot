import { useState } from 'react';
import { Terminal, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import type { TestRun } from '../types';

interface TestExecutionCenterProps {
  testRuns: TestRun[];
  isRunning?: boolean;
  onDiagnose?: () => void;
}

export default function TestExecutionCenter({ testRuns, isRunning, onDiagnose }: TestExecutionCenterProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const latestRun = testRuns[testRuns.length - 1];

  return (
    <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-800/30 border-b border-surface-800/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-surface-400" />
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            Test Execution
          </span>
        </div>
        {latestRun && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <Clock className="w-3 h-3" />
              {latestRun.duration}s
            </div>
            <div
              className={clsx(
                'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                latestRun.exit_code === 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              )}
            >
              {latestRun.exit_code === 0 ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              Exit {latestRun.exit_code}
            </div>
          </div>
        )}
      </div>

      {/* Running state */}
      {isRunning && (
        <div className="px-4 py-3 bg-brand-500/5 border-b border-brand-500/20">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-brand-400">Running test suite...</span>
          </div>
          <div className="mt-2 h-1 bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full animate-progress-fill" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Summary */}
      {latestRun && !isRunning && (
        <div className={clsx(
          'px-4 py-3 border-b border-surface-800/50',
          latestRun.exit_code === 0 ? 'bg-emerald-500/5' : 'bg-red-500/5'
        )}>
          {latestRun.exit_code === 0 ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">
                All tests passing
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold text-red-400">
                  Test failures detected
                </span>
              </div>
              {onDiagnose && (
                <button
                  onClick={onDiagnose}
                  className="text-xs font-medium text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1 rounded-full transition-colors"
                >
                  Ask DevPilot to Diagnose
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Test runs */}
      <div className="max-h-96 overflow-y-auto">
        {testRuns.length === 0 && !isRunning ? (
          <div className="text-center py-8">
            <Terminal className="w-8 h-8 text-surface-700 mx-auto mb-2" />
            <p className="text-sm text-surface-500">No test runs yet</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-800/30">
            {testRuns.map((run, index) => (
              <div key={run.id}>
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {run.exit_code === 0 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm font-mono text-surface-300">{run.command}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-surface-500">{run.duration}s</span>
                    {expandedIndex === index ? (
                      <ChevronUp className="w-4 h-4 text-surface-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-surface-500" />
                    )}
                  </div>
                </button>

                {expandedIndex === index && (
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
                        Command
                      </span>
                      <pre className="mt-1 font-mono text-xs text-surface-300 bg-surface-800/50 px-3 py-2 rounded">
                        $ {run.command}
                      </pre>
                    </div>

                    {run.stdout && (
                      <div>
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
                          Output
                        </span>
                        <pre className="mt-1 font-mono text-xs text-surface-300 bg-surface-800/50 px-3 py-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
                          {run.stdout}
                        </pre>
                      </div>
                    )}

                    {run.stderr && (
                      <div>
                        <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
                          Errors
                        </span>
                        <pre className="mt-1 font-mono text-xs text-red-400 bg-red-500/5 px-3 py-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
                          {run.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
