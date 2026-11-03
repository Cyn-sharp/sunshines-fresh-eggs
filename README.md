# 🥚 Sunshine's Fresh Eggs — Inventory Management System

A mobile-first Progressive Web App (PWA) for managing egg inventory across a bodega (warehouse) and tindahan (retail store). Built for a real small business in the Philippines.

## 📱 Features (Phase 1)
- ✅ Email/Password Authentication (Firebase Auth)
- ✅ Role-based access control (Admin & Tindero)
- ✅ Protected routes with auto-redirect
- ✅ Mobile-first responsive UI
- ✅ Offline-ready architecture (PWA)

## 🗺️ Roadmap
- [x] **Phase 1:** Project setup, Auth, Role-based routing
- [ ] **Phase 2:** Inventory tracking (Bodega & Tindahan)
- [ ] **Phase 3:** Sales logging & pricing
- [ ] **Phase 4:** Daily auditing & discrepancy detection
- [ ] **Phase 5:** Alerts & Admin dashboard
- [ ] **Phase 6:** PWA offline support
- [ ] **Phase 7:** Polish & deploy

## 🛠 Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Firestore + Auth)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Hosting:** Vercel (planned)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Auth (Email/Password) and Firestore enabled

### Installation
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/sunshines-fresh-eggs.git
cd sunshines-fresh-eggs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase config

# Start development server
npm run dev