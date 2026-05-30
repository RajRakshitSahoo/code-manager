import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { VscFolder, VscCode, VscNote, VscHeart, VscAdd, VscTrendingUp, VscHistory, VscSymbolVariable } from 'react-icons/vsc';
import { statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3572A5', java: '#b07219',
  css: '#563d7c', html: '#e34c26', sql: '#336791', php: '#4F5D95',
  cpp: '#f34b7d', rust: '#dea584', go: '#00ADD8', jsx: '#61dafb', tsx: '#3178c6'
};

const ACTION_ICONS = {
  project_created: '📁', project_updated: '✏️', project_deleted: '🗑️',
  snippet_created: '💻', snippet_updated: '✏️', snippet_deleted: '🗑️', snippet_copied: '📋',
  note_created: '📝', note_updated: '✏️', note_deleted: '🗑️',
  data_exported: '📤', data_imported: '📥', user_login: '🔐', user_registered: '🎉'
};

function StatCard({ icon: Icon, label, value, color, to, loading }) {
  const navigate = useNavigate();
  return (
    <motion.div whileHover={{ y: -2 }} onClick={() => to && navigate(to)}
      className="stat-card cursor-pointer">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        {loading ? (
          <div className="space-y-1">
            <div className="skeleton w-10 h-6" />
            <div className="skeleton w-16 h-3" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    statsAPI.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--bg-tertiary)', titleColor: 'var(--text-primary)', bodyColor: 'var(--text-secondary)', borderColor: 'var(--border-color)', borderWidth: 1 } },
    scales: {
      x: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-secondary)', font: { size: 11 } } },
      y: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-secondary)', font: { size: 11 } } }
    }
  };

  const langChartData = stats ? {
    labels: stats.languageStats.map(l => l.lang),
    datasets: [{
      data: stats.languageStats.map(l => l.count),
      backgroundColor: stats.languageStats.map(l => LANG_COLORS[l.lang] || '#007acc'),
      borderWidth: 0
    }]
  } : null;

  const activityChartData = stats ? {
    labels: stats.weekActivity.map(a => a._id),
    datasets: [{
      label: 'Actions',
      data: stats.weekActivity.map(a => a.count),
      borderColor: 'var(--accent)',
      backgroundColor: 'rgba(0,122,204,0.1)',
      tension: 0.4,
      fill: true
    }]
  } : null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your coding activity overview</p>
        </div>
        <button onClick={() => navigate('/snippets/new')} className="btn-primary flex items-center gap-2">
          <VscAdd /> New Snippet
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={VscFolder} label="Projects" value={stats?.totalProjects ?? 0} color="#007acc" to="/projects" loading={loading} />
        <StatCard icon={VscCode} label="Snippets" value={stats?.totalSnippets ?? 0} color="#4ec9b0" to="/snippets" loading={loading} />
        <StatCard icon={VscNote} label="Notes" value={stats?.totalNotes ?? 0} color="#dcdcaa" to="/notes" loading={loading} />
        <StatCard icon={VscHeart} label="Favorites" value={stats?.totalFavorites ?? 0} color="#f44747" to="/favorites" loading={loading} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card flex items-center gap-3">
          <VscSymbolVariable size={20} style={{ color: '#c586c0' }} />
          <div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{loading ? '—' : (stats?.mostUsedLanguage || 'N/A')}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Most Used Language</div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <VscTrendingUp size={20} style={{ color: '#4ec9b0' }} />
          <div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{loading ? '—' : (stats?.totalLines?.toLocaleString() ?? 0)}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Lines of Code</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>7-Day Activity</h3>
          {activityChartData ? (
            <Line data={activityChartData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } }} height={120} />
          ) : (
            <div className="skeleton h-32 rounded" />
          )}
        </div>

        {/* Language Distribution */}
        <div className="card">
          <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>Language Distribution</h3>
          {langChartData && langChartData.labels.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-36 h-36 flex-shrink-0">
                <Doughnut data={langChartData} options={{ plugins: { legend: { display: false } }, cutout: '65%' }} />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                {stats.languageStats.map(l => (
                  <div key={l.lang} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LANG_COLORS[l.lang] || '#007acc' }} />
                    <span className="truncate capitalize" style={{ color: 'var(--text-secondary)' }}>{l.lang}</span>
                    <span className="ml-auto font-medium" style={{ color: 'var(--text-primary)' }}>{l.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <VscCode size={28} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>No snippets yet. Create your first!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Projects</h3>
            <button onClick={() => navigate('/projects')} className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>View all</button>
          </div>
          <div className="space-y-2">
            {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded" />) :
              stats?.recentProjects?.length ? stats.recentProjects.map(p => (
                <div key={p._id} className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors"
                  style={{ borderRadius: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: p.color || 'var(--accent)' }}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{p.category}</div>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded capitalize flex-shrink-0"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{p.status}</span>
                </div>
              )) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No projects yet</p>
              )
            }
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              <VscHistory size={14} className="inline mr-1" />Recent Activity
            </h3>
            <button onClick={() => navigate('/activity')} className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>View all</button>
          </div>
          <div className="space-y-2">
            {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-8 rounded" />) :
              stats?.recentActivities?.length ? stats.recentActivities.slice(0, 8).map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  <span className="text-base">{ACTION_ICONS[a.action] || '⚡'}</span>
                  <span className="flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                    <span className="capitalize">{a.action.replace(/_/g, ' ')}</span>
                    {a.resourceName && <span style={{ color: 'var(--text-primary)' }}> · {a.resourceName}</span>}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }} className="flex-shrink-0">
                    {formatDistanceToNow(a.createdAt)}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No activity yet</p>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
