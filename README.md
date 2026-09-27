# 🎬 Vibescape AI Cinema And Music 🎵

[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Render](https://img.shields.io/badge/Deploy-Render_Ready-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

> **Vibescape AI Cinema And Music** is an intelligent, emotion-driven discovery platform that connects films and songs directly to your exact mood, emotional states, and cultural tastes. Featuring legal external streaming redirects (Netflix, Prime Video, Disney+ Hotstar, Spotify, YouTube), 30-second audio previews, and instant personalized watchlists.

---

## ✨ Features

- 🎭 **Emotional Mood & Theme Intelligence:**  
  Explore 10 foundational emotional states (Feel-Good, Romantic, Late-Night, Tearjerkers, High Adrenaline, Spooky Thrillers, Mind-Bending Sci-Fi, Cozy, Nostalgic Retro, and Epic Adventure) with dynamic sub-theme pills.
- 🎬 **Multi-Industry Global Catalog:**  
  Curated and live search filters across **Hollywood**, **Bollywood**, **South Indian Cinema** (Tamil, Telugu, Malayalam, Kannada), and **World Cinema** (Korean, Japanese, Latin).
- 🎵 **Integrated Music Experience:**  
  Instant 30-second high-definition audio previews, direct Genius lyrics lookups, and one-click Spotify streaming links.
- 🍿 **Smart OTT Streaming Badges:**  
  Real-time legal streaming availability indicators for Netflix, Prime Video, Disney+ Hotstar, Apple TV, Sony LIV, and JioCinema with direct playback redirects.
- 🔒 **Personal Vault & Watchlist:**  
  Save favorites and watchlists with instant, persistent local database sync powered by SQLite.
- 🤖 **Hybrid AI & Live Search Architecture:**  
  Combines Google Gemini Generative AI, rich offline curated media catalogs, live IMDb/OMDb data, and iTunes API music feeds.
- 💎 **Modern Cyber-Neon UI:**  
  Built with high-end glassmorphism, responsive grid layouts, custom audio visualizer waves, and smooth micro-animations.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 6, Lucide Icons, Pure Modern Vanilla CSS
- **Backend API:** Node.js, Express 5, Better-SQLite3, Google Generative AI SDK (`@google/generative-ai`)
- **Deployment Compatibility:** Production-ready for **Render**, **Vercel**, and **Railway** (supports both native Node.js and Python/Gunicorn hosting modes).

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js** v18+ installed on your system.
- Git installed.

### 2. Clone the Repository
```bash
git clone https://github.com/alby9999/AI-Movies-and-Songs-Recommendations.git
cd AI-Movies-and-Songs-Recommendations/ai-agent-1.0-69f761fecbb863689f6a433fb075fc31f838d71b
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) to enable custom generative mood queries).*

### 5. Run the Application
You can run both the frontend and backend concurrently:
```bash
npm run dev:full
```
Or run them separately:
```bash
# Terminal 1: Backend Server (Port 5001)
npm run server

# Terminal 2: Frontend Dev Server (Port 5173)
npm run dev
```

Open your browser at **`http://localhost:5173`** to start discovering!

---

## ☁️ Deploying to Render

This repository is pre-configured to deploy seamlessly on [Render](https://render.com/).

### Option 1: Native Node.js Web Service (Recommended)
1. Go to your **Render Dashboard** and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `alby9999/AI-Movies-and-Songs-Recommendations`.
3. Configure the settings:
   - **Environment:** `Node`
   - **Root Directory:** `ai-agent-1.0-69f761fecbb863689f6a433fb075fc31f838d71b`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`
4. Click **Deploy Web Service**.

### Option 2: Python Web Service (Gunicorn)
If your Render service is set to **Python**:
- **Environment:** `Python`
- **Root Directory:** `.` *(leave blank or use root)*
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`

---

## 📁 Repository Structure

```
├── README.md                                          # Project documentation
├── package.json                                       # Root build delegator
├── requirements.txt                                   # Python dependencies for Render
├── app.py                                             # Flask + Gunicorn entrypoint
├── .env.example                                       # Safe environment templates
├── .gitignore                                         # Git ignore rules
└── ai-agent-1.0-69f761fecbb863689f6a433fb075fc31f838d71b/
    ├── server.js                                      # Express API & Production Static Server
    ├── curatedMedia.js                                # Handcrafted high-definition catalog
    ├── curatedSongs.js                                # Curated songs and lyrics references
    ├── db.js                                          # SQLite database configuration
    ├── index.html                                     # Single Page Application HTML entry
    ├── vite.config.js                                 # Vite bundler configuration
    ├── src/
    │   ├── App.jsx                                    # Main application & routing logic
    │   ├── MusicPlayerApp.jsx                         # Dedicated music player & audio controls
    │   ├── ProfileDashboard.jsx                       # User library, watchlist & stats
    │   └── audioSynthesizer.js                        # Procedural audio generator
    └── dist/                                          # Compiled production assets
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
