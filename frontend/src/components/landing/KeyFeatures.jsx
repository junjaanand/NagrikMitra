import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Mic,
  Camera,
  BarChart3,
  GitCompare,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  {
    id: 'deterministic-matcher',
    title: 'Deterministic Eligibility Matcher',
    hindi: 'सटीक पात्रता मिलान',
    description:
      'Evaluates 9 structured demographic constraints (age, state, caste, income, BPL, disability) across 4,693 schemes in under 60ms with zero AI hallucinations.',
    icon: Target,
    tag: 'Rule Engine',
    color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200/80',
  },
  {
    id: 'multilingual-voice',
    title: 'Multilingual Voice Assistant',
    hindi: 'हिंदी और अंग्रेजी वॉयस चैट',
    description:
      'Tap the mic and speak naturally in Hindi or English. Powered by Groq & Gemini with ChromaDB RAG to deliver accurate, source-grounded answers.',
    icon: Mic,
    tag: 'Web Speech API',
    color: 'from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-200/80',
  },
  {
    id: 'document-scanner',
    title: 'Live Camera Document Scanner',
    hindi: 'लाइव कैमरा दस्तावेज़ स्कैनर',
    description:
      'Point your camera at an Aadhaar or PAN card. Tesseract OCR instantly extracts your name, DOB, and state to auto-fill your eligibility profile.',
    icon: Camera,
    tag: 'Tesseract 5.0 OCR',
    color: 'from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-200/80',
  },
  {
    id: 'visual-analytics',
    title: 'Visual Analytics Dashboard',
    hindi: 'दृश्य विश्लेषिकी डैशबोर्ड',
    description:
      'Interactive Recharts graphs showcasing eligible scheme distribution by category, potential annual financial benefit tallies, and state coverage.',
    icon: BarChart3,
    tag: 'Recharts SVG',
    color: 'from-purple-500/10 to-purple-500/5 text-purple-600 border-purple-200/80',
  },
  {
    id: 'scheme-comparison',
    title: 'Side-by-Side Scheme Comparison',
    hindi: 'योजनाओं की तुलना',
    description:
      'Select multiple schemes to contrast subsidy amounts, eligibility criteria, application steps, and required paperwork in an intuitive matrix.',
    icon: GitCompare,
    tag: 'Decision Support',
    color: 'from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200/80',
  },
  {
    id: 'document-readiness',
    title: 'Document Readiness & QR Handoff',
    hindi: 'दस्तावेज़ तत्परता स्कोर',
    description:
      'Know before you visit the government office: tracks verified certificates, alerts missing paperwork, and generates offline QR codes for CSC visits.',
    icon: FileCheck2,
    tag: 'Readiness Index',
    color: 'from-teal-500/10 to-teal-500/5 text-teal-600 border-teal-200/80',
  },
];

export default function KeyFeatures({ onExploreFeature }) {
  return (
    <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Cutting-Edge Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered For Speed, Precision & Last-Mile Inclusivity
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Combining deterministic computer science with state-of-the-art generative AI and computer
            vision to create India's most capable welfare assistant.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {FEATURES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                onClick={() => onExploreFeature && onExploreFeature(item.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="rounded-2xl p-7 bg-white border border-slate-200/80 hover:border-emerald-400/80 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Top Bar: Icon + Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Hindi Tag */}
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs text-emerald-700 font-medium font-devanagari">
                      {item.hindi}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <span className="font-bold">Explore Feature</span>
                  <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
