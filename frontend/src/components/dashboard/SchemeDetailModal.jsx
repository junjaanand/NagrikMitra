import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Bookmark, CheckSquare, Square, Building2, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getSchemeBySlug } from '../../api/client';

export default function SchemeDetailModal({ scheme, isOpen, onClose, isBookmarked, onToggleBookmark }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState({});

  useEffect(() => {
    if (scheme?.slug && isOpen) {
      setLoading(true);
      getSchemeBySlug(scheme.slug)
        .then((data) => {
          setDetail(data);
          setCheckedDocs({});
        })
        .catch(() => setDetail(scheme))
        .finally(() => setLoading(false));
    }
  }, [scheme, isOpen]);

  if (!isOpen || !scheme) return null;

  const current = detail || scheme;

  // Split documents required into array items
  const docList = current.documents_required
    ? current.documents_required
        .split(/[,;\n•]/)
        .map((d) => d.replace(/<[^>]+>/g, '').trim())
        .filter((d) => d.length > 3)
    : ['Aadhaar Card', 'Bank Account Passbook', 'Proof of Residence / Domicile Certificate'];

  const toggleDocCheck = (doc) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  const completedDocsCount = Object.values(checkedDocs).filter(Boolean).length;
  const readinessPercent = docList.length > 0 ? Math.round((completedDocsCount / docList.length) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {current.state === 'Central' ? '🇮🇳 Central Initiative' : `🏛️ ${current.state}`}
              </span>
              {current.category && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {current.category}
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {current.name}
            </h2>
            {current.ministry && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{current.ministry}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(current)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Benefits Box */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              Official Entitlements & Financial Benefits
            </span>
            <div
              className="text-sm text-emerald-950 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: current.benefits || 'Financial assistance and welfare subsidies provided.' }}
            />
          </div>

          {/* Eligibility Matrix */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              Statutory Eligibility Criteria
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age Bracket</span>
                <span className="font-bold text-slate-800">
                  {current.eligibility_age_min || current.eligibility_age_max
                    ? `${current.eligibility_age_min || 0} - ${current.eligibility_age_max || 'No limit'} yrs`
                    : 'Universal'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                <span className="font-bold text-slate-800 capitalize">
                  {current.eligibility_gender || 'All Genders'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Income Ceiling</span>
                <span className="font-bold text-slate-800">
                  {current.eligibility_income_max
                    ? `₹${Number(current.eligibility_income_max).toLocaleString()}`
                    : 'No Income Cap'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Residence</span>
                <span className="font-bold text-slate-800 capitalize">
                  {current.eligibility_residence || 'Both Rural & Urban'}
                </span>
              </div>
            </div>

            {current.eligibility_text && (
              <div
                className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: current.eligibility_text }}
              />
            )}
          </div>

          {/* Interactive Document Readiness Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Document Readiness Checklist</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                {readinessPercent}% Ready ({completedDocsCount}/{docList.length})
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Check off the documents you have ready before visiting the Common Service Center (CSC) or applying online:
            </p>

            <div className="space-y-2">
              {docList.map((doc, idx) => {
                const checked = Boolean(checkedDocs[doc]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDocCheck(doc)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      checked
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">{doc}</span>
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Process */}
          {current.application_process && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                Step-by-Step Application Procedure
              </h3>
              <div
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: current.application_process }}
              />
            </div>
          )}

        </div>

        {/* Footer Action Links */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500">
            Official government scheme record from Digital India
          </span>

          {current.apply_url || current.official_url ? (
            <a
              href={current.apply_url || current.official_url}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Open Official Application Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-xs font-medium text-slate-500">Apply at nearest CSC / Panchayat office</span>
          )}
        </div>

      </div>
    </div>
  );
}
