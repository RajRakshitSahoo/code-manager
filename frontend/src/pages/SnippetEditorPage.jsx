import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import {
  VscSave, VscCopy, VscHeart, VscTrash, VscArrowLeft, VscHistory,
  VscScreenFull, VscScreenNormal, VscWordWrap, VscAdd
} from 'react-icons/vsc';
import { snippetsAPI, projectsAPI } from '../services/api';
import { LANGUAGES, getMonacoLanguage, copyToClipboard } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SnippetEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [snippet, setSnippet] = useState({
    title: '', description: '', language: 'javascript', code: '// Start coding here\n', tags: [], isFavorite: false
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    projectsAPI.getAll({ limit: 50 }).then(r => setProjects(r.data.data)).catch(() => {});
    if (!isNew) {
      snippetsAPI.getOne(id)
        .then(res => { setSnippet(res.data.data); setLoading(false); })
        .catch(() => { toast.error('Snippet not found'); navigate('/snippets'); });
    }
  }, [id]);

  const handleSave = async () => {
    if (!snippet.title.trim()) return toast.error('Title is required');
    if (!snippet.code.trim()) return toast.error('Code is required');
    setSaving(true);
    try {
      if (isNew) {
        const res = await snippetsAPI.create(snippet);
        toast.success('Snippet created!');
        navigate(`/snippets/${res.data.data._id}`, { replace: true });
      } else {
        const res = await snippetsAPI.update(id, snippet);
        setSnippet(res.data.data);
        setIsDirty(false);
        toast.success('Snippet saved!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleFavorite = async () => {
    if (isNew) return;
    try {
      const res = await snippetsAPI.toggleFavorite(id);
      setSnippet(s => ({ ...s, isFavorite: res.data.data.isFavorite }));
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this snippet?')) return;
    try {
      await snippetsAPI.delete(id);
      toast.success('Snippet deleted');
      navigate('/snippets');
    } catch { toast.error('Delete failed'); }
  };

  const handleCopy = async () => {
    await copyToClipboard(snippet.code);
    if (!isNew) snippetsAPI.trackCopy(id).catch(() => {});
    toast.success('Code copied!');
  };

  const loadVersions = async () => {
    if (isNew) return;
    try {
      const res = await snippetsAPI.getVersions(id);
      setVersions(res.data.data);
      setShowVersions(true);
    } catch { toast.error('Failed to load versions'); }
  };

  const restoreVersion = async (version) => {
    if (!confirm(`Restore to version ${version}?`)) return;
    try {
      const res = await snippetsAPI.restoreVersion(id, version);
      setSnippet(s => ({ ...s, code: res.data.data.code }));
      setShowVersions(false);
      toast.success(`Restored to version ${version}`);
    } catch { toast.error('Restore failed'); }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !snippet.tags.includes(t)) {
      setSnippet(s => ({ ...s, tags: [...s.tags, t] }));
      setIsDirty(true);
    }
    setTagInput('');
  };

  // Ctrl+S save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [snippet]);

  const editorTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'vs' : 'vs-dark';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className={`animate-in ${fullscreen ? 'fixed inset-0 z-50 flex flex-col p-0' : 'space-y-4'}`}
      style={fullscreen ? { background: 'var(--bg-primary)' } : {}}>
      {/* Toolbar */}
      <div className={`flex items-center gap-2 flex-wrap ${fullscreen ? 'p-3 border-b' : ''}`}
        style={fullscreen ? { background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' } : {}}>
        <button onClick={() => navigate('/snippets')} className="btn-secondary flex items-center gap-1 text-xs">
          <VscArrowLeft /> Back
        </button>
        <div className="flex-1 min-w-48">
          <input className="input-field font-semibold text-base" value={snippet.title}
            onChange={e => { setSnippet(s => ({ ...s, title: e.target.value })); setIsDirty(true); }}
            placeholder="Snippet title..." />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setWordWrap(w => !w)} title="Toggle Word Wrap"
            className={`p-2 rounded transition-colors ${wordWrap ? 'text-blue-400' : ''}`}
            style={{ color: wordWrap ? 'var(--accent)' : 'var(--text-secondary)', background: wordWrap ? 'rgba(0,122,204,0.1)' : 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <VscWordWrap size={15} />
          </button>
          {!isNew && (
            <button onClick={loadVersions} title="Version History"
              className="p-2 rounded transition-colors" style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              <VscHistory size={15} />
            </button>
          )}
          <button onClick={() => setFullscreen(f => !f)} title="Toggle Fullscreen"
            className="p-2 rounded transition-colors" style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            {fullscreen ? <VscScreenNormal size={15} /> : <VscScreenFull size={15} />}
          </button>
          <button onClick={handleCopy} title="Copy Code"
            className="p-2 rounded transition-colors" style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <VscCopy size={15} />
          </button>
          {!isNew && (
            <>
              <button onClick={handleFavorite} title="Favorite"
                className="p-2 rounded transition-colors"
                style={{ color: snippet.isFavorite ? '#f44747' : 'var(--text-secondary)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <VscHeart size={15} />
              </button>
              <button onClick={handleDelete} title="Delete"
                className="p-2 rounded hover:text-red-400 transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <VscTrash size={15} />
              </button>
            </>
          )}
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-60">
            {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <VscSave size={14} />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      <div className={`${fullscreen ? 'flex-1 flex gap-0 overflow-hidden' : 'grid grid-cols-1 lg:grid-cols-4 gap-4'}`}>
        {/* Editor */}
        <div className={`${fullscreen ? 'flex-1' : 'lg:col-span-3'} monaco-container`}
          style={{ height: fullscreen ? '100%' : '520px' }}>
          {/* Editor Tabs Bar */}
          <div className="flex items-center gap-0 border-b px-2 py-1" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 px-3 py-1 rounded-t text-xs font-medium"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderBottom: '2px solid var(--accent)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: LANGUAGES.find(l => l.value === snippet.language)?.icon ? '#4ec9b0' : '#007acc' }} />
              {snippet.title || 'untitled'}.{snippet.language === 'javascript' ? 'js' : snippet.language === 'python' ? 'py' : snippet.language}
              {isDirty && <span className="text-yellow-400 text-xs">●</span>}
            </div>
          </div>
          <Editor
            height={fullscreen ? 'calc(100% - 36px)' : '484px'}
            language={getMonacoLanguage(snippet.language)}
            value={snippet.code}
            theme={editorTheme}
            onChange={val => { setSnippet(s => ({ ...s, code: val || '' })); setIsDirty(true); }}
            onMount={editor => { editorRef.current = editor; }}
            options={{
              fontSize: 14,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontLigatures: true,
              minimap: { enabled: !fullscreen },
              wordWrap: wordWrap ? 'on' : 'off',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              suggest: { preview: true },
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>

        {/* Sidebar Panel */}
        {!fullscreen && (
          <div className="space-y-4">
            {/* Language */}
            <div className="card">
              <label className="label">Language</label>
              <select className="input-field text-sm" value={snippet.language}
                onChange={e => { setSnippet(s => ({ ...s, language: e.target.value })); setIsDirty(true); }}>
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.icon} {l.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="card">
              <label className="label">Description</label>
              <textarea className="input-field resize-none text-sm" rows={3} value={snippet.description}
                onChange={e => { setSnippet(s => ({ ...s, description: e.target.value })); setIsDirty(true); }}
                placeholder="What does this snippet do?" />
            </div>

            {/* Project */}
            <div className="card">
              <label className="label">Project (optional)</label>
              <select className="input-field text-sm" value={snippet.project || ''}
                onChange={e => { setSnippet(s => ({ ...s, project: e.target.value || null })); setIsDirty(true); }}>
                <option value="">No project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div className="card">
              <label className="label">Tags</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {snippet.tags.map(t => (
                  <span key={t} className="tag flex items-center gap-1 text-xs">
                    #{t}
                    <button onClick={() => { setSnippet(s => ({ ...s, tags: s.tags.filter(x => x !== t) })); setIsDirty(true); }}
                      className="hover:text-red-400 leading-none">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <input className="input-field text-xs flex-1" value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="tag name + Enter" />
                <button onClick={addTag} className="p-2 rounded btn-secondary">
                  <VscAdd size={12} />
                </button>
              </div>
            </div>

            {/* Stats */}
            {!isNew && (
              <div className="card text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between"><span>Lines</span><span style={{ color: 'var(--text-primary)' }}>{snippet.code?.split('\n').length || 0}</span></div>
                <div className="flex justify-between"><span>Characters</span><span style={{ color: 'var(--text-primary)' }}>{snippet.code?.length || 0}</span></div>
                <div className="flex justify-between"><span>Copies</span><span style={{ color: 'var(--text-primary)' }}>{snippet.copies || 0}</span></div>
                <div className="flex justify-between"><span>Version</span><span style={{ color: 'var(--text-primary)' }}>v{snippet.currentVersion || 1}</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Version History Modal */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Version History</h3>
              <button onClick={() => setShowVersions(false)} style={{ color: 'var(--text-secondary)' }} className="text-xl">×</button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {versions.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No version history</p>
              ) : (
                versions.slice().reverse().map(v => (
                  <div key={v.version} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--bg-tertiary)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Version {v.version}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{v.summary}</div>
                    </div>
                    <button onClick={() => restoreVersion(v.version)}
                      className="btn-secondary text-xs px-3">Restore</button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
