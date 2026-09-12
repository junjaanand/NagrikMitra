# NagrikMitra (नागरिक मित्र) 🇮🇳

### *A Hybrid Rule-Engine and LLM-Based Intelligent System for Personalized Government Scheme Discovery, Authentication, and Document Assistance*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=Tailwind-CSS&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-3.45-003B57.svg?style=flat&logo=SQLite&logoColor=white)](https://sqlite.org)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-orange.svg?style=flat)](https://trychroma.com)
[![Tesseract OCR](https://img.shields.io/badge/Tesseract-5.0_Neural_OCR-blue.svg?style=flat)](https://github.com/tesseract-ocr/tesseract)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Executive Summary

India administers over **4,600+ central and state welfare initiatives**, yet an estimated **65% of entitled citizens**—predominantly rural smallholder farmers, women self-help groups, daily-wage laborers, and marginalized youth—remain excluded due to:
1. **Information Asymmetry:** Complex bureaucratic jargon spread across hundreds of disparate departmental portals.
2. **Language & Literacy Barriers:** Most portals mandate written English navigation.
3. **AI Hallucination Risk:** Generic chatbots frequently invent non-existent welfare schemes or misstate statutory eligibility rules.
4. **Paperwork Rejection:** Over 40% of physical applications at Common Service Centers (CSCs) fail due to missing or unverified certificates.

**NagrikMitra (नागरिक मित्र)** solves this challenge by pairing a **pure deterministic boolean rule-engine** (guaranteeing zero hallucinations in <60ms) with a **bilingual multi-tier conversational AI** (Groq Llama 3.3 70B + Gemini 1.5 Flash + ChromaDB RAG), **optical character recognition** (Tesseract 5.0 OCR for Aadhaar/PAN), and an **interactive document readiness toolkit with offline QR handoff**.

---

## 🚀 Key Architectural Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                   NAGRIKMITRA CIVIC TECH WEB APPLICATION               │
├────────────────────────────────────────────────────────────────────────┤
│ 1. DETERMINISTIC ELIGIBILITY MATCHER                                   │
│    • Evaluates 9 statutory constraints in <60ms with 0% AI hallucination│
│    • B-Tree indexed SQLite database across 4,693 schemes               │
│                                                                        │
│ 2. MULTILINGUAL VOICE ASSISTANT                                        │
│    • Web Speech API speech-to-text in Hindi & English                  │
│    • Multi-tier fallback LLM: Groq Llama 3.3 70B → Gemini → Local      │
│    • ChromaDB dense vector knowledge retrieval                         │
│                                                                        │
│ 3. LIVE CAMERA IDENTITY SCANNER                                        │
│    • WebRTC live camera capture & OpenCV image binarization            │
│    • Tesseract 5.0 neural OCR for Aadhaar & PAN card parsing           │
│    • Automatic UID masking (XXXX-XXXX-1234) for privacy compliance     │
│                                                                        │
│ 4. VISUAL ANALYTICS DASHBOARD                                          │
│    • Interactive Recharts SVG graphics (Sector donut, State bar charts)│
│    • Central vs State allocation metrics across 37 States & UTs        │
│                                                                        │
│ 5. SIDE-BY-SIDE SCHEME COMPARISON                                      │
│    • Multi-column decision support matrix comparing benefits, age,    │
│      income caps, paperwork count, and application routes              │
│                                                                        │
│ 6. DOCUMENT READINESS & OFFLINE QR HANDOFF                             │
│    • Interactive certificate checklist with dynamic % readiness score  │
│    • Missing document warning engine                                   │
│    • Offline scannable QR tokens for Village CSC kiosk handoff         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend Architecture
- **Framework:** FastAPI 0.110.0 (Python 3.12, Uvicorn asynchronous ASGI server)
- **Database:** SQLite 3.45 with multi-column B-Tree indexes on `state`, `category`, `eligibility_gender`, `eligibility_bpl`, `eligibility_disability`
- **Vector Retrieval:** ChromaDB persistent collection with semantic cosine similarity retrieval
- **Multi-Tier Fallback LLM:**
  - **Tier 1 (Primary):** Groq Cloud (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`, 300+ tok/s)
  - **Tier 2 (Secondary):** Google Gemini 1.5 Flash (`gemini-1.5-flash`)
  - **Tier 3 (Local Offline):** Deterministic grounded template synthesizer
- **Computer Vision & OCR:** Tesseract 5.0 Neural LSTM OCR Engine + OpenCV adaptive thresholding & PIL image enhancement

### Frontend Architecture
- **Framework:** React 18.x with Vite 8.3 build toolchain
- **Styling:** Tailwind CSS 3.4 with Civic Modern palette (`civic-green`, `civic-saffron`, `civic-navy`, `civic-slate`)
- **Animation:** Framer Motion 13.x
- **Data Visualization:** Recharts 3.10 SVG charting library
- **Icons & QR:** Lucide React icons & `qrcode.react` SVG generator
- **Auth & Session:** Supabase JavaScript client with Google OAuth, Email login, and 1-Click Instant Demo Citizen profiles

---

## 📂 Repository Structure

```
d:/2hrs/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── db.py               # SQLite connection pool & table definitions
│   │   │   ├── seed_data.py        # 4,693-scheme CSV ingestion pipeline
│   │   │   └── vector_store.py     # ChromaDB vector collection manager
│   │   ├── models/
│   │   │   ├── scheme.py           # Pydantic schemas for schemes
│   │   │   └── user.py             # Demographic profile input & output schemas
│   │   ├── routes/
│   │   │   ├── schemes.py          # Scheme browsing, search, and metadata APIs
│   │   │   ├── eligibility.py      # Deterministic rule matching endpoints
│   │   │   ├── chat.py             # Bilingual voice & chat RAG endpoints
│   │   │   └── ocr.py              # Camera & file OCR extraction endpoints
│   │   ├── services/
│   │   │   ├── rule_engine.py      # Pure boolean conjunctive matching engine
│   │   │   ├── rag_pipeline.py     # ChromaDB vector retrieval pipeline
│   │   │   ├── llm_client.py       # Multi-tier fallback LLM client (Groq/Gemini)
│   │   │   └── ocr_service.py      # Tesseract OCR & OpenCV binarization
│   │   ├── config.py               # Environment configuration loader
│   │   └── main.py                 # FastAPI application entry point
│   ├── data/
│   │   ├── nagrikmitra.db          # Pre-seeded SQLite database (4,693 schemes)
│   │   └── chroma_db/              # Persistent ChromaDB vector embeddings
│   ├── tests/                      # Automated test suites for Days 1-4
│   ├── requirements.txt            # Python backend dependencies
│   └── .env.example                # Example environment variables template
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js           # Axios REST client configured for FastAPI
│   │   │   └── supabase.js         # Supabase client initialization
│   │   ├── components/
│   │   │   ├── auth/               # AuthModal with Google OAuth & 1-Click Demos
│   │   │   ├── common/             # Navbar, Footer
│   │   │   ├── dashboard/          # EligibilityWizard, SchemeCard, SchemeDetailModal, EditProfileModal
│   │   │   ├── features/           # 6 Interactive sandbox simulators
│   │   │   └── landing/            # HeroSection, HowItWorks, KeyFeatures, LiveStats, AboutMission, TechStackGrid, TeamProfiles, Modals
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User authentication state
│   │   │   └── ProfileContext.jsx  # Demographic profile & OCR sync store
│   │   ├── data/
│   │   │   └── featuresData.js     # Comprehensive technical & civic data
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Public civic tech landing page
│   │   │   ├── CitizenDashboard.jsx# Authenticated citizen command dashboard
│   │   │   └── FeatureDetailPage.jsx# In-depth views for all 6 capabilities
│   │   ├── App.jsx                 # View state routing & modal container
│   │   └── main.jsx                # React root entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── Schemes.csv                     # Raw dataset containing 4,693 verified schemes
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18.x or higher
- **Tesseract OCR:** Installed locally (`C:\Program Files\Tesseract-OCR\tesseract.exe` on Windows, or `brew install tesseract` on macOS / `sudo apt install tesseract-ocr` on Linux)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed the database if not using pre-built data
python -c "import sys; sys.path.insert(0, '.'); from app.database.seed_data import main; main()"

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The interactive Swagger API documentation will be accessible at: **`http://127.0.0.1:8000/docs`**

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 📡 Core API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Application health and database connection status |
| `GET` | `/api/schemes` | Paginated scheme catalog with multi-facet query filters |
| `GET` | `/api/schemes/{slug}` | Comprehensive scheme dossier, benefits, and guidelines |
| `GET` | `/api/schemes/meta/stats` | Real-time statistics across 4,693 schemes & 37 jurisdictions |
| `POST` | `/api/eligibility/match` | Deterministic rule matching engine across 9 constraints |
| `POST` | `/api/chat/message` | Bilingual RAG conversational AI endpoint |
| `POST` | `/api/ocr/scan-file` | Optical character recognition on uploaded document |
| `POST` | `/api/ocr/scan-frame` | Real-time WebRTC camera frame OCR parsing |

---

## 👥 Project Attribution & Mentor Attribution

- **Developed as a Final-Year Engineering Capstone Project**
- **Project Title:** NagrikMitra (नागरिक मित्र) — Intelligent Civic Welfare Discovery & Authentication
- **Faculty Guide & Mentorship:** Department of Computer Science & Engineering
- **Open-Source Civic Initiative:** Grounded in Digital India and MyScheme public datasets.

---

## 📄 License
This project is open-source and distributed under the **MIT License**.