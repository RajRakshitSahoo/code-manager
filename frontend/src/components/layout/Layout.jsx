import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  VscHome, VscFolder, VscCode, VscNote, VscHeart, VscSearch,
  VscHistory, VscAccount, VscSettingsGear, VscColorMode,
  VscAdd, VscMenu, VscClose, VscChevronRight, VscTerminal, VscSignOut
} from 'react-icons/vsc';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: VscHome, label: 'Dashboard' },
  { to: '/projects', icon: VscFolder, label: 'Projects' },
  { to: '/snippets', icon: VscCode, label: 'Snippets' },
  { to: '/notes', icon: VscNote, label: 'Notes' },
  { to: '/favorites', icon: VscHeart, label: 'Favorites' },
  { to: '/search', icon: VscSearch, label: 'Search' },
  { to: '/activity', icon: VscHistory, label: 'Activity' },
];

const BOTTOM_ITEMS = [
  { to: '/profile', icon: VscAccount, label: 'Profile' },
  { to: '/settings', icon: VscSettingsGear, label: 'Settings' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey)) {
        switch(e.key) {
          case 'n': e.preventDefault(); navigate('/snippets/new'); break;
          case 'f': e.preventDefault(); navigate('/search'); break;
          case 'd': e.preventDefault(); navigate('/dashboard'); break;
          case 'p': e.preventDefault(); navigate('/projects'); break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, var(--accent), #c586c0)' }}>
          CM
        </div>
        {sidebarOpen && (
          <div>
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Code Manager</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pro</div>
          </div>
        )}
      </div>

      {/* Quick Add */}
      {sidebarOpen && (
        <div className="p-3">
          <button onClick={() => navigate('/snippets/new')} className="w-full btn-primary flex items-center justify-center gap-2 text-xs">
            <VscAdd /> New Snippet
          </button>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={16} />
            {sidebarOpen && <span>{label}</span>}
            {sidebarOpen && location.pathname === to && <VscChevronRight size={12} className="ml-auto" />}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-2 space-y-0.5" style={{ borderColor: 'var(--border-color)' }}>
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={16} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}

        <button onClick={cycleTheme} className="sidebar-item w-full">
          <VscColorMode size={16} />
          {sidebarOpen && <span className="capitalize">{theme.replace('-', ' ')}</span>}
        </button>

        <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300">
          <VscSignOut size={16} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* User Avatar */}
      {sidebarOpen && user && (
        <div className="px-3 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 52 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col flex-shrink-0 border-r relative"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        <SidebarContent />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg transition-colors z-10"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-56 z-50 md:hidden border-r flex flex-col"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <button onClick={() => setMobileOpen(true)}>
            <VscMenu size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Code Manager Pro</span>
          <VscTerminal size={18} style={{ color: 'var(--accent)' }} />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="page-transition">
            <Outlet />
          </div>
        </main>

        {/* Status Bar - VS Code style */}
        <div className="hidden md:flex items-center justify-between px-4 py-1 text-xs"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          <div className="flex items-center gap-4">
            <span>⚡ Code Manager Pro</span>
            <span>Ctrl+N: New Snippet | Ctrl+F: Search | Ctrl+D: Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="capitalize">{theme.replace('-', ' ')}</span>
            <span>{user?.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
