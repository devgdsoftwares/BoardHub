Here’s a **clean and professional `README.md`** for your `BoardHub` project, including:

* A ✍️ project overview
* A 📋 checklist table for required features
* 🛠️ setup & run instructions
* ✨ stretch goal notes
* ✅ usage walkthrough

You can copy this directly into your `/web/README.md`.

---

````markdown
# 📌 BoardHub – Full-Stack Showcase Challenge

> 🚀 A 24-hour sprint to build a Trello-style productivity tool with Next.js, Tailwind CSS, and MongoDB.

---

## 📚 Overview

BoardHub is a lightweight Kanban-style collaboration app where teams can create **boards → lists → cards** with intuitive drag-and-drop and authentication. Built as part of a full-stack engineering assessment, the project emphasizes both user experience and code craftsmanship.

---

## 🎯 Challenge Scope

**Challenge Duration:** 24 hours  
**Tech Stack:** Next.js 15 · Tailwind CSS · MongoDB · Node.js 22

---

## ✅ Feature Checklist

### 📌 User Interface Track

| ID  | Title                                        | Effort | Status   |
|-----|----------------------------------------------|--------|----------|
| U0  | Core CRUD: create/edit/delete boards, lists & cards | ★★     | ✅ Done   |
| U1  | Responsive UI with drag & drop (@dnd-kit)     | ★★★★   | ✅ Done   |
| U2  | Dark/Light theme toggle (system + manual)     | ★      | ✅ Done   |
| U3  | Empty states & skeleton loaders               | ★      | ✅ Done   |
| U4  | Landing page with animated hero & CTA         | ★★     | ⏳ Pending |
| U5  | Inline card editor with markdown preview      | ★★★    | ⏳ Pending |
| U6  | Real‑time presence avatars via WebSocket      | ★★     | ⏳ Pending |
| U7  | Keyboard‑shortcut cheat‑sheet overlay         | ★      | ⏳ Pending |
| U8  | Accessibility pass (WCAG-AA, ARIA)            | ★★     | ⏳ Pending |
| U9  | Public read‑only board share link             | ★★     | ⏳ Pending |

### ⚙️ Engineering Track

| ID  | Title                                        | Effort | Status   |
|-----|----------------------------------------------|--------|----------|
| E0  | API routes & server actions for CRUD         | ★★     | ✅ Done   |
| E1  | Manual auth: signup/login with cookies & CSRF| ★★★★   | ✅ Done   |
| E2  | MongoDB schema & indexes                     | ★★     | ✅ Done   |
| E3  | Global error boundary + basic logging        | ★      | ✅ Done   |
| E4  | Role-based access control (RBAC)             | ★★     | ⏳ Pending |
| E5  | Optimistic UI updates                        | ★★     | ⏳ Pending |
| E6  | Edge runtime rate limiter (no libs)          | ★      | ⏳ Pending |
| E7  | Multi-stage Dockerfile (<200MB image)        | ★      | ⏳ Pending |
| E8  | SSE stream for live updates                  | ★★     | ⏳ Pending |
| E9  | Audit-log for changes                        | ★      | ⏳ Pending |
| E10 | Bundle analysis + perf budget (LCP, CLS)     | ★      | ⏳ Pending |

---

## 💡 Stretch Goal Notes

> None attempted within the timebox — 100% focus went into delivering a stable MVP with all required features.

---

## ⚙️ Getting Started

### 🧩 Prerequisites

- Node.js `v22.x` (use [nvm](https://github.com/nvm-sh/nvm))
- MongoDB (local instance)

### ⚙️ Install & Run (Dev Mode)

```bash
# Step 1: Start MongoDB
mongod --config /opt/homebrew/etc/mongod.conf

# Step 2: Authenticate
mongosh -u admin -p secret123 --authenticationDatabase admin

# Step 3: Run App
cd web
nvm use 22
npm install
npm run dev
````

The app will be available at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🛠️ MongoDB Setup

Add this `.env.local` file:

```env
MONGODB_URI=mongodb://admin:secret123@127.0.0.1:27017/boardhub?authSource=admin
```

✅ Replace `boardhub` with your DB name if different.

---

## 🧪 How to Use

1. Visit `/signup` and create an account
2. Log in via `/login`
3. Create a **board**
4. Add **lists** inside the board
5. Add **cards** inside each list
6. Drag & drop cards and lists to reorder
 <img width="1390" height="637" alt="login" src="https://github.com/user-attachments/assets/e8e74c96-0476-424e-9880-9f3954202cb8" />
<img width="1390" height="637" alt="sign-up" src="https://github.com/user-attachments/assets/cb482093-766d-46bc-8670-ca9319bd6186" />
<img width="1498" height="641" alt="Add card" src="https://github.com/user-attachments/assets/a7c66174-98b3-44f4-ba25-c9c373785f37" />
<img width="1494" height="670" alt="Drag-drop list" src="https://github.com/user-attachments/assets/cd7a8c07-d440-483d-a599-e0b18a0209ba" />


---

## 🧠 Architecture

* `src/models/`: Mongoose schemas for Board, List, Card, User
* `src/app/api/`: REST API routes (signup, login, CRUD)
* `src/app/dashboard/`: Authenticated board UI
* `@dnd-kit/core`: Drag and drop between lists/cards

---

## 🧪 Testing Notes

* Auth protected routes use server-side checks
* CSRF tokens are implemented for all mutations
* MongoDB connection reuses pooled client
* UI is fully responsive and drag-capable

---

## 📂 Folder Structure (Simplified)

```bash
BoardHub/
├── package.json
├── src/models/Board.js
├── src/models/Card.js
├── src/models/List.js
├── src/models/User.js
└── web/
    ├── src/app/
    │   ├── api/auth/
    │   ├── api/boards/
    │   ├── api/cards/
    │   ├── api/lists/
    │   ├── dashboard/
    │   ├── login/
    │   └── signup/
```

---

## 📌 About

> Built as a technical challenge for a full-time web developer position.
> Submitted within a 24-hour window with full CRUD, auth, and responsive board UI.

---

 
