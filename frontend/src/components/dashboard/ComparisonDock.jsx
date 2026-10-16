import React from 'react';
import { GitCompare, X, ArrowRight, Layers, Trash2 } from 'lucide-react';

export default function ComparisonDock({
  comparedSchemes = [],
  onRemoveScheme,
  onClearAll,
  onOpenMatrix,
}) {
  if (comparedSchemes.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 animate-slideUp">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Indicator & Selected Chips */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black block">Comparison Queue</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {comparedSchemes.length} / 4 Schemes Selected
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block shrink-0" />

          {/* Scheme Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {comparedSchemes.map((s) => (
              <span
                key={s.slug}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200"
              >
                <span className="max-w-[120px] sm:max-w-[150px] truncate">{s.name}</span>
                <button
                  onClick={() => onRemoveScheme(s.slug)}
                  className="p-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  title="Remove from comparison"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 justify-end shrink-0">
          <button
            onClick={onClearAll}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear all selected schemes"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenMatrix}
            disabled={comparedSchemes.length < 2}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              comparedSchemes.length >= 2
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
