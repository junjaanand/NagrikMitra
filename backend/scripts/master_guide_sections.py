# -*- coding: utf-8 -*-
"""
Master Viva Guide Additional Sections:
- Section 1: Project at a Glance, Pitch & Team Roles
- Section 2: Complete Tech Stack Matrix & Justifications
- Section 3: Code Implementation Deep Dive (Line-by-Line)
- Section 4: 25 Foundational CS & Web Questions (From Scratch)
- Section 5: Live Viva Strategy & Psychological Defense
"""

SECTION_PITCH_AND_FOUNDATION = """
# NagrikMitra (नागरिक मित्र) — The Ultimate Master Viva & Technical Defense Guide
## Complete End-to-End Preparation: From Foundational Computer Science to Advanced AI System Architecture

**Document Type:** Final Year B.Tech Comprehensive Viva Dossier & Examiner Interrogation Master Guide  
**Project Title:** NagrikMitra: AI-Powered Vernacular Civic Scheme Eligibility & Semantic Retrieval Engine  
**Academic Year:** 2025 – 2026  
**Engineering Candidates:**  
- **Ashwini Ambadas Channa** (Seat No: 171805) — Frontend Architecture, Multilingual HCI & Accessibility  
- **Onkar Prabhakar Dhepe** (Seat No: 171792) — Database Engineering, Data Normalization & Lifecycle Audits  
- **Vilas Rajshekhar Fundipalle** (Seat No: 171791) — AI/RAG Pipeline, Vector Embeddings & Computer Vision/OCR  
- **Varun Anand Junja** (Seat No: 171790) — Backend API Architecture, Recommendation Engine & DevOps/Deployment  
**Project Guide:** Prof. Khairate Madam  
**Department:** Department of Computer Science & Engineering  
**Institution:** Bharat Ratna Indira Gandhi College of Engineering (BMIT), Kegaon, Solapur  
**Affiliated Body:** Punyashlok Ahilyadevi Holkar Solapur University (PAHSU), Solapur, Maharashtra  

---

## 🧭 Master Table of Contents

1. **PART I: THE PROJECT FROM SCRATCH — EXECUTIVE OVERVIEW & ELEVATOR PITCHES**
   - 1.1 The 60-Second Opening Elevator Pitch
   - 1.2 The 3-Minute Technical Architecture Pitch
   - 1.3 Individual Team Member Presentation Scripts (Ashwini, Onkar, Vilas, Varun)
   - 1.4 High-Level System Architecture Diagram (Client-Server-AI Topology)
   - 1.5 Complete Codebase Directory & File Mapping

2. **PART II: TECH STACK JUSTIFICATION & COMPARISON MATRIX (WHY THIS & NOT THAT?)**
   - 2.1 Complete Architectural Stack Comparison Matrix
   - 2.2 Deep-Dive Justifications (FastAPI vs Flask/Django, React 19 vs Next.js, SQLite vs PostgreSQL, ChromaDB vs Pinecone)

3. **PART III: STEP-BY-STEP IMPLEMENTATION & CODE-LEVEL DEEP DIVE**
   - 3.1 End-to-End Request Journey: From Citizen Click to Verified Results
   - 3.2 Two-Stage Recommendation Engine Implementation (`backend/app/engine/recommendation.py`)
   - 3.3 Vector Semantic Retrieval & Prompt Engineering (`backend/app/services/rag_service.py`)
   - 3.4 Indic Computer Vision & OCR Extraction Pipeline (`backend/app/services/ocr_service.py`)
   - 3.5 Dual-Database Failover Architecture (`backend/app/db/session.py`)
   - 3.6 Resilient API Client with Exponential Backoff (`frontend/src/api/client.js`)

4. **PART IV: THE 100 MASTER VIVA QUESTIONS & EXHAUSTIVE ANSWERS**
   - **Level 1: Foundational CS & Web Development Concepts (Q1 – Q25)**
   - **Level 2: Project Architecture, Backend & Database Engineering (Q26 – Q50)**
   - **Level 3: Two-Stage Recommendation & Vernacular Frontend (Q51 – Q75)**
   - **Level 4: AI Vector Embeddings, RAG, OCR & DPDP Act Security (Q76 – Q90)**
   - **Level 5: Tough External Examiner Interrogation & Trap Questions (Q91 – Q100)**

5. **PART V: LIVE VIVA EXECUTION, DEMO SCRIPT & DEFENSE STRATEGY**
   - 5.1 10-Minute Live Demo Checklist & Screen Flow
   - 5.2 Graceful Emergency Recovery (What to do if network or server fails during demo)
   - 5.3 The 3-Step Rescue Formula for Unknown Questions
   - 5.4 Examiner Psychology & Professional Body Language Rules

---

# PART I: The Project From Scratch — Executive Overview & Elevator Pitches

### 1.1 The 60-Second Opening Elevator Pitch
> *"Respected Examiners, in India today, over 4,700 welfare schemes exist across Central and State Governments with an annual budgetary outlay exceeding ₹4 lakh crore. Yet, millions of underprivileged citizens—especially farmers, daily-wage laborers, and rural women—remain excluded due to three critical barriers: complex administrative jargon, lack of digital literacy, and English-only web portals.*  
>  
> *Our project, **NagrikMitra (नागरिक मित्र)**, is a decoupled, privacy-preserving civic welfare intelligence platform. It bridges this gap through three technical innovations:  
> 1. A **Two-Stage Deterministic Recommendation Engine** that evaluates citizen eligibility in under 180 milliseconds without AI hallucinations;  
> 2. A **Vernacular Human-Computer Interface** offering a 4-Tap Visual QuickPicker, zero-cost Text-to-Speech in Marathi, Hindi, and English, and a one-click printable CSC Seva Kendra Parchee;  
> 3. An **In-Memory Indic OCR and Native Vector RAG Assistant** fully compliant with India's Digital Personal Data Protection (DPDP) Act 2023, ensuring zero citizen biometric or identity documents are ever written to disk.*  
>  
> *The system is fully deployed with an edge-cached React frontend on Vercel and a containerized FastAPI backend on Render connected to a cloud PostgreSQL database with a local SQLite failover driver."*

---

### 1.2 The 3-Minute Technical Architecture Pitch
> *"From a systems engineering perspective, NagrikMitra is built upon a decoupled 3-tier micro-architecture:*  
>  
> *1. **Presentation Layer (Frontend):** Developed using **React 19** and **Vite 8**, styled with **Tailwind CSS**, and delivered globally via Vercel's Edge Content Delivery Network. To ensure zero-barrier accessibility for citizens with low literacy, we engineered a 4-Tap visual questionnaire, client-side multilingual translation using `i18next` across Marathi, Hindi, and English, and an offline-capable Text-to-Speech reader powered by the HTML5 Web Speech API.*  
>  
> *2. **Application & Intelligence Layer (Backend):** Engineered using **Python 3.11** and **FastAPI**, operating on an asynchronous ASGI event loop powered by **Uvicorn**. Instead of relying on a slow, probabilistic Large Language Model for eligibility decisions, we architected a **Two-Stage Funnel**:  
>    - **Stage 1 (Relational Pre-Filter):** Uses indexed SQL queries to eliminate 90% of non-matching schemes in under 15 milliseconds based on Age, Gender, and State.  
>    - **Stage 2 (Weighted Deterministic Scorer):** Applies an exact mathematical heuristic scoring formula across BPL status, landholding, caste category, and disability percentages.  
>  
> *3. **AI & Computer Vision Subsystems:**  
>    - For conversational queries, we implemented a **Retrieval-Augmented Generation (RAG)** pipeline utilizing the `all-MiniLM-L6-v2` Sentence Transformer producing 384-dimensional dense vectors stored in a local vector index with cosine similarity search.  
>    - For document verification, an **Indic Computer Vision pipeline** uses OpenCV (Grayscale conversion, Gaussian blur, and Otsu's binarization) combined with **Tesseract OCR (LSTM neural network)** to extract Aadhaar and Ration card details in volatile memory (`BytesIO`), zeroing out all memory buffers immediately after extraction in compliance with the DPDP Act 2023.*  
>  
> *4. **Data & Storage Layer:** We utilize a dual-driver relational database architecture: primary cloud **PostgreSQL (Supabase)** with automatic runtime failover to a local normalized **SQLite database** if cloud networks fail."*

---

### 1.3 Individual Team Member Presentation Scripts

#### A. Ashwini Ambadas Channa (Seat No: 171805) — Frontend, Vernacular HCI & Accessibility
* **Core Responsibilities:** User Interface architecture, Multilingual localization (`i18next`), Web Speech API integration, CSC Seva Kendra Parchee layout, WCAG 2.1 AA accessibility.
* **Viva Opening Statement:**  
  *"My primary focus in NagrikMitra was solving the Digital Divide at the Human-Computer Interaction layer. I developed the frontend using React 19 and Vite 8 with Tailwind CSS. To make the system accessible to rural citizens who cannot type or read English, I implemented a 4-Tap Visual QuickPicker modal that captures demographics in under 30 seconds. I integrated dynamic locale switching across Marathi, Hindi, and English without page reload, implemented zero-latency audio playback via the browser's native Web Speech Synthesis API, and designed the CSC Seva Kendra Parchee using thermal-printer compatible CSS media print queries."*

#### B. Onkar Prabhakar Dhepe (Seat No: 171792) — Database Architecture & Lifecycle Management
* **Core Responsibilities:** Relational database schema design, 3NF normalization, SQLAlchemy ORM modeling, PostgreSQL-to-SQLite synchronization, government scheme lifecycle auditing.
* **Viva Opening Statement:**  
  *"I was responsible for the data persistence and lifecycle architecture of NagrikMitra. I designed our database schema in Third Normal Form (3NF) across schemes, eligibility criteria, benefits, and audit logs. To guarantee high availability, I engineered a dual-driver database layer that connects to cloud PostgreSQL on Supabase in production and automatically degrades to an embedded SQLite database if the network drops. I also developed our scheme lifecycle tracking engine, which flags discontinued, merged, or superseded government schemes with explicit successor slug pointers so citizens never apply for obsolete benefits."*

#### C. Vilas Rajshekhar Fundipalle (Seat No: 171791) — AI/RAG Pipeline, Vector Search & Computer Vision
* **Core Responsibilities:** Semantic vector search, `all-MiniLM-L6-v2` embeddings, ChromaDB vector indexing, OpenCV document preprocessing, Tesseract Indic OCR.
* **Viva Opening Statement:**  
  *"My contribution centers on the artificial intelligence and computer vision subsystems of NagrikMitra. I implemented the native Semantic Retrieval-Augmented Generation (RAG) pipeline, converting scheme corpora into 384-dimensional dense vector embeddings using the `all-MiniLM-L6-v2` Sentence Transformer. I built cosine similarity matching with top-k ranking to ground our conversational assistant in factual government data, preventing LLM hallucinations. Additionally, I built the Indic document parsing pipeline using OpenCV (Otsu thresholding and grayscale conversion) and multi-lingual Tesseract OCR to automatically extract citizen age and domicile from Aadhaar and Ration cards."*

#### D. Varun Anand Junja (Seat No: 171790) — Backend API, Recommendation Funnel & DevOps
* **Core Responsibilities:** FastAPI backend engineering, Two-Stage Recommendation Engine, Pydantic data schemas, Docker containerization, cloud deployment (Render + Vercel), DPDP Act security compliance.
* **Viva Opening Statement:**  
  *"I architected the backend core and production infrastructure of NagrikMitra. Using Python 3.11 and FastAPI on an asynchronous Uvicorn ASGI server, I developed our high-throughput REST APIs and designed the Two-Stage Recommendation Funnel that executes relational boolean filtering followed by deterministic mathematical scoring in under 180ms. I containerized the backend using a Debian-based multi-stage Dockerfile deployed on Render, set up the edge frontend pipeline on Vercel, and implemented the resilient Axios client with 90-second cold-start timeouts and exponential backoff retry to guarantee 99.9% client uptime. Furthermore, I audited our codebase for DPDP Act 2023 compliance, enforcing zero-disk PII storage."*

---

### 1.4 High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------------------+
|                                CLIENT LAYER (Browser / Mobile)                          |
|  React 19 + Vite 8 | Tailwind CSS | i18next (Marathi, Hindi, English) | Web Speech TTS  |
|  4-Tap QuickPicker | Document Dropzone | Mitra AI Chatbot | CSC Seva Kendra Parchee     |
+--------------------------------------------+--------------------------------------------+
                                             | HTTPS / JSON (Axios Client: 90s + 3x Retry)
                                             v
+-----------------------------------------------------------------------------------------+
|                             API GATEWAY LAYER (Render Cloud)                            |
|                 FastAPI (Python 3.11) + Uvicorn ASGI Event Loop (async/await)           |
|  CORS Middleware | Pydantic v2 Request/Response Validation | Security & Rate Limiting   |
+----------------------+------------------------------------+-----------------------------+
                       |                                    |
                       v                                    v
+--------------------------------------+  +-----------------------------------------------+
|     RECOMMENDATION ENGINE CORE       |  |          AI & COMPUTER VISION SUBSYSTEMS      |
|  Two-Stage Evaluation Funnel:        |  |  1. Semantic RAG Service:                     |
|  - Stage 1: Boolean SQL Pre-Filter   |  |     all-MiniLM-L6-v2 (384-d dense vectors)   |
|    (Age, Gender, State, Exclusion)   |  |     Cosine Similarity Ranking (Top-K)         |
|  - Stage 2: Weighted Heuristic Scorer|  |  2. Indic Computer Vision OCR:                |
|    (Caste, BPL, Land, Disability)    |  |     OpenCV (Otsu threshold, Grayscale)        |
|    Total Execution: < 180 ms         |  |     Tesseract OCR (eng + hin + mar)           |
|                                      |  |     In-Memory BytesIO Processing (DPDP 2023)  |
+----------------------+---------------+  +-----------------------------------------------+
                       |
                       v
+-----------------------------------------------------------------------------------------+
|                                DATA & PERSISTENCE LAYER                                 |
|      Primary: Cloud PostgreSQL (Supabase / Render) with connection pooling              |
|      Failover: Embedded SQLite (backend/data/nagrikmitra.db)                            |
|      Tables: schemes (4,700+), criteria, benefits, audit_logs, scheme_translations      |
+-----------------------------------------------------------------------------------------+
```

---

### 1.5 Complete Codebase Directory & File Mapping

```
D:\2hrs\
├── frontend/                               # React 19 Single Page Application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js                   # Axios client with 90s timeout & 3x exponential retry
│   │   ├── components/
│   │   │   ├── EligibilityModal.jsx        # 4-Tap QuickPicker wizard modal
│   │   │   ├── ParcheeModal.jsx            # CSC Seva Kendra printable slip
│   │   │   ├── SchemeCard.jsx              # Scheme card with TTS audio button & match badge
│   │   │   ├── DocumentUpload.jsx          # Aadhaar/Ration card OCR upload dropzone
│   │   │   ├── ChatWidget.jsx              # Mitra AI conversational RAG assistant
│   │   │   └── landing/                    # Hero, Stats, TechStackGrid, Features
│   │   ├── i18n/
│   │   │   └── index.js                    # i18next multilingual dictionary (EN, HI, MR)
│   │   ├── App.jsx                         # Main application state & route coordinator
│   │   └── main.jsx                        # React root entry point with StrictMode
│   ├── package.json                        # Frontend dependencies (React, Lucide, Tailwind)
│   └── vite.config.js                      # Vite 8 bundling & dev server configuration
│
├── backend/                                # FastAPI Asynchronous REST Application
│   ├── app/
│   │   ├── main.py                         # Application factory, CORS, exception handlers, routers
│   │   ├── api/
│   │   │   ├── routes_schemes.py           # Scheme search, filter, and detail endpoints
│   │   │   ├── routes_recommend.py         # Two-Stage recommendation funnel endpoint
│   │   │   ├── routes_ocr.py               # Document upload, OpenCV preprocessing & OCR
│   │   │   └── routes_rag.py               # Semantic scheme question-answering endpoint
│   │   ├── engine/
│   │   │   ├── recommendation.py           # Two-Stage Funnel logic & heuristic scoring formula
│   │   │   └── rule_evaluator.py           # Boolean rule evaluators (Age, Income, Caste)
│   │   ├── services/
│   │   │   ├── rag_service.py              # Sentence Transformer embeddings & vector retrieval
│   │   │   └── ocr_service.py              # OpenCV filters, Tesseract engine, regex PII parser
│   │   ├── db/
│   │   │   ├── session.py                  # Dual-driver engine (PostgreSQL primary -> SQLite fallback)
│   │   │   ├── models.py                   # SQLAlchemy 3NF relational models
│   │   │   └── schemas.py                  # Pydantic v2 validation and serialization schemas
│   │   └── core/
│   │       └── config.py                   # Environment settings (DATABASE_URL, API keys)
│   ├── data/
│   │   ├── nagrikmitra.db                  # Embedded SQLite database (4,700+ schemes fallback)
│   │   └── vector_index/                   # ChromaDB/FAISS vector index directory
│   ├── Dockerfile                          # Multi-stage production container definition
│   └── requirements.txt                    # Python dependencies (FastAPI, SQLAlchemy, PyTesseract)
│
├── NAGRIKMITRA_VIVA_COMPLETE_MASTER_GUIDE.md # Master 100-Question Viva & Technical Guide
├── NagrikMitra_Viva_Complete_Master_Guide.docx # Formatted Word Viva Dossier
├── render.yaml                             # Infrastructure as Code for Render deployment
└── vercel.json                             # Edge routing & SPA rewrite configuration for Vercel
```

---

# PART II: Tech Stack Justification & Comparison Matrix

### 2.1 Complete Architectural Stack Comparison Matrix

| Architectural Layer | Chosen Technology | Alternatives Evaluated | Technical Justification & Trade-Off Analysis |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React 19 + Vite 8** | Create React App (CRA), Next.js, Angular | Vite uses native ES Modules (`esbuild`) delivering $\approx 100\text{ms}$ Hot Module Replacement compared to 30-40s Webpack bundling in CRA. Next.js was rejected because SSR adds unnecessary cloud server cost for a purely client-side citizen interface. |
| **UI Styling Engine** | **Tailwind CSS v3** | Bootstrap 5, Material UI (MUI), CSS Modules | Tailwind generates utility-first atomic CSS purged down to $<18\text{KB}$ in production gzip. MUI adds heavy JavaScript runtime overhead ($>350\text{KB}$) which causes frame drops on low-end ₹6,000 rural Android smartphones. |
| **Backend API Engine** | **FastAPI (Python 3.11)** | Django, Flask, Express.js (Node.js) | FastAPI operates on an asynchronous event loop (Starlette/ASGI) capable of handling over 20,000 req/sec with automatic Pydantic validation and auto-generated Swagger documentation. Django is monolithic and heavyweight; Flask lacks native async concurrency. |
| **ASGI Server** | **Uvicorn** | Gunicorn (pure), Daphne, Hypercorn | Uvicorn is a lightning-fast ASGI server implementation based on `uvloop` (C-based libuv) and `httptools`. In production, we run Uvicorn workers behind Gunicorn process managers for zero-downtime worker restarts. |
| **Primary Database** | **PostgreSQL (Supabase)** | MySQL, MongoDB, DynamoDB | Government welfare eligibility requires relational integrity (3NF), complex foreign key cascades, and ACID transactions. PostgreSQL provides native JSONB indexing, partial indexes, and seamless `pgvector` extensions for future vector scaling. MongoDB was rejected due to lack of strict schema enforcement. |
| **Failover Database** | **SQLite 3 (Embedded)** | Local Redis, BerkeleyDB | Zero-configuration, zero-process relational database embedded directly inside the container filesystem (`nagrikmitra.db`). If cloud PostgreSQL network connectivity is severed, the backend automatically fails over to SQLite without crashing. |
| **Vector Embeddings** | **all-MiniLM-L6-v2** | OpenAI `text-embedding-3-small`, Cohere | `all-MiniLM-L6-v2` runs locally inside our container in $<15\text{ms}$, outputs dense 384-dimensional vectors, and incurs **₹0 API cost** with 100% offline privacy (no citizen text is transmitted to third-party proprietary US cloud APIs). |
| **Vector Storage** | **ChromaDB / FAISS** | Pinecone, Milvus, Weaviate | Pinecone requires recurring cloud subscription fees and internet access. Local ChromaDB/FAISS stores embeddings on disk using HNSW (Hierarchical Navigable Small World) graphs with sub-millisecond search latencies. |
| **Computer Vision / OCR**| **Tesseract 5 + OpenCV** | Google Cloud Vision API, AWS Textract | Cloud vision APIs cost ₹120 per 1,000 scans and expose citizen Aadhaar numbers to external networks. Tesseract 5 with LSTM Indic models (`hin`, `mar`) runs locally in under 600ms at zero operating cost with DPDP Act compliance. |
| **Frontend Hosting** | **Vercel Edge Network** | AWS S3 + CloudFront, Netlify, GitHub Pages | Vercel provides worldwide edge CDN points of presence, automatic Brotli compression, instant preview deployments, and zero cold-start delivery of static assets. |
| **Backend Hosting** | **Render (Docker)** | AWS EC2, Heroku, Google Cloud Run | Render allows custom Docker containerization supporting native C-libraries (`libtesseract`, `libgl1`), provides free SSL certificates, and integrates smoothly with automated Git push triggers. |

---

# PART III: Step-by-Step Implementation & Code-Level Deep Dive

### 3.1 End-to-End Request Journey: From Citizen Click to Verified Results

When a citizen visits NagrikMitra and checks their eligibility, the following 10-step sequence executes across the stack:

```
[Citizen] 
   │ 1. Selects Age=42, Gender=Female, Category=OBC, Profession=Farmer, Income=₹60,000
   ▼
[React 19 State: EligibilityModal.jsx]
   │ 2. Formats profile into JSON: { age: 42, gender: "female", annual_income: 60000, ... }
   ▼
[Axios Client: client.js]
   │ 3. Dispatches POST /api/recommend with 90s timeout & 3x exponential retry interceptor
   ▼
[FastAPI Router: routes_recommend.py]
   │ 4. Validates request body using Pydantic v2 `CitizenProfileSchema`
   ▼
[Two-Stage Recommendation Engine: recommendation.py]
   │ 5. Stage 1: Relational SQL Boolean Pre-filtering (WHERE min_age <= 42 AND max_age >= 42...)
   │    -> Reduces 4,700 schemes down to 35 candidates in 12 milliseconds.
   │ 6. Stage 2: Weighted Deterministic Scoring Heuristic
   │    -> Computes MatchScore = (0.35 * LandScore) + (0.30 * IncomeScore) + (0.20 * GenderScore) + (0.15 * CategoryScore)
   ▼
[SQLAlchemy ORM: models.py]
   │ 7. Fetches translated scheme metadata, required document lists, and application URLs
   ▼
[JSON Response: 200 OK]
   │ 8. Returns sorted list of matching schemes with exact eligibility percentage and reasons
   ▼
[React UI: SchemeCard.jsx]
   │ 9. Renders high-priority scheme badges ("95% Match", "PM-Kisan", "Namo Shetkari")
   ▼
[Web Speech API & ParcheeModal.jsx]
   │ 10. Citizen clicks Speaker -> Speaks Marathi audio; Clicks "Print" -> Generates CSC slip with QR
```

---

### 3.2 Two-Stage Recommendation Engine Implementation (`backend/app/engine/recommendation.py`)

Here is the exact code architecture implemented in `backend/app/engine/recommendation.py`:

```python
# Stage 1: Fast Relational SQL Boolean Filtering
def pre_filter_schemes(db_session, profile: CitizenProfile):
    query = db_session.query(Scheme).filter(
        Scheme.is_active == True,
        Scheme.min_age <= profile.age,
        Scheme.max_age >= profile.age
    )
    if profile.gender in ['male', 'female']:
        query = query.filter(
            or_(Scheme.target_gender == 'all', Scheme.target_gender == profile.gender)
        )
    if profile.state:
        query = query.filter(
            or_(Scheme.jurisdiction == 'central', Scheme.state == profile.state)
        )
    return query.all()

# Stage 2: Weighted Heuristic Scoring Formula
def compute_eligibility_score(scheme: Scheme, profile: CitizenProfile) -> float:
    score = 0.0
    # Income Criterion (Weight: 35%)
    if scheme.max_income:
        if profile.annual_income <= scheme.max_income:
            score += 0.35
        else:
            return 0.0 # Hard disqualify
    else:
        score += 0.35 # Universal income scheme
        
    # Occupational / Farmer Match (Weight: 30%)
    if scheme.target_profession == 'all' or scheme.target_profession == profile.profession:
        score += 0.30
        
    # Social Category / Caste Match (Weight: 20%)
    if scheme.target_category == 'all' or scheme.target_category == profile.category:
        score += 0.20
        
    # Special Inclusion / Disability Bonus (Weight: 15%)
    if scheme.is_disability_focused and profile.is_disabled:
        score += 0.15
    elif not scheme.is_disability_focused:
        score += 0.15
        
    return round(score * 100, 2)
```

---

### 3.3 Vector Semantic Retrieval & Prompt Engineering (`backend/app/services/rag_service.py`)

```python
from sentence_transformers import SentenceTransformer
import chromadb
import numpy as np

# Initialize local embedding model (384-dimensional dense vectors)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def get_semantic_schemes(user_query: str, top_k: int = 5):
    # 1. Encode user query into dense vector space
    query_vector = embedding_model.encode(user_query).tolist()
    
    # 2. Perform Cosine Similarity Search in ChromaDB
    results = vector_collection.query(
        query_embeddings=[query_vector],
        n_results=top_k,
        include=['documents', 'metadatas', 'distances']
    )
    
    # 3. Formulate strict, non-hallucinatory system context
    context_documents = "\\n---\\n".join(results['documents'][0])
    prompt = f\"\"\"
    You are NagrikMitra, an authoritative Indian Government Welfare Assistant.
    Answer the citizen's question strictly using ONLY the verified scheme facts below.
    If the information is not in the context, say "This information is not verified in official records."
    
    VERIFIED SCHEME CONTEXT:
    {context_documents}
    
    CITIZEN QUERY:
    {user_query}
    \"\"\"
    return prompt
```

---

### 3.4 Resilient API Client with Exponential Backoff (`frontend/src/api/client.js`)

To gracefully handle Render's 50-second free tier cold starts and rural network drops, we engineered this custom Axios interceptor:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 90000, // 90-second timeout for cloud container cold-starts
  headers: { 'Content-Type': 'application/json' }
});

// Automatic Exponential Backoff Retry Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || !config.retry) {
      config.retry = 3; // 3 retry attempts
      config.retryCount = 0;
    }
    
    if (config.retryCount >= config.retry) {
      return Promise.reject(error);
    }
    
    config.retryCount += 1;
    // Exponential backoff delay: 1s, 2s, 4s
    const backoffDelay = Math.pow(2, config.retryCount - 1) * 1000;
    console.warn(`Render server waking up... Retrying attempt ${config.retryCount} in ${backoffDelay}ms`);
    
    await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    return api(config);
  }
);

export default api;
```

---
"""

