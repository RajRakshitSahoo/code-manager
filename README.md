# 🚀 Code Manager Pro
fgdh fh rhfh gh fghfhf 
> **Advanced Developer Productivity & Code Organization Platform**
> Built with React, Node.js, Express, MongoDB — Portfolio-ready, production-grade.

![Code Manager Pro](https://img.shields.io/badge/version-1.0.0-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933) ![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT login/register, bcrypt passwords, protected routes |
| 📊 **Dashboard** | Stats, charts (Chart.js), activity feed, recent items |
| 📁 **Projects** | Create/edit/delete/archive, tech stack, categories, tags |
| 💻 **Snippets** | Full Monaco Editor (VS Code), syntax highlighting, version history |
| 📝 **Notes** | Markdown editor with live preview, categories |
| ❤️ **Favorites** | Favorite any project, snippet, or note |
| 🔍 **Search** | Global search across all content with filters |
| 📜 **Activity Log** | Timeline of all actions |
| ⚙️ **Settings** | Theme switching, data export, keyboard shortcuts |
| 🌙 **Themes** | VS Code Dark, Hacker Green, Dracula, Light |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Monaco Editor, Chart.js, React Router v6

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://mongodb.com/atlas))

### 1. Clone / Extract Project
```bash
cd code-manager-pro
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

### 4. Seed Demo Data (optional)
```bash
cd ../backend
node utils/seed.js
# Creates: demo@codemanager.pro / demo123456
```

### 5. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 6. Open Browser
```
http://localhost:5173
```

---

## 🗂️ Project Structure

```
code-manager-pro/
├── backend/
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── snippetController.js
│   │   ├── noteController.js
│   │   ├── statsController.js
│   │   └── searchController.js
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Snippet.js
│   │   ├── Note.js
│   │   └── Activity.js
│   ├── routes/              # Express routes
│   ├── utils/
│   │   └── seed.js          # Demo data seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/Layout.jsx   # Sidebar, navbar, keyboard shortcuts
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── SnippetsPage.jsx
│   │   │   ├── SnippetEditorPage.jsx  # Monaco editor
│   │   │   ├── NotesPage.jsx
│   │   │   ├── FavoritesPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── ActivityPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js       # Axios API client
│   │   ├── styles/
│   │   │   └── globals.css  # Themes, components, animations
│   │   ├── utils/
│   │   │   └── helpers.js   # formatDate, copyToClipboard, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── code-manager-pro.code-workspace   # VS Code workspace
├── package.json                       # Root scripts
└── README.md
```

---

## 🌍 Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/code-manager-pro
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 🔑 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| PATCH | `/api/projects/:id/favorite` | Toggle favorite |
| GET | `/api/snippets` | List snippets |
| POST | `/api/snippets` | Create snippet |
| GET | `/api/snippets/:id/versions` | Version history |
| POST | `/api/snippets/:id/restore/:v` | Restore version |
| GET | `/api/notes` | List notes |
| POST | `/api/notes` | Create note |
| GET | `/api/search?q=...` | Global search |
| GET | `/api/stats` | Dashboard stats |
| GET | `/api/activity` | Activity log |
| GET | `/api/profile` | User profile |
| PUT | `/api/profile` | Update profile |
| PUT | `/api/profile/password` | Change password |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New Snippet |
| `Ctrl+S` | Save (in editor) |
| `Ctrl+F` | Global Search |
| `Ctrl+D` | Go to Dashboard |
| `Ctrl+P` | Go to Projects |

---

## 🎨 Themes

- **VS Code Dark** — Classic professional dark
- **Hacker Green** — Matrix-style terminal
- **Dracula** — Popular purple dark theme
- **Light** — Clean light mode

Switch via Settings page or the sidebar theme button.

---

## 🚀 Production Deployment

### MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env`

### Deploy Backend (Railway / Render / Heroku)
```bash
cd backend
# Set environment variables in your platform dashboard
# PORT, MONGODB_URI, JWT_SECRET, NODE_ENV=production
```

### Deploy Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
# Set VITE_API_URL env var if backend is on different domain
```

---

## 📦 Opening in VS Code

1. Open VS Code
2. File → Open Workspace from File
3. Select `code-manager-pro.code-workspace`
4. Use the built-in tasks (Ctrl+Shift+P → "Run Task") to start servers

---

## 🧪 Demo Account

After running the seed script:
- **Email:** `demo@codemanager.pro`
- **Password:** `demo123456`

Includes 5 sample projects, 5 code snippets, 3 notes, and activity history.

---

## 📄 License

MIT License — Free to use for personal and commercial projects.
