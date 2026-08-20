import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  GitBranch,
  Folder,
  Clock,
  Zap,
  ArrowRight,
  Inbox,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Project } from '../types';
import { getProjects, createProject } from '../services/api';
import { formatDate } from '../utils/format';

const DEMO_PROJECT = {
  name: 'DevPilot Demo',
  repo_url: 'https://github.com/facebook/react',
  branch: 'main',
  engineering_task: 'Add a new useAsyncEffect hook that handles async operations with automatic cleanup and error handling.',
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchingDemo, setLaunchingDemo] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch {
      console.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  async function handleLaunchDemo() {
    setLaunchingDemo(true);
    try {
      const project = await createProject(DEMO_PROJECT);
      window.location.href = `/projects/${project.id}`;
    } catch {
      console.error('Failed to launch demo');
    } finally {
      setLaunchingDemo(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-surface-400 text-sm mt-1">
              Manage your AI engineering projects
            </p>
          </div>
          <Link to="/projects/new">
            <Button icon={<Plus className="w-4 h-4" />}>New Project</Button>
          </Link>
        </div>

        {/* Quick Start */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Quick Start</h3>
                <p className="text-xs text-surface-400">
                  Launch a demo to see DevPilot in action — no API key required
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-800/50 border border-surface-700/50 text-[10px] text-surface-500">
                <span>Complete workflow: Analyze → Plan → Build → Test → Debug → Ship</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                loading={launchingDemo}
                onClick={handleLaunchDemo}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Demo
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20">
            <LoadingSpinner message="Loading projects..." />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-xl py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-surface-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-sm text-surface-400 mb-6 max-w-sm mx-auto">
              Create your first project to start building with AI assistance, or try our demo.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/projects/new">
                <Button icon={<Plus className="w-4 h-4" />}>Create First Project</Button>
              </Link>
              <Button variant="secondary" onClick={handleLaunchDemo} loading={launchingDemo}>
                Try Demo
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card hover>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-brand-400" />
                      <h3 className="font-semibold text-white truncate">
                        {project.name}
                      </h3>
                    </div>
                    <StatusBadge status={project.status} size="sm" />
                  </div>

                  <div className="space-y-2 text-sm text-surface-400">
                    <div className="flex items-center gap-2 truncate">
                      <GitBranch className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{project.repo_url}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  {project.status === 'complete' && (
                    <div className="mt-3 pt-3 border-t border-surface-800/50">
                      <div className="flex items-center gap-4 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Completed
                        </span>
                        <span>{project.task_count} task{project.task_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}

                  {project.status === 'failed' && (
                    <div className="mt-3 pt-3 border-t border-surface-800/50">
                      <div className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        Needs attention
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="glass rounded-xl divide-y divide-surface-800/50">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface-800/30 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-200 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-surface-500">
                      {formatDate(project.updated_at)}
                    </p>
                  </div>
                  <StatusBadge status={project.status} size="sm" showIcon={false} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
