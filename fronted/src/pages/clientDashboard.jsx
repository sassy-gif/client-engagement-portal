import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
  logout();
  navigate('/login');
}
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const clientId = user?.clientId;

  useEffect(() => {
    if (!clientId) {
      setError('No client workspace linked to this account.');
      setLoading(false);
      return;
    }

    apiClient
      .get(`/clients/${clientId}/dashboard`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return <div className="p-10 font-body text-ink/50">Loading workspace...</div>;
  }

  if (error) {
    return <div className="p-10 font-body text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-paper">
     <header className="border-b border-hairline bg-white px-8 py-6 flex items-start justify-between">
  <div>
    <p className="font-mono text-xs uppercase tracking-wider text-brass mb-1">
      Client Workspace
    </p>
    <h1 className="font-display text-3xl text-ink">{data.client.company_name}</h1>
    {data.client.contact_person && (
      <p className="font-body text-sm text-ink/50 mt-1">
        Primary contact: {data.client.contact_person}
      </p>
    )}
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

      <main className="px-8 py-8 max-w-4xl">
        <h2 className="font-display text-lg text-ink/70 mb-4">
          Engagements ({data.projects.length})
        </h2>

        {data.projects.length === 0 ? (
          <p className="font-body text-sm text-ink/50">
            No active engagements yet.
          </p>
        ) : (
          data.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </main>
    </div>
  );
}