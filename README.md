# GenZNotes — Premium College Notes Marketplace
> **Exam Tomorrow? GenZNotes Today.**

A complete, production-ready college notes marketplace built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). 

GenZNotes empowers university students to discover, preview, purchase, and read academic notes organized by **College → Course → Semester/Year → Subject → Unit → Notes**, completely controlled and dynamically managed via an intuitive Admin Panel.

---

## 🏗️ Architecture Overview

The system consists of three distinct applications:

1. **Student Frontend (`frontend/`)**: React.js + Vite + Tailwind CSS + Lucide Icons (Port 5173)
2. **Admin Frontend (`admin/`)**: React.js + Vite + Tailwind CSS + Lucide Icons (Port 5174)
3. **Backend API (`backend/`)**: Node.js + Express.js + MongoDB + Mongoose + JWT + bcrypt + Cashfree PG SDK (Port 5000)

---

## ✨ Key Features & Architectural Highlights

### 1. Sunset-Inspired Brand Identity
- **Palette**: Warm Sunset Orange (`#F28C52`), Coral (`#E96B55`), Deep Sunset Red (`#D94F50`), Warm Cream (`#FFF7F0`), Dark Surface (`#222222`), Dark Background (`#171717`).
- Full dark mode and light mode support with persistent user preferences across both student and admin apps.

### 2. Dynamic Academic Hierarchy (100% Admin Controlled)
- Dynamic hierarchy: `College → Course → Semester → Subject → Unit → Notes`
- Nothing is hardcoded; all colleges, courses, semesters, subjects, units, notes, and pricing are stored in MongoDB and managed via the Admin Dashboard.
- Prevention of accidental deletion of entities containing dependent children.

### 3. Professional HTML Digital Notes Reader
- Notes are **NOT** rendered as downloadable PDFs.
- Rendered as structured, paper-like A4 digital documents with page headers/footers, margins, equations, and tables.
- **Shared Notes Renderer**: Both Admin Preview and Student Reader use the identical renderer (`NotesReader.jsx`).
- Light & dark reading surfaces, zoom controls, and table of contents sidebar.

### 4. Content Protection & Free Preview Security
- **Normal Notes**: First 2 pages free by default; remaining pages locked with a purchase overlay and price breakdown.
- **Quick Notes**: First page locked by default (`previewPageCount: 0`).
- **Critical Security**: The backend **never** sends paid HTML to the client for locked pages; content is stripped server-side, preventing CSS blur bypasses.
- **Dynamic Watermarking**: Purchased notes feature user-specific diagonal watermark stamps (masked email & reference ID).
- **Anti-Copy Protection**: Right-click, text selection, and print media queries are disabled inside the reader.

### 5. Single-Device Login Enforcement
- Active session tracked in MongoDB with a unique session ID.
- Logging in on a new device immediately invalidates previous sessions.
- Inactive devices receive a `401 SESSION_INVALIDATED` alert: *"Your account was logged in on another device. Please log in again."*

### 6. Cashfree Payment & Multi-tier Entitlements
- Purchases supported at four granular tiers:
  1. Complete Semester Package Pass (unlocks all subjects & units in that semester)
  2. Complete Subject Pass (unlocks all units under that subject)
  3. Individual Unit Pass (unlocks that unit's notes)
  4. Individual Note / Quick Note Pass
- Prices are **always** validated against MongoDB server-side.
- Order & payment status verified server-side via Cashfree PG APIs, with HMAC-SHA256 webhook signature verification (`crypto.timingSafeEqual`).

### 7. Reading Progress & My Library
- Automatic reading progress bookmarks track the last-read page.
- "Continue Reading" cards allow one-click resumption of study sessions.
- Wishlist for bookmarking subjects and notes.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017`

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Student Frontend
cd ../frontend
npm install

# Admin Frontend
cd ../admin
npm install
```

### 2. Seed Database with Real College Data

Run the database seed script to populate colleges (DTU, MU, AU), courses (CSE, IT), semesters 1–8, subjects (DSA, DBMS, OS, Discrete Math), units, and multi-page HTML notes:

```bash
cd backend
npm run seed
```

Default credentials:
- **Admin**: `admin@notesguru.in` / `Admin@12345`
- **Student**: `student@notesguru.in` / `Student@12345`

### 3. Run Applications

**Start Backend Server (Port 5000):**
```bash
cd backend
npm start
```

**Start Student Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

**Start Admin Frontend (Port 5174):**
```bash
cd admin
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) in your browser.

---

## 🧪 Automated End-to-End Verification Tests

Run the comprehensive test suite verifying health checks, single-device login, academic hierarchy, content locking, Cashfree entitlement fulfillment, and admin authorization:

```bash
cd backend
node src/scripts/test-e2e.js
```

---

## 🔒 Security Audit & Practices
- **Passwords**: Hashed using `bcryptjs` with salt rounds.
- **JWT**: Signed with user and unique session IDs.
- **Content Protection**: Server-side stripping of locked page HTML.
- **Rate Limiting**: Applied to general API routes and auth endpoints.
- **Headers**: Secured with Helmet.
- **HTML Sanitization**: Applied with `sanitize-html` to prevent stored XSS in rich notes.

---

© GenZNotes. Crafted for university students across India.
# notes-guru
