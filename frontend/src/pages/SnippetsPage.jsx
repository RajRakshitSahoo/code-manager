import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VscAdd, VscCode, VscHeart, VscEdit, VscTrash, VscCopy, VscSearch, VscFilter } from 'react-icons/vsc';
import { snippetsAPI } from '../services/api';
import { LANGUAGES, LANG_COLORS, formatDate, copyToClipboard } from '../utils/helpers';
import toast from 'react-hot-toast';

function SnippetCard({ snippet, onDelete, onFavorite }) {
  const navigate = useNavigate();
  const langColor = LANG_COLORS[snippet.language] || '#007acc';
  const langLabel = LANGUAGES.find(l => l.value === snippet.language)?.label || snippet.language;

  const handleCopy = async (e) => {
    e.stopPropagation();
    await copyToClipboard(snippet.code || '');
    snippetsAPI.trackCopy(snippet._id).catch(() => {});
    toast.success('Copied to clipboard!');
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card group cursor-pointer hover:border-opacity-100"
      onClick={() => navigate(`/snippets/${snippet._id}`)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: langColor }} />
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{snippet.title}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
          <button onClick={handleCopy} className="p-1.5 rounded hover:text-blue-400 transition-colors"
            style={{ color: 'var(--text-secondary)' }} title="Copy code">
            <VscCopy size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); onFavorite(snippet._id); }}
            className="p-1.5 rounded transition-colors"
            style={{ color: snippet.isFavorite ? '#f44747' : 'var(--text-secondary)' }}>
            <VscHeart size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); navigate(`/snippets/${snippet._id}`); }}
            className="p-1.5 rounded hover:text-blue-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <VscEdit size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(snippet._id); }}
            className="p-1.5 rounded hover:text-red-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <VscTrash size={13} />
          </button>
        </div>
      </div>

      {snippet.description && (
        <p className="text-xs mb-2 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{snippet.description}</p>
      )}

      {/* Code Preview */}
      <div className="rounded-md p-2 mb-3 font-mono text-xs overflow-hidden"
        style={{ background: 'var(--bg-tertiary)', maxHeight: '60px' }}>
        <pre className="truncate" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre', overflow: 'hidden' }}>
          {(snippet.code || '').split('\n').slice(0, 3).join('\n')}
        </pre>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ background: `${langColor}20`, color: langColor }}>{langLabel}</span>
          {snippet.tags?.slice(0, 2).map(t => (
            <span key={t} className="tag text-xs">#{t}</span>
          ))}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(snippet.createdAt)}</span>
      </div>
    </motion.div>
  );
}

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const navigate = useNavigate();

  const loadSnippets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterLang) params.language = filterLang;
      if (filterFav) params.favorite = 'true';
      const res = await snippetsAPI.getAll(params);
      setSnippets(res.data.data);
    } catch {
      toast.error('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSnippets(); }, [search, filterLang, filterFav]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this snippet?')) return;
    try {
      await snippetsAPI.delete(id);
      setSnippets(s => s.filter(x => x._id !== id));
      toast.success('Snippet deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleFavorite = async (id) => {
    try {
      const res = await snippetsAPI.toggleFavorite(id);
      setSnippets(s => s.map(x => x._id === id ? { ...x, isFavorite: res.data.data.isFavorite } : x));
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title"><VscCode className="inline mr-2" />Snippets</h1>
          <p className="page-subtitle">{snippets.length} snippets</p>
        </div>
        <button onClick={() => navigate('/snippets/new')} className="btn-primary flex items-center gap-2">
          <VscAdd /> New Snippet
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-9" placeholder="Search snippets, code, tags..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={filterLang} onChange={e => setFilterLang(e.target.value)}>
          <option value="">All Languages</option>
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <button onClick={() => setFilterFav(f => !f)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${filterFav ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'btn-secondary'}`}
          style={filterFav ? { border: '1px solid rgba(244,71,71,0.4)' } : {}}>
          <VscHeart size={14} /> Favorites
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-44 rounded-lg" />)}
        </div>
      ) : snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <VscCode size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 className="mt-4 font-semibold" style={{ color: 'var(--text-primary)' }}>No snippets found</h3>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-secondary)' }}>
            {search ? 'Try a different search term' : 'Create your first code snippet'}
          </p>
          <button onClick={() => navigate('/snippets/new')} className="btn-primary flex items-center gap-2">
            <VscAdd /> New Snippet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snippets.map(s => (
            <SnippetCard key={s._id} snippet={s} onDelete={handleDelete} onFavorite={handleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
