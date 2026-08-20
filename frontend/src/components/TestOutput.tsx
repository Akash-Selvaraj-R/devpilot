import { Terminal, CheckCircle, XCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import type { TestRun } from '../types';
import { formatDate } from '../utils/format';

interface TestOutputProps {
  testRun: TestRun;
}

export default function TestOutput({ testRun }: TestOutputProps) {
  const isSuccess = testRun.exit_code === 0;

  return (
    <div className="rounded-lg overflow-hidden border border-surface-800 bg-surface-900">
      <div className="flex items-center justify-between px-4 py-3 bg-surface-800/50 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-surface-400" />
          <span className="text-sm font-mono text-surface-300">Test Output</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Clock className="w-3 h-3" />
            {testRun.duration}s
          </div>
          <div
            className={clsx(
              'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            )}
          >
            {isSuccess ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            Exit {testRun.exit_code}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">
            Command
          </span>
          <p className="mt-1 font-mono text-sm text-surface-300 bg-surface-800/50 px-3 py-2 rounded">
            $ {testRun.command}
          </p>
        </div>

        {testRun.stdout && (
          <div className="mb-3">
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">
              Output
            </span>
            <pre className="mt-1 font-mono text-sm text-surface-300 bg-surface-800/50 px-3 py-2 rounded overflow-x-auto max-h-64 overflow-y-auto">
              {testRun.stdout}
            </pre>
          </div>
        )}

        {testRun.stderr && (
          <div>
            <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">
              Errors
            </span>
            <pre className="mt-1 font-mono text-sm text-red-400 bg-red-500/5 px-3 py-2 rounded overflow-x-auto max-h-64 overflow-y-auto">
              {testRun.stderr}
            </pre>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-surface-800/30 border-t border-surface-800 text-xs text-surface-600">
        {formatDate(testRun.created_at)}
      </div>
    </div>
  );
}
