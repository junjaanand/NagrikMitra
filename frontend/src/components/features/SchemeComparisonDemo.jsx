import React, { useState } from 'react';
import { GitCompare, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';

const COMPARED_SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    state: 'Central Govt',
    benefit: '₹6,000 / year (₹2,000 every 4 months directly into bank)',
    benefitAmount: '₹6,000 / yr',
    ageLimit: '18 - 100 Years',
    incomeCap: 'No Cap (Cultivable land ownership required)',
    documents: 'Aadhaar, Land Ownership Records (Khasra/Khatauni), Bank Passbook',
    docCount: 3,
    applicationMode: 'Online PM-KISAN Portal / Common Service Center (CSC)',
    frequency: '3 Times / Year',
  },
  {
    id: 'pm-sym',
    name: 'PM Shram Yogi Maandhan (PM-SYM)',
    ministry: 'Ministry of Labour and Employment',
    state: 'Central Govt',
    benefit: 'Assured minimum pension of ₹3,000 / month after age 60',
    benefitAmount: '₹36,000 / yr',
    ageLimit: '18 - 40 Years Entry Age',
    incomeCap: 'Monthly income ≤ ₹15,000',
    documents: 'Aadhaar Card, Jan Dhan Savings Bank Account / IFSC',
    docCount: 2,
    applicationMode: 'Enrolment through nearest Village CSC Kiosk',
    frequency: 'Monthly Pension',
  },
];

export default function SchemeComparisonDemo({ onOpenDashboard }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-flex items-center gap-1.5">
            <GitCompare className="w-3.5 h-3.5" />
            Decision Support Matrix Sandbox
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            Multi-Scheme Side-by-Side Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Contrasts statutory benefits, criteria, and documentation to pick the optimal welfare program.
          </p>
        </div>

        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>Compare in Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Synchronized Comparison Grid */}
      <div className="py-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-3.5 bg-slate-100/70 font-bold text-slate-600 rounded-l-xl w-1/4">
                Attribute / Feature
              </th>
              {COMPARED_SCHEMES.map((s, idx) => (
                <th
                  key={s.id}
                  className={`p-3.5 font-extrabold text-slate-900 w-3/8 ${
                    idx === 0 ? 'bg-emerald-50/70 text-emerald-950 border-r border-slate-200' : 'bg-blue-50/70 text-blue-950 rounded-r-xl'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Scheme #{idx + 1} ({s.state})
                  </span>
                  <span className="text-sm font-bold block mt-0.5">{s.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-3.5 font-bold text-slate-700">Financial Entitlement</td>
              {COMPARED_SCHEMES.map((s) => (
                <td key={s.id} className="p-3.5 font-semibold text-slate-900">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs mb-1">
                    {s.benefitAmount}
                  </span>
                  <span className="block text-slate-600 text-[11px] leading-relaxed">
                    {s.benefit}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3.5 font-bold text-slate-700">Statutory Age Bracket</td>
              {COMPARED_SCHEMES.map((s) => (
                <td key={s.id} className="p-3.5 font-semibold text-slate-800">
                  {s.ageLimit}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3.5 font-bold text-slate-700">Income Ceiling</td>
              {COMPARED_SCHEMES.map((s) => (
                <td key={s.id} className="p-3.5 font-semibold text-slate-800">
                  {s.incomeCap}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3.5 font-bold text-slate-700">Paperwork Overhead</td>
              {COMPARED_SCHEMES.map((s) => (
                <td key={s.id} className="p-3.5 text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">
                    {s.docCount} Mandatory Documents:
                  </span>
                  <span className="text-[11px] text-slate-600 leading-relaxed block">
                    {s.documents}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3.5 font-bold text-slate-700">Application Mode</td>
              {COMPARED_SCHEMES.map((s) => (
                <td key={s.id} className="p-3.5 font-semibold text-slate-800">
                  {s.applicationMode}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3.5 font-bold text-slate-700">Disbursement Cycle</td>
              {COMPARED_SCHEMES.map((s) => (
                <td key={s.id} className="p-3.5 font-bold text-emerald-700">
                  {s.frequency}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
