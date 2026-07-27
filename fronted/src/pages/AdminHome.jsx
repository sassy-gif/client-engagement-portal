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

  function handleLogout() {
    logout();
    navigate('/login');
  }

  useEffect(() => {
    Promise.all([apiClient.get('/clients'), apiClient.get('/projects')])
      .then(([clientsRes, projectsRes]) => {
        setClients(clientsRes.data);
        setProjects(projectsRes.data);
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

      <main className="px-8 py-8 max-w-5xl grid grid-cols-2 gap-8">
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
      </main>
    </div>
  );
}