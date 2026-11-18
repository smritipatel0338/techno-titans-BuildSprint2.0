# 🌱 Future You: Living Tree Twin

An AI-powered Digital Twin platform that visualizes how daily habits shape your future across health, academics, and finances.

Future You transforms everyday decisions into interactive simulations, helping users compare their current lifestyle with improved routines through engaging visualizations, predictive analytics, gamification, and personalized future-self insights.

---

## 🚀 Overview

Future You: Living Tree Twin creates a virtual representation of a user’s behavioral patterns and projects their impact over time.

Through AI-driven simulations, habit tracking, and immersive visual storytelling, users can explore multiple future outcomes and make better day-to-day decisions.

---

## ✨ Key Features

### 📊 Habit Tracking Dashboard

Track core behavioral pillars:

- 😴 Sleep Duration
- 📚 Study Hours
- 📱 Screen Time
- 🏃 Physical Activity
- 🪙 Spending Patterns

---

### ⚖️ Two Future Simulations

#### Plan A: Current Routine
Projects outcomes if current habits continue unchanged.

#### Plan B: Improved Routine
Shows potential outcomes when healthier and more productive habits are adopted.

---

### 🌳 Living Tree Twin Visualization

Dynamic tree-based digital twins that evolve according to user habits.

Available growth archetypes:

- 🌲 Redwood
- 🌳 Banyan
- 🌿 Bonsai

Trees flourish or decay based on user consistency and progress.

---

### ⏳ Time Travel Timeline

Interactive timeline scrubbing for:

- 6-Month Projections
- 1-Year Milestones
- 5-Year Future Scenarios

---

### 📈 Predictive Analytics

- Habit trend analysis
- Growth projections
- Consistency scoring
- Lowest-performing pillar identification
- Future trajectory comparison

---

### ✉️ Future Self Letters

Generate personalized letters from your future self using:

- AI-powered LLM generation
- Deterministic local fallback mode

Letters explain progress, setbacks, milestones, and recommendations.

---

### 🎮 Gamification

- Daily Quests
- XP & Levels
- Streak Tracking
- Achievement System
- Streak Protection Shields
- Tulsi Mascot Interactions

---

### 🎨 User Experience

- Mobile-first design
- Responsive layouts
- Sidebar & bottom navigation
- Dark/Light themes
- Retro newspaper aesthetic
- Nature-inspired visual identity

---

# 🏗️ Tech Stack

## Frontend

- React
- Vite
- CSS
- Recharts

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

## AI Engine

- Python
- FastAPI
- Scikit-learn
- OpenAI Compatible APIs

---

# 🔐 Authentication Features

✅ User Registration

✅ Secure Login

✅ JWT Authorization

✅ Password Hashing (bcrypt)

✅ Protected APIs

---

# 👥 Social Features

- User Search
- Send Friend Requests
- Accept / Reject Requests
- Shared Progress Summaries
- Community Motivation

---

# 📂 Project Structure

```text
future-you/
│
├── frontend/
│   ├── src/
│   └── public/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
│
├── ai-engine/
│   ├── models/
│   ├── services/
│   └── main.py
│
├── docs/
│   └── original-gemini-inspiration.html
│
└── README.md
```

---

# ⚙️ Installation

## Requirements

- Node.js 20+
- Python 3.10+
- MongoDB (Local or Atlas)

---

## Install Dependencies

```bash
npm install
npm run install:all

cd ai-engine

python -m venv .venv

# Windows
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

---

# 🔧 Environment Setup

## Backend

Copy:

```bash
backend/.env.example
```

to

```bash
backend/.env
```

Configure:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_super_secret_key
```

---

## AI Service

Copy:

```bash
ai-engine/.env.example
```

to

```bash
ai-engine/.env
```

Optional:

```env
OPENAI_API_KEY=your_key
LLM_MODEL=gpt-model
```

If omitted, the application automatically uses its local fallback letter generator.

---

# ▶️ Run the Application

Start all services in separate terminals.

### Backend

```bash
cd backend
npm run dev
```

### AI Engine

```bash
cd ai-engine
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 📡 API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Habits

```http
GET  /api/habits
POST /api/habits
GET  /api/habits/summary
```

## Simulations

```http
POST /api/simulations
```

## Friends

```http
GET    /api/friends
GET    /api/friends/search?q=
POST   /api/friends/request/:userId
PATCH  /api/friends/request/:requestId
```

---

# 🤖 AI Methodology

The AI engine:

- Analyzes historical habit data
- Uses Linear Regression trend modeling
- Generates explainable future projections
- Produces future-self reflection letters
- Supports both AI-powered and local-generation modes

> Projections are illustrative estimates and should not be interpreted as medical, academic, or financial guarantees.

---

# 🔒 Production Readiness Checklist

Before deployment:

- HTTPS
- Secure token strategy
- Rate limiting
- Email verification
- Password reset flows
- Abuse reporting
- Monitoring & logging
- Database indexing
- Backup strategy
- Privacy compliance
- MongoDB Atlas security restrictions

⚠️ Never commit `.env` files.

---

# 🏆 Buildathon Project

Developed for **Techno Titans Buildathon 2026**.

**Future You: Living Tree Twin** helps users visualize, understand, and improve the long-term impact of their daily habits through AI-powered simulations and engaging gamified experiences.

