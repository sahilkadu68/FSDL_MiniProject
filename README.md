# 🌱 CarbonLens — Carbon Footprint Tracker

A full-stack web application where users log daily activities (transport, food, energy), visualize their CO₂e emissions on a dashboard, and use an AI-powered What-If Simulator to explore how lifestyle changes could reduce their carbon footprint.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Dark Glassmorphism) |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB (In-memory for dev / Atlas for production) |
| Auth | JWT (email/password) |
| AI | Google Gemini API (What-If Simulator only) |

## ✨ Features

- **User Authentication** — Register/Login with JWT
- **Activity Logging** — Log transport, food & energy activities with auto CO₂e calculation
- **Live CO₂e Preview** — See emissions calculated in real-time as you type
- **Dashboard** — Stat cards (today/week/month), donut chart by category, 7-day bar chart
- **Rule-Based Eco Tips** — Personalized tips based on your highest emission category
- **What-If Simulator** — Adjust lifestyle sliders and see AI-projected impact (Gemini API)
- **My Logs** — View, edit, and delete past activity entries
- **Responsive Design** — Works on mobile and desktop

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sahilkadu68/FSDL_MiniProject.git
cd FSDL_MiniProject

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Configuration

Create a `server/.env` file:
```env
PORT=5000
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
MONGODB_URI=mongodb+srv://...  # Optional: leave placeholder for in-memory DB
```

> **Note:** If no valid `MONGODB_URI` is provided, the app automatically uses an in-memory MongoDB — no database setup needed!

### Running

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

## 📁 Project Structure

```
├── client/                  React + Vite Frontend
│   └── src/
│       ├── pages/           Login, Register, Dashboard, LogActivity, MyLogs, Simulator
│       ├── components/      Navbar, ProtectedRoute
│       ├── context/         AuthContext (JWT state management)
│       ├── utils/           Axios API wrapper
│       └── index.css        Complete design system
│
├── server/                  Express.js Backend
│   ├── routes/              auth, logs, ai
│   ├── models/              User, ActivityLog (Mongoose)
│   ├── middleware/           JWT authentication
│   └── utils/               Emission factors, rule-based tips
│
└── Carbon_Footprint_Tracker_SRS_Simplified.docx
```

## 📊 Emission Factors

| Activity | Factor | Unit |
|---|---|---|
| Car (Petrol) | 0.21 kg | per km |
| Bus | 0.089 kg | per km |
| Train | 0.041 kg | per km |
| Beef Meal | 3.0 kg | per meal |
| Chicken Meal | 0.7 kg | per meal |
| Vegetarian Meal | 0.2 kg | per meal |
| Electricity | 0.82 kg | per kWh |
| Natural Gas | 2.0 kg | per m³ |

## 🤖 AI Usage (Minimal)

- Gemini API is called **only** on the What-If Simulator page
- Tips are 100% rule-based (zero API calls)
- CO₂e calculations are local math
- Automatic fallback to rule-based simulation if API fails