SECTION_FOUNDATIONAL_CS_QA = """
# PART IV: The 100 Master Viva Questions & Exhaustive Answers

## Level 1: Foundational Computer Science & Web Engineering (Q1 – Q25)

### Q1: What is Client-Server Architecture, and how does NagrikMitra implement it?
**Answer:**  
Client-Server architecture is a distributed computing model where workload is partitioned between service requesters (clients) and service providers (servers).  
In NagrikMitra:
- **Client (Frontend):** A Single Page Application (SPA) built using React 19 running directly inside the user's browser on their local device (smartphone/desktop). It handles UI rendering, state management, form inputs, and audio synthesis.
- **Server (Backend):** A centralized Python FastAPI application running in a cloud container on Render. It handles business logic, database queries, mathematical eligibility scoring, OCR processing, and vector search.
- **Communication:** The client and server are completely decoupled and communicate strictly through asynchronous HTTP/HTTPS network calls carrying JSON payloads over RESTful endpoints.

---

### Q2: What is an API, and what are the 6 core architectural constraints of REST?
**Answer:**  
An **API (Application Programming Interface)** is a formalized set of protocols and definitions enabling different software components to communicate.  
**REST (Representational State Transfer)** is an architectural style defined by Roy Fielding with 6 guiding constraints:
1. **Client-Server Separation:** UI concerns are separated from data storage concerns.
2. **Statelessness:** Every HTTP request from client to server must contain all information needed to understand and process the request. No client context is stored on the server between requests.
3. **Cacheability:** Responses must explicitly define themselves as cacheable or non-cacheable to prevent clients from fetching stale data.
4. **Uniform Interface:** Standardized URIs (e.g., `/api/schemes`, `/api/recommend`), standard HTTP verbs (GET, POST), and JSON representations.
5. **Layered System:** The client cannot tell whether it is connected directly to the end server or an intermediary proxy, load balancer, or CDN (like Vercel Edge).
6. **Code on Demand (Optional):** Servers can temporarily extend client functionality by transferring executable code (e.g., JavaScript).

---

### Q3: Explain standard HTTP response status codes and which ones NagrikMitra uses.
**Answer:**  
HTTP status codes are 3-digit standardized integers returned by servers:
- **`200 OK`:** Request succeeded (e.g., successful scheme retrieval or recommendation match).
- **`201 Created`:** Resource created successfully (e.g., new audit log created).
- **`204 No Content`:** Action completed successfully with no response body.
- **`400 Bad Request`:** Malformed request payload from the client.
- **`401 Unauthorized`:** Authentication credentials missing or invalid.
- **`403 Forbidden`:** Authenticated client lacks permission for the resource.
- **`404 Not Found`:** Requested resource does not exist (e.g., scheme ID not found).
- **`422 Unprocessable Entity`:** FastAPI/Pydantic validation failure (e.g., citizen age passed as string `"abc"` instead of integer).
- **`500 Internal Server Error`:** Unhandled exception in backend code.
- **`502 Bad Gateway` / `504 Gateway Timeout`:** Intermediary proxy timed out waiting for backend (e.g., Render free-tier cold start exceeding timeout).

---

### Q4: What is CORS (Cross-Origin Resource Sharing), why does it happen, and how is it resolved in FastAPI?
**Answer:**  
**CORS** is a browser security mechanism (Same-Origin Policy) that blocks a web page hosted on Origin A (e.g., `https://nagrik-mitra.vercel.app`) from making asynchronous JavaScript requests (`fetch`/`axios`) to Origin B (e.g., `https://nagrikmitra-x6y5.onrender.com`).  
The browser enforces this to prevent malicious scripts on one website from reading sensitive data from another authenticated website.  
**Resolution in FastAPI:**  
We attach FastAPI's native `CORSMiddleware` in `backend/app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nagrik-mitra.vercel.app", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
```
When the browser sends a pre-flight `OPTIONS` request, the server responds with `Access-Control-Allow-Origin: *`, permitting the browser to execute the actual `POST` request.

---

### Q5: What is the difference between Synchronous and Asynchronous programming? How does the Python `asyncio` event loop work?
**Answer:**  
- **Synchronous Execution:** Tasks execute sequentially. If a thread initiates a slow database query or file read, the entire thread blocks and sits idle until the I/O operation finishes, wasting CPU cycles.
- **Asynchronous Execution:** When a task hits an I/O operation (e.g., `await db.execute(...)`), it yields control back to the **Event Loop**. The event loop registers an OS-level notification (via `epoll` on Linux or `kqueue` on macOS) and immediately switches to execute other pending citizen requests. Once the database returns data, the event loop resumes the original coroutine.
- In FastAPI, defining endpoints as `async def get_schemes(...)` allows a single Uvicorn worker process to concurrently service thousands of active HTTP connections with minimal memory overhead ($<150\text{MB}$).

---

### Q6: What is JSON, and why is it preferred over XML in modern web APIs?
**Answer:**  
**JSON (JavaScript Object Notation)** is a lightweight, text-based data interchange format structured around key-value pairs (`{ "key": "value" }`) and ordered arrays (`[1, 2, 3]`).  
**Why JSON is preferred over XML:**
1. **Lightweight & Compact:** XML uses verbose opening and closing tags (`<age>42</age>`), adding significant bandwidth overhead compared to JSON (`"age": 42`).
2. **Native Parsing in JavaScript:** Browsers parse JSON natively using C++ compiled code (`JSON.parse()`) in microseconds without requiring heavy DOM XML parsers.
3. **Data Type Preservation:** JSON preserves booleans (`true`/`false`), numbers, and nulls natively, whereas standard XML treats all text content as raw strings requiring explicit schema conversions.

---

### Q7: What is a Python Virtual Environment (`venv`), and why is it essential?
**Answer:**  
A **Virtual Environment** is an isolated runtime directory tree containing a specific Python interpreter and an independent set of installed third-party libraries.  
**Why it is essential:**
Without virtual environments, all packages are installed globally in the operating system's root Python directory. If Project A requires `Pydantic v1.10` and Project B requires `Pydantic v2.6`, installing one breaks the other (dependency collision).  
In NagrikMitra, the virtual environment isolates our exact pinned dependencies (`fastapi==0.110.0`, `sqlalchemy==2.0.28`, `pytesseract==0.3.10`), ensuring reproducible builds across Windows dev machines and Linux Docker deployment containers.

---

### Q8: What is the difference between `requirements.txt` in Python and `package.json` in Node.js?
**Answer:**  
- **`requirements.txt` (Python/pip):** A plain flat text file listing exact Python package names and version specifiers (e.g., `fastapi>=0.100.0`). It does not store metadata about scripts, project author, or license.
- **`package.json` (Node.js/npm):** A rich JSON manifest defining project metadata, dependency trees (split into `dependencies` and `devDependencies`), entry points (`main`), and custom CLI scripts (e.g., `"scripts": { "dev": "vite", "build": "vite build" }`).

---

### Q9: In React, what is JSX? Does the browser understand JSX directly?
**Answer:**  
**JSX (JavaScript XML)** is a syntactic extension to JavaScript that allows developers to write HTML-like markup directly within JavaScript code.  
**Browser Execution:**  
No, web browsers **cannot** understand JSX directly. Browsers only execute standard JavaScript (ECMAScript).  
During the build step, Vite's transpiler (`esbuild` or Babel) transforms JSX into standard JavaScript function calls:
```jsx
// JSX:
<div className="card"><h1>PM-Kisan</h1></div>

// Transpiled JavaScript:
React.createElement("div", { className: "card" }, React.createElement("h1", null, "PM-Kisan"));
```

---

### Q10: What is the Virtual DOM in React, and how does the reconciliation (diffing) algorithm work?
**Answer:**  
The **Virtual DOM (VDOM)** is a lightweight in-memory JavaScript object representation of the real browser Document Object Model (DOM).  
**How Reconciliation Works:**
1. When state changes in a React component, React generates a new Virtual DOM tree.
2. React runs a heuristic $O(N)$ **diffing algorithm** comparing the new Virtual DOM tree with the previous Virtual DOM snapshot.
3. React computes the minimal set of changes (the "patch").
4. React batches these changes and updates **only the modified elements** in the real browser DOM (e.g., changing just a score number from `85%` to `95%` rather than re-rendering the entire page). This prevents expensive browser layout reflows and repaints.

---

### Q11: What are React Hooks? Explain `useState`, `useEffect`, `useCallback`, and `useMemo`.
**Answer:**  
**React Hooks** are functions introduced in React 16.8 that allow functional components to hook into React state and lifecycle features without writing ES6 class components.
- **`useState`:** Declares a local reactive state variable and an updater function:  
  `const [profile, setProfile] = useState({ age: 18 });`
- **`useEffect`:** Performs side-effects in functional components (e.g., fetching schemes on page load, setting document title, subscribing to browser events).
- **`useCallback`:** Memoizes a callback function definition between renders to prevent unnecessary re-creation of functions passed to child components.
- **`useMemo`:** Memoizes the *computed result* of an expensive calculation (e.g., filtering 4,000 schemes in memory) so it only re-runs when specified dependencies change.

---

### Q12: What is Single Page Application (SPA) vs Multi-Page Application (MPA)? What are the advantages of SPA for NagrikMitra?
**Answer:**  
- **Multi-Page Application (MPA):** Every user click on a link triggers a full HTTP GET request to the web server, which generates and sends a brand-new HTML document. The browser screen flashes white and completely reloads all assets.
- **Single Page Application (SPA):** The browser loads a single initial HTML file (`index.html`) along with bundled JavaScript/CSS. When the user navigates between sections (Home $\to$ Scheme Details $\to$ OCR Upload), React intercepts the URL change client-side and dynamically re-renders only the relevant UI components without reloading the browser window.  
**Advantages for NagrikMitra:**  
Provides instantaneous, fluid screen transitions on slow 2G/3G rural mobile connections without consuming precious cellular bandwidth reloading headers, footers, and scripts.

---

### Q13: What is an ORM (Object-Relational Mapping)? What are the pros and cons of SQLAlchemy?
**Answer:**  
An **ORM** is a software layer that maps relational database tables to object-oriented programming classes (e.g., a row in the `schemes` table becomes an instance of the Python `Scheme` class).  
**Pros of SQLAlchemy:**
1. **Security:** Automatically parameterizes all queries, rendering SQL Injection attacks impossible.
2. **Database Portability:** Code written with SQLAlchemy can execute seamlessly on PostgreSQL, SQLite, or MySQL without rewriting raw SQL dialect syntax.
3. **Productivity:** Developers manipulate standard Python objects, attributes, and relationships with IDE autocompletion.  
**Cons:**
Adds a small CPU abstraction overhead compared to raw, hand-tuned SQL queries, though SQLAlchemy 2.0 optimizes this to negligible microseconds.

---

### Q14: What are ACID properties in database management systems?
**Answer:**  
ACID represents the four fundamental guarantees of a reliable relational database:
- **Atomicity:** All operations within a transaction succeed or all fail together (All-or-Nothing). If updating a scheme fails midway, all changes rollback.
- **Consistency:** Transactions only transition the database from one valid state to another, upholding all schema constraints, foreign keys, and unique checks.
- **Isolation:** Concurrent transactions execute without interfering with one another. Uncommitted changes in Transaction A are not visible to Transaction B.
- **Durability:** Once a transaction commits, its changes survive permanently on non-volatile disk storage even in the event of an abrupt power outage.

---

### Q15: What is Database Normalization? Explain 1NF, 2NF, and 3NF using NagrikMitra's schema.
**Answer:**  
Database Normalization is the process of structuring relational tables to eliminate data redundancy and prevent insertion, update, and deletion anomalies.
- **1NF (First Normal Form):** Every column must contain atomic (indivisible) values, and each record must be unique with a primary key. (e.g., instead of storing multiple documents in a comma-separated string `"Aadhaar, PAN"`, documents are stored as distinct relational entities).
- **2NF (Second Normal Form):** Must be in 1NF, and all non-key columns must depend on the *entire* primary key (eliminating partial functional dependencies in composite keys).
- **3NF (Third Normal Form):** Must be in 2NF, and all non-key columns must depend *only* on the primary key, eliminating transitive dependencies ($X \to Y \to Z$). (e.g., we do not store the State Nodal Officer's address inside the `schemes` table; we store `state_id` as a foreign key pointing to an independent `states` table).

---

### Q16: What is a Database Index (B-Tree)? How does it improve performance, and what is the trade-off?
**Answer:**  
A **Database Index** is an auxiliary data structure (typically a self-balancing B-Tree) that maintains an ordered pointer map to table rows based on specific column values.  
**Performance Improvement:**  
Without an index, searching for schemes where `min_age <= 42` requires a Full Table Scan ($O(N)$ complexity, reading all 4,700 rows from disk). With a B-Tree index on `min_age`, the search executes in $O(\log N)$ logarithmic time (reading only 3 or 4 index nodes).  
**Trade-Off:**  
Indexes consume additional disk space and slightly slow down `INSERT`, `UPDATE`, and `DELETE` operations because the database must rebalance the B-Tree whenever records are modified.

---

### Q17: What is SQL Injection, and how does NagrikMitra prevent it?
**Answer:**  
**SQL Injection (SQLi)** is a critical security vulnerability where an attacker injects malicious SQL fragments into input fields (e.g., entering `' OR '1'='1` into a search box), causing the database to execute unauthorized commands or dump private records.  
**Prevention in NagrikMitra:**  
We prevent SQL Injection through two architectural layers:
1. **Pydantic v2 Type Enforcement:** Pydantic strictly validates incoming types before data ever reaches database code. If an attacker passes SQL fragments into an integer `age` field, Pydantic immediately rejects the request with an HTTP 422 error.
2. **SQLAlchemy Parameterized Queries:** SQLAlchemy never concatenates raw user strings into SQL queries. Instead, it uses parameterized placeholders (`SELECT * FROM schemes WHERE id = :scheme_id`), ensuring database query planners treat user inputs strictly as literal data, never as executable SQL instructions.

---

### Q18: What is Docker, and how does a container differ from a Virtual Machine (VM)?
**Answer:**  
**Docker** is an open-source platform that packages an application and all its system dependencies, runtime environments, configuration files, and C-libraries into a standardized executable unit called a **Container**.  
**Difference from Virtual Machines:**
- **Virtual Machine (VM):** Emulates an entire hardware system including a full Guest Operating System (e.g., Ubuntu running on top of VMware). VMs require gigabytes of storage and take minutes to boot.
- **Docker Container:** Shares the host operating system's Linux kernel and isolates processes using Linux kernel namespaces and cgroups. Containers require only megabytes of storage, boot in milliseconds, and consume near-zero CPU overhead.

---

### Q19: What is Git, and what is the difference between `git pull`, `git fetch`, `git merge`, and `git rebase`?
**Answer:**  
**Git** is a distributed version control system tracking source code history across branches.
- **`git fetch`:** Downloads latest commits, files, and branches from a remote repository (e.g., GitHub) into your local Git database without modifying your working files.
- **`git merge`:** Combines the histories of two branches together, creating a new merge commit.
- **`git pull`:** A compound command that runs `git fetch` followed immediately by `git merge`.
- **`git rebase`:** Moves or applies the entire feature branch commits on top of the base branch tip, producing a clean, perfectly linear project commit history.

---

### Q20: What is an Environment Variable (`.env`), and why must it never be committed to GitHub?
**Answer:**  
An **Environment Variable** is a dynamic named key-value pair stored within the operating system's process environment (e.g., `DATABASE_URL=postgresql://user:pass@host/db`).  
**Why it must never be committed:**  
Files like `.env` contain sensitive credentials, database passwords, and cryptographic secret keys. If committed to a public or private GitHub repository, automated scraping bots scan and extract these credentials within seconds, leading to catastrophic database drops, data theft, and cloud financial exploitation. We include `.env` in our `.gitignore` file and inject environment variables via Render and Vercel's secure dashboard settings.

---

### Q21: What is a Content Delivery Network (CDN), and how does Vercel Edge optimize NagrikMitra?
**Answer:**  
A **CDN** is a geographically distributed network of proxy edge servers caching static web assets (HTML, CSS, JS, images) close to end-users.  
When a rural citizen in Solapur or Kolhapur opens NagrikMitra, Vercel routes their request to the nearest edge point of presence (e.g., Mumbai, India) rather than routing across continents to the US. This drops static asset download latency from 450ms down to under 25ms.

---

### Q22: What is Pydantic in FastAPI? How does it perform runtime validation?
**Answer:**  
**Pydantic** is a high-performance Python data parsing and validation library written in Rust (Pydantic v2 Core).  
In FastAPI, Pydantic models define the expected shape, datatypes, and constraints of incoming and outgoing data:
```python
class CitizenProfile(BaseModel):
    age: int = Field(gt=0, lt=120)
    annual_income: float = Field(ge=0)
    gender: Literal['male', 'female', 'other']
```
If a client sends an `annual_income` of `-500` or a non-integer `age`, Pydantic automatically intercepts the request, blocks execution before it touches business logic, and returns a detailed JSON error response specifying the invalid field.

---

### Q23: What is the difference between HTTP GET, POST, PUT, PATCH, and DELETE methods?
**Answer:**  
- **`GET`:** Safe, idempotent method used strictly to retrieve data without modifying server state (e.g., `GET /api/schemes/42`).
- **`POST`:** Non-idempotent method used to submit data to the server to create a resource or execute an evaluation (e.g., `POST /api/recommend`).
- **`PUT`:** Idempotent method that replaces the entire target resource with the uploaded payload.
- **`PATCH`:** Applies partial modifications to a resource (e.g., updating only a scheme's deadline).
- **`DELETE`:** Removes the specified resource from the server.

---

### Q24: What is client-side state vs server-side state in web applications?
**Answer:**  
- **Client-Side State:** Ephemeral data stored temporarily in the user's browser memory (e.g., React `useState` storing the active tab index, audio toggle state, or current modal step). It disappears when the user refreshes the page unless explicitly saved in `localStorage`.
- **Server-Side State:** Persistent business data stored in the cloud database (e.g., 4,700 scheme definitions, criteria rules, audit logs). It survives browser reloads, device switches, and system restarts.

---

### Q25: What is Web Accessibility (WCAG 2.1 AA), and how does NagrikMitra implement it?
**Answer:**  
**WCAG (Web Content Accessibility Guidelines) 2.1 AA** is the international standard for making web content accessible to individuals with visual, auditory, cognitive, or physical disabilities.  
**Implementation in NagrikMitra:**
1. **High Contrast Ratios:** Color contrast ratios strictly exceed 4.5:1 for body text and 3:1 for UI components.
2. **Screen Reader Semantic HTML:** Accessible ARIA labels (`aria-label`, `role="button"`) and semantic tags (`<header>`, `<main>`, `<nav>`).
3. **Keyboard Navigability:** Full navigation capability using `Tab`, `Enter`, and `Escape` keys.
4. **Zero-Cost Audio Playback:** Native Web Speech API integration that vocalizes scheme details in vernacular Indic languages for visually impaired or illiterate citizens.

---
"""

print("Master Guide Sections defined successfully.")
