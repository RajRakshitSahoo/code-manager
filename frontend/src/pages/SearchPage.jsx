import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VscSearch, VscFolder, VscCode, VscNote, VscLoading } from 'react-icons/vsc';
import { searchAPI } from '../services/api';
import { LANG_COLORS, LANGUAGES, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterLang, setFilterLang] = useState('');
  const [filterType, setFilterType] = useState('');
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const doSearch = async (q) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const params = { q };
      if (filterLang) params.language = filterLang;
      if (filterType) params.type = filterType;
      const res = await searchAPI.global(params);
      setResults(res.data.data);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, filterLang, filterType]);

  const total = results ? results.projects.length + results.snippets.length + results.notes.length : 0;

  return (
    <div className="space-y-6 animate-in max-w-3xl mx-auto">
      <div>
        <h1 className="page-title"><VscSearch className="inline mr-2" />Search</h1>
        <p className="page-subtitle">Search across all your projects, snippets, and notes</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <VscSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: 'var(--text-secondary)' }} />
        {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />}
        <input
          autoFocus
          className="input-field pl-12 pr-12 py-3 text-base"
          placeholder="Search everything... (Ctrl+F)"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="input-field w-auto text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="projects">Projects</option>
          <option value="snippets">Snippets</option>
          <option value="notes">Notes</option>
        </select>
        <select className="input-field w-auto text-xs" value={filterLang} onChange={e => setFilterLang(e.target.value)}>
          <option value="">All Languages</option>
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {/* Results */}
      {!query && (
        <div className="text-center py-16">
          <VscSearch size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>Start typing to search your workspace</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Searches projects, snippets, notes, tags, and code</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Found <span style={{ color: 'var(--text-primary)' }} className="font-medium">{total}</span> results for "{query}"
          </p>

          {/* Projects */}
          {results.projects.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}>
                <VscFolder /> Projects ({results.projects.length})
              </h3>
              <div className="space-y-2">
                {results.projects.map(p => (
                  <motion.div key={p._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="card flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate('/projects')}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: p.color || 'var(--accent)' }}>{p.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{p.category} · {p.description}</div>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{formatDate(p.updatedAt)}</div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Snippets */}
          {results.snippets.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}>
                <VscCode /> Snippets ({results.snippets.length})
              </h3>
              <div className="space-y-2">
                {results.snippets.map(s => {
                  const langColor = LANG_COLORS[s.language] || '#007acc';
                  return (
                    <motion.div key={s._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="card flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/snippets/${s._id}`)}>
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: langColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {LANGUAGES.find(l => l.value === s.language)?.label}
                          {s.description && ` · ${s.description}`}
                        </div>
                      </div>
                      <div className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{formatDate(s.updatedAt)}</div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}>
                <VscNote /> Notes ({results.notes.length})
              </h3>
              <div className="space-y-2">
                {results.notes.map(n => (
                  <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="card flex items-center gap-3"
                    style={{ borderLeft: `3px solid ${n.color || 'var(--accent)'}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{n.title}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{n.category}</div>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{formatDate(n.updatedAt)}</div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {total === 0 && (
            <div className="text-center py-12">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No results found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Try different keywords or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
