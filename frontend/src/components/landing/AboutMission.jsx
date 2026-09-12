import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart, Eye, ArrowUpRight, Zap, CheckCircle2, XCircle } from 'lucide-react';

export default function AboutMission() {
  return (
    <section id="about" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            Our Purpose & Philosophy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bridging India's Welfare Awareness Gap
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Every year, thousands of crores in welfare funds lapse unspent not because of lack of
            programs, but because eligible citizens simply do not know they qualify.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              From Bureaucratic Maze to Instant Citizen Empowerment
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              India has created world-class social safety nets—from PM-KISAN and Ayushman Bharat to
              state-specific minority education scholarships. However, a rural farmer or daily-wage
              artisan faces fragmented government websites, complex gazette notifications, and
              unclear eligibility conditions.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              <strong className="text-slate-800">NagrikMitra (नागरिक मित्र)</strong> was built on the
              principle of <em>Antyodaya</em>—uplifting the last citizen in the queue. By replacing
              convoluted manual searching with mathematical boolean matching, voice conversation, and
              OCR scanning, we turn complex administrative bureaucracy into a single click.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-2xl font-black text-emerald-600">59ms</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">Rule Engine Latency</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-2xl font-black text-emerald-600">0%</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">AI Hallucination</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-2xl font-black text-emerald-600">37</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">States/UTs Covered</div>
              </div>
            </div>
          </div>

          {/* Comparison Table: The Old Way vs NagrikMitra */}
          <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200/90 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              The Evolution of Welfare Discovery
            </h4>

            {/* Old Way */}
            <div className="p-4 rounded-xl bg-white border border-rose-100 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <XCircle className="w-4 h-4" />
                <span>The Traditional Struggle</span>
              </div>
              <ul className="text-xs text-slate-500 space-y-1.5 pl-6 list-disc">
                <li>Navigating 50+ separate Central and State ministry websites</li>
                <li>Deciphering 30-page complex legal circulars in English only</li>
                <li>Multiple office visits rejected due to missing paperwork</li>
              </ul>
            </div>

            {/* NagrikMitra Way */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>The NagrikMitra Experience</span>
              </div>
              <ul className="text-xs text-emerald-900 space-y-1.5 pl-6 list-disc font-medium">
                <li>Unified search across all 4,693 central and state schemes</li>
                <li>Spoken Hindi & English voice assistant accessible to all literacy levels</li>
                <li>Camera document OCR pre-fills your profile in seconds</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
