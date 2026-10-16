import React, { useState, useEffect } from 'react';
import {
  X,
  GitCompare,
  ExternalLink,
  Printer,
  CheckCircle2,
  Building2,
  IndianRupee,
  Calendar,
  UserCheck,
  MapPin,
  FileText,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Bookmark,
  Share2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getSchemeBySlug } from '../../api/client';

export default function ComparisonMatrixModal({
  isOpen,
  onClose,
  schemes = [],
  onRemoveScheme,
  onToggleBookmark,
  bookmarkedSlugs = [],
}) {
  const [fullDetails, setFullDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Fetch full details for all compared schemes
  useEffect(() => {
    if (!isOpen || schemes.length === 0) {
      setFullDetails([]);
      return;
    }

    let mounted = true;
    setLoading(true);

    Promise.all(
      schemes.map((s) =>
        getSchemeBySlug(s.slug).catch(() => s)
      )
    )
      .then((results) => {
        if (mounted) setFullDetails(results);
      })
      .catch((err) => {
        console.error('Failed to fetch detailed comparison schemes:', err);
        if (mounted) setFullDetails(schemes);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, schemes]);

  if (!isOpen || schemes.length === 0) return null;

  const currentSchemes = fullDetails.length > 0 ? fullDetails : schemes;

  // Comparison summary payload for QR code
  const comparisonQrPayload = JSON.stringify({
    app: 'NagrikMitra',
    type: 'scheme_comparison',
    schemes: currentSchemes.map((s) => ({
      name: s.name,
      slug: s.slug,
      state: s.state,
      benefit: s.estimated_benefit_amount || 'Subsidized welfare',
      apply_url: s.apply_url || s.official_url,
    })),
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col print:max-h-none print:shadow-none print:border-none">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center border border-amber-400/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Government Welfare Schemes Comparison Matrix
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                  {currentSchemes.length} Schemes Side-by-Side
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Statutory criteria, financial assistance, and procedural requirements benchmarked.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal((v) => !v)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Share or scan on mobile via QR"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print comparative table"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print A4</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QR Code Quick Modal Overlay */}
        {showQrModal && (
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 justify-center sm:justify-start">
                <QrCode className="w-4 h-4 text-amber-600" />
                Mobile Kiosk & CSC Hand-Off Token
              </span>
              <h4 className="text-base font-bold text-slate-900">
                Scan with your Smartphone or CSC Operator Scanner
              </h4>
              <p className="text-xs text-slate-600 max-w-md">
                Encodes all {currentSchemes.length} compared initiatives with direct official portal URLs and requirement parameters.
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-md border border-amber-200 shrink-0">
              <QRCodeSVG
                value={comparisonQrPayload}
                size={120}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-4 bg-slate-100 font-extrabold text-slate-700 rounded-tl-2xl w-48 sticky left-0 z-10 shadow-xs">
                  Evaluation Dimension
                </th>
                {currentSchemes.map((s, idx) => (
                  <th
                    key={s.slug}
                    className={`p-4 font-black align-top min-w-[260px] ${
                      idx % 2 === 0 ? 'bg-slate-50/80' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          s.state === 'Central'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {s.state === 'Central' ? '🇮🇳 Central Flagship' : `🏛️ ${s.state}`}
                      </span>

                      {onRemoveScheme && currentSchemes.length > 2 && (
                        <button
                          onClick={() => onRemoveScheme(s.slug)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {s.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {s.ministry || s.department || 'Government of India'}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              
              {/* Financial Entitlement */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Financial Benefit</span>
                </td>
                {currentSchemes.map((s) => (
                  <td key={s.slug} className="p-4 text-slate-800">
                    {s.estimated_benefit_amount && (
                      <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs mb-1.5">
                        {s.estimated_benefit_amount}
                      </span>
                    )}
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                      {s.benefits || 'Official welfare subsidy assistance.'}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Sector / Category */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs">
                  Primary Sector
                </td>
                {currentSchemes.map((s) => (
                  <td key={s.slug} className="p-4 text-slate-800 font-semibold">
                    {s.category || 'General Civic Welfare'}
                  </td>
                ))}
              </tr>

              {/* Age Bracket */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Age Bracket</span>
                </td>
                {currentSchemes.map((s) => {
                  const minA = s.eligibility_age_min;
                  const maxA = s.eligibility_age_max;
                  let ageLabel = 'Universal (No age barrier)';
                  if (minA && maxA) ageLabel = `${minA} to ${maxA} Years`;
                  else if (minA) ageLabel = `${minA}+ Years`;
                  else if (maxA) ageLabel = `Up to ${maxA} Years`;
                  return (
                    <td key={s.slug} className="p-4 text-slate-800 font-semibold">
                      {ageLabel}
                    </td>
                  );
                })}
              </tr>

              {/* Gender Criteria */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Target Gender</span>
                </td>
                {currentSchemes.map((s) => (
                  <td key={s.slug} className="p-4 text-slate-800 capitalize font-semibold">
                    {s.eligibility_gender === 'female' ? '👩 Women Only' : s.eligibility_gender === 'male' ? '👨 Men Only' : 'Universal (All Genders)'}
                  </td>
                ))}
              </tr>

              {/* Income Ceiling */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs">
                  Income Ceiling
                </td>
                {currentSchemes.map((s) => (
                  <td key={s.slug} className="p-4 text-slate-800">
                    {s.eligibility_income_max ? (
                      <span className="font-bold text-amber-700">
                        ≤ ₹{s.eligibility_income_max.toLocaleString()} / year
                      </span>
                    ) : (
                      <span className="text-slate-500">No Statutory Income Cap</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* BPL & Disability Focus */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs">
                  Vulnerability Focus
                </td>
                {currentSchemes.map((s) => (
                  <td key={s.slug} className="p-4 text-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                      {s.eligibility_bpl && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                          BPL Card Required
                        </span>
                      )}
                      {s.eligibility_disability && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                          PwD / दिव्यांग
                        </span>
                      )}
                      {!s.eligibility_bpl && !s.eligibility_disability && (
                        <span className="text-slate-500">Universal Eligibility</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Area Domicile */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>Area Domicile</span>
                </td>
                {currentSchemes.map((s) => (
                  <td key={s.slug} className="p-4 text-slate-800 capitalize font-semibold">
                    {s.eligibility_residence === 'rural'
                      ? '🏡 Rural Areas Only'
                      : s.eligibility_residence === 'urban'
                      ? '🏢 Urban Areas Only'
                      : 'All India (Rural & Urban)'}
                  </td>
                ))}
              </tr>

              {/* Documents Required */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Documents Checklist</span>
                </td>
                {currentSchemes.map((s) => (
                  <td key={s.slug} className="p-4 text-slate-700">
                    <p className="text-[11px] leading-relaxed line-clamp-4">
                      {s.documents_required || 'Standard Identity Proof (Aadhaar, Bank Passbook, Domicile).'}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Application Channel & Portal */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 bg-slate-100/70 sticky left-0 z-10 shadow-xs">
                  Application Access
                </td>
                {currentSchemes.map((s) => (
                  <td key={s.slug} className="p-4">
                    {s.apply_url || s.official_url ? (
                      <a
                        href={s.apply_url || s.official_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500">Village CSC Kiosk Enrollment</span>
                    )}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
