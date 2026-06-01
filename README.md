# TaskFlow

A full-stack Kanban task management app built with the MERN stack.

## 🌐 Live Demo

**[https://taskflow-dun-xi.vercel.app](https://taskflow-dun-xi.vercel.app)**

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Zustand |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Vercel (frontend) + Render (backend) |

## ✨ Features

- 🔐 User registration and login (JWT auth)
- 📋 Create and delete boards
- ✅ Create and delete tasks
- 🖱️ Drag and drop tasks between columns
- 🏷️ Priority levels (Low, Medium, High)
- 🌙 Fully responsive dark UI

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/shafiq-ahamed04/taskflow.git
cd taskflow
```

### 2. Start the backend
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

```bash
npm run dev
```

### 3. Start the frontend
```bash
cd client
npm install
```

Create a `.env` file in `client/`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs on **http://localhost:5173** · Backend runs on **http://localhost:5000**

## 🗂️ Project Structure

```
taskflow/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # Shared components
│   │   ├── pages/       # Dashboard, BoardPage, Login, Register
│   │   └── store/       # Zustand auth store
│   └── vercel.json
└── server/              # Express backend
    ├── controllers/
    ├── middleware/
    ├── models/          # Mongoose schemas
    ├── routes/
    └── render.yaml
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/boards` | Get all user boards |
| POST | `/api/boards` | Create a board |
| DELETE | `/api/boards/:id` | Delete a board |
| GET | `/api/tasks/board/:id` | Get tasks for a board |
| POST | `/api/tasks/board/:id` | Create a task |
| PUT | `/api/tasks/:id` | Update task (status, etc.) |
| DELETE | `/api/tasks/:id` | Delete a task |

## 🚢 Deployment

- **Frontend** → [Vercel](https://vercel.com) — set `VITE_API_URL` env var to your Render backend URL
- **Backend** → [Render](https://render.com) — set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` env vars

---

Built by [Shafiq Ahamed](https://github.com/shafiq-ahamed04)
