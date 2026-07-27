import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'done']; 

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function handleStatusChange(taskId, newStatus) {
    try {
      await apiClient.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  }
  useEffect(() => {
    apiClient
      .get(`/projects/${projectId}/tasks`)
      .then((res) => setTasks(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return <div className="p-10 font-body text-ink/50">Loading tasks...</div>;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hairline bg-white px-8 py-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="font-mono text-xs uppercase tracking-wider text-brass hover:underline mb-3"
        >
          ← Back to Admin Console
        </button>
        <h1 className="font-display text-3xl text-ink">Project Tasks</h1>
      </header>

      <main className="px-8 py-8 max-w-3xl">
        {error && <p className="font-body text-sm text-red-600 mb-4">{error}</p>}

        {tasks.length === 0 ? (
          <p className="font-body text-sm text-ink/50">No tasks yet for this project.</p>
        ) : (
          <div className="bg-white border border-hairline rounded-sm divide-y divide-hairline">
            {tasks.map((t) => (
              <div key={t.id} className="px-4 py-3">
               <div className="flex items-center justify-between">
  <p className="font-body text-sm text-ink">{t.title}</p>
  <select
    value={t.status}
    onChange={(e) => handleStatusChange(t.id, e.target.value)}
    className="font-mono text-[10px] uppercase tracking-wider text-brass border border-brass/30 bg-brass/10 px-2 py-1 rounded-sm cursor-pointer"
  >
    {STATUS_OPTIONS.map((s) => (
      <option key={s} value={s}>
        {s.replace('_', ' ')}
      </option>
    ))}
  </select>
</div>
                <p className="font-mono text-xs text-ink/40 mt-1">
                  {t.assignee_name || 'Unassigned'} · Priority: {t.priority}
                  {t.due_date && ` · Due ${new Date(t.due_date).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}