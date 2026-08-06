# 🔐 Full-Stack Auth App — Flask + React + MySQL

A simple full-stack web application with user registration, login, and a protected users list — built with a **Flask** REST API backend, a **React (Vite)** frontend, and a **MySQL** database, all tied together behind an **Nginx** reverse proxy.

![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?logo=nginx&logoColor=white)

---

## ✨ Features

- 🔑 User registration with hashed passwords (`werkzeug.security`)
- 🔓 Login with credential verification
- 👥 Protected users list, gated by a simple header-based auth check
- 🌐 CORS-enabled API for cross-origin frontend requests
- ⚡ Fast, modern frontend built with React + Vite
- 🔁 Nginx reverse proxy in front of both frontend and backend

---

## 📁 Project Structure

```
.
├── app.py              # Flask backend — API routes & MySQL logic
├── requirements.txt     # Python dependencies
├── .gitignore           # Excludes venv, node_modules, env files, etc.
└── frontend/             # React (Vite) frontend
    ├── src/
    │   └── App.jsx        # Login / Register / Users UI
    └── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd webapplication-
```

### 2. Set up the backend

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set up MySQL

```sql
CREATE DATABASE simple_app;

CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON simple_app.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;

USE simple_app;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Update the credentials in `app.py`'s `get_db()` function to match.

### 4. Run the backend

```bash
python app.py
```

Backend runs at `http://127.0.0.1:5000`.

### 5. Set up and run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/register` | Create a new user | — |
| `POST` | `/api/login` | Verify credentials, return user info | — |
| `GET` | `/api/users` | List all registered users | `X-Username` header |

### Example — Register

```bash
curl -X POST http://127.0.0.1:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "hamza", "password": "test123"}'
```

### Example — Get users

```bash
curl -H "X-Username: hamza" http://127.0.0.1:5000/api/users
```

---

## 🌐 Nginx Reverse Proxy (optional, for a unified address)

To serve both frontend and backend from a single address (`http://localhost`) instead of separate ports:

```bash
cd frontend
npm run build
```

```nginx
server {
    listen 80;
    server_name localhost;

    root /path/to/webapplication-/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> 📝 Update `App.jsx`'s `API` constant to `/api` (relative path) instead of the full `http://localhost:5000/api` when using this setup.

---

## 🗺️ Architecture

```
   Browser
      │
      ▼
  ┌────────┐        ┌──────────────────┐        ┌───────────┐
  │ Nginx  │ ─────▶ │  React (static)   │        │           │
  │ :80    │        │  frontend/dist    │        │           │
  │        │ ─/api─▶│  Flask API        │ ─────▶ │  MySQL    │
  └────────┘        │  :5000            │        │           │
                     └──────────────────┘        └───────────┘
```

---

## 🔒 Security Notes

- Passwords are hashed with `werkzeug.security` before storage — never stored in plain text.
- The dedicated `appuser` MySQL account is used instead of `root`, following least-privilege practice.
- ⚠️ Database credentials currently live directly in `app.py`. For production use, move these into a `.env` file (excluded via `.gitignore`) and load them with `python-dotenv`.
- The `/api/users` auth check is minimal (username-only, no password/token) — suitable for local development only, not production-grade authentication.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Flask, Flask-CORS |
| Database | MySQL 8.x |
| Frontend | React 18, Vite |
| Reverse Proxy | Nginx |
| Auth | Werkzeug password hashing |

---

## 📄 License

This project is provided as-is for learning and local development purposes.
