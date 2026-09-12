import React, { useState } from 'react';
import { Camera, ShieldCheck, CheckCircle2, Lock, Eye, ScanLine, FileText, ArrowRight } from 'lucide-react';

export default function DocumentScannerDemo({ onOpenScanModal }) {
  const [docType, setDocType] = useState('aadhaar'); // 'aadhaar' or 'pan'

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Computer Vision & Neural OCR Sandbox
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            Automated Identity Extraction & Privacy Redaction
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulates optical character recognition and regex parsing over official Indian identity cards.
          </p>
        </div>

        {onOpenScanModal && (
          <button
            onClick={onOpenScanModal}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>Open Camera Scanner</span>
          </button>
        )}
      </div>

      {/* Document Selector */}
      <div className="flex items-center gap-3 py-5">
        <button
          onClick={() => setDocType('aadhaar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            docType === 'aadhaar'
              ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          🪪 Aadhaar Card (UIDAI Standard)
        </button>

        <button
          onClick={() => setDocType('pan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            docType === 'pan'
              ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          💳 PAN Card (Income Tax Dept)
        </button>
      </div>

      {/* Interactive Card Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual Simulated Card with Bounding Boxes */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-blue-300 relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-slate-300 mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
              {docType === 'aadhaar' ? 'GOVERNMENT OF INDIA • UIDAI' : 'INCOME TAX DEPARTMENT • GOVT OF INDIA'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active CV Bounding Boxes
            </span>
          </div>

          <div className="space-y-3">
            {/* Name Box */}
            <div className="p-2 rounded-lg bg-blue-50/90 border border-blue-400 relative">
              <span className="absolute -top-2 right-2 text-[9px] font-mono bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                CONF: 98.4%
              </span>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Name / नाम:</span>
              <span className="text-sm font-bold text-slate-900">
                {docType === 'aadhaar' ? 'RAMESH KUMAR YADAV' : 'RAMESH K YADAV'}
              </span>
            </div>

            {/* DOB & Gender Box */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg bg-blue-50/90 border border-blue-400 relative">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">DOB / जन्म तिथि:</span>
                <span className="text-sm font-bold text-slate-900">14/08/1982 (Age: 42)</span>
              </div>

              <div className="p-2 rounded-lg bg-blue-50/90 border border-blue-400 relative">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Gender / लिंग:</span>
                <span className="text-sm font-bold text-slate-900">MALE / पुरुष</span>
              </div>
            </div>

            {/* Masked UID / PAN Number */}
            <div className="p-3 rounded-lg bg-slate-900 text-white border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  {docType === 'aadhaar' ? 'Masked Aadhaar Number' : 'Permanent Account Number'}
                </span>
                <span className="text-base font-mono font-bold tracking-widest text-emerald-400">
                  {docType === 'aadhaar' ? 'XXXX XXXX 8921' : 'ABCDE1234F'}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                Redacted
              </span>
            </div>

          </div>
        </div>

        {/* OpenCV & Regex Inspection Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <ScanLine className="w-4 h-4 text-blue-600" />
            <span>Computer Vision Pipeline Execution</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-700">1. Grayscale & Contrast Normalization</span>
              <span className="text-emerald-700 font-bold">Completed (12ms)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-700">2. Otsu Adaptive Binarization</span>
              <span className="text-emerald-700 font-bold">Completed (18ms)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-700">3. Tesseract 5.0 LSTM Neural OCR</span>
              <span className="text-emerald-700 font-bold">Completed (380ms)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-700">4. Regex Demographic Entity Parser</span>
              <span className="text-emerald-700 font-bold">100% Extracted (4ms)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Storage Privacy Principle:</strong> Neither raw document images nor unmasked Aadhaar numbers are persisted on disk or database. Attributes are held strictly in temporary session memory.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
