import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Server,
  Database,
  BrainCircuit,
  Eye,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Cpu
} from 'lucide-react';

const TECH_CATEGORIES = [
  {
    category: 'Frontend & Vernacular UI',
    icon: Code2,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    highlight: 'React 19 + 4-Language i18n',
    metric: '1.61s Build & HMR',
    techs: [
      { name: 'React 19 & Vite 8', role: 'Concurrent rendering hierarchy with sub-second HMR' },
      { name: 'react-i18next Vernacular Engine', role: 'Runtime language switching (EN, HI, MR, TA) with dual-layer caching' },
      { name: 'Web Speech API & Audio TTS', role: 'Native speech synthesis ([🔊 सुनिए]) for semi-literate accessibility' },
      { name: 'Tailwind CSS & Framer Motion', role: 'Responsive civic design system with glassmorphic physics' },
      { name: 'HTML5 Canvas Kendra Slip Engine', role: 'Instant printable token & QR code generation for CSC kiosks' },
    ],
  },
  {
    category: 'Backend & Recommendation Funnel',
    icon: Server,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    highlight: 'Two-Stage Funnel Engine',
    metric: '42ms Execution Speed',
    techs: [
      { name: 'FastAPI (Python 3.11 ASGI)', role: 'Asynchronous REST APIs with OpenAPI 3.1 docs and connection pooling' },
      { name: 'Two-Stage Funnel Matcher', role: 'Sub-15ms SQL macro-filtering + progressive AST micro-criteria evaluation' },
      { name: 'Statutory Policy Reliever', role: 'Indian reservation relaxations (+5y SC/ST, +3y OBC, +10y PwD) & 10% income buffer' },
      { name: 'Ration Card Proxy Engine (Φration)', role: 'Bypasses income certificate barrier via Yellow, Orange, White card proxies' },
      { name: 'NIC Lifecycle Auditor & Sync', role: 'Non-blocking async probe detecting 10+ umbrella program mergers' },
    ],
  },
  {
    category: 'Cloud Database & pgvector RAG',
    icon: Database,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    highlight: 'PostgreSQL 17 + HNSW',
    metric: '4,728 Schemes Vectorized',
    techs: [
      { name: 'Supabase Cloud PostgreSQL 17', role: 'Managed enterprise relational database with pooled SSL connections' },
      { name: 'Native pgvector Extension', role: '4,728 schemes indexed with HNSW (idx_scheme_embeddings_hnsw)' },
      { name: 'Hybrid Vector Search RPC', role: 'match_schemes_hybrid unblocking state & central programs in <45ms' },
      { name: 'Vernacular Devanagari Normalizer', role: 'Canonicalizes Hindi/Marathi queries (e.g. पीएम किसान → PM-KISAN)' },
      { name: 'Row-Level Security (RLS)', role: 'Cryptographically scoped tenant & citizen bookmark privacy' },
    ],
  },
  {
    category: 'AI, Indic Vision & DPDP Privacy',
    icon: BrainCircuit,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    highlight: 'DPDP Zero-Retention + Indic OCR',
    metric: '100% PII Masked (UID/PAN)',
    techs: [
      { name: 'Linux Tesseract 5.5 Indic OCR', role: 'Dual-pass PSM 3/11 engine for Hindi, Marathi & English ID text' },
      { name: 'Headless OpenCV (CLAHE)', role: 'Contrast-limited adaptive histogram equalization & binarization' },
      { name: 'DPDP Act 2023 Memory Zeroization', role: 'Ephemeral bytearray zero-retention (0x00 memory wipe) with UID masking' },
      { name: 'Multi-Tier Conversational LLM', role: 'Groq Llama 3.3 70B primary with Google Gemini 1.5 Flash fallback' },
      { name: 'HMAC-SHA256 JWT Security Guard', role: 'Cryptographic signature verification with silent 401 session renewal' },
    ],
  },
];

export default function TechStackGrid() {
  return (
    <section id="tech-stack" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1.5 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Production Cloud Architecture (10 Phases Verified)
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Enterprise Full-Stack Technology Suite
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Built with zero vendor lock-in. A production-verified hybrid cloud topology combining
            Supabase PostgreSQL 17, native <code className="text-xs bg-slate-200/80 px-1.5 py-0.5 rounded font-mono text-purple-700 font-bold">pgvector</code> HNSW semantic search, 
            DPDP-compliant Indic computer vision, and bilingual Web Speech assistance.
          </p>
        </div>

        {/* 4 Architectural Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TECH_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-800">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {cat.metric}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-1">{cat.category}</h3>
                  <div className="text-[11px] font-bold text-emerald-700 mb-4">{cat.highlight}</div>

                  {/* Technology List */}
                  <div className="space-y-2.5">
                    {cat.techs.map((tech) => (
                      <div key={tech.name} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="text-xs font-black text-slate-900">{tech.name}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{tech.role}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Metric Badge */}
                <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Operational</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
