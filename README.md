# 🚀 TaskFlow — Kanban-Style Task Management App

## 📋 Description
TaskFlow is a full-stack Kanban-style task management CRUD application built to demonstrate full stack development and DevOps skills. Users can register, login, create boards, and manage tasks with drag-and-drop functionality across status columns (To Do → In Progress → Done).

### Key Features
- **Authentication** — Register & Login with JWT-based auth
- **Boards** — Full CRUD operations on project boards
- **Tasks** — Create, Read, Update, Delete tasks within boards
- **Drag & Drop** — Move tasks between status columns seamlessly
- **Comments** — Add comments on individual tasks
- **Priority & Status** — Organize tasks by priority (Low/Medium/High) and status

---

## 🛠️ Tech Stack

| Layer      | Technologies                                                  |
|------------|---------------------------------------------------------------|
| Frontend   | React, Vite, Tailwind CSS, React Router v6, Axios, @dnd-kit/core, Zustand |
| Backend    | Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, dotenv, cors |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## 📁 Project Structure
```
taskflow/
├── client/          → React frontend (Vite + Tailwind CSS)
│   ├── public/
│   └── src/
│       ├── api/         → Axios instance & API config
│       ├── components/  → Reusable UI components
│       ├── pages/       → Route-level page components
│       └── store/       → Zustand state management
│
├── server/          → Express.js backend
│   ├── controllers/ → Route handler logic
│   ├── middleware/   → Auth middleware (JWT verification)
│   ├── models/       → Mongoose schemas
│   └── routes/       → API route definitions
│
├── .env.example     → Environment variable template
├── .gitignore       → Git ignore rules
├── Dockerfile       → Docker containerization (placeholder)
└── README.md        → Project documentation
```

---

## ⚙️ Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Atlas account (free tier)
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/taskflow.git
cd taskflow

# Setup backend
cd server
npm install
cp ../.env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret

# Setup frontend
cd ../client
npm install
```

---

## ▶️ Run

### Development
```bash
# Start backend (from /server)
cd server
npm run dev

# Start frontend (from /client)
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000

---

## 🚢 Deploy

### Frontend (Vercel)
<!-- TODO: Add Vercel deployment instructions -->

### Backend (Render)
<!-- TODO: Add Render deployment instructions -->

### Database (MongoDB Atlas)
<!-- TODO: Add MongoDB Atlas setup instructions -->

---

## 🔮 DevOps Roadmap
- [ ] CI/CD with GitHub Actions
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] AWS deployment
- [ ] Monitoring & logging

---

## 📝 License
MIT
