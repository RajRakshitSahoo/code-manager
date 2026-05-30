import { useState } from 'react';
import { VscSettingsGear, VscColorMode, VscBell, VscDatabase, VscShield } from 'react-icons/vsc';
import { useTheme } from '../context/ThemeContext';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const THEME_INFO = {
  'vscode-dark': { name: 'VS Code Dark', desc: 'Classic dark theme inspired by VS Code', preview: '#1e1e1e' },
  'hacker-green': { name: 'Hacker Green', desc: 'Matrix-style green on black', preview: '#0a0f0a' },
  'dracula': { name: 'Dracula', desc: 'Popular dark theme with purple accents', preview: '#282a36' },
  'light': { name: 'Light', desc: 'Clean light theme for daylight', preview: '#ffffff' },
};

const SHORTCUTS = [
  { keys: ['Ctrl', 'N'], action: 'New Snippet' },
  { keys: ['Ctrl', 'S'], action: 'Save Current' },
  { keys: ['Ctrl', 'F'], action: 'Global Search' },
  { keys: ['Ctrl', 'D'], action: 'Go to Dashboard' },
  { keys: ['Ctrl', 'P'], action: 'Go to Projects' },
];

export default function SettingsPage() {
  const { theme, setTheme, themes } = useTheme();
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState(user?.notifications ?? true);

  const handleSavePrefs = async () => {
    try {
      const res = await profileAPI.update({ notifications });
      updateUser(res.data.data);
      toast.success('Preferences saved!');
    } catch { toast.error('Save failed'); }
  };

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export' });
      const [projects, snippets, notes] = await Promise.all([
        fetch('/api/projects?limit=1000', { headers: { Authorization: `Bearer ${localStorage.getItem('cmp_token')}` } }).then(r => r.json()),
        fetch('/api/snippets?limit=1000', { headers: { Authorization: `Bearer ${localStorage.getItem('cmp_token')}` } }).then(r => r.json()),
        fetch('/api/notes?limit=1000', { headers: { Authorization: `Bearer ${localStorage.getItem('cmp_token')}` } }).then(r => r.json()),
      ]);
      const data = {
        exportedAt: new Date().toISOString(),
        user: { name: user.name, email: user.email },
        projects: projects.data,
        snippets: snippets.data,
        notes: notes.data,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-manager-pro-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported!', { id: 'export' });
    } catch { toast.error('Export failed', { id: 'export' }); }
  };

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div>
        <h1 className="page-title"><VscSettingsGear className="inline mr-2" />Settings</h1>
        <p className="page-subtitle">Customize your Code Manager Pro experience</p>
      </div>

      {/* Theme */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <VscColorMode /> Theme
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {themes.map(t => {
            const info = THEME_INFO[t];
            return (
              <button key={t} onClick={() => setTheme(t)}
                className="flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                style={{
                  background: theme === t ? 'rgba(0,122,204,0.1)' : 'var(--bg-tertiary)',
                  border: `2px solid ${theme === t ? 'var(--accent)' : 'var(--border-color)'}`,
                }}>
                <div className="w-8 h-8 rounded-lg border flex-shrink-0" style={{ background: info.preview, borderColor: 'var(--border-color)' }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{info.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{info.desc}</div>
                </div>
                {theme === t && <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <VscBell /> Notifications
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Toast Notifications</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Show success/error notifications</div>
          </div>
          <button onClick={() => setNotifications(n => !n)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ background: notifications ? 'var(--accent)' : 'var(--border-color)' }}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <button onClick={handleSavePrefs} className="btn-primary text-sm mt-4">Save Preferences</button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>⌨️ Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.action} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map(k => (
                  <kbd key={k} className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <VscDatabase /> Data Management
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Export all your data as JSON. Includes all projects, snippets, and notes.
        </p>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          📤 Export All Data (JSON)
        </button>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <VscShield /> About
        </h3>
        <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <p>Code Manager Pro v1.0.0</p>
          <p>Built with React, Node.js, MongoDB</p>
          <p>© 2024 Code Manager Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
