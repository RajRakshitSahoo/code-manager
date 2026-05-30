export const formatDistanceToNow = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'jsx', label: 'React JSX', icon: '⚛️' },
  { value: 'tsx', label: 'React TSX', icon: '⚛️' },
  { value: 'html', label: 'HTML', icon: '🧡' },
  { value: 'css', label: 'CSS', icon: '💜' },
  { value: 'scss', label: 'SCSS', icon: '🌸' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'c', label: 'C', icon: '🔵' },
  { value: 'cpp', label: 'C++', icon: '🔵' },
  { value: 'sql', label: 'SQL', icon: '🗄️' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'bash', label: 'Bash', icon: '💻' },
  { value: 'json', label: 'JSON', icon: '📄' },
  { value: 'yaml', label: 'YAML', icon: '📋' },
  { value: 'markdown', label: 'Markdown', icon: '📝' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'other', label: 'Other', icon: '📄' },
];

export const PROJECT_CATEGORIES = [
  'Web Development', 'Frontend', 'Backend', 'Full Stack',
  'React', 'JavaScript', 'Python', 'Java', 'AI Projects', 'College Projects', 'Other'
];

export const NOTE_CATEGORIES = ['Programming', 'Interview', 'Learning', 'Documentation', 'General', 'Ideas'];

export const STATUS_COLORS = {
  active: '#4ec9b0',
  completed: '#569cd6',
  archived: '#858585',
  'on-hold': '#dcdcaa'
};

export const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3572A5', java: '#b07219',
  css: '#563d7c', html: '#e34c26', sql: '#336791', php: '#4F5D95',
  cpp: '#f34b7d', rust: '#dea584', go: '#00ADD8', jsx: '#61dafb', tsx: '#3178c6',
  bash: '#89e051', json: '#cbcb41', yaml: '#cb171e'
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};

export const getMonacoLanguage = (lang) => {
  const map = { jsx: 'javascript', tsx: 'typescript', bash: 'shell', cpp: 'cpp', c: 'c' };
  return map[lang] || lang;
};
