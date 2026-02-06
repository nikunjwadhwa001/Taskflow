# TaskFlow 🗂️

TaskFlow is a full-stack task management web application built using Go, Gin, PostgreSQL, and Docker.  
It allows users to securely manage projects and tasks with authentication, authorization, and a clean user interface.

---

## 🚀 Features

### 🔐 Authentication & Security
- User registration with bcrypt password hashing
- Secure login with JWT-based authentication
- Stateless authentication (no server-side sessions)
- Middleware-protected routes
- Ownership-based authorization (users can access only their own data)

### 📁 Project Management
- Create and delete projects
- Each project belongs to a specific user
- Cascading deletion of tasks when a project is deleted

### ✅ Task Management
- Create, update, and delete tasks within projects
- Task status workflow:
  - Todo → In Progress → Done
- Secure task updates with authorization checks
- Pagination for scalable task listing

### 📊 Dashboard
- User-specific dashboard
- Shows:
  - Total projects
  - Total tasks
  - Tasks by status (Todo / In Progress / Done)

### 🎨 UI / UX
- Server-side rendered HTML using Go templates
- Global navigation bar
- Status-based task badges
- Confirmation dialogs for destructive actions
- Clean, responsive layout using vanilla CSS

---

## 🛠️ Tech Stack

### Backend
- Go
- Gin (HTTP framework)
- GORM (ORM)
- PostgreSQL

### Frontend
- HTML
- CSS
- Vanilla JavaScript

### Security
- bcrypt (password hashing)
- JWT (authentication)

### Infrastructure
- Docker & Docker Compose

---

## 🧠 Architecture Overview

