import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Check,
  GitCompare,
  Volume2,
  VolumeX,
  FileDown,
} from 'lucide-react';
import { readSchemeAloud, stopSpeech } from '../../utils/speechHelper';
import { generateKendraSlip } from '../../utils/slipGenerator';

export default function SchemeCard({
  scheme,
  isBookmarked,
  onToggleBookmark,
  onViewDetails,
  isCompared = false,
  onToggleCompare,
}) {
  const [speaking, setSpeaking] = useState(false);
  const matchScore = scheme.relevance_score || 100;

  const handleToggleVoice = (e) => {
    e.stopPropagation();
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      readSchemeAloud(scheme, {
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  };

  const handleDownloadSlip = (e) => {
    e.stopPropagation();
    generateKendraSlip(scheme);
  };

  return (
    <div className={`rounded-2xl bg-white border p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${
      isCompared ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/90 hover:border-emerald-400'
    }`}>
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                scheme.state === 'Central'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {scheme.state === 'Central' ? '🇮🇳 Central Govt' : `🏛️ ${scheme.state}`}
            </span>

            {scheme.category && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {scheme.category.split(',')[0].trim()}
              </span>
            )}

            {/* Application Mode Badge (Online / Offline / Hybrid) */}
            {scheme.application_mode === 'offline' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
                <span>🏢</span> In-Person
              </span>
            ) : scheme.application_mode === 'hybrid' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/80 flex items-center gap-1">
                <span>🔄</span> CSC Hybrid
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                <span>🌐</span> Online
              </span>
            )}

            {/* Lifecycle Status Pill (if seasonal, subsumed, or dead link) */}
            {scheme.lifecycle_status === 'seasonal_window' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                🗓️ Seasonal
              </span>
            )}
            {(scheme.lifecycle_status === 'subsumed' || scheme.lifecycle_status === 'superseded_merged') && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                <span>🔄</span> Upgraded
              </span>
            )}
            {(scheme.lifecycle_status === 'dead_link' || scheme.lifecycle_status === 'soft_dead') && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                <span>🏛️</span> In-Person / CSC
              </span>
            )}

            {/* Phase 04: Tier 2 Near-Match / Action Required Badge */}
            {scheme.eligibility_tier === 2 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-xs">
                <span>⚡</span> Near-Match
              </span>
            )}
          </div>

          {/* Action Buttons: Compare + Bookmark */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(scheme)}
                className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isCompared
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isCompared ? 'Remove from Comparison Queue' : 'Add to Comparison Queue'}
              >
                <GitCompare className="w-3 h-3" />
                <span>{isCompared ? 'Selected' : 'Compare'}</span>
              </button>
            )}

            <button
              onClick={() => onToggleBookmark(scheme)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={isBookmarked ? 'Remove from Saved' : 'Save Scheme'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2 mb-2">
          {scheme.name}
        </h4>

        {/* Umbrella Scheme Successor Notice */}
        {scheme.successor_name && (
          <div className="mb-2.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] font-medium text-amber-900 flex items-center gap-1.5">
            <span className="font-bold text-amber-700">Restructured into:</span>
            <span className="truncate">{scheme.successor_name}</span>
          </div>
        )}

        {/* Benefits text */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {scheme.benefits || 'Financial assistance, welfare subsidies, and enablement support.'}
        </p>

        {/* Highlighted Monetary Benefit */}
        {scheme.estimated_benefit_amount && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/60">
            <span>Subsidy:</span>
            <span className="text-emerald-700">{scheme.estimated_benefit_amount}</span>
          </div>
        )}

        {/* Phase 04: Near-Match Missing Criteria Alert */}
        {scheme.missing_criteria && scheme.missing_criteria.length > 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 leading-snug space-y-1">
            <div className="flex items-center gap-1 font-bold text-amber-950">
              <span>⚠️ Action Needed to Qualify:</span>
            </div>
            <p className="text-amber-800">{scheme.missing_criteria[0]}</p>
            {scheme.actionable_guidance && (
              <p className="text-[10px] text-amber-700 font-medium italic">💡 {scheme.actionable_guidance}</p>
            )}
          </div>
        )}

        {/* Phase 04: Progressive Micro-Condition Chips */}
        {scheme.micro_conditions && scheme.micro_conditions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {scheme.micro_conditions.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80"
                title={`${chip.category}: ${chip.label}`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Match Reason Pills */}
        {scheme.match_reasons && scheme.match_reasons.length > 0 && (
          <div className="space-y-1 mb-4 pt-2 border-t border-slate-100">
            {scheme.match_reasons.slice(0, 2).map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="line-clamp-1">{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onViewDetails(scheme)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Guidelines</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Audio Read-Out Button */}
          <button
            onClick={handleToggleVoice}
            className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
              speaking
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
            title={speaking ? 'Stop Audio' : 'Listen to scheme guidelines in Hindi'}
          >
            {speaking ? <VolumeX className="w-3 h-3 text-rose-600" /> : <Volume2 className="w-3 h-3 text-emerald-600" />}
            <span>{speaking ? 'रोकें' : 'सुनिए'}</span>
          </button>

          {/* CSC Kendra Slip Button */}
          <button
            onClick={handleDownloadSlip}
            className="p-1 rounded-md text-[11px] font-medium border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Download CSC Seva Kendra Slip (Offline Token)"
          >
            <FileDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {scheme.apply_url || scheme.official_url ? (
          <a
            href={scheme.apply_url || scheme.official_url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            🏛️ CSC In-Person
          </span>
        )}
      </div>
    </div>
  );
}
