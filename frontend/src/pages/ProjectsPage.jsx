import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VscAdd, VscFolder, VscEdit, VscTrash, VscHeart, VscArchive, VscFilter, VscSearch } from 'react-icons/vsc';
import { projectsAPI } from '../services/api';
import { PROJECT_CATEGORIES, STATUS_COLORS, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const TECH_SUGGESTIONS = ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Python', 'FastAPI', 'TypeScript', 'Next.js', 'Tailwind CSS'];

function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project || {
    name: '', description: '', category: 'Other', techStack: [], status: 'active', tags: [], color: '#007acc', githubUrl: '', liveUrl: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setLoading(true);
    try {
      if (project?._id) {
        const res = await projectsAPI.update(project._id, form);
        onSave(res.data.data, false);
        toast.success('Project updated!');
      } else {
        const res = await projectsAPI.create(form);
        onSave(res.data.data, true);
        toast.success('Project created!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const addTech = (tech) => {
    if (!form.techStack.includes(tech)) setForm(f => ({ ...f, techStack: [...f.techStack, tech] }));
    setTechInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {project?._id ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }} className="hover:text-red-400 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Project Name *</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Awesome Project" />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input-field resize-none" rows={2} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief project description..." />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="label">Tech Stack</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.techStack.map(t => (
                <span key={t} className="badge flex items-center gap-1">
                  {t}
                  <button type="button" onClick={() => setForm(f => ({ ...f, techStack: f.techStack.filter(x => x !== t) }))} className="text-red-400 hover:text-red-300 leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field text-xs" value={techInput} onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), techInput.trim() && addTech(techInput.trim()))}
                placeholder="Add technology..." />
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {TECH_SUGGESTIONS.filter(t => !form.techStack.includes(t)).slice(0, 6).map(t => (
                <button key={t} type="button" onClick={() => addTech(t)}
                  className="text-xs px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  + {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map(t => (
                <span key={t} className="tag flex items-center gap-1">
                  #{t}
                  <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} className="hover:text-red-400 leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field text-xs" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag and press Enter" />
              <button type="button" onClick={addTag} className="btn-secondary text-xs px-3">Add</button>
            </div>
          </div>

          {/* Color & URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Color</label>
              <input type="color" className="w-full h-9 rounded cursor-pointer"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
            <div>
              <label className="label">GitHub URL</label>
              <input className="input-field text-xs" value={form.githubUrl}
                onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (project?._id ? 'Save Changes' : 'Create Project')}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete, onFavorite, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="card group relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{ background: project.color || 'var(--accent)' }}>
            {project.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{project.name}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.category}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onFavorite(project._id)} className={`p-1.5 rounded transition-colors ${project.isFavorite ? 'text-red-400' : ''}`}
            style={{ color: project.isFavorite ? '#f44747' : 'var(--text-secondary)' }}>
            <VscHeart size={14} />
          </button>
          <button onClick={() => onEdit(project)} className="p-1.5 rounded transition-colors hover:text-blue-400"
            style={{ color: 'var(--text-secondary)' }}>
            <VscEdit size={14} />
          </button>
          <button onClick={() => onDelete(project._id)} className="p-1.5 rounded transition-colors hover:text-red-400"
            style={{ color: 'var(--text-secondary)' }}>
            <VscTrash size={14} />
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
      )}

      {/* Tech Stack */}
      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.techStack.slice(0, 4).map(t => (
            <span key={t} className="badge text-xs">{t}</span>
          ))}
          {project.techStack.length > 4 && <span className="badge text-xs">+{project.techStack.length - 4}</span>}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
          style={{ color: STATUS_COLORS[project.status] || '#858585', background: `${STATUS_COLORS[project.status]}20` }}>
          {project.status}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(project.updatedAt)}</span>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | project object
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '', category: '' });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;
      const res = await projectsAPI.getAll(params);
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, [search, filter]);

  const handleSave = (project, isNew) => {
    if (isNew) setProjects(p => [project, ...p]);
    else setProjects(p => p.map(x => x._id === project._id ? project : x));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await projectsAPI.delete(id);
      setProjects(p => p.filter(x => x._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleFavorite = async (id) => {
    try {
      const res = await projectsAPI.toggleFavorite(id);
      setProjects(p => p.map(x => x._id === id ? res.data.data : x));
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title"><VscFolder className="inline mr-2" />Projects</h1>
          <p className="page-subtitle">{projects.length} projects</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
          <VscAdd /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input className="input-field pl-9" placeholder="Search projects..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="archived">Archived</option>
        </select>
        <select className="input-field w-auto" value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-lg" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <VscFolder size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 className="mt-4 font-semibold" style={{ color: 'var(--text-primary)' }}>No projects yet</h3>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-secondary)' }}>Create your first project to get started</p>
          <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
            <VscAdd /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <ProjectCard key={p._id} project={p}
              onEdit={setModal}
              onDelete={handleDelete}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <ProjectModal
            project={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
