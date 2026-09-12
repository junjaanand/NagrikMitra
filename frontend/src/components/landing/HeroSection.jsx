import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Mic, Camera, ArrowRight, Shield, Award } from 'lucide-react';

export default function HeroSection({ onCheckEligibility, onOpenChat, onOpenScanner }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/60 via-amber-50/40 to-blue-50/60 blur-3xl rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-2xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Live Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-800"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>🇮🇳 Digital India Welfare Engine</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">4,693 Verified Schemes</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]"
            >
              Discover Government Schemes{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 bg-clip-text text-transparent">
                You Truly Deserve.
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl"
            >
              India offers over 4,700 central and state welfare programs. NagrikMitra's deterministic
              AI rule engine evaluates your age, income, caste, state, and occupation in under 60ms—with
              <strong className="text-slate-800 font-semibold"> zero hallucinations</strong>, bilingual voice assistance in Hindi & English, and live document scanning.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              {/* Primary CTA */}
              <button
                onClick={onCheckEligibility}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Check Your Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Hindi Voice CTA */}
              <button
                onClick={onOpenChat}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>हिंदी में पूछें (Voice Chat)</span>
              </button>

              {/* Camera OCR CTA */}
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-sm transition-all cursor-pointer"
                title="Scan Aadhaar or PAN card"
              >
                <Camera className="w-4 h-4 text-slate-600" />
                <span>Scan ID Card</span>
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Rule Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Official myScheme Sourced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Free & Open Source</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Card Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Card Mockup Container */}
            <div className="relative rounded-3xl p-6 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Live Eligibility Snapshot</h3>
                    <p className="text-[11px] text-slate-500">Citizen Profile: Farmer • UP • BPL</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  552 Matched
                </span>
              </div>

              {/* Sample Matched Schemes List */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">PM-KISAN Samman Nidhi</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-medium">Central</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">₹6,000 / year direct income support</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    100% Match
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">Krishak Durghatna Kalyan</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">Uttar Pradesh</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Up to ₹5,00,000 accidental assistance</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    100% Match
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">PM Awas Yojana (Gramin)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-medium">Rural</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">₹1,20,000 housing construction subsidy</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    100% Match
                  </span>
                </div>
              </div>

              {/* Estimated Benefit Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md shadow-emerald-700/20">
                <div>
                  <p className="text-[11px] font-medium text-emerald-100">Total Potential Benefit</p>
                  <p className="text-xl font-extrabold tracking-tight">₹6,26,000+</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">
                    Calculated in 59ms
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative Floating Pill */}
            <div className="absolute -bottom-4 -left-4 bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Rule Engine Precision</p>
                <p className="text-xs font-bold text-slate-800">Zero Hallucination Guaranteed</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
