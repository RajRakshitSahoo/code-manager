// FavoritesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscHeart, VscFolder, VscCode, VscNote } from 'react-icons/vsc';
import { projectsAPI, snippetsAPI, notesAPI } from '../services/api';
import { LANG_COLORS, LANGUAGES, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export function FavoritesPage() {
  const [data, setData] = useState({ projects: [], snippets: [], notes: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      projectsAPI.getAll({ favorite: 'true', limit: 50 }),
      snippetsAPI.getAll({ favorite: 'true', limit: 50 }),
      notesAPI.getAll({ favorite: 'true', limit: 50 })
    ]).then(([p, s, n]) => {
      setData({ projects: p.data.data, snippets: s.data.data, notes: n.data.data });
    }).catch(() => toast.error('Failed to load favorites'))
    .finally(() => setLoading(false));
  }, []);

  const total = data.projects.length + data.snippets.length + data.notes.length;

  if (loading) return (
    <div className="space-y-4 animate-in">
      <div className="skeleton h-8 w-48 rounded" />
      {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="page-title"><VscHeart className="inline mr-2 text-red-400" />Favorites</h1>
        <p className="page-subtitle">{total} favorited items</p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <VscHeart size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 className="mt-4 font-semibold" style={{ color: 'var(--text-primary)' }}>No favorites yet</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Click the heart icon on any item to favorite it</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.projects.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <VscFolder /> Projects ({data.projects.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.projects.map(p => (
                  <div key={p._id} className="card cursor-pointer" onClick={() => navigate('/projects')}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ background: p.color || 'var(--accent)' }}>{p.name.charAt(0)}</div>
                      <div>
                        <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.snippets.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <VscCode /> Snippets ({data.snippets.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.snippets.map(s => {
                  const langColor = LANG_COLORS[s.language] || '#007acc';
                  return (
                    <div key={s._id} className="card cursor-pointer" onClick={() => navigate(`/snippets/${s._id}`)}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: langColor }} />
                        <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                      </div>
                      <div className="font-mono text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {LANGUAGES.find(l => l.value === s.language)?.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {data.notes.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <VscNote /> Notes ({data.notes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.notes.map(n => (
                  <div key={n._id} className="card" style={{ borderLeft: `3px solid ${n.color || 'var(--accent)'}` }}>
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{n.title}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{n.category} · {formatDate(n.updatedAt)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
