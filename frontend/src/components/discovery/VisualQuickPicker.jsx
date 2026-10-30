import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  RATION_CARD_PROXY,
  POPULAR_ROLES,
  MAJOR_STATES,
  CASTE_CATEGORIES,
} from '../../utils/civicProxies';

export default function VisualQuickPicker({ onComplete, initialProfile = {} }) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(initialProfile.occupation || 'farmer');
  const [selectedState, setSelectedState] = useState(initialProfile.state || 'Central');
  const [selectedRation, setSelectedRation] = useState(initialProfile.ration_card_color || 'yellow');
  const [selectedCaste, setSelectedCaste] = useState(initialProfile.caste_category || 'General');

  const handleSearch = () => {
    const rationData = RATION_CARD_PROXY[selectedRation] || RATION_CARD_PROXY.none;

    const payload = {
      occupation: selectedRole,
      state: selectedState,
      caste_category: selectedCaste,
      ration_card_color: selectedRation,
      annual_income: rationData.annual_income,
      is_bpl: rationData.is_bpl,
      gender: selectedRole === 'woman' ? 'female' : 'all',
      age: selectedRole === 'student' ? 21 : selectedRole === 'senior' ? 65 : 35,
      residence: 'both',
      has_disability: false,
    };

    if (onComplete) {
      onComplete(payload);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            {t('picker.badge', '4-Tap Visual Scheme Finder')}
          </div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>{t('picker.title', 'बिना फॉर्म भरे — मात्र 4 टैप में अपनी योजनाएं खोजें')}</span>
          </h3>
          <p className="text-xs text-emerald-100 font-medium">
            {t('picker.subtitle', 'No typing required. Select your profile visually and get immediate matched government welfare benefits.')}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-emerald-500/30 border border-emerald-300/30 text-white flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            100% Private & Anonymous
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* TAP 1: ROLE / OCCUPATION */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>{t('picker.step1_title', '1. आपकी भूमिका / पेशा (Your Role)')}</span>
            <span className="text-[11px] font-semibold text-emerald-600">{t('picker.step1_subtitle', 'Tap 1 of 4')}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {POPULAR_ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <div className="text-xs font-bold leading-tight">{role.label}</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">{role.hindi}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAP 2: STATE / JURISDICTION */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>{t('picker.step2_title', '2. आपका राज्य / अधिवास (Your State)')}</span>
            <span className="text-[11px] font-semibold text-emerald-600">{t('picker.step2_subtitle', 'Tap 2 of 4')}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {MAJOR_STATES.map((st) => {
              const isSelected = selectedState === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedState(st.id)}
                  className={`px-3 py-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 font-medium hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm">{st.flag}</div>
                  <div className="text-[11px] truncate leading-tight mt-0.5">{st.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAP 3: RATION CARD COLOR (INCOME & BPL PROXY) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('picker.step3_title', '3. राशन कार्ड का रंग (Ration Card Color Proxy)')}
            </label>
            <span className="text-[11px] font-semibold text-emerald-600">{t('picker.step3_subtitle', 'Tap 3 of 4')}</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2.5">
            {t('picker.step3_desc', 'बिना आय प्रमाण पत्र के ऑटोमैटिक BPL व आय सीमा गणना:')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(RATION_CARD_PROXY).map((card) => {
              const isSelected = selectedRation === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedRation(card.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 mt-0.5 border border-slate-300 shadow-xs"
                    style={{ backgroundColor: card.colorHex }}
                  />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {card.label}
                    </div>
                    <div className="text-[10px] text-amber-900 font-semibold">
                      {card.hindiLabel}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {card.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAP 4: SOCIAL CATEGORY */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>{t('picker.step4_title', '4. सामाजिक श्रेणी (Social Category)')}</span>
            <span className="text-[11px] font-semibold text-emerald-600">{t('picker.step4_subtitle', 'Tap 4 of 4')}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CASTE_CATEGORIES.map((caste) => {
              const isSelected = selectedCaste === caste.id;
              return (
                <button
                  key={caste.id}
                  type="button"
                  onClick={() => setSelectedCaste(caste.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 font-medium hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{caste.label}</div>
                  <div className="text-[10px] text-slate-500">{caste.hindi}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {t('picker.selected_label', 'चयनित:')} <strong>{POPULAR_ROLES.find(r => r.id === selectedRole)?.label}</strong> • <strong>{selectedState}</strong> • <strong>{RATION_CARD_PROXY[selectedRation]?.label.split('/')[0]}</strong> • <strong>{selectedCaste}</strong>
            </span>
          </div>

          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{t('picker.find_schemes_btn', 'पात्र योजनाएं खोजें (Find My Schemes)')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
