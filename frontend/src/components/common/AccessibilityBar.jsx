import React, { useState, useEffect } from 'react';
import { Eye, Type, Contrast, SunMedium, Moon } from 'lucide-react';

export default function AccessibilityBar() {
  const [fontSize, setFontSize] = useState('normal'); // 'small', 'normal', 'large'
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Apply font size class to html/body
    const root = document.documentElement;
    if (fontSize === 'small') {
      root.style.fontSize = '14px';
    } else if (fontSize === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [fontSize]);

  useEffect(() => {
    // Apply high-contrast filter if active
    if (highContrast) {
      document.body.classList.add('contrast-125');
    } else {
      document.body.classList.remove('contrast-125');
    }
  }, [highContrast]);

  return (
    <div className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline mr-1">
        Accessibility:
      </span>

      {/* Text Size Controls */}
      <div className="flex items-center gap-0.5 bg-slate-900/60 p-0.5 rounded-lg border border-slate-700/60">
        <button
          onClick={() => setFontSize('small')}
          className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
            fontSize === 'small' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          title="Decrease font size"
        >
          A-
        </button>
        <button
          onClick={() => setFontSize('normal')}
          className={`px-1.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
            fontSize === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          title="Default font size"
        >
          A
        </button>
        <button
          onClick={() => setFontSize('large')}
          className={`px-1.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
            fontSize === 'large' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          title="Increase font size"
        >
          A+
        </button>
      </div>

      {/* High Contrast Toggle */}
      <button
        onClick={() => setHighContrast((c) => !c)}
        className={`p-1 rounded-lg border transition-colors cursor-pointer ${
          highContrast
            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
            : 'border-slate-700 text-slate-400 hover:text-white'
        }`}
        title={highContrast ? 'Disable high contrast' : 'Enable high contrast mode'}
      >
        <Contrast className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
