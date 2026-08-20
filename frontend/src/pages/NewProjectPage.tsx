import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Folder, GitBranch, FileText, Zap, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { createProject } from '../services/api';

const DEMO_DATA = {
  name: 'Demo Flask API',
  repo_url: 'https://github.com/demo-repository',
  branch: 'main',
  engineering_task:
    'Add JWT authentication to the application. Create an authentication service, add JWT dependency, create login endpoint, create token validation middleware, add protected routes, update frontend login flow, and add authentication tests.',
};

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    repo_url: '',
    branch: 'main',
    engineering_task: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.repo_url || !form.engineering_task) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const project = await createProject({
        name: form.name,
        repo_url: form.repo_url,
        branch: form.branch,
      });
      // Store the engineering task in sessionStorage for the workspace to use
      sessionStorage.setItem(`project_task_${project.id}`, form.engineering_task);
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm(DEMO_DATA);
    setError(null);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">New Project</h1>
          <p className="text-surface-400 text-sm mt-1">
            Create a new AI engineering project
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass rounded-xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Project Name
                </div>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My Awesome Project"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-900 border border-surface-800 text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Repository URL
                </div>
              </label>
              <input
                type="url"
                value={form.repo_url}
                onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                placeholder="https://github.com/owner/repo"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-900 border border-surface-800 text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Branch
                </div>
              </label>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                placeholder="main"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-900 border border-surface-800 text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Engineering Task
                </div>
              </label>
              <textarea
                value={form.engineering_task}
                onChange={(e) =>
                  setForm({ ...form, engineering_task: e.target.value })
                }
                placeholder="Describe what you want to build. For example: Add a new useAsyncEffect hook that handles async operations with automatic cleanup, error handling, and abort support..."
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-900 border border-surface-800 text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={fillDemo}
              icon={<Zap className="w-4 h-4" />}
            >
              Use Demo Repository
            </Button>

            <Button
              type="submit"
              loading={loading}
              disabled={!form.name || !form.repo_url || !form.engineering_task}
              icon={loading ? undefined : <ArrowLeft className="w-4 h-4" />}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
