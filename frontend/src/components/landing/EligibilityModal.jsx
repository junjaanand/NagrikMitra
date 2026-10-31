import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  CheckCircle,
  Loader2,
  Volume2,
  FileDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { matchEligibility } from '../../api/client';
import { readSchemeAloud } from '../../utils/speechHelper';
import { generateKendraSlip } from '../../utils/slipGenerator';
import SchemeDetailModal from '../dashboard/SchemeDetailModal';

const INDIAN_STATES = [
  "Central", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];

export default function EligibilityModal({ isOpen, onClose, initialProfile = null }) {
  const [profile, setProfile] = useState({
    age: 30,
    gender: 'all',
    state: 'Central',
    caste_category: 'General',
    annual_income: 100000,
    residence: 'rural',
    is_bpl: false,
    has_disability: false,
    occupation: 'farmer',
    ration_card_color: 'yellow'
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSchemeForDetail, setSelectedSchemeForDetail] = useState(null);
  const [playingSlug, setPlayingSlug] = useState(null);

  // Auto-evaluate when opened via 4-Tap QuickPicker or ID Scanner
  useEffect(() => {
    if (isOpen) {
      if (initialProfile) {
        const merged = {
          age: Number(initialProfile.age) || 30,
          gender: initialProfile.gender || 'all',
          state: initialProfile.state || 'Central',
          caste_category: initialProfile.caste_category || 'General',
          annual_income: Number(initialProfile.annual_income) || 100000,
          residence: initialProfile.residence || 'rural',
          is_bpl: Boolean(initialProfile.is_bpl),
          has_disability: Boolean(initialProfile.has_disability),
          occupation: initialProfile.occupation || 'farmer',
          ration_card_color: initialProfile.ration_card_color || 'yellow',
        };
        setProfile(merged);
        executeEvaluation(merged);
      } else {
        setResults(null);
        setError(null);
      }
    } else {
      setResults(null);
      setError(null);
      setSelectedSchemeForDetail(null);
    }
  }, [isOpen, initialProfile]);

  const executeEvaluation = async (evalProfile) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...evalProfile,
        age: Number(evalProfile.age),
        annual_income: Number(evalProfile.annual_income),
      };
      const res = await matchEligibility(payload);
      setResults(res);
    } catch (err) {
      console.error('Eligibility evaluation error:', err);
      setError(err.message || 'Failed to evaluate eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeEvaluation(profile);
  };

  const handleAudioRead = (e, scheme) => {
    e.stopPropagation();
    setPlayingSlug(scheme.slug);
    readSchemeAloud(scheme, {
      onEnd: () => setPlayingSlug(null),
    });
  };

  const handleDownloadSlip = (e, scheme) => {
    e.stopPropagation();
    generateKendraSlip(scheme, profile);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  Two-Stage Deterministic Matcher
                </span>
                {profile.occupation && (
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    • {profile.occupation}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                {results ? `पात्र सरकारी योजनाएं (${results.total_matched || results.matched_schemes?.length || 0})` : 'Check Government Scheme Eligibility'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    4,728 सरकारी योजनाओं का विश्लेषण हो रहा है...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluating macro demographics, statutory age relaxations & AST micro-criteria...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
                <div className="text-sm font-bold">Error Evaluating Eligibility:</div>
                <div className="text-xs text-rose-600">{error}</div>
                <button
                  onClick={() => executeEvaluation(profile)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Retry Evaluation
                </button>
              </div>
            ) : !results ? (
              /* Demographic Form if opened manually */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Age (years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="110"
                      required
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="all">All / Universal (सभी)</option>
                      <option value="male">Male (पुरुष)</option>
                      <option value="female">Female (महिला)</option>
                      <option value="other">Transgender / Other</option>
                    </select>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / UT of Residence
                    </label>
                    <select
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Caste Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Caste Category
                    </label>
                    <select
                      value={profile.caste_category}
                      onChange={(e) => setProfile({ ...profile, caste_category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="General">General (सामान्य)</option>
                      <option value="OBC">OBC (अन्य पिछड़ा वर्ग)</option>
                      <option value="SC">SC (अनुसूचित जाति)</option>
                      <option value="ST">ST (अनुसूचित जनजाति)</option>
                    </select>
                  </div>

                  {/* Annual Income */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Annual Family Income (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      required
                      value={profile.annual_income}
                      onChange={(e) => setProfile({ ...profile, annual_income: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Occupation / Status
                    </label>
                    <select
                      value={profile.occupation}
                      onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="farmer">Farmer (किसान)</option>
                      <option value="student">Student (विद्यार्थी)</option>
                      <option value="artisan">Artisan / Weaver (कारीगर/बुनकर)</option>
                      <option value="laborer">Construction / Daily Laborer (मजदूर)</option>
                      <option value="entrepreneur">Self-Employed / MSME</option>
                      <option value="unemployed">Unemployed Youth</option>
                      <option value="other">Other / General Citizen</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.is_bpl}
                      onChange={(e) => setProfile({ ...profile, is_bpl: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>BPL Card Holder (बीपीएल)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.has_disability}
                      onChange={(e) => setProfile({ ...profile, has_disability: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Person with Disability (दिव्यांग)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.residence === 'rural'}
                      onChange={(e) => setProfile({ ...profile, residence: e.target.checked ? 'rural' : 'both' })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Rural Resident (ग्रामीण)</span>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Find All Eligible Schemes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Results List */
              <div className="space-y-4">
                {/* Summary Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      100% Deterministic Match Completed
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5">
                      {results.total_matched || results.matched_schemes?.length || 0} कल्याणकारी योजनाएं उपलब्ध
                    </h3>
                    {results.potential_benefit_summary && (
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        {results.potential_benefit_summary}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setResults(null)}
                    className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <Filter className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Filter Badle (Modify)</span>
                  </button>
                </div>

                {/* Scheme Cards Grid */}
                <div className="space-y-3.5 max-h-[58vh] overflow-y-auto pr-1">
                  {results.matched_schemes?.map((s) => {
                    const isAudioPlaying = playingSlug === s.slug;
                    return (
                      <div
                        key={s.slug}
                        onClick={() => setSelectedSchemeForDetail(s)}
                        className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {s.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                                {s.state || 'Central'}
                              </span>
                              {s.category && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {s.category}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {s.benefits || s.description || 'Financial assistance, agricultural equipment subsidy, or direct welfare grant.'}
                            </p>

                            {s.estimated_benefit_amount && (
                              <div className="pt-1">
                                <span className="inline-block text-[11px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                                  लाभ राशि: {s.estimated_benefit_amount}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Match Score Badge */}
                          <div className="shrink-0 text-right">
                            <span className="inline-block text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {s.relevance_score ? `${Math.round(s.relevance_score)}% Match` : '100% Match'}
                            </span>
                          </div>
                        </div>

                        {/* Match Reason Chips */}
                        {s.match_reasons && s.match_reasons.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                            {s.match_reasons.slice(0, 2).map((r, i) => (
                              <span key={i} className="text-[10px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                                ✓ {r}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Interactive Action Buttons on Card */}
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* Read Aloud Button */}
                            <button
                              type="button"
                              onClick={(e) => handleAudioRead(e, s)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isAudioPlaying
                                  ? 'bg-rose-50 border border-rose-300 text-rose-700 animate-pulse'
                                  : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800'
                              }`}
                              title="Listen to scheme in Hindi"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{isAudioPlaying ? 'सुन रहे हैं...' : 'सुनिए'}</span>
                            </button>

                            {/* Kendra Slip Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDownloadSlip(e, s)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Download CSC Kendra application slip with QR code"
                            >
                              <FileDown className="w-3.5 h-3.5 text-slate-600" />
                              <span>पर्ची</span>
                            </button>
                          </div>

                          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>विवरण देखें</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Scheme Detail Modal for clicked cards */}
      {selectedSchemeForDetail && (
        <SchemeDetailModal
          scheme={selectedSchemeForDetail}
          isOpen={Boolean(selectedSchemeForDetail)}
          onClose={() => setSelectedSchemeForDetail(null)}
        />
      )}
    </>
  );
}
