import { useState, useEffect } from 'react';
import { VscHistory } from 'react-icons/vsc';
import { activityAPI } from '../services/api';
import { formatDistanceToNow, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const ACTION_META = {
  project_created: { icon: '📁', label: 'Created project', color: '#4ec9b0' },
  project_updated: { icon: '✏️', label: 'Updated project', color: '#569cd6' },
  project_deleted: { icon: '🗑️', label: 'Deleted project', color: '#f44747' },
  project_archived: { icon: '📦', label: 'Archived project', color: '#858585' },
  snippet_created: { icon: '💻', label: 'Created snippet', color: '#4ec9b0' },
  snippet_updated: { icon: '✏️', label: 'Updated snippet', color: '#569cd6' },
  snippet_deleted: { icon: '🗑️', label: 'Deleted snippet', color: '#f44747' },
  snippet_copied: { icon: '📋', label: 'Copied snippet', color: '#dcdcaa' },
  note_created: { icon: '📝', label: 'Created note', color: '#4ec9b0' },
  note_updated: { icon: '✏️', label: 'Updated note', color: '#569cd6' },
  note_deleted: { icon: '🗑️', label: 'Deleted note', color: '#f44747' },
  data_exported: { icon: '📤', label: 'Exported data', color: '#c586c0' },
  data_imported: { icon: '📥', label: 'Imported data', color: '#c586c0' },
  user_login: { icon: '🔐', label: 'Signed in', color: '#007acc' },
  user_registered: { icon: '🎉', label: 'Joined', color: '#007acc' },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    activityAPI.getAll({ page, limit: 30 })
      .then(res => {
        if (page === 1) setActivities(res.data.data);
        else setActivities(a => [...a, ...res.data.data]);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('Failed to load activity'))
      .finally(() => setLoading(false));
  }, [page]);

  // Group by date
  const grouped = activities.reduce((acc, a) => {
    const day = new Date(a.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div>
        <h1 className="page-title"><VscHistory className="inline mr-2" />Activity Log</h1>
        <p className="page-subtitle">{total} total activities</p>
      </div>

      {loading && page === 1 ? (
        <div className="space-y-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16">
          <VscHistory size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>No activity yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3 sticky top-0 py-1"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>{day}</div>
              <div className="space-y-1">
                {items.map((a, i) => {
                  const meta = ACTION_META[a.action] || { icon: '⚡', label: a.action, color: '#007acc' };
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: `${meta.color}20` }}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{meta.label}</span>
                        {a.resourceName && (
                          <span className="text-sm font-medium ml-1" style={{ color: meta.color }}>{a.resourceName}</span>
                        )}
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {formatDistanceToNow(a.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {activities.length < total && (
            <div className="text-center pt-4">
              <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-secondary">
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
