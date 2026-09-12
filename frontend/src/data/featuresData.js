import {
  Target,
  Mic,
  Camera,
  BarChart3,
  GitCompare,
  FileCheck2,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Database,
  Search,
} from 'lucide-react';

export const FEATURES_DATA = {
  'deterministic-matcher': {
    id: 'deterministic-matcher',
    title: 'Deterministic Eligibility Matcher',
    hindi: 'सटीक पात्रता मिलान इंजन',
    tag: 'Rule Engine',
    subTag: 'SQLite B-Tree + Conjunctive Boolean Evaluator',
    color: 'emerald',
    icon: Target,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary:
      'A high-performance algorithmic evaluator that parses 9 statutory demographic constraints against 4,693 government welfare schemes in under 60 milliseconds with zero AI hallucinations.',
    problemStatement:
      'Conventional portals either force citizens to manually parse hundreds of ambiguous PDF guidelines, or use probabilistic LLMs that frequently hallucinate non-existent welfare schemes, invent bogus eligibility criteria, and misinform vulnerable rural citizens.',
    solutionOverview:
      'NagrikMitra implements a pure deterministic boolean filter engine written in Python 3.12, utilizing indexed SQLite tables. By mathematically enforcing conjunctive normal form (CNF) constraints on statutory criteria, it produces 100% legally grounded eligibility decisions with provable auditability.',
    benchmarks: [
      { label: 'Evaluation Latency', value: '< 60 ms', note: 'Over 4,693 schemes' },
      { label: 'AI Hallucination Rate', value: '0.00%', note: 'Pure deterministic logic' },
      { label: 'Statutory Constraints', value: '9 Factors', note: 'Age, Caste, Income, etc.' },
      { label: 'Database Breadth', value: '4,693 Schemes', note: 'Central + 37 States/UTs' },
    ],
    technicalHighlights: [
      {
        title: 'B-Tree Multi-Column Indexing',
        desc: 'Pre-indexed columns on (state, category, eligibility_gender, eligibility_bpl, eligibility_disability) eliminate full table scans.',
      },
      {
        title: 'Universal Fallback Relaxation',
        desc: 'Correctly matches schemes open to universal applicants (e.g., NULL or 0-100 age bounds, all castes, or universal income limits).',
      },
      {
        title: 'Relevance Scoring Heuristic',
        desc: 'Ranks matched results prioritizing Central flagship schemes, high subsidy yields, and demographic specificity.',
      },
      {
        title: 'Instant Pre-Filtering',
        desc: 'Zero memory overhead: streams query results directly into Pydantic models for immediate client response.',
      },
    ],
    parametersEvaluated: [
      { name: 'Age Bounds', desc: 'Validates Min/Max statutory age restrictions (e.g. 18-40 for youth, 60+ for pensions)' },
      { name: 'Gender Identity', desc: 'Filters Male, Female, or Transgender specific initiatives (448 women-targeted schemes)' },
      { name: 'Jurisdiction Domicile', desc: 'Cross-references citizen state against Central schemes and 37 State/UT welfare boards' },
      { name: 'Area of Residence', desc: 'Differentiates Rural (गाँव / ग्राम पंचायत) and Urban (शहरी / नगर पालिका) subsidies' },
      { name: 'Caste & Social Class', desc: 'Applies statutory reservations for General, OBC, SC, ST, and minority funds' },
      { name: 'Annual Household Income', desc: 'Enforces statutory income caps (e.g., ₹1.5L, ₹2.5L, or ₹8L for EWS)' },
      { name: 'BPL Card Status', desc: 'Unlocks 157+ targeted Antyodaya Anna and extreme-poverty support schemes' },
      { name: 'Disability (PwD)', desc: 'Activates 308+ specialized assistive devices, pensions, and conveyance allowances' },
      { name: 'Occupational Sector', desc: 'Matches farmer, artisan, student, construction laborer, or MSME trades' },
    ],
    architectureSteps: [
      'Citizen inputs profile via 4-Stage Wizard, Profile Ribbon, or OCR scan.',
      'FastAPI receives JSON payload at POST /api/eligibility/match and validates via Pydantic.',
      'Rule engine executes SQL parameterized boolean query with conjunctive predicates.',
      'Relevance scoring algorithm assigns priority weights and formats match rationale.',
      'Client receives filtered scheme list with specific qualification tags in under 60ms.',
    ],
    interactiveType: 'matcher',
  },

  'multilingual-voice': {
    id: 'multilingual-voice',
    title: 'Multilingual Voice Assistant',
    hindi: 'हिंदी और अंग्रेजी वॉयस चैट सहायक',
    tag: 'Web Speech API',
    subTag: 'Groq Llama 3.3 70B + Gemini 1.5 Flash + ChromaDB RAG',
    color: 'rose',
    icon: Mic,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    summary:
      'A bilingual conversational AI assistant supporting spoken and typed queries in Hindi and English, combining dense vector retrieval with a multi-tier fallback LLM pipeline.',
    problemStatement:
      'Over 65% of rural Indian citizens face English literacy barriers or struggle to navigate complex bureaucratic jargon. Meanwhile, standard LLM chat interfaces hit API rate limits or generate responses ungrounded in actual welfare policies.',
    solutionOverview:
      'NagrikMitra pairs the browser-native Web Speech API with an ultra-fast multi-tier LLM architecture (Primary: Groq Llama 3.3 70B for 300+ token/s streaming; Secondary: Google Gemini 1.5 Flash; Tertiary: Local Grounded Synthesizer). ChromaDB dense vector retrieval grounds every response with actual scheme provisions.',
    benchmarks: [
      { label: 'Speech Recognition', value: 'Zero Latency', note: 'Browser-native Web Speech API' },
      { label: 'LLM Inference Speed', value: '300+ tok/s', note: 'Groq LPU hardware acceleration' },
      { label: 'Fallback Redundancy', value: '3 Tiers', note: 'Groq → Gemini → Local Grounded' },
      { label: 'Vector Knowledge Base', value: 'ChromaDB', note: '150+ dense embeddings of schemes' },
    ],
    technicalHighlights: [
      {
        title: 'Bilingual Speech-to-Text',
        desc: 'Supports Hindi (hi-IN) and Indian English (en-IN) directly via webkitSpeechRecognition without paid audio API overhead.',
      },
      {
        title: 'Dense RAG Augmentation',
        desc: 'Retrieves top-3 semantically similar scheme dossiers from ChromaDB and injects them as statutory context into the LLM system prompt.',
      },
      {
        title: 'Regex & LLM Slot Extraction',
        desc: 'Parses casual citizen statements like "मैं 45 साल का किसान हूँ" into structured JSON demographic profiles: {age: 45, occupation: "farmer"}.',
      },
      {
        title: 'Rate-Limit Immune Fallback',
        desc: 'Automatically rolls over to Google Gemini 1.5 Flash or local template synthesizer if primary provider quota is exceeded.',
      },
    ],
    parametersEvaluated: [
      { name: 'Spoken Hindi (Devanagari)', desc: 'Natural Devanagari transcription for rural dialect phrases' },
      { name: 'Indian English Accents', desc: 'Trained speech models handling diverse regional cadences' },
      { name: 'Query Intent Classification', desc: 'Disambiguates between scheme inquiry, eligibility check, and document requirements' },
      { name: 'Source Grounding', desc: 'Every answer explicitly quotes official guidelines and official URLs' },
    ],
    architectureSteps: [
      'Citizen clicks microphone icon and speaks query in Hindi or English.',
      'Web Speech API converts acoustic audio stream into UTF-8 text transcript.',
      'Backend receives message and queries ChromaDB persistent collection for semantically relevant schemes.',
      'Groq Llama 3.3 70B (or Gemini fallback) synthesizes an empathetic, grounded answer with source citations.',
      'Browser SpeechSynthesis reads the response aloud to illiterate citizens.',
    ],
    interactiveType: 'voice',
  },

  'document-scanner': {
    id: 'document-scanner',
    title: 'Live Camera Document Scanner',
    hindi: 'लाइव कैमरा दस्तावेज़ स्कैनर',
    tag: 'Tesseract 5.0 OCR',
    subTag: 'OpenCV Preprocessing + Aadhaar / PAN Neural Parsing',
    color: 'blue',
    icon: Camera,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    summary:
      'Computer vision and optical character recognition pipeline that extracts demographic parameters from Aadhaar and PAN cards via live camera feed or image upload.',
    problemStatement:
      'Entering manual demographic data (DOB, State, UID) is prone to typing errors, particularly on mobile phones by citizens with limited digital literacy. Mistakes lead to disqualified welfare applications.',
    solutionOverview:
      'NagrikMitra leverages WebRTC camera capture (`getUserMedia`) and HTML5 canvas streaming to send frames to a high-speed Tesseract 5.0 OCR engine. OpenCV image enhancement removes shadows, adjusts contrast, and binarizes text before regex extraction.',
    benchmarks: [
      { label: 'OCR Processing Time', value: '450 - 900 ms', note: 'Full image enhancement + parse' },
      { label: 'UID Masking Security', value: '100% Redaction', note: 'Only last 4 digits stored' },
      { label: 'OCR Engine', value: 'Tesseract 5.0', note: 'LSTM Neural Network' },
      { label: 'Input Channels', value: 'Camera & Upload', note: 'Live WebRTC frame + File drag-and-drop' },
    ],
    technicalHighlights: [
      {
        title: 'OpenCV Adaptive Thresholding',
        desc: 'Applies grayscale binarization and morphological transformations to handle glare and uneven lighting on laminated physical cards.',
      },
      {
        title: 'Aadhaar 12-Digit Regex Parsing',
        desc: 'Detects standard 12-digit UID patterns, masks the first 8 digits for privacy compliance (XXXX-XXXX-1234), and extracts DOB and Gender.',
      },
      {
        title: 'PAN Card Verification',
        desc: 'Extracts 10-character alphanumeric Income Tax Permanent Account Numbers ([A-Z]{5}[0-9]{4}[A-Z]{1}) and applicant birth year.',
      },
      {
        title: 'One-Click Profile Injection',
        desc: 'Extracted attributes automatically populate the Profile Ribbon and trigger deterministic matching in the rule engine.',
      },
    ],
    parametersEvaluated: [
      { name: '12-Digit Aadhaar UID', desc: 'Securely parsed and masked for compliance with UIDAI guidelines' },
      { name: 'Date of Birth (DOB)', desc: 'Automatically calculates current citizen age in years' },
      { name: 'Gender Annotation', desc: 'Extracts Male, Female, or Transgender markers' },
      { name: 'Domicile State', desc: 'Extracts state of residence from address text on back of card' },
    ],
    architectureSteps: [
      'Citizen captures card photo via live webcam/mobile camera or uploads JPEG/PNG.',
      'Frontend converts frame to base64 or multipart/form-data and sends to POST /api/ocr/scan-file.',
      'Backend OpenCV pipeline applies grayscale, Gaussian blur, and Otsu binarization.',
      'Tesseract 5.0 neural model reads character streams in English and Hindi.',
      'Regex state machine extracts DOB, Gender, and masked UID, returning structured JSON to pre-fill profile.',
    ],
    interactiveType: 'scanner',
  },

  'visual-analytics': {
    id: 'visual-analytics',
    title: 'Visual Analytics Dashboard',
    hindi: 'दृश्य विश्लेषिकी डैशबोर्ड',
    tag: 'Recharts SVG',
    subTag: 'Interactive Sector Breakdown, Central vs State & Benefit Tallies',
    color: 'purple',
    icon: BarChart3,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    summary:
      'Dynamic graphical visualization suite transforming 4,693 scheme records into interactive sector charts, financial benefit distributions, and demographic allocation breakdowns.',
    problemStatement:
      'Citizens and civil service administrators cannot easily comprehend the macro distribution of welfare spending, leading to under-utilized state funds and lack of awareness about high-subsidy sectors.',
    solutionOverview:
      'NagrikMitra integrates Recharts SVG visualization components into the Citizen Dashboard, rendering instant visual breakdowns of eligible schemes across 20 distinct categories, 37 States vs Central funds, and potential annual monetary entitlements.',
    benchmarks: [
      { label: 'Render Engine', value: 'Recharts SVG', note: 'Hardware-accelerated vector rendering' },
      { label: 'Database Aggregation', value: '< 20 ms', note: 'Fast SQL GROUP BY & COUNT aggregates' },
      { label: 'Top Categories Tracked', value: '280 Sub-sectors', note: 'Agriculture, Health, Education, etc.' },
      { label: 'Central vs State Ratio', value: '684 / 4,009', note: 'Flagship vs Regional coverage' },
    ],
    technicalHighlights: [
      {
        title: 'Category Distribution Donut Chart',
        desc: 'Visualizes the concentration of schemes across Agriculture, Education, Women & Child, Health, and Social Welfare.',
      },
      {
        title: 'State vs Central Allocation Bar Chart',
        desc: 'Compares federal initiatives (684 schemes) with state-specific initiatives (4,009 schemes) across India.',
      },
      {
        title: 'Potential Financial Benefit Metrics',
        desc: 'Aggregates direct benefit transfers (DBT) and equipment subsidies, illustrating total reachable annual welfare value.',
      },
      {
        title: 'Responsive Vector Viewports',
        desc: 'Charts adapt seamlessly from ultra-wide desktop monitors down to mobile smartphone viewports.',
      },
    ],
    parametersEvaluated: [
      { name: 'Agriculture & Rural Welfare', desc: 'Direct farmer subsidies, seed assistance, and crop insurance funds' },
      { name: 'Education & Learning', desc: 'Pre-matric, post-matric scholarships, and skill development stipends' },
      { name: 'Women & Child Development', desc: 'Maternity assistance, girl child protection, and SHG credit subsidies' },
      { name: 'Health & Wellness', desc: 'Ayushman Bharat hospitalization and free generic medicine dispensaries' },
    ],
    architectureSteps: [
      'Dashboard loads aggregate metadata from GET /api/schemes/meta/stats.',
      'Recharts processes category counts and financial ranges into SVG coordinate models.',
      'Interactive tooltips render upon mouse hover with localized subsidy summaries.',
      'Clicking a slice filters the scheme explorer to that specific sector.',
    ],
    interactiveType: 'analytics',
  },

  'scheme-comparison': {
    id: 'scheme-comparison',
    title: 'Side-by-Side Scheme Comparison',
    hindi: 'योजनाओं की तुलनात्मक तालिका',
    tag: 'Decision Support',
    subTag: 'Multi-Scheme Contrast Matrix across Subsidies, Criteria & Paperwork',
    color: 'amber',
    icon: GitCompare,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    summary:
      'Decision-support matrix allowing citizens to select 2 to 4 competing welfare schemes and compare their benefits, age limits, income caps, and paperwork side by side.',
    problemStatement:
      'Citizens often face multiple overlapping schemes (e.g. PM-KISAN vs State Rythu Bandhu vs PM-KMY pension) and do not know which offers greater financial value or simpler paperwork requirements.',
    solutionOverview:
      'NagrikMitra offers a structured multi-column comparison matrix that aligns statutory constraints, subsidy payout frequencies, required certificates, and application URLs in a side-by-side decision grid.',
    benchmarks: [
      { label: 'Concurrent Comparisons', value: 'Up to 4 Schemes', note: 'Side-by-side synchronized view' },
      { label: 'Comparison Attributes', value: '8 Dimensions', note: 'Subsidy, Criteria, Documents, Process' },
      { label: 'Matrix Render Speed', value: '< 5 ms', note: 'Instantaneous client-side evaluation' },
      { label: 'CSC Export Format', value: 'Printable Dossier', note: 'Ready for physical village kiosk review' },
    ],
    technicalHighlights: [
      {
        title: 'Synchronized Attribute Alignment',
        desc: 'Aligns financial benefits, age bounds, caste restrictions, and income ceilings row by row for rapid evaluation.',
      },
      {
        title: 'Discrepancy Highlighting',
        desc: 'Visually highlights which scheme provides higher financial subsidies or requires fewer prerequisite certificates.',
      },
      {
        title: 'One-Click Selection & Swap',
        desc: 'Easily swap schemes in and out of the matrix directly from search results or the saved bookmarks drawer.',
      },
      {
        title: 'Application Process Comparison',
        desc: 'Contrasts online portal procedures with physical Common Service Center (CSC) / Panchayat offline submission routes.',
      },
    ],
    parametersEvaluated: [
      { name: 'Monetary Benefit Amount', desc: 'Direct benefit transfer payout or subsidy value per annum' },
      { name: 'Payout Frequency', desc: 'Monthly pension vs quarterly DBT installment vs one-time capital grant' },
      { name: 'Document Overhead', desc: 'Count of mandatory certificates required before application' },
      { name: 'Processing Authority', desc: 'Central Ministry vs District Collectorate vs Gram Panchayat' },
    ],
    architectureSteps: [
      'Citizen checks 2 to 4 schemes from the explorer or saved dossiers.',
      'Frontend fetches detailed attributes via getSchemeBySlug API for each selection.',
      'Comparison matrix engine normalizes fields into aligned comparative rows.',
      'User reviews differences in payout and documentation to select the optimal scheme.',
    ],
    interactiveType: 'comparison',
  },

  'document-readiness': {
    id: 'document-readiness',
    title: 'Document Readiness & QR Handoff',
    hindi: 'दस्तावेज़ तत्परता एवं क्यूआर हैंडऑफ',
    tag: 'Readiness Index',
    subTag: 'Offline QR Generation + Missing Certificate Alert Engine',
    color: 'teal',
    icon: FileCheck2,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    summary:
      'An intelligent readiness toolkit that calculates application readiness percentage (% Ready), alerts citizens of missing paperwork, and encodes dossiers into offline QR codes for Village CSC operators.',
    problemStatement:
      'Over 40% of citizen applications submitted at rural Common Service Centers (CSCs) or government offices are rejected due to missing certificates (e.g. lacking Domicile certificate, income declaration, or bank passbook copy), wasting time and money.',
    solutionOverview:
      'NagrikMitra parses the required documents for each scheme, presents a checkable readiness checklist with an animated progress meter, and generates an offline-scannable QR code encoding the citizen’s demographic profile and target schemes for instant kiosk handoff.',
    benchmarks: [
      { label: 'Readiness Calculation', value: 'Real-Time', note: 'Instant % score update on document check' },
      { label: 'QR Encoding Speed', value: '< 10 ms', note: 'Client-side qrcode.react vector generation' },
      { label: 'Offline Usability', value: '100% Offline', note: 'Scannable by any smartphone or CSC scanner' },
      { label: 'Rejection Prevention', value: 'Up to 90%', note: 'Alerts missing certificates before kiosk visits' },
    ],
    technicalHighlights: [
      {
        title: 'Dynamic Readiness Meter',
        desc: 'Calculates readiness percentage based on verified available documents vs mandatory requirements for the chosen scheme.',
      },
      {
        title: 'Missing Document Warning Flags',
        desc: 'Flags critical bottlenecks (e.g., "Caste Certificate missing - required for OBC scholarship") before visiting government offices.',
      },
      {
        title: 'Offline Compressed QR Code Generator',
        desc: 'Encodes citizen demographic summary and target scheme slugs into a dense QR code that village VLEs can scan without internet connectivity.',
      },
      {
        title: 'Printable Application Packet',
        desc: 'Generates a clean checklist format suitable for offline printing and physical filing at Taluk offices.',
      },
    ],
    parametersEvaluated: [
      { name: 'Aadhaar Card with Linked Mobile', desc: 'Prerequisite for DBT subsidies and e-KYC authentication' },
      { name: 'Active Bank Passbook', desc: 'Zero-balance PMJDY account details with IFSC code' },
      { name: 'Domicile / Residence Certificate', desc: 'Issued by Tehsildar or Sub-Divisional Magistrate' },
      { name: 'Income Certificate', desc: 'Recent revenue department certificate validating family income cap' },
      { name: 'Caste / Category Certificate', desc: 'Statutory proof for SC, ST, and OBC reservation subsidies' },
    ],
    architectureSteps: [
      'Citizen views scheme dossier and reviews extracted list of required documents.',
      'Citizen toggles checkboxes for certificates currently in their possession.',
      'Readiness algorithm computes readiness percentage (% Ready) and highlights missing documents.',
      'Citizen clicks "Generate Offline QR" to produce a scannable QR code containing application metadata for CSC VLEs.',
    ],
    interactiveType: 'readiness',
  },
};
