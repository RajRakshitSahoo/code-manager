require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Snippet = require('../models/Snippet');
const Note = require('../models/Note');
const Activity = require('../models/Activity');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/code-manager-pro');
  console.log('Connected to MongoDB');

  // Clean existing data
  await Promise.all([User.deleteMany(), Project.deleteMany(), Snippet.deleteMany(), Note.deleteMany(), Activity.deleteMany()]);
  console.log('Cleared existing data');

  // Create demo user
  const user = await User.create({
    name: 'Alex Developer',
    email: 'demo@codemanager.pro',
    password: 'demo123456',
    bio: 'Full-stack developer | React & Node.js enthusiast',
    theme: 'vscode-dark'
  });
  console.log('Demo user created: demo@codemanager.pro / demo123456');

  // Create projects
  const projects = await Project.insertMany([
    { user: user._id, name: 'E-Commerce Platform', description: 'Full-stack online store with React, Node, MongoDB', category: 'Full Stack', techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'], status: 'active', tags: ['ecommerce', 'react', 'nodejs'], color: '#007acc', isFavorite: true },
    { user: user._id, name: 'AI Chat Assistant', description: 'GPT-powered chat application with memory', category: 'AI Projects', techStack: ['Python', 'FastAPI', 'OpenAI', 'React'], status: 'active', tags: ['ai', 'python', 'chatgpt'], color: '#6f42c1' },
    { user: user._id, name: 'Portfolio Website', description: 'Personal developer portfolio with animations', category: 'Frontend', techStack: ['React', 'Framer Motion', 'Tailwind'], status: 'completed', tags: ['portfolio', 'react', 'frontend'], color: '#28a745', isFavorite: true },
    { user: user._id, name: 'Task Manager API', description: 'RESTful API for task management with JWT auth', category: 'Backend', techStack: ['Node.js', 'Express', 'MongoDB', 'JWT'], status: 'active', tags: ['api', 'nodejs', 'rest'], color: '#fd7e14' },
    { user: user._id, name: 'Data Dashboard', description: 'Analytics dashboard with Chart.js and D3', category: 'Frontend', techStack: ['React', 'Chart.js', 'D3.js'], status: 'on-hold', tags: ['dashboard', 'charts', 'analytics'], color: '#20c997' }
  ]);

  // Create snippets
  await Snippet.insertMany([
    {
      user: user._id, title: 'React Custom Hook - useLocalStorage', language: 'javascript',
      description: 'Custom hook to persist state in localStorage',
      code: `import { useState } from 'react';\n\nexport const useLocalStorage = (key, initialValue) => {\n  const [storedValue, setStoredValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      return initialValue;\n    }\n  });\n\n  const setValue = (value) => {\n    try {\n      setStoredValue(value);\n      window.localStorage.setItem(key, JSON.stringify(value));\n    } catch (error) {\n      console.error(error);\n    }\n  };\n\n  return [storedValue, setValue];\n};`,
      tags: ['react', 'hooks', 'localstorage'], isFavorite: true, project: projects[0]._id,
      versions: [{ version: 1, code: 'initial', summary: 'Initial version' }]
    },
    {
      user: user._id, title: 'JWT Authentication Middleware', language: 'javascript',
      description: 'Express middleware for JWT token verification',
      code: `const jwt = require('jsonwebtoken');\n\nconst authMiddleware = async (req, res, next) => {\n  try {\n    const token = req.headers.authorization?.split(' ')[1];\n    if (!token) return res.status(401).json({ error: 'No token provided' });\n    \n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (error) {\n    res.status(401).json({ error: 'Invalid token' });\n  }\n};\n\nmodule.exports = authMiddleware;`,
      tags: ['nodejs', 'jwt', 'auth', 'middleware'], isFavorite: true, project: projects[3]._id,
      versions: [{ version: 1, code: 'initial', summary: 'Initial version' }]
    },
    {
      user: user._id, title: 'Python Fibonacci Generator', language: 'python',
      description: 'Memory-efficient Fibonacci sequence generator',
      code: `def fibonacci_generator(n):\n    """Generate Fibonacci numbers up to n terms"""\n    a, b = 0, 1\n    count = 0\n    while count < n:\n        yield a\n        a, b = b, a + b\n        count += 1\n\n# Usage\nfib = fibonacci_generator(10)\nprint(list(fib))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,
      tags: ['python', 'algorithms', 'generators'], project: projects[1]._id,
      versions: [{ version: 1, code: 'initial', summary: 'Initial version' }]
    },
    {
      user: user._id, title: 'CSS Glassmorphism Card', language: 'css',
      description: 'Beautiful glassmorphism card component styles',
      code: `.glass-card {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n  transition: transform 0.3s ease, box-shadow 0.3s ease;\n}\n\n.glass-card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);\n}`,
      tags: ['css', 'glassmorphism', 'ui', 'animations'],
      versions: [{ version: 1, code: 'initial', summary: 'Initial version' }]
    },
    {
      user: user._id, title: 'SQL User Analytics Query', language: 'sql',
      description: 'Complex query for user activity analytics',
      code: `SELECT \n  u.id,\n  u.name,\n  u.email,\n  COUNT(DISTINCT o.id) as total_orders,\n  SUM(o.total_amount) as lifetime_value,\n  MAX(o.created_at) as last_order_date,\n  DATEDIFF(NOW(), MAX(o.created_at)) as days_since_last_order\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)\nGROUP BY u.id\nHAVING total_orders > 0\nORDER BY lifetime_value DESC\nLIMIT 100;`,
      tags: ['sql', 'analytics', 'database'],
      versions: [{ version: 1, code: 'initial', summary: 'Initial version' }]
    }
  ]);

  // Create notes
  await Note.insertMany([
    { user: user._id, title: 'React Hooks Cheatsheet', content: '# React Hooks Quick Reference\n\n## useState\n```js\nconst [state, setState] = useState(initialValue);\n```\n\n## useEffect\n```js\nuseEffect(() => {\n  // side effect\n  return () => cleanup();\n}, [dependency]);\n```\n\n## useCallback\n```js\nconst memoized = useCallback(() => {\n  doSomething(a, b);\n}, [a, b]);\n```', category: 'Programming', tags: ['react', 'hooks', 'cheatsheet'], isFavorite: true },
    { user: user._id, title: 'System Design Interview Notes', content: '# System Design Key Concepts\n\n## Scalability\n- Horizontal vs Vertical scaling\n- Load balancing strategies\n- CDN usage\n\n## Database Design\n- CAP Theorem\n- SQL vs NoSQL trade-offs\n- Sharding and replication\n\n## Caching\n- Redis use cases\n- Cache invalidation strategies\n- Write-through vs write-behind', category: 'Interview', tags: ['system-design', 'interview', 'backend'] },
    { user: user._id, title: 'Docker Commands Reference', content: '# Essential Docker Commands\n\n```bash\n# Build image\ndocker build -t myapp .\n\n# Run container\ndocker run -p 3000:3000 -d myapp\n\n# List containers\ndocker ps\n\n# Stop container\ndocker stop <id>\n\n# Docker compose\ndocker-compose up -d\ndocker-compose down\n```', category: 'Documentation', tags: ['docker', 'devops', 'containers'] }
  ]);

  // Create activities
  const actions = ['project_created', 'snippet_created', 'note_created', 'snippet_updated', 'project_updated'];
  for (let i = 0; i < 15; i++) {
    await Activity.create({
      user: user._id,
      action: actions[i % actions.length],
      resource: ['project', 'snippet', 'note'][i % 3],
      resourceName: `Sample resource ${i + 1}`,
      createdAt: new Date(Date.now() - i * 3600000 * 8)
    });
  }

  console.log('✅ Seed data created successfully!');
  console.log('📧 Login: demo@codemanager.pro');
  console.log('🔑 Password: demo123456');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
