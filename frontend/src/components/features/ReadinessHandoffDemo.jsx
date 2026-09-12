import React, { useState } from 'react';
import { FileCheck2, CheckSquare, Square, QrCode, AlertTriangle, ShieldCheck, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const INITIAL_DOCS = [
  { id: 'aadhaar', name: 'Aadhaar Card (Linked with Active Mobile)', checked: true, required: true },
  { id: 'passbook', name: 'Bank Passbook / Jan Dhan Statement (IFSC)', checked: true, required: true },
  { id: 'domicile', name: 'State Domicile / Residence Certificate', checked: true, required: true },
  { id: 'income', name: 'Annual Income Certificate (< 1 Year Old)', checked: false, required: true },
  { id: 'caste', name: 'Caste / Social Category Certificate', checked: false, required: false },
];

export default function ReadinessHandoffDemo() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [showQrModal, setShowQrModal] = useState(false);

  const toggleDoc = (id) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, checked: !d.checked } : d))
    );
  };

  const totalRequired = docs.filter((d) => d.required).length;
  const completedRequired = docs.filter((d) => d.required && d.checked).length;
  const readinessPercent = Math.round((completedRequired / totalRequired) * 100);

  const missingMandatory = docs.filter((d) => d.required && !d.checked);

  // Payload for offline QR handoff
  const qrPayload = JSON.stringify({
    app: 'NagrikMitra',
    citizen: 'Ramesh Kumar',
    state: 'Uttar Pradesh',
    readiness: `${readinessPercent}%`,
    ready_docs: docs.filter((d) => d.checked).map((d) => d.name),
    target_schemes: ['pm-kisan', 'up-kisan-pension'],
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wide bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 inline-flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5" />
            Readiness Index & Offline Kiosk Handoff
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            Document Readiness Meter & Offline QR Generator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Check off available documents to test real-time readiness scoring and generate offline CSC handoff tokens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Checklist</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Checklist + Meter + QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
        
        {/* Left 2 Cols: Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Prerequisite Certificates Checklist:
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {docs.filter((d) => d.checked).length} of {docs.length} collected
            </span>
          </div>

          <div className="space-y-2.5">
            {docs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  doc.checked
                    ? 'bg-teal-50/60 border-teal-300 text-teal-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {doc.checked ? (
                    <CheckSquare className="w-5 h-5 text-teal-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs block">{doc.name}</span>
                    {doc.required && (
                      <span className="text-[10px] text-amber-700 font-bold uppercase">
                        Mandatory Certificate
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    doc.checked
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {doc.checked ? 'Ready' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          {/* Missing warning */}
          {missingMandatory.length > 0 ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Action Required:</strong> Missing {missingMandatory.length} mandatory certificate(s) ({missingMandatory.map((m) => m.name.split('(')[0]).join(', ')}). Obtain these before visiting your Gram Panchayat / CSC to prevent application rejection.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>100% Application Ready!</strong> All statutory mandatory paperwork is verified.
              </span>
            </div>
          )}
        </div>

        {/* Right Col: Readiness Meter & Offline QR Code */}
        <div className="space-y-4">
          
          {/* Readiness Score Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Application Readiness Score
            </span>
            <div className="text-4xl font-black text-teal-600">
              {readinessPercent}%
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {readinessPercent === 100
                ? 'Eligible for instant kiosk submission'
                : 'Complete pending paperwork for guaranteed approval'}
            </span>
          </div>

          {/* Live Dynamic QR Code Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-3 border border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <QrCode className="w-3.5 h-3.5" />
              <span>Offline CSC Handoff Token</span>
            </div>

            <div className="p-3 bg-white rounded-xl inline-block shadow-md">
              <QRCodeSVG
                value={qrPayload}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">
              Village CSC VLEs can scan this QR code without internet connectivity to instantly import verified credentials and paperwork status.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
