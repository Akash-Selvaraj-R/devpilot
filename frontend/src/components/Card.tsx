import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  hover?: boolean;
  padding?: boolean;
}

export default function Card({ children, className, header, footer, hover = false, padding = true }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl glass',
        hover && 'glass-hover cursor-pointer',
        className
      )}
    >
      {header && (
        <div className="px-5 py-4 border-b border-surface-800/50">{header}</div>
      )}
      <div className={clsx(padding && 'p-5')}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-surface-800/50 bg-surface-900/30 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
