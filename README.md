# 🌲 AI Village: A Real-Time Autonomous Simulation

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

**AI Village** is a top-tier, production-grade 3D simulation of a living, breathing ecosystem. Inhabited by autonomous AI agents, this village is a moody, cinematic, and introspective world where every character has a soul, a memory, and a daily routine.

---

## ✨ Features

### 🏘️ Immersive 3D Environment
*   **Procedural Village:** A beautiful landscape featuring rolling green hills, a winding 3D river, and stylized architecture.
*   **Dynamic Atmosphere:** A vast, starry night sky with soft ambient lighting and procedural forests.
*   **High-Fidelity Interaction:** Right-click to rotate, scroll to zoom, and click characters to engage in deep conversation.

### 🧠 Autonomous AI Agents
*   **Real-Time Brains:** Powered by **WebSockets**, agents perform a continuous server-side loop: *Planning → Walking → Interacting*.
*   **Deep Memory (RAG):** Every interaction is stored in a **ChromaDB** vector database. NPCs remember past "gossip" and your previous whispers.
*   **Unique Personalities:** 6 distinct villagers including **Elias the Clockmaker**, **Sera the Poet**, **Thistle the Herbalist**, and **Silas the Traveler**.
*   **Meet & Greet Logic:** Agents automatically stop, face each other, and exchange secrets when their paths cross.

### 🛡️ Resilient Architecture
*   **Hybrid AI Engine:** Seamlessly switches between **OpenAI (GPT-3.5)** for real-time complex reasoning and a **Local Personality Engine** for zero-latency fallbacks when API quotas are hit.
*   **Smooth Interpolation:** Mathematical `lerp` logic ensures characters walk gracefully across the 3D terrain without "teleporting."
*   **Full Persistence:** Village state and character locations are synchronized with a local SQLite database.

---

## 🚀 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Three.js, React Three Fiber (R3F), Tailwind CSS v4, Framer Motion |
| **Backend** | FastAPI, WebSockets, Python 3.12 |
| **AI/LLM** | OpenAI API, Custom Local Personality Engine |
| **Memory/DB** | ChromaDB (Vector Search), SQLite (State), SQLAlchemy |

---

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API Key (Optional, but recommended for full AI features)

### 1. Backend Setup
```powershell
cd backend
pip install -r requirements.txt
# Create a .env file with: OPENAI_API_KEY=your_key_here
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

Visit **[http://localhost:5173/](http://localhost:5173/)** to explore the village.

---

## 🗺️ Character Cast

| Character | Personality | Activity |
| :--- | :--- | :--- |
| **Elias** | Reclusive & Metaphorical | Tends to the village clocks and decay. |
| **Sera** | Quiet & Intense | Communicates through presence and unwritten poetry. |
| **Thistle** | Energetic & Curious | Searches for rare silver moss along the riverbanks. |
| **Bramble** | Grumpy & Observant | Keeps a watchful eye on the trout in the river. |
| **Clara** | Warm & Optimistic | Spreads warmth with her freshly baked village bread. |
| **Silas** | Mysterious & Wise | Watches the constellation of the Loom from the hills. |

---

## 📜 Development Notes
*   **Black Screen Fix:** The village uses procedural 3D geometries to ensure it loads instantly and works offline, bypassing network blocks on external asset CDNs.
*   **Real-Time Sync:** Uses a persistent WebSocket heartbeat (`ws://localhost:8000/ws`) to maintain the "Live" status of the simulation.

---

*Designed with ❤️ for a fully autonomous future.*

