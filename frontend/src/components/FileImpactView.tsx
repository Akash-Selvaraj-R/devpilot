import { FilePlus, FileEdit, FileMinus } from 'lucide-react';

interface FileImpactViewProps {
  filesCreated: string[];
  filesModified: string[];
  filesRemoved: string[];
  onFileClick?: (filePath: string) => void;
}

export default function FileImpactView({ filesCreated, filesModified, filesRemoved, onFileClick }: FileImpactViewProps) {
  const total = filesCreated.length + filesModified.length + filesRemoved.length;

  return (
    <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
      <div className="px-4 py-3 bg-surface-800/30 border-b border-surface-800/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            Files Changed
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            {filesCreated.length > 0 && (
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <FilePlus className="w-2.5 h-2.5" />
                {filesCreated.length} created
              </span>
            )}
            {filesModified.length > 0 && (
              <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <FileEdit className="w-2.5 h-2.5" />
                {filesModified.length} modified
              </span>
            )}
            {filesRemoved.length > 0 && (
              <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <FileMinus className="w-2.5 h-2.5" />
                {filesRemoved.length} removed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-surface-800/30 max-h-64 overflow-y-auto">
        {filesCreated.map((file) => (
          <button
            key={`created-${file}`}
            onClick={() => onFileClick?.(file)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-800/20 transition-colors text-left"
          >
            <FilePlus className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-mono text-surface-300 truncate">{file}</span>
          </button>
        ))}
        {filesModified.map((file) => (
          <button
            key={`modified-${file}`}
            onClick={() => onFileClick?.(file)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-800/20 transition-colors text-left"
          >
            <FileEdit className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-sm font-mono text-surface-300 truncate">{file}</span>
          </button>
        ))}
        {filesRemoved.map((file) => (
          <button
            key={`removed-${file}`}
            onClick={() => onFileClick?.(file)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-800/20 transition-colors text-left"
          >
            <FileMinus className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="text-sm font-mono text-surface-300 truncate">{file}</span>
          </button>
        ))}
        {total === 0 && (
          <div className="text-center py-6 text-sm text-surface-500">
            No file changes yet
          </div>
        )}
      </div>
    </div>
  );
}
