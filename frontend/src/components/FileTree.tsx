import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileText,
  FileJson,
  FileImage,
  FileCog,
} from 'lucide-react';
import clsx from 'clsx';

interface FileTreeProps {
  node: Record<string, any>;
  level?: number;
}

const fileIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  json: FileJson,
  md: FileText,
  txt: FileText,
  css: FileCode,
  html: FileCode,
  svg: FileImage,
  png: FileImage,
  jpg: FileImage,
  py: FileCode,
  go: FileCode,
  rs: FileCode,
  yaml: FileCog,
  yml: FileCog,
  toml: FileCog,
};

function getFileIcon(name: string): React.ComponentType<{ className?: string }> {
  const ext = name.replace(/\/$/, '').split('.').pop()?.toLowerCase() || '';
  return fileIcons[ext] || File;
}

export default function FileTree({ node, level = 0 }: FileTreeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 1);

  const entries = useMemo(() => {
    return Object.entries(node).sort(([aName, aVal], [bName, bVal]) => {
      const aIsDir = aVal !== null;
      const bIsDir = bVal !== null;
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
      return aName.localeCompare(bName);
    });
  }, [node]);

  return (
    <div>
      {entries.map(([name, value]) => {
        const isDirectory = value !== null;
        const Icon = isDirectory ? (isExpanded ? FolderOpen : Folder) : getFileIcon(name);
        const displayName = name.replace(/\/$/, '');

        return (
          <div key={name}>
            <button
              onClick={() => {
                if (isDirectory) {
                  setIsExpanded(!isExpanded);
                }
              }}
              className={clsx(
                'flex items-center gap-1.5 w-full px-2 py-1 text-left text-sm rounded-md transition-colors',
                'hover:bg-surface-800/50 group',
                'text-surface-300'
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              {isDirectory ? (
                <span className="w-4 h-4 flex items-center justify-center">
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-surface-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-surface-500" />
                  )}
                </span>
              ) : (
                <span className="w-4" />
              )}
              <Icon
                className={clsx(
                  'w-4 h-4 flex-shrink-0',
                  isDirectory ? 'text-amber-400/70' : 'text-surface-500'
                )}
              />
              <span className="truncate">{displayName}</span>
            </button>
            {isDirectory && isExpanded && value && (
              <FileTree node={value} level={level + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}
