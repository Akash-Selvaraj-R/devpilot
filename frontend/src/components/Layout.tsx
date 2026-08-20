import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, LayoutDashboard, Plus, GitBranch, Zap, Clock } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects/new', label: 'New Project', icon: Plus },
  { path: '/runs', label: 'Run History', icon: Clock },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <header className="glass sticky top-0 z-50 border-b border-surface-800/50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">
                  Dev<span className="gradient-text">Pilot</span>
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-500/10 text-brand-400'
                          : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-800/50 border border-surface-700/50 text-xs text-surface-500">
                <kbd className="font-mono text-[10px]">Ctrl</kbd>
                <span>+</span>
                <kbd className="font-mono text-[10px]">K</kbd>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-medium">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
