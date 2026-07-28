import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  useEffect(() => {
   Promise.all([apiClient.get('/clients'), apiClient.get('/projects'), apiClient.get('/analytics/overview')])
      .then(([clientsRes, projectsRes, analyticsRes]) => {
        setClients(clientsRes.data);
        setProjects(projectsRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 font-body text-ink/50">Loading...</div>;
  }

  if (error) {
    return <div className="p-10 font-body text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hairline bg-white px-8 py-6 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-brass mb-1">
            Admin Console
          </p>
          <h1 className="font-display text-3xl text-ink">Origami Consulting</h1>
        </div>
        <div className="text-right">
          <p className="font-body text-sm text-ink/70">{user.fullName}</p>
          <button
            onClick={handleLogout}
            className="font-mono text-xs uppercase tracking-wider text-brass hover:underline mt-1"
          >
            Log out
          </button>
        </div>
      </header>

<main className="px-8 py-8 max-w-5xl">
        {analytics && (
          <section className="mb-8">
            <h2 className="font-display text-lg text-ink/70 mb-4">Overview</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-hairline rounded-sm p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-ink/40">Clients</p>
                <p className="font-display text-3xl text-ink mt-1">{analytics.totals.totalClients}</p>
              </div>
              <div className="bg-white border border-hairline rounded-sm p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-ink/40">Projects</p>
                <p className="font-display text-3xl text-ink mt-1">{analytics.totals.totalProjects}</p>
              </div>
              <div className="bg-white border border-hairline rounded-sm p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-ink/40">Tasks</p>
                <p className="font-display text-3xl text-ink mt-1">{analytics.totals.totalTasks}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-hairline rounded-sm p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-ink/40 mb-3">Projects by Status</p>
                {analytics.projectsByStatus.map((row) => (
                  <div key={row.status} className="mb-2">
                    <div className="flex justify-between text-xs font-body text-ink/60 mb-0.5">
                      <span>{row.status.replace('_', ' ')}</span>
                      <span>{row.count}</span>
                    </div>
                    <div className="h-2 bg-paper rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-brass"
                        style={{ width: `${(row.count / analytics.totals.totalProjects) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-hairline rounded-sm p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-ink/40 mb-3">Tasks by Status</p>
                {analytics.tasksByStatus.map((row) => (
                  <div key={row.status} className="mb-2">
                    <div className="flex justify-between text-xs font-body text-ink/60 mb-0.5">
                      <span>{row.status.replace('_', ' ')}</span>
                      <span>{row.count}</span>
                    </div>
                    <div className="h-2 bg-paper rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-sage"
                        style={{ width: `${(row.count / analytics.totals.totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

       <div className="grid grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-lg text-ink/70 mb-4">
            Clients ({clients.length})
          </h2>
          <div className="bg-white border border-hairline rounded-sm divide-y divide-hairline">
            {clients.map((c) => (
              <div key={c.id} className="px-4 py-3">
                <p className="font-body text-sm text-ink">{c.company_name}</p>
                <p className="font-mono text-xs text-ink/40">{c.contact_email}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink/70 mb-4">
            Projects ({projects.length})
          </h2>
          <div className="bg-white border border-hairline rounded-sm divide-y divide-hairline">
        {projects.map((p) => (
  <div
    key={p.id}
    onClick={() => navigate(`/projects/${p.id}`)}
    className="px-4 py-3 cursor-pointer hover:bg-paper transition-colors"
  >
    <p className="font-body text-sm text-ink">{p.name}</p>
    <p className="font-mono text-xs text-ink/40">
      {p.client_name} · {p.status}
    </p>
  </div>
))}
          </div>
        </section>
     </div>
      </main>
    </div>
  );
}