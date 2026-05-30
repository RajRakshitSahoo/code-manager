import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VscAccount, VscSave, VscKey } from 'react-icons/vsc';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', avatar: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    profileAPI.get().then(res => {
      setProfile(res.data.data);
      setForm({ name: res.data.data.name || '', bio: res.data.data.bio || '', avatar: res.data.data.avatar || '' });
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const res = await profileAPI.update(form);
      setProfile(p => ({ ...p, ...res.data.data }));
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('Fill all fields');
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await profileAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-in">
      <div className="skeleton h-8 w-32 rounded" />
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div>
        <h1 className="page-title"><VscAccount className="inline mr-2" />Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {/* Profile Header */}
      <div className="card flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), #c586c0)' }}>
          {profile?.avatar ? (
            <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{profile?.name}</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Member since {formatDate(profile?.createdAt)}</p>
        </div>
        <div className="ml-auto grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Projects', value: profile?.projectsCount || 0 },
            { label: 'Snippets', value: profile?.snippetsCount || 0 },
            { label: 'Notes', value: profile?.notesCount || 0 },
          ].map(s => (
            <div key={s.label}>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Profile</h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input-field resize-none" rows={2} value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell us about yourself..." maxLength={200} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{form.bio.length}/200</p>
          </div>
          <div>
            <label className="label">Avatar URL</label>
            <input className="input-field" value={form.avatar}
              onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
              placeholder="https://..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <VscSave size={14} />}
            Save Profile
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <VscKey /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input-field" value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field" value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input-field" value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" />
          </div>
          <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {savingPw ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <VscKey size={14} />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
