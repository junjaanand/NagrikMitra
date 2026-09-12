import React from 'react';
import { ShieldCheck, Phone, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white relative">
      {/* Tricolor Accent Top Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Nagrik<span className="text-emerald-400">Mitra</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                नागरिक मित्र
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An intelligent, deterministic welfare discovery and document assistance system.
              Empowering citizens across 37 Indian States and Union Territories with instant, zero-hallucination
              scheme eligibility.
            </p>

            <div className="text-[11px] text-slate-500">
              Developed under the Open Source Initiative. Sourced from Digital India (MeitY) & National Portal of India.
            </div>
          </div>

          {/* Col 3: Essential Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              National Helplines
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Welfare Schemes: <strong>14443</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kisan Call Center: <strong>1800-180-1551</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Women Helpline: <strong>181</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ayushman Bharat: <strong>14555</strong></span>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Official Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1">
                  <span>myScheme Portal</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1">
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1">
                  <span>Open Government Data</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://uidai.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1">
                  <span>UIDAI Aadhaar Portal</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Institutional */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Project Info
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Final Year Capstone 2026</li>
              <li>Department of CSE</li>
              <li>Academic License: CC BY 4.0</li>
              <li className="text-emerald-400 font-semibold">100% Free for Citizens</li>
            </ul>
          </div>

        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NagrikMitra (नागरिक मित्र). All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Digital India
          </p>
        </div>
      </div>
    </footer>
  );
}
