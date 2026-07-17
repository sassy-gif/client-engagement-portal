import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs uppercase tracking-wider text-brass text-center mb-2">
          Origami Consulting
        </p>
        <h1 className="font-display text-3xl text-ink text-center mb-8">
          Client Engagement
        </h1>

        <form onSubmit={handleSubmit} className="bg-white border border-hairline rounded-sm p-6">
          <label className="block font-mono text-xs uppercase tracking-wider text-ink/50 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-hairline rounded-sm px-3 py-2 mb-4 font-body text-sm text-ink focus:outline-none"
          />

          <label className="block font-mono text-xs uppercase tracking-wider text-ink/50 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-hairline rounded-sm px-3 py-2 mb-4 font-body text-sm text-ink focus:outline-none"
          />

          {error && (
            <p className="font-body text-sm text-red-600 mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink text-paper font-body text-sm py-2.5 rounded-sm hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}