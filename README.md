# NagrikMitra (नागरिक मित्र) 🇮🇳

### *A Hybrid Rule-Engine and Multi-Tier LLM Intelligent Platform for Civic Welfare Discovery, Document Verification, and Automated Delivery*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=Tailwind-CSS&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-3.45-003B57.svg?style=flat&logo=SQLite&logoColor=white)](https://sqlite.org)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-orange.svg?style=flat)](https://trychroma.com)
[![Tesseract OCR](https://img.shields.io/badge/Tesseract-5.5_Neural_OCR-blue.svg?style=flat)](https://github.com/tesseract-ocr/tesseract)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Executive Summary

India administers over **4,700+ central and state welfare initiatives**, yet an estimated **65% of entitled citizens**—predominantly rural smallholder farmers, women self-help groups, daily-wage laborers, and marginalized youth—remain excluded due to:
1. **Information Asymmetry & Dead Portals:** Complex bureaucratic jargon, broken or outdated application URLs, and sudden scheme mergers/discontinuations without public notice.
2. **Channel Confusion:** Lack of clarity on whether a scheme is **100% Online**, requires in-person submission at a **Gram Panchayat / Tehsildar**, or requires **CSC Kendra** biometric e-KYC.
3. **Unstructured Guidelines:** Long, messy blocks of unformatted text that obscure step-by-step application instructions and mandatory paperwork.
4. **AI Hallucination & Paperwork Rejection:** Generic chatbots invent non-existent benefits, while over 40% of physical applications are rejected due to missing certificates.

**NagrikMitra (नागरिक मित्र)** solves these systemic challenges by uniting:
* **Deterministic Rule Matching:** 9 statutory eligibility rules evaluated in `<60ms` with 0% AI hallucination.
* **Intelligent Scheme Delivery Engine:** Solves inactive/seasonal scheme tracking, broken links via **SerpAPI / Google Search grounding & auto-healing**, and classifies schemes into Online, In-Person Offline, and CSC Hybrid modes across all **4,728 initiatives**.
* **Structured Guidelines Dossier:** Converts unstructured scheme text into clean step-by-step visual timelines, demographic scorecards, benefit breakdowns, and interactive document readiness checklists.
* **Neural Multi-Pass OCR Scanner:** Real-time camera & file scanner using **Tesseract 5.5 + LAB-CLAHE shadow removal + deskewing** for Aadhaar (masked UID) and PAN cards.
* **Conversational Bilingual AI & Analytics:** Groq Llama 3.3 70B / Gemini RAG assistant with speech-to-text, plus interactive Recharts visual analytics.

---

## 🚀 Key Architectural Capabilities

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NAGRIKMITRA CIVIC TECH ARCHITECTURE                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. DETERMINISTIC ELIGIBILITY ENGINE                                                    │
│    • Evaluates 9 statutory constraints in <60ms with zero hallucination               │
│    • B-Tree indexed SQLite database across 4,728 government schemes                    │
│                                                                                        │
│ 2. APPLICATION MODE CLASSIFICATION (4,728 SCHEMES)                                     │
│    • 🌐 100% Online Direct Portals: 1,596 schemes (33.8%)                             │
│    • 🏢 In-Person Physical Office (Panchayat/Tehsildar): 1,271 schemes (26.9%)         │
│    • 🔄 CSC Hybrid / Assisted Mode: 1,861 schemes (39.4%)                             │
│    • Native SQLite custom function `classify_mode()` with exact mathematical parity    │
│                                                                                        │
│ 3. SELF-HEALING LINK RESOLVER & SEARCH GROUNDING                                       │
│    • Live asynchronous HTTP health probes (detects 404s, timeouts, dead links)         │
│    • Search auto-healing via SerpAPI / DuckDuckGo government portal search (`site:gov.in`)│
│    • Canonical National myScheme mirror fallback ensuring 0% dead ends                 │
│    • Crowd-sourced "Report Broken Link" with cache invalidation & auto-recrawl         │
│                                                                                        │
│ 4. STRUCTURED SCHEME GUIDELINES DOSSIER                                                │
│    • Step-by-Step Procedure Timeline with numbered badges & external portal links      │
│    • 6-Box Demographic Matrix (Age, Gender, Income Cap, BPL, Disability, Domicile)     │
│    • Categorized Document Checklist (Identity, Financial, Category, Academic)          │
│    • Live Document Readiness Index (% Ready) & missing certificate alerts              │
│    • Offline CSC Kiosk QR Code token generator & A4 print formatting                   │
│                                                                                        │
│ 5. NEURAL MULTI-PASS COMPUTER VISION & OCR SCANNER                                     │
│    • LAB-CLAHE shadow/glare equalization + automated Hough line deskewing              │
│    • Dual-pass recognition (Pass 1: Grayscale PSM 3 + Pass 2: Adaptive Gaussian PSM 11)│
│    • Resilient DOB/Age parser (handles delimiters, colons, dots, YOB)                  │
│    • Character confusion recovery for 12-digit Aadhaar UID and 10-char PAN numbers     │
│    • Postal PIN code (6-digit) to State intelligence mapping                           │
│    • Camera viewfinder auto-cropping for 2x text resolution                            │
│                                                                                        │
│ 6. BILINGUAL CONVERSATIONAL RAG & VOICE ASSISTANT                                      │
│    • Hindi & English voice recognition via Web Speech API                              │
│    • Multi-tier fallback LLM: Groq Llama 3.3 70B → Google Gemini 1.5 → Local RAG       │
│    • ChromaDB dense vector knowledge retrieval for accurate citations                  │
│                                                                                        │
│ 7. VISUAL ANALYTICS, COMPARISON MATRIX & OGD SYNC                                      │
│    • Interactive Recharts SVG graphics (Sector allocation donut, State bar charts)     │
│    • Side-by-side scheme comparison matrix with highlighted differences                │
│    • Dynamic scheme ingestion & Open Government Data (data.gov.in) synchronization    │
│    • Role-Based Access Control (RBAC) & CERT-In compute rate limiting                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Welfare Scheme Delivery Analytics (4,728 Schemes)

NagrikMitra indexes and algorithmically classifies the entire national welfare landscape:

| Application Channel | Total Initiatives | Percentage | Guidance Provided to Citizen |
| :--- | :---: | :---: | :--- |
| **🌐 Online Direct** | **1,596** | **33.8%** | Direct link to official state/central digital portal with form guidelines. |
| **🔄 CSC Hybrid Assisted** | **1,861** | **39.4%** | Online registration followed by biometric e-KYC at nearest Village CSC Kendra. |
| **🏢 In-Person Physical Office** | **1,271** | **26.9%** | Physical office advisory: Gram Panchayat, Tehsildar, BDO, or District Welfare. |
| **Total Catalog** | **4,728** | **100.0%** | **Sub-millisecond filtering across 37 States & Central Ministries.** |

---

## 🛠️ Technology Stack

### Backend
- **Framework:** FastAPI 0.110.0 (Python 3.11+, asynchronous Uvicorn ASGI server)
- **Database:** SQLite 3.45 with custom Python user functions (`classify_mode`, `classify_status`) and B-Tree indexes
- **Vector Store:** ChromaDB with semantic cosine similarity retrieval
- **Multi-Tier LLM Architecture:**
  - **Primary:** Groq Cloud (`llama-3.3-70b-versatile`, 300+ tokens/sec)
  - **Secondary:** Google Gemini 1.5 Flash (`gemini-1.5-flash`)
  - **Fallback:** Deterministic grounded template synthesizer
- **Computer Vision & OCR:**
  - Tesseract 5.5 LSTM Neural OCR Engine
  - OpenCV (LAB-CLAHE, Hough line deskewing, Adaptive Gaussian binarization)
  - PIL (Pillow) & NumPy
- **Search & Auto-Healing:** SerpAPI + DuckDuckGo Government Search (`site:gov.in`) + HTTPX asynchronous client
- **Security:** JWT authentication, RBAC authorization, and sliding-window compute rate limiting

### Frontend
- **Framework:** React 18.x with Vite 8.3 build toolchain
- **Styling:** Tailwind CSS 3.4 with Civic Modern palette
- **Animations:** Framer Motion 13.x
- **Data Visualization:** Recharts 3.10 SVG charting suite
- **Icons & QR:** Lucide React & `qrcode.react` SVG generator
- **Authentication:** Supabase client with Google OAuth, email authentication, and 1-Click Instant Demo Citizen sessions

---

## 📂 Repository Structure

```
d:/2hrs/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── db.py               # SQLite connection pool & custom C-functions
│   │   │   ├── seed_data.py        # 4,728-scheme CSV ingestion pipeline
│   │   │   └── vector_store.py     # ChromaDB vector collection manager
│   │   ├── dependencies/
│   │   │   └── auth.py             # RBAC role gating, CERT-In rate limiting, guest sessions
│   │   ├── models/
│   │   │   ├── ocr.py              # ExtractedDocumentData & OCRScanResponse schemas
│   │   │   ├── scheme.py           # SchemeBase, Detail, Mode breakdown, Link resolver models
│   │   │   └── user.py             # Demographic profile input & matching result schemas
│   │   ├── routes/
│   │   │   ├── chat.py             # Bilingual voice & chat RAG endpoints
│   │   │   ├── eligibility.py      # Deterministic rule matching endpoints
│   │   │   ├── ocr.py              # Camera & multipart file OCR extraction endpoints
│   │   │   └── schemes.py          # Catalog, mode filter, analytics, resolver, and ingestion APIs
│   │   ├── services/
│   │   │   ├── data_gov_sync.py    # Open Government Data (data.gov.in) synchronizer
│   │   │   ├── gemini_client.py    # Fallback LLM client
│   │   │   ├── link_resolver.py    # Health probes, SerpAPI search auto-healing, and mode classification
│   │   │   ├── ocr_service.py      # Multi-pass LAB-CLAHE & Tesseract OCR pipeline
│   │   │   ├── rag_pipeline.py     # ChromaDB vector retrieval pipeline
│   │   │   └── rule_engine.py      # Boolean conjunctive matching engine
│   │   ├── config.py               # Settings loader via pydantic-settings
│   │   └── main.py                 # FastAPI application entry point
│   ├── data/
│   │   ├── nagrikmitra.db          # Pre-seeded SQLite database (4,728 schemes)
│   │   └── chroma_db/              # Persistent ChromaDB vector embeddings
│   ├── tests/                      # Comprehensive test suites (Days 1–13)
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js           # Axios client with token interceptors and error handling
│   │   │   └── supabase.js         # Supabase client configuration
│   │   ├── components/
│   │   │   ├── analytics/          # AnalyticsDashboard with Recharts charts
│   │   │   ├── auth/               # AuthModal with Google OAuth & 1-Click Demos
│   │   │   ├── common/             # Navbar, Footer, ErrorBoundary, AccessibilityBar
│   │   │   ├── dashboard/          # SchemeCard, SchemeDetailModal, SchemeGuidelinesView, ComparisonDock
│   │   │   ├── features/           # Interactive feature sandbox simulators
│   │   │   └── landing/            # HeroSection, KeyFeatures, LiveStats, QuickScanModal, QuickChatModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User authentication state
│   │   │   └── ProfileContext.jsx  # Demographic profile & OCR sync store
│   │   ├── hooks/
│   │   │   └── useRequireAuth.js   # Route protection hook
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx  # Ingestion & analytics management portal
│   │   │   ├── CitizenDashboard.jsx# Main citizen dashboard with Explorer & Wizard
│   │   │   ├── FeatureDetailPage.jsx# Detailed deep-dive pages
│   │   │   └── LandingPage.jsx     # Public civic tech landing page
│   │   ├── App.jsx                 # View routing & modal container
│   │   └── main.jsx                # React root entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── Schemes.csv                     # Raw dataset containing 4,728 verified schemes
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python:** 3.10, 3.11, or 3.12
- **Node.js:** 18.x or higher
- **Tesseract OCR:** Installed locally:
  - **Windows:** Default installer installs to `C:\Program Files\Tesseract-OCR\tesseract.exe`
  - **macOS:** `brew install tesseract`
  - **Linux:** `sudo apt install tesseract-ocr`

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive Swagger API documentation: **`http://127.0.0.1:8000/docs`**
* Alternative ReDoc documentation: **`http://127.0.0.1:8000/redoc`**

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
* Open **`http://127.0.0.1:5173/`** in your browser.

---

## 📡 Core API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health and SQLite database connectivity status |
| `GET` | `/api/schemes` | Paginated scheme catalog with `mode`, `state`, `category`, and full-text search |
| `GET` | `/api/schemes/{slug}` | Full scheme details, statutory eligibility, and application guidelines |
| `GET` | `/api/schemes/meta/stats` | Global scheme counts across central and state jurisdictions |
| `GET` | `/api/schemes/meta/modes` | Scheme breakdown across Online, Offline, and CSC Hybrid modes |
| `GET` | `/api/schemes/meta/analytics` | High-performance aggregated analytics for Recharts visual charts |
| `POST` | `/api/schemes/{slug}/resolve-link` | Live HTTP probe & SerpAPI search grounding for active application URLs |
| `POST` | `/api/schemes/{slug}/report-link` | Citizen crowd-sourced broken link reporter with cache invalidation |
| `POST` | `/api/schemes/create` | Dynamic scheme ingestion into SQLite and ChromaDB (Admin/CSC VLE gated) |
| `POST` | `/api/schemes/sync-ogd` | Open Government Data (data.gov.in) synchronization endpoint |
| `POST` | `/api/eligibility/match` | 9-rule deterministic eligibility matching engine (`<60ms`) |
| `POST` | `/api/chat/message` | Bilingual conversational AI with voice and ChromaDB citations |
| `POST` | `/api/ocr/scan-file` | Multi-pass Tesseract OCR on uploaded image file (PNG/JPG) |
| `POST` | `/api/ocr/scan-frame` | Real-time WebRTC camera frame OCR parsing with auto-cropping |

---

## 🧪 Automated Testing Suite

To run all automated regression and functional test suites:

```bash
# Run all tests
python backend/tests/run_all_tests.py

# Test Day 9 Voice & Multi-Pass OCR
python -c "import sys; sys.path.insert(0, 'backend'); from tests.test_day9_voice_ocr import test_ocr_camera_frame_endpoint; test_ocr_camera_frame_endpoint()"

# Test Day 10 Comparison Matrix
python -m pytest backend/tests/test_day10_matrix.py -v

# Test Day 11 Dynamic Scheme Ingestion
python -m pytest backend/tests/test_day11_dynamic_ingestion.py -v

# Test Day 12 Role-Based Access Control
python -m pytest backend/tests/test_day12_auth_gating.py -v

# Test Production Hardening
python -m pytest backend/tests/test_production_hardening.py -v
```

---

## 👥 Project Attribution & Mentor Acknowledgment

* **Developed as a Final-Year Engineering Capstone Project**
* **Project Title:** NagrikMitra (नागरिक मित्र) — Intelligent Civic Welfare Discovery & Authentication Platform
* **Faculty Guide & Mentorship:** Department of Computer Science & Engineering
* **Open-Source Civic Initiative:** Grounded in Digital India and MyScheme public datasets.

---

## 📄 License
This project is open-source and distributed under the **MIT License**.