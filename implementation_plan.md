# 10-Day End-to-End Implementation Plan: NagrikMitra (नागरिक मित्र)

This document establishes the production-grade, 10-day roadmap for developing and validating **NagrikMitra (नागरिक मित्र)** from scratch into a fully functional, distinction-caliber final-year project.

---

## What We Are Building (End-to-End System Scope)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   NAGRIKMITRA CIVIC TECH WEB APPLICATION               │
├────────────────────────────────────────────────────────────────────────┤
│ 1. PUBLIC LANDING PAGE (React 18 + Tailwind + Framer Motion)           │
│    • Hero Section: Typewriter heading, 4,693+ animated live counters   │
│    • 3-Step Interactive Process Roadmap                                │
│    • 6 Glassmorphic Feature Cards with hover glow                      │
│    • Real-time Stats: 4,693 Schemes, 37 States, 20 Sectors, 448 Women │
│    • About Project & Digital India Mission narrative                   │
│    • Tech Stack showcase & Team Attribution profiles                   │
│                                                                        │
│ 2. AUTHENTICATION & SESSION STORE (Firebase Auth + FastAPI)            │
│    • Google One-Click OAuth 2.0 Sign-In + Phone OTP Login              │
│    • Persistent demographic profile & bookmarked scheme storage        │
│                                                                        │
│ 3. CITIZEN COMMAND DASHBOARD (Post-Login Protected Hub)                │
│    • Demographic Profile Ribbon with instant edit modal                │
│    • Quick Actions Grid (Eligibility, Chat, Scan, Directory, Compare)  │
│    • Recharts Graphical Analytics (Category bar, State pie, Readiness) │
│                                                                        │
│ 4. DETERMINISTIC ELIGIBILITY ENGINE (Python + SQLite)                  │
│    • Logical evaluation across 9 parameters (Age, Gender, State,       │
│      Caste, Income, Residence, BPL, Disability, Occupation)            │
│    • Zero hallucination, evaluates all 4,693 schemes in <250ms         │
│                                                                        │
│ 5. MULTILINGUAL AI VOICE & CHAT ASSISTANT (Gemini + RAG + Web Speech)  │
│    • Bidirectional voice in Hindi & English (SpeechRecognition API)   │
│    • LangChain + ChromaDB RAG over scheme texts and guidelines         │
│                                                                        │
│ 6. IDENTITY DOCUMENT SCANNER (Tesseract OCR 5.0 + Live Camera)         │
│    • WebRTC live camera stream capture (`getUserMedia`) / file upload  │
│    • Automated extraction of Aadhaar, PAN, and Ration Card details     │
│                                                                        │
│ 7. DECISION SUPPORT & READINESS TOOLKIT                                │
│    • Side-by-side scheme comparison matrix (2 to 4 schemes)           │
│    • Document readiness index (% ready) & missing certificate alerts   │
│    • Offline QR Code generator for mobile hand-off or CSC visits       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## User Review Required

> [!IMPORTANT]
> 1. **Google Gemini API Key:** The AI Chatbot and RAG pipeline require a free Gemini API key from Google AI Studio (`https://aistudio.google.com/`).
> 2. **Firebase Project Setup:** Firebase Authentication (Google Sign-in and Phone Auth) requires a free Firebase project with client credentials placed in `.env`.
> 3. **Tesseract OCR Binary:** Tesseract OCR engine should be installed on the host system (default path: `C:\Program Files\Tesseract-OCR\tesseract.exe`) for local document optical processing.

---

## 10-Day Daily Breakdown

```
┌──────┬─────────────────────────────────────────────────────────────────┐
│ Day  │ Milestone Title                                                 │
├──────┼─────────────────────────────────────────────────────────────────┤
│ D-1  │ Project Setup, Dataset Ingestion & SQLite/ChromaDB Architecture │
│ D-2  │ Deterministic Rule Engine & Fast Scheme Query REST APIs         │
│ D-3  │ Multilingual RAG Knowledge Pipeline & Gemini LLM Integration    │
│ D-4  │ Tesseract OCR & Document Computer Vision Extraction Pipeline   │
│ D-5  │ Modern React 18 Scaffolding, Design System & Public Landing     │
│ D-6  │ Landing Page Completion & Firebase Authentication (Google/Phone)│
│ D-7  │ Protected Citizen Dashboard, User Profile & State Management    │
│ D-8  │ Interactive Eligibility Wizard & Recharts Analytics Dashboard   │
│ D-9  │ AI Chatbot with Web Speech Voice API & Live Camera OCR Scanner  │
│ D-10 │ Scheme Comparison, QR Code Sharing, End-to-End Testing & Polish │
└──────┴─────────────────────────────────────────────────────────────────┘
```

---

### 📅 Day 1: Project Setup, Dataset Ingestion & Database Architecture

#### What We Are Building:
- The foundational monorepo directory layout (`/backend` and `/frontend`).
- The Python virtual environment and dependencies (`fastapi`, `uvicorn`, `langchain`, `chromadb`, `google-genai`, `pytesseract`, `pydantic`).
- An ingestion pipeline that parses `d:\2hrs\Schemes.csv` (16.7 MB, 4,693 rows, 24 columns), normalizes types, creates SQLite indexes, and vectorizes scheme text into ChromaDB.

#### Step-by-Step Technical Tasks:
1. Initialize folder structure:
   ```
   d:/2hrs/
   ├── backend/
   │   ├── app/
   │   │   ├── database/
   │   │   ├── models/
   │   │   ├── routes/
   │   │   └── services/
   │   └── requirements.txt
   └── frontend/
   ```
2. Build `backend/app/database/db.py`: SQLite connection pool, session manager, and table definitions.
3. Build `backend/app/database/seed_data.py`:
   - Load `Schemes.csv`.
   - Parse JSON strings in `eligibility_caste` and `eligibility_state`.
   - Insert 4,693 records into `schemes` table with indexes on `state`, `category`, `eligibility_gender`, and `eligibility_bpl`.
4. Initialize ChromaDB persistent client in `backend/app/database/vector_store.py`:
   - Embed `name`, `category`, `benefits`, `eligibility_text`, and `documents_required` for top high-impact schemes.

#### Verification Criteria:
- SQLite query `SELECT COUNT(*) FROM schemes;` outputs exactly `4693`.
- Retrieval test returns results under 10ms.

---

### 📅 Day 2: Deterministic Rule Engine & Scheme Query REST APIs

#### What We Are Building:
- Pure Python deterministic rule-matching engine that evaluates citizen demographic input against all 4,693 schemes with mathematical rigor.
- Core FastAPI endpoints for filtering, full-text search, category browsing, and individual scheme details.

#### Step-by-Step Technical Tasks:
1. Create `backend/app/models/eligibility.py`: Pydantic schema for `UserProfileInput` (age, gender, state, caste, income, residence, bpl, disability, occupation).
2. Implement `backend/app/services/rule_engine.py`:
   - Conjunctive boolean matching: checks age bounds, gender compatibility, caste inclusion, income ceiling, residence, state/central jurisdiction, and disability/BPL predicates.
   - Computes matching score and sorts results by high-priority central flagship schemes first.
3. Implement `backend/app/routes/schemes.py`:
   - `GET /api/schemes`: Paginated scheme explorer with multi-facet filters.
   - `GET /api/schemes/{slug}`: Comprehensive scheme detail view.
   - `GET /api/schemes/categories`: Unique categories count list.
   - `GET /api/schemes/states`: Unique states count list.
4. Implement `backend/app/routes/eligibility.py`:
   - `POST /api/eligibility/match`: Receives user demographic profile, executes rule engine, and returns matched schemes with matched criteria tags.

#### Verification Criteria:
- Automated `pytest` run tests TC-01 (Farmer, UP) and TC-02 (Student, MH) yielding expected flagship schemes in $< 200\text{ms}$.

---

### 📅 Day 3: Multilingual RAG Knowledge Pipeline & Gemini LLM Integration

#### What We Are Building:
- LangChain RAG pipeline combining ChromaDB vector retrieval with Google Gemini 1.5 Flash.
- Chat service that performs natural language understanding (NLU), bilingual slot extraction (Hindi/English), and conversational response synthesis.

#### Step-by-Step Technical Tasks:
1. Implement `backend/app/services/gemini_client.py`:
   - Initialize Google GenAI SDK with API key from environment variable `GEMINI_API_KEY`.
   - Setup system instructions for "NagrikMitra" (friendly, empathetic, clear civic advisor).
2. Implement `backend/app/services/rag_pipeline.py`:
   - Query ChromaDB collection with user query embeddings.
   - Inject top-3 retrieved scheme context chunks into prompt.
   - Support few-shot bilingual Hindi/English slot extraction prompt: converts "मैं 45 साल का किसान हूँ" $\rightarrow$ `{age: 45, occupation: "farmer"}`.
3. Implement `backend/app/routes/chat.py`:
   - `POST /api/chat/message`: Receives user chat message and conversation history, returns conversational text and structured profile recommendations.

#### Verification Criteria:
- Test query: *"What documents are needed for PM-KISAN?"* returns verified list with source reference.
- Hindi query: *"मुझे छात्रवृत्ति के बारे में बताओ"* returns verified scholarship schemes in Devanagari Hindi.

---

### 📅 Day 4: Tesseract OCR & Document Computer Vision Pipeline

#### What We Are Building:
- Computer vision preprocessing pipeline and OCR extraction service for physical identity cards (Aadhaar, PAN, and Ration Card).
- REST endpoint that accepts image uploads or base64 frames and returns structured demographic attributes.

#### Step-by-Step Technical Tasks:
1. Implement `backend/app/services/ocr_service.py`:
   - Image ingestion using PIL / OpenCV.
   - Preprocessing: Grayscale conversion, Otsu thresholding, noise removal.
   - Tesseract OCR execution with English + Hindi language packs (`eng+hin`).
2. Build pattern extraction regular expressions:
   - Aadhaar number: `\b[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}\b`
   - PAN card number: `\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b`
   - Date of birth: `\b\d{2}[/-]\d{2}[/-]\d{4}\b`
   - Gender identification: `Male`, `Female`, `Transgender`, `पुरुष`, `महिला`.
3. Implement `backend/app/routes/ocr.py`:
   - `POST /api/ocr/scan`: Receives `multipart/form-data` image, runs OCR pipeline, and returns JSON of extracted fields with confidence score.

#### Verification Criteria:
- Uploading sample Aadhaar photo correctly extracts Name, DOB, Gender, and 12-digit UID.

---

### 📅 Day 5: Modern React 18 Scaffolding, Design System & Public Landing Page (Part 1)

#### What We Are Building:
- Frontend initialization using React 18 and Vite.
- Tailwind CSS styling setup with the "Government Modern" civic palette (Emerald Green, Saffron, Navy Blue).
- Shadcn/ui and Radix UI accessible component primitives.
- Public Landing Page: Sections 1–4 (Hero Banner, How it Works, Key Features grid, and Live Stats counter).

#### Step-by-Step Technical Tasks:
1. Scaffold frontend:
   ```bash
   npm create vite@latest frontend -- --template react
   cd frontend && npm install
   npm install tailwindcss postcss autoprefixer lucide-react framer-motion recharts axios
   npx tailwindcss init -p
   ```
2. Configure Tailwind theme in `tailwind.config.js` with civic colors:
   - `civic-green`: `#16a34a`, `civic-saffron`: `#ff9933`, `civic-navy`: `#0f2942`, `civic-slate`: `#f8fafc`.
3. Build `frontend/src/components/layout/Navbar.jsx`:
   - Brand logo with emblem badge, navigation links, Language toggle (EN/HI), Dark mode button, and Login CTA.
4. Build `frontend/src/components/landing/HeroSection.jsx`:
   - Typewriter animation using Framer Motion.
   - Live scheme count badge (`4,693 Schemes Available`).
   - Call-to-action buttons ("Find Schemes Now", "Ask in Hindi 🗣️").
5. Build `frontend/src/components/landing/HowItWorks.jsx`: 3-step interactive roadmap with icons.
6. Build `frontend/src/components/landing/KeyFeatures.jsx`: 6 interactive glassmorphic cards with hover glow.
7. Build `frontend/src/components/landing/LiveStats.jsx`: Scroll-triggered animated number counters.

#### Verification Criteria:
- Frontend compiles cleanly with zero warnings (`npm run dev`).
- Hero section and counters animate smoothly on page scroll.

---

### 📅 Day 6: Public Landing Page Completion & Firebase Authentication

#### What We Are Building:
- Remaining Landing Page sections: About Mission, Tech Stack badges, Team Profiles, and Footer.
- Firebase Authentication integration supporting Google One-Click OAuth 2.0 Sign-In and Phone Number OTP.
- Auth state management context (`AuthContext.jsx`) and Protected Route guards.

#### Step-by-Step Technical Tasks:
1. Build Landing Page Sections 5–8:
   - `AboutMission.jsx`: Explaining problem, social impact, and hybrid AI.
   - `TechStackGrid.jsx`: Logos and roles of React, FastAPI, Gemini, ChromaDB, Firebase, Tesseract.
   - `TeamProfiles.jsx`: Cards with photos, roles, guide details, and GitHub/LinkedIn links.
   - `Footer.jsx`: Institutional accreditation, copyright, contact, and GitHub repository links.
2. Initialize Firebase in `frontend/src/config/firebase.js`:
   - Firebase SDK credentials from `.env`.
   - Setup `GoogleAuthProvider` and `RecaptchaVerifier` for phone login.
3. Build `frontend/src/context/AuthContext.jsx`:
   - Listens to `onAuthStateChanged`.
   - Exposes `currentUser`, `loginWithGoogle`, `sendPhoneOtp`, `verifyPhoneOtp`, and `logout`.
4. Build `frontend/src/components/auth/AuthModal.jsx`:
   - Clean tabbed dialog: Tab 1 (One-Click Google Login), Tab 2 (Phone Number + 6-digit OTP).
5. Build `frontend/src/components/auth/ProtectedRoute.jsx`:
   - Wraps authenticated views and redirects unauthenticated guests to login modal.

#### Verification Criteria:
- Clicking "Sign in with Google" opens Google popup and successfully logs user in.
- Authenticated user name and avatar appear in the Navbar.

---

### 📅 Day 7: Protected Citizen Dashboard, User Profile & State Management

#### What We Are Building:
- Authenticated **Citizen Command Dashboard** (`/dashboard`).
- User profile editing modal with local/remote synchronization.
- Quick Actions grid for seamless access to all sub-tools.
- Saved schemes bookmarking drawer.

#### Step-by-Step Technical Tasks:
1. Build `frontend/src/context/ProfileContext.jsx`:
   - Stores active demographic state (age, gender, state, income, caste, residence, bpl, disability).
   - Persists state in `localStorage` and backend profile endpoint.
2. Build `frontend/src/pages/CitizenDashboard.jsx`:
   - **Demographic Profile Ribbon:** Displays verified citizen attributes with an *"Edit Details"* button.
   - **Quick Actions Grid:** 6 navigation cards with Lucide icons (Eligibility Wizard, AI Chatbot, Document Scanner, Directory, Compare, Saved).
   - **Results Snapshot:** Metric card showing eligible scheme count and potential annual financial value.
   - **Bookmarked Schemes Drawer:** Collapsible sidebar of starred schemes.
3. Build `frontend/src/components/dashboard/EditProfileModal.jsx`:
   - Multi-field input modal with dropdowns for 37 States, 4 Castes, and Rural/Urban residence.

#### Verification Criteria:
- Updating profile fields updates the dashboard ribbon immediately and persists across page reloads.

---

### 📅 Day 8: Interactive Eligibility Wizard & Recharts Analytics Dashboard

#### What We Are Building:
- Multi-step Eligibility Wizard form (`/eligibility`) with real-time field validation.
- Matched Schemes Results view (`/results`) with filterable cards and document readiness evaluator.
- Recharts animated data visualization dashboard.

#### Step-by-Step Technical Tasks:
1. Build `frontend/src/pages/EligibilityWizard.jsx`:
   - Step 1: Personal (Age, Gender, Category).
   - Step 2: Socio-Economic (Income, BPL, Disability).
   - Step 3: Location (State, Rural/Urban).
   - Progress bar with smooth transitions.
2. Build `frontend/src/components/schemes/SchemeCard.jsx`:
   - Scheme title, ministry badge, benefit summary, applicability badges, and bookmark toggle.
3. Build `frontend/src/pages/ResultsDashboard.jsx`:
   - Displays matched schemes returned by backend rule engine.
   - **Recharts Data Visualization:**
     - Category distribution bar chart (Schemes per category).
     - State vs Central allocation donut chart.
     - Potential financial subsidy total metric banner.
4. Build `frontend/src/pages/SchemeDetailView.jsx`:
   - Detailed scheme dossier with **Document Readiness Score** progress bar.
   - Checkable document list updating readiness score in real time.

#### Verification Criteria:
- Submitting the wizard sends POST request to `/api/eligibility/match` and renders matched cards with animated charts in $< 1\text{ second}$.

---

### 📅 Day 9: AI Chatbot with Web Speech Voice API & Live Camera OCR Scanner

#### What We Are Building:
- Multilingual conversational chatbot with Web Speech API voice input/output.
- Live WebRTC camera scanner (`getUserMedia`) and file upload OCR interface.

#### Step-by-Step Technical Tasks:
1. Build `frontend/src/components/chat/VoiceChatbot.jsx`:
   - Floating persistent button + expanding chat drawer.
   - Web Speech API integration (`webkitSpeechRecognition`): Click mic $\rightarrow$ speak in Hindi/English $\rightarrow$ auto-fills chat input.
   - Typing indicator with bouncing dots animation.
   - Speech synthesis (`speechSynthesis.speak`) for reading AI responses aloud.
2. Build `frontend/src/pages/DocumentScanner.jsx`:
   - Mode 1: File upload (Drag & drop image).
   - Mode 2: Live camera feed using `<video>` element and `<canvas>` frame capture.
   - Send captured image to backend `/api/ocr/scan`.
   - Display extracted attributes (Name, DOB, Gender, ID) with one-click *"Apply to Profile"* button.

#### Verification Criteria:
- Speaking into microphone transcribes Hindi text accurately.
- Camera snapshot extracts Aadhaar card details and pre-fills user profile.

---

### 📅 Day 10: Scheme Comparison, QR Code Sharing, End-to-End Testing & Polish

#### What We Are Building:
- Side-by-side scheme comparison matrix (`/compare`).
- Offline QR Code generator for mobile hand-off or physical CSC visits.
- Accessibility controls (Dark mode, text resizing `A+`/`A-`).
- End-to-end testing across all 10 test cases (TC-01 to TC-10) and performance validation.

#### Step-by-Step Technical Tasks:
1. Build `frontend/src/pages/ComparisonMatrix.jsx`:
   - Multi-column table comparing 2 to 4 selected schemes on benefits, eligibility, required documents, and application procedure.
2. Build `frontend/src/components/common/QRCodeModal.jsx`:
   - Uses `qrcode.react` to generate scannable QR code of eligible scheme list for offline sharing.
3. Polish UI & Accessibility:
   - Implement dark mode theme toggle.
   - Add font resizing buttons (`A+` / `A-`).
   - Add empty states, error boundaries, and skeleton loaders.
4. Execute Test Suite:
   - Verify all 10 test cases from the design report.
   - Measure latency across APIs and frontend components.

#### Verification Criteria:
- All 10 test cases pass with expected results.
- End-to-end user journey works smoothly: Landing Page $\rightarrow$ Google Login $\rightarrow$ Dashboard $\rightarrow$ Voice Chat / Camera OCR $\rightarrow$ Eligible Schemes $\rightarrow$ Comparison $\rightarrow$ QR Share.

---

## Verification Plan

### Automated Tests
- `pytest backend/tests/test_rule_engine.py`: Validates TC-01 to TC-03.
- `pytest backend/tests/test_ocr.py`: Validates regex extraction on test images.
- `pytest backend/tests/test_rag.py`: Validates ChromaDB retrieval and Gemini integration.

### Manual Verification Flow
1. **Landing Page:** Open `http://localhost:5173/`, verify typewriter animation, live stats counters, and smooth scrolling across all 8 sections.
2. **Authentication:** Click "Sign in with Google", confirm Firebase modal opens, complete login, verify user profile populates in the Navbar.
3. **Citizen Dashboard:** Review personalized demographic ribbon, quick action cards, and empty state widgets.
4. **Document Scanner:** Switch to live camera mode, point camera at sample identity card, capture frame, verify parsed JSON fields, and click "Apply to Profile".
5. **Eligibility Wizard:** Verify pre-filled profile fields, submit form, verify matched scheme cards appear alongside Recharts graphical visualizations.
6. **Voice AI Assistant:** Click floating mic, speak in Hindi: *"मुझे किसान योजना के बारे में बताओ"*, verify transcribed query, streaming response, and spoken audio playback.
7. **Scheme Comparison & QR Code:** Select 2 schemes, view comparison matrix, click "Share via QR", and scan with smartphone to view matched summary.
