# TaskFlow — To-Do List Management System

TaskFlow is a modern, responsive full-stack To-Do List Management dashboard built with React, TypeScript, Tailwind CSS, and an Express REST API.

## Features

- **Full CRUD Operations**: Create, view, edit, and delete tasks with confirmation dialogs.
- **Task Metadata**: Track title, description, priority (`Low`, `Medium`, `High`), due date, creation date, and completion status.
- **Dashboard Metrics**: Real-time summary cards for Total, Completed, Pending, and Overdue tasks.
- **Search, Filter & Sort**:
  - Search tasks by title.
  - Filter by priority (`All`, `High`, `Medium`, `Low`) and status (`All`, `Pending`, `Completed`, `Overdue`).
  - Sort by creation date (newest/oldest) and due date (earliest/latest).
- **Persistent REST API**: Express backend with input validation, error handling, and atomic server-side JSON storage.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, REST API
- **Build & Tooling**: Vite, tsx

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | Retrieve all tasks |
| `GET` | `/api/tasks/:id` | Retrieve a specific task by UUID |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update an existing task |
| `DELETE` | `/api/tasks/:id` | Permanently delete a task |

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Run in development**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build and run in production**:
   ```bash
   npm run build
   npm start
   ```
