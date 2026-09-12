import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Cpu, CheckCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Enter Profile or Scan Document',
    description:
      'Fill a quick 1-minute profile form (age, state, income, caste) or snap a photo of your Aadhaar/PAN card to auto-populate all fields via OCR.',
    icon: FileText,
    badge: 'Quick & Private',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    step: '02',
    title: 'Deterministic AI Rule Engine Evaluates',
    description:
      'Our mathematical rule engine evaluates all 9 demographic constraints across 4,693 central and state welfare initiatives in under 60 milliseconds.',
    icon: Cpu,
    badge: 'Zero Hallucination',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    step: '03',
    title: 'Get Matched Schemes & Document Checklist',
    description:
      'Access tailored scheme dossiers, track your Document Readiness Index (e.g., 4/5 documents ready), and get direct links to official government portals.',
    icon: CheckCheck,
    badge: 'Actionable Guidance',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How NagrikMitra Works For Every Citizen
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Eliminating bureaucratic complexity. From identity verification to official application
            submission in three effortless steps.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative rounded-2xl p-7 bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 transition-all group"
              >
                {/* Step Number Top-Right */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-900 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-300 group-hover:text-emerald-500/40 transition-colors">
                    {item.step}
                  </span>
                </div>

                {/* Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2.5 leading-snug">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
