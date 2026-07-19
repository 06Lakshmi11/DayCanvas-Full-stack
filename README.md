# 📅 DayCanvas — Full Stack

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

*A quiet place for daily notes — a calendar you can actually write on, now synced across every device you log into.*

Author — **Lakshmi Valmiki**

## Table of Contents

- [About The Project](#about-the-project)
- [Repository Structure](#repository-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [How It All Connects](#how-it-all-connects)
- [Good to Know](#good-to-know)
- [Ideas to Extend](#ideas-to-extend)
- [Author](#author)

---

## About The Project

DayCanvas is a month-view calendar app where you can write notes, build checklists, attach photos, set reminders, and see real public holidays — all on any day you click. It started as a fully client-side app, and now has a real backend so notes sync across devices with proper user accounts.

This repository contains **both halves** of the project:
- `frontend/` — the React app users interact with
- `backend/` — the Node.js/Express API and MongoDB database that stores everything

## 📁 Repository Structure

```text
DayCanvas-FullStack
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── utils
│   │   ├── assets
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── server.js
│   └── package.json
│
└── README.md
```
## Features

- 🗓️ Month-view calendar with prev/next/today navigation and instant year/month jump
- 🔐 **Real user accounts** — sign up, log in, notes tied to your account
- 🔄 **Notes sync across devices** — log in anywhere, same notes
- 📝 Two note types — free-form text and interactive checklists
- 🔤 Text formatting — bold, italic, and adjustable size
- 🚦 Priority tagging with a custom radio selector
- 📷 Photo attachments, resized automatically before saving
- ⏰ Reminders with browser notifications
- 🎨 8-color palette plus 4 full app themes, with a one-tap dark mode toggle
- 🎉 Real public holidays and festivals via a live API, with country selection
- 🔍 Full-text search across all notes
- 💾 Export/Import backup as JSON
- ↩️ Delete confirmation with undo
- ➕ Floating "add note" button, always accessible
- 👤 Profile menu with avatar initials

## Tech Stack

**Frontend**
- React 18, Vite 5
- Plain CSS with custom properties for theming
- Nager.Date API for public holidays

**Backend**
- Node.js, Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Getting Started

You'll need **two terminals running at the same time** — one for the backend, one for the frontend.

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (copy from `.env.example`) with:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/daycanvas?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret-string
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Then run:
```bash
npm run dev
```

You should see:

MongoDB connected
DayCanvas API listening on
 http://localhost:5000

**Keep this terminal running.**

### 2. Frontend Setup

In a **new** terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:
```env
VITE_API_URL=http://localhost:5000/api
```

Then run:
```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) — you'll land on a login/signup screen.

## 🔄 How It All Connects

```text
React Frontend (Browser)
          │
          ▼
fetch() + JWT Token
          │
          ▼
Express API (Node.js)
          │
          ▼
Authentication Middleware
          │
          ▼
Controllers
          │
          ▼
Mongoose Models
          │
          ▼
MongoDB Atlas Database
```

Every note action (create, edit, delete, checklist toggle) follows this flow:

1. The React frontend sends an authenticated request.
2. Express verifies the JWT token.
3. The controller processes the request.
4. Mongoose reads or updates MongoDB Atlas.
5. The updated data is returned to the frontend.

Only the login token and UI preferences (theme, selected country) are stored in the browser.

## Good to Know

- **Reminders only fire while the tab is open** — no service worker/push notifications yet.
- **Holiday data** comes from the free Nager.Date API and may not have full coverage for every country.
- **Photos** are resized client-side before upload to keep request sizes reasonable.
- Both `frontend/.env` and `backend/.env` are gitignored — anyone cloning this repo needs to create their own.

## Ideas to Extend

- True background push notifications via a service worker
- Recurring/repeating notes
- `.ics` export for Google/Outlook/Apple Calendar
- A year-at-a-glance view
- Deploy the backend (Render/Railway) and frontend (Vercel/Netlify) so it's live for anyone, not just localhost

## Author

**Lakshmi Valmiki**