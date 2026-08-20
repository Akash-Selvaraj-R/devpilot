import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NewProjectPage from './pages/NewProjectPage';
import WorkspacePage from './pages/WorkspacePage';

function App() {
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:id" element={<WorkspacePage />} />
      </Routes>
    </div>
  );
}

export default App;
