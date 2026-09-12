import React from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function SchemeCard({ scheme, isBookmarked, onToggleBookmark, onViewDetails }) {
  const matchScore = scheme.relevance_score || 100;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
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
          </div>

          {/* Bookmark Button */}
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

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2 mb-2">
          {scheme.name}
        </h4>

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
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(scheme)}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
        >
          <span>View Guidelines</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        {scheme.apply_url || scheme.official_url ? (
          <a
            href={scheme.apply_url || scheme.official_url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Apply Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[10px] text-slate-400">Offline / CSC Portal</span>
        )}
      </div>
    </div>
  );
}
