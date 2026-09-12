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
} from 'lucide-react';

const TECH_CATEGORIES = [
  {
    category: 'Frontend & UI',
    icon: Code2,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    techs: [
      { name: 'React 18', role: 'Component hierarchy & concurrent UI' },
      { name: 'Vite', role: 'Sub-second bundling & HMR' },
      { name: 'Tailwind CSS', role: 'Civic design system & responsive layout' },
      { name: 'Framer Motion', role: 'Typewriter animations & spring physics' },
      { name: 'Recharts', role: 'SVG category & benefit analytics' },
    ],
  },
  {
    category: 'Backend & High-Speed Logic',
    icon: Server,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    techs: [
      { name: 'FastAPI (Python 3.11)', role: 'Asynchronous REST APIs with OpenAPI docs' },
      { name: 'Deterministic Rule Engine', role: 'Pure boolean matching in 59ms' },
      { name: 'Pydantic v2', role: 'Strict statutory schema validation' },
      { name: 'Uvicorn ASGI', role: 'High-concurrency server execution' },
    ],
  },
  {
    category: 'Database & Vector Store',
    icon: Database,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    techs: [
      { name: 'SQLite 3 (B-Tree)', role: '4,693 schemes with 6 composite indexes' },
      { name: 'ChromaDB', role: 'Persistent semantic vector embeddings' },
      { name: 'all-MiniLM-L6-v2', role: 'ONNX neural dense vector representations' },
    ],
  },
  {
    category: 'AI, Vision & Cloud Auth',
    icon: BrainCircuit,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    techs: [
      { name: 'Groq (Llama 3.3 70B)', role: 'Primary ultra-fast conversational LLM' },
      { name: 'Google Gemini 1.5 Flash', role: 'Secondary bilingual multilingual fallback' },
      { name: 'Tesseract 5.0 OCR', role: 'Aadhaar & PAN neural text extraction' },
      { name: 'Supabase (PostgreSQL)', role: 'Google OAuth & citizen profile persistence' },
    ],
  },
];

export default function TechStackGrid() {
  return (
    <section id="tech-stack" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Modern Engineering Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Enterprise Full-Stack Technology Suite
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Built with zero vendor lock-in. A hybrid high-performance stack combining low-latency local
            databases, neural computer vision, and cloud authentication.
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
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{cat.category}</h3>
                  </div>

                  <div className="space-y-3">
                    {cat.techs.map((tech) => (
                      <div key={tech.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs font-bold text-slate-900">{tech.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{tech.role}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center justify-between">
                  <span>Verified Operational</span>
                  <span>✓</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
