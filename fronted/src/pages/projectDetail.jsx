import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'done'];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const fileInputRef = useRef(null);

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

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', 'client_visible');

    try {
      await apiClient.post(`/projects/${projectId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { data } = await apiClient.get(`/projects/${projectId}/documents`);
      setDocuments(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  useEffect(() => {
    Promise.all([
      apiClient.get(`/projects/${projectId}/tasks`),
      apiClient.get(`/projects/${projectId}/documents`)
    ])
      .then(([tasksRes, documentsRes]) => {
        setTasks(tasksRes.data);
        setDocuments(documentsRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load project data'))
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

        <div className="flex items-center justify-between mt-10 mb-4">
          <h2 className="font-display text-lg text-ink">Documents</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-mono text-xs uppercase tracking-wider bg-ink text-paper px-3 py-1.5 rounded-sm hover:bg-ink/90"
          >
            Upload File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {documents.length === 0 ? (
          <p className="font-body text-sm text-ink/50">No documents uploaded yet.</p>
        ) : (
          <div className="bg-white border border-hairline rounded-sm divide-y divide-hairline">
            {documents.map((d) => (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-ink">{d.file_name}</p>
                  <p className="font-mono text-xs text-ink/40">
                    {d.uploaded_by_name} · {(d.file_size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <a
                  href={`http://localhost:5000/api/documents/${d.id}/download`}
                  className="font-mono text-xs uppercase tracking-wider text-brass hover:underline"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}