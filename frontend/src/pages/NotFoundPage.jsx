import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="font-mono text-8xl font-bold mb-4" style={{ color: 'var(--accent)' }}>404</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Page not found</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>The route you're looking for doesn't exist.</p>
        <div className="font-mono text-sm p-4 rounded-lg mb-6 text-left inline-block"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#f44747' }}>Error:</span> Cannot GET <span style={{ color: '#4ec9b0' }}>{window.location.pathname}</span>
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary">← Go Back</button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">🏠 Dashboard</button>
        </div>
      </div>
    </div>
  );
}
