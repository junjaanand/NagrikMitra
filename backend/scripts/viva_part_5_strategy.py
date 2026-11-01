# -*- coding: utf-8 -*-
"""
Part V: Live Viva Execution, Demo Script & Psychological Defense Strategy
"""

SECTION_PART_5_STRATEGY = """
# PART V: Live Viva Execution, Demo Script & Defense Strategy

### 5.1 The 10-Minute Live Demo Checklist & Screen Flow

When the external examiner asks: *"Show me the project demo,"* follow this exact 8-step sequence:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NAGRIKMITRA LIVE VIVA DEMO CHECKLIST                     │
├────┬──────────────────────┬─────────────────────────────────────────────────┤
│Step│ Action on Screen      │ What to Say to the External Examiner            │
├────┼──────────────────────┼─────────────────────────────────────────────────┤
│ 1  │ Open Homepage        │ "Sir/Madam, this is the NagrikMitra landing     │
│    │ (http://localhost:   │ page. Notice the vernacular Indic interface with│
│    │ 5173 or Vercel URL)  │ quick metrics: 4,700+ active schemes indexed."  │
├────┼──────────────────────┼─────────────────────────────────────────────────┤
│ 2  │ Switch Language to   │ "Notice that language switches instantaneously  │
│    │ Marathi or Hindi     │ via i18next without a page reload or network    │
│    │ (Navbar toggle)      │ round-trip."                                    │
├────┼──────────────────────┼─────────────────────────────────────────────────┤
│ 3  │ Click 'पात्रता जांचें' │ "We developed a 4-Tap Visual QuickPicker for    │
│    │ (Eligibility Modal)  │ citizens with limited literacy. Let us evaluate │
│    │                      │ a 42-year-old female rural small-holder farmer."│
├────┼──────────────────────┼─────────────────────────────────────────────────┤
│ 4  │ Step through Wizard: │ "Step 1: Age 42, Gender Female. Step 2: State   │
│    │ Demographics -> Trade│ Maharashtra. Step 3: Income ₹60,000. Step 4:    │
│    │ -> Click Run Match   │ Farmer category. Now watch the match latency."  │
├────┼──────────────────────┼─────────────────────────────────────────────────┤
│ 5  │ View Recommendation  │ "In under 180ms, our Two-Stage Funnel eliminated│
│    │ Results Cards        │ 90% non-matching schemes in Stage 1 SQL and     │
│    │                      │ computed deterministic scores in Stage 2."      │
├────┼──────────────────────┼─────────────────────────────────────────────────┤
│ 6  │ Click Speaker Icon   │ "Our zero-cost Web Speech TTS synthesizes speech│
│    │ on Scheme Card       │ natively inside the browser in Marathi/Hindi,   │
│    │ (TTS Audio Playback) │ costing ₹0 compared to cloud TTS APIs."         │
├────┼──────────────────────┼─────────────────────────────────────────────────┤
│ 7  │ Click 'Export CSC    │ "For offline village access, one click generates│
│    │ Parchee' (पर्ची)     │ a thermal-printer compatible CSC slip with a    │
│    │                      │ dynamic QR code linking to the official portal."│
├────┼──────────────────────┼─────────────────────────────────────────────────┤
│ 8  │ Open Document Upload │ "Our in-memory OpenCV + Tesseract pipeline parses│
│    │ & drop sample card   │ Aadhaar/Ration card text with 0 bytes saved on  │
│    │                      │ disk, complying with the DPDP Act 2023."        │
└────┴──────────────────────┴─────────────────────────────────────────────────┘
```

---

### 5.2 Graceful Emergency Recovery (What if Something Goes Wrong?)

| Emergency Scenario | Immediate Action | Professional Recovery Statement |
| :--- | :--- | :--- |
| **Render Cloud Backend Freezes or Shows Cold-Start Timeout** | Switch immediately to local backend (`http://localhost:8000`) or showcase cached results. | *"Sir, as noted in our cloud architecture documentation, Render's free tier spins down idle instances. Our resilient Axios client has a 90s timeout with automatic 3x exponential backoff retry. While it wakes up, allow us to demonstrate the offline SQLite driver locally."* |
| **Wi-Fi / Internet Disconnects in Exam Hall** | Show that the frontend SPA remains interactive and demo the local SQLite database. | *"This actually demonstrates one of NagrikMitra's core design principles: offline resilience. Notice our local SQLite fallback driver and client-side cached schemes continue functioning without active internet."* |
| **Tesseract OCR Misrecognizes a Blurry Document** | Explain OCR confidence metrics and show the manual verification fallback. | *"Notice that the system displays an OCR confidence score of 62%. Because citizen welfare eligibility is critical, when confidence drops below 75%, our UI deliberately prompts the user for manual confirmation rather than silently guessing."* |

---

### 5.3 The 3-Step Rescue Formula for Unknown Questions

If the examiner asks a question you do not know the immediate answer to, **NEVER guess, panic, or remain completely silent.** Use this 3-step professional engineering response:

1. **Step 1 (Acknowledge & Validate):**  
   *"That is an insightful architectural question, Sir/Madam."*
2. **Step 2 (Anchor to What You DO Know):**  
   *"In our current implementation, we approached this by [mention the closest related component, e.g., our Two-Stage recommendation funnel or our SQLAlchemy data model]..."*
3. **Step 3 (Reason from First Principles & Propose Future Work):**  
   *"While we haven't benchmarked that specific edge condition in production, from a systems design perspective, we would implement it using [e.g., Redis caching / asynchronous Celery queue workers]. We have documented this exact extension in our Future Scope section."*

---

### 5.4 Examiner Psychology & Professional Team Coordination Rules

1. **Rule of Team Unity:** Never contradict a teammate in front of the external examiner. If a teammate gives an incomplete answer, wait for them to finish, then politely add: *"To add to my teammate's point, from a backend perspective..."*
2. **Body Language:** Stand or sit upright. Maintain direct, respectful eye contact with the external examiner. Do not look down at the floor or fidget with laptops.
3. **Answer Brevity:** Answer the exact question asked in 2-3 concise sentences first, then pause. If the examiner wants elaboration, they will ask. Do not ramble.
4. **Code Confidence:** When asked *"Show me your code,"* navigate calmly to the exact file (`recommendation.py`, `rag_service.py`, `client.js`) without searching or hesitating.
"""

print("Part V Strategy defined successfully.")
