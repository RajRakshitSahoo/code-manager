import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VscAdd, VscNote, VscHeart, VscEdit, VscTrash, VscEye, VscSearch, VscPinned } from 'react-icons/vsc';
import { notesAPI } from '../services/api';
import { NOTE_CATEGORIES, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const NOTE_COLORS = ['#1e1e1e', '#1a2a1a', '#1a1a2a', '#2a1a1a', '#2a2a1a', '#1a2a2a'];

function NoteModal({ note, onClose, onSave }) {
  const [form, setForm] = useState(note || { title: '', content: '', category: 'General', tags: [], color: '#1e1e1e' });
  const [tagInput, setTagInput] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      if (note?._id) {
        const res = await notesAPI.update(note._id, form);
        onSave(res.data.data, false);
        toast.success('Note updated!');
      } else {
        const res = await notesAPI.create(form);
        onSave(res.data.data, true);
        toast.success('Note created!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{note?._id ? 'Edit Note' : 'New Note'}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all ${preview ? 'text-blue-400' : ''}`}
              style={{ background: preview ? 'rgba(0,122,204,0.15)' : 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: preview ? 'var(--accent)' : 'var(--text-secondary)' }}>
              <VscEye size={13} /> {preview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }} className="hover:text-red-400 text-xl leading-none">×</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <input className="input-field text-lg font-semibold" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Note title..." />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-1 mt-1">
                {NOTE_COLORS.map(c => (
                  <button key={c} type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{ background: c, borderColor: form.color === c ? 'var(--accent)' : 'var(--border-color)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Content / Preview */}
          {preview ? (
            <div className="prose-dark min-h-48 p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || '*Start writing...*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="input-field resize-none font-mono text-sm"
              rows={12}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your note in Markdown...&#10;&#10;# Heading&#10;**bold** *italic* `code`&#10;&#10;```javascript&#10;const code = 'here';&#10;```"
            />
          )}

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {form.tags.map(t => (
                <span key={t} className="tag flex items-center gap-1 text-xs">
                  #{t}
                  <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field text-xs flex-1" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag + Enter" />
              <button onClick={addTag} className="btn-secondary text-xs px-3">Add</button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (note?._id ? 'Save Changes' : 'Create Note')}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, onFavorite }) {
  const [expanded, setExpanded] = useState(false);
  const preview = note.content?.split('\n').slice(0, 4).join('\n') || '';

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card group relative overflow-hidden"
      style={{ borderLeft: `3px solid ${note.color || '#1e1e1e'}` }}>
      {note.isPinned && (
        <div className="absolute top-2 right-2 text-yellow-400"><VscPinned size={12} /></div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{note.title}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onFavorite(note._id)} style={{ color: note.isFavorite ? '#f44747' : 'var(--text-secondary)' }} className="p-1.5 rounded">
            <VscHeart size={13} />
          </button>
          <button onClick={() => onEdit(note)} style={{ color: 'var(--text-secondary)' }} className="p-1.5 rounded hover:text-blue-400">
            <VscEdit size={13} />
          </button>
          <button onClick={() => onDelete(note._id)} style={{ color: 'var(--text-secondary)' }} className="p-1.5 rounded hover:text-red-400">
            <VscTrash size={13} />
          </button>
        </div>
      </div>

      <div className="prose-dark text-xs mb-3 cursor-pointer" onClick={() => setExpanded(e => !e)}
        style={{ maxHeight: expanded ? 'none' : '80px', overflow: 'hidden' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{expanded ? note.content : preview}</ReactMarkdown>
      </div>
      {note.content && note.content.split('\n').length > 4 && (
        <button onClick={() => setExpanded(e => !e)} className="text-xs hover:underline mb-2"
          style={{ color: 'var(--accent)' }}>
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <span className="badge text-xs">{note.category}</span>
          {note.tags?.slice(0, 2).map(t => <span key={t} className="tag text-xs">#{t}</span>)}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(note.updatedAt)}</span>
      </div>
    </motion.div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterFav, setFilterFav] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCat) params.category = filterCat;
      if (filterFav) params.favorite = 'true';
      const res = await notesAPI.getAll(params);
      setNotes(res.data.data);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNotes(); }, [search, filterCat, filterFav]);

  const handleSave = (note, isNew) => {
    if (isNew) setNotes(n => [note, ...n]);
    else setNotes(n => n.map(x => x._id === note._id ? note : x));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await notesAPI.delete(id);
      setNotes(n => n.filter(x => x._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleFavorite = async (id) => {
    try {
      const res = await notesAPI.toggleFavorite(id);
      setNotes(n => n.map(x => x._id === id ? { ...x, isFavorite: res.data.data.isFavorite } : x));
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title"><VscNote className="inline mr-2" />Notes</h1>
          <p className="page-subtitle">{notes.length} notes · Supports Markdown</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
          <VscAdd /> New Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-9" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setFilterFav(f => !f)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${filterFav ? 'text-red-400' : 'btn-secondary'}`}
          style={filterFav ? { background: 'rgba(244,71,71,0.1)', border: '1px solid rgba(244,71,71,0.4)' } : {}}>
          <VscHeart size={14} /> Favorites
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-lg" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <VscNote size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 className="mt-4 font-semibold" style={{ color: 'var(--text-primary)' }}>No notes yet</h3>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-secondary)' }}>Capture your programming knowledge in Markdown</p>
          <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
            <VscAdd /> Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => (
            <NoteCard key={n._id} note={n} onEdit={setModal} onDelete={handleDelete} onFavorite={handleFavorite} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <NoteModal note={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  );
}
