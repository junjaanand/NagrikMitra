import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  CheckSquare,
  Square,
  Building2,
  FileText,
  CheckCircle2,
  ShieldAlert,
  QrCode,
  Printer,
  Share2,
  Flag,
  Loader2,
  Globe,
  Building,
  GitMerge,
  ArrowRight,
  Volume2,
  VolumeX,
  FileDown,
  MessageCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getSchemeBySlug, resolveSchemeLink, reportBrokenLink } from '../../api/client';
import SchemeGuidelinesView from './SchemeGuidelinesView';
import { readSchemeAloud, stopSpeech } from '../../utils/speechHelper';
import { generateKendraSlip, shareOnWhatsApp } from '../../utils/slipGenerator';

export default function SchemeDetailModal({ scheme, isOpen, onClose, isBookmarked, onToggleBookmark }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [showQr, setShowQr] = useState(false);
  const [resolvingLink, setResolvingLink] = useState(false);
  const [resolvedLink, setResolvedLink] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (scheme?.slug && isOpen) {
      setLoading(true);
      setResolvedLink(null);
      setReported(false);
      setSpeaking(false);
      getSchemeBySlug(scheme.slug)
        .then((data) => {
          setDetail(data);
          setCheckedDocs({});
        })
        .catch(() => setDetail(scheme))
        .finally(() => setLoading(false));
    } else {
      stopSpeech();
      setSpeaking(false);
    }
    return () => {
      stopSpeech();
    };
  }, [scheme, isOpen]);

  const handleToggleVoice = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
    } else if (current) {
      setSpeaking(true);
      readSchemeAloud(current, {
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  };

  const handleResolveAndOpenLink = async () => {
    if (!current) return;
    setResolvingLink(true);
    try {
      const res = await resolveSchemeLink(current.slug);
      setResolvedLink(res);
      window.open(res.resolved_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const fallbackUrl = current.apply_url || current.official_url || `https://www.myscheme.gov.in/schemes/${current.slug}`;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setResolvingLink(false);
    }
  };

  const handleReportLink = async () => {
    if (!current || reported || reporting) return;
    setReporting(true);
    try {
      await reportBrokenLink(current.slug, 'Citizen reported unreachable / dead link');
      setReported(true);
    } catch (e) {
      setReported(true);
    } finally {
      setReporting(false);
    }
  };

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

  // Generate payload for offline CSC kiosk scanning
  const offlinePayload = JSON.stringify({
    app: 'NagrikMitra',
    type: 'scheme_dossier',
    name: current.name,
    slug: current.slug,
    state: current.state,
    readiness: `${readinessPercent}%`,
    ready_docs: Object.keys(checkedDocs).filter((k) => checkedDocs[k]),
    pending_docs: docList.filter((d) => !checkedDocs[d]),
    apply_url: current.apply_url || current.official_url,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 print:max-h-none print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 print:hidden">
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
            {/* Audio Read-Out Button */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                speaking
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse font-bold'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
              title={speaking ? 'Stop Audio' : 'Listen to scheme in Hindi'}
            >
              {speaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              <span className="text-xs font-bold hidden sm:inline">{speaking ? 'रोकें' : 'सुनिए'}</span>
            </button>

            <button
              onClick={() => setShowQr((v) => !v)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showQr ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Show Offline QR Code for CSC Kiosk"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Print Scheme Dossier (A4)"
            >
              <Printer className="w-4 h-4" />
            </button>

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
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offline QR Code Banner */}
        {showQr && (
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden animate-fadeIn">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 justify-center sm:justify-start">
                <QrCode className="w-3.5 h-3.5 text-amber-600" />
                Offline CSC Kiosk & Mobile Hand-Off Token
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Scan with smartphone or take to Village CSC Center
              </h4>
              <p className="text-xs text-slate-600">
                Readiness score: <strong>{readinessPercent}%</strong> • {completedDocsCount}/{docList.length} required documents verified.
              </p>
            </div>

            <div className="p-2 bg-white rounded-2xl shadow-md border border-amber-200 shrink-0">
              <QRCodeSVG value={offlinePayload} size={105} level="M" />
            </div>
          </div>
        )}

        {/* Umbrella Successor Upgrade Banner */}
        {(current.lifecycle_status === 'subsumed' || current.successor_slug) && (
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-start gap-3.5 print:hidden">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <GitMerge className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Restructured & Upgraded Program
                </span>
              </div>
              <p className="text-xs text-amber-950 font-medium leading-relaxed">
                {current.merger_notice || `${current.name} has been restructured and upgraded into a newer national flagship program.`}
              </p>
              {current.successor_slug && (
                <button
                  onClick={() => {
                    getSchemeBySlug(current.successor_slug)
                      .then((data) => setDetail(data))
                      .catch(() => {});
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
                >
                  <span>View Active Successor: {current.successor_name || current.successor_slug}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dead Link / Soft-Dead Offline Office Guidance */}
        {(current.lifecycle_status === 'dead_link' || current.lifecycle_status === 'soft_dead' || current.lifecycle_status === 'offline') && (
          <div className="p-5 bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-200 flex items-start gap-3.5 print:hidden">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800 shrink-0 mt-0.5">
              <Building className="w-5 h-5 text-rose-700" />
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                🏛️ Physical In-Person Application Recommended
              </span>
              <p className="text-xs text-rose-950 font-medium leading-relaxed">
                The official digital portal is currently archived or under annual maintenance. You can apply in person at your nearest Gram Panchayat, Tehsildar Office, or Common Service Center (CSC).
              </p>
              <a
                href="https://locator.csccloud.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-rose-900 hover:text-rose-950 underline"
              >
                <span>Find Nearest CSC Center (locator.csccloud.in)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Content Body: Highly Structured Scheme Guidelines & Action Plan */}
        <div className="p-6">
          <SchemeGuidelinesView
            scheme={current}
            checkedDocs={checkedDocs}
            onToggleDoc={toggleDocCheck}
          />
        </div>

        {/* Footer Action Links */}
        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 print:hidden">
          <div className="flex items-center gap-3">
            {/* Citizen Report Broken Link Button */}
            <button
              onClick={handleReportLink}
              disabled={reported || reporting}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                reported
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300'
              }`}
              title="Report dead, broken, or unreachable link"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{reported ? '✓ Link Flagged for Verification' : 'Report Broken Link'}</span>
            </button>

            {resolvedLink && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                resolvedLink.status === 'auto_healed'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : resolvedLink.status === 'verified'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {resolvedLink.status === 'auto_healed' ? '⚡ Auto-Healed Link' : resolvedLink.status === 'verified' ? '✓ Verified Live' : '🏛️ National Mirror'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Download Kendra Slip Button */}
            <button
              onClick={() => generateKendraSlip(current)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download Offline CSC Seva Kendra Slip (PNG Token)"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>पर्ची डाउनलोड</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={() => shareOnWhatsApp(current)}
              className="px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Share Scheme on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleResolveAndOpenLink}
              disabled={resolvingLink}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {resolvingLink ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Portal Link...</span>
                </>
              ) : (
                <>
                  <span>
                    {current.application_mode === 'offline' ? 'Open Guidelines & Portal' : 'Open Official Application Portal'}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
