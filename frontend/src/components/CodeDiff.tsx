import { useMemo } from 'react';
import clsx from 'clsx';

interface CodeDiffProps {
  diff: string;
  language?: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'header';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split('\n');
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        oldLine = parseInt(match[1], 10);
        newLine = parseInt(match[2], 10);
      }
      result.push({ type: 'header', content: line });
    } else if (line.startsWith('+')) {
      result.push({
        type: 'added',
        content: line.slice(1),
        newLineNum: newLine++,
      });
    } else if (line.startsWith('-')) {
      result.push({
        type: 'removed',
        content: line.slice(1),
        oldLineNum: oldLine++,
      });
    } else {
      result.push({
        type: 'unchanged',
        content: line.startsWith(' ') ? line.slice(1) : line,
        oldLineNum: oldLine++,
        newLineNum: newLine++,
      });
    }
  }

  return result;
}

export default function CodeDiff({ diff, language }: CodeDiffProps) {
  const lines = useMemo(() => parseDiff(diff), [diff]);

  return (
    <div className="rounded-lg overflow-hidden border border-surface-800 bg-surface-900">
      {language && (
        <div className="px-4 py-2 bg-surface-800/50 border-b border-surface-800">
          <span className="text-xs font-mono text-surface-400">{language}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {lines.map((line, index) => (
              <tr
                key={index}
                className={clsx(
                  'border-b border-surface-800/30',
                  line.type === 'added' && 'bg-emerald-500/10',
                  line.type === 'removed' && 'bg-red-500/10',
                  line.type === 'header' && 'bg-surface-800/50'
                )}
              >
                <td className="w-12 px-2 py-0.5 text-right text-surface-600 select-none border-r border-surface-800/30">
                  {line.oldLineNum ?? ''}
                </td>
                <td className="w-12 px-2 py-0.5 text-right text-surface-600 select-none border-r border-surface-800/30">
                  {line.newLineNum ?? ''}
                </td>
                <td
                  className={clsx(
                    'w-8 px-2 py-0.5 text-center select-none',
                    line.type === 'added' && 'text-emerald-500',
                    line.type === 'removed' && 'text-red-500',
                    line.type === 'header' && 'text-surface-500'
                  )}
                >
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : line.type === 'header' ? '' : ' '}
                </td>
                <td className="px-4 py-0.5 whitespace-pre">
                  <span
                    className={clsx(
                      line.type === 'added' && 'text-emerald-300',
                      line.type === 'removed' && 'text-red-300',
                      line.type === 'unchanged' && 'text-surface-300',
                      line.type === 'header' && 'text-surface-500 font-medium'
                    )}
                  >
                    {line.content}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
