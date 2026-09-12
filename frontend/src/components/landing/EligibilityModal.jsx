import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { matchEligibility } from '../../api/client';

const INDIAN_STATES = [
  "Central", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];

export default function EligibilityModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState({
    age: 30,
    gender: 'male',
    state: 'Uttar Pradesh',
    caste_category: 'OBC',
    annual_income: 150000,
    residence: 'rural',
    is_bpl: false,
    has_disability: false,
    occupation: 'farmer'
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await matchEligibility({
        ...profile,
        age: Number(profile.age),
        annual_income: Number(profile.annual_income),
      });
      setResults(res);
    } catch (err) {
      setError(err.message || 'Failed to evaluate eligibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
              Deterministic Rule Engine
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Check Government Scheme Eligibility
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!results ? (
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
                  </select>
                </div>
              </div>

              {/* Checkboxes: BPL, Disability, Residence */}
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

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating 4,693 Schemes in Rule Engine...</span>
                    </>
                  ) : (
                    <>
                      <span>Find All Eligible Schemes</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Results View */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800">Deterministic Match Complete</span>
                  <h3 className="text-2xl font-black text-emerald-900">
                    {results.total_matched} Schemes Found!
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">{results.potential_benefit_summary}</p>
                </div>
                <button
                  onClick={() => setResults(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-emerald-300 hover:bg-emerald-100/50"
                >
                  Modify Filter
                </button>
              </div>

              {/* Matched Schemes Cards */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {results.matched_schemes.map((s) => (
                  <div
                    key={s.slug}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 shadow-xs transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">{s.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                            {s.state}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {s.benefits || 'Financial assistance and welfare subsidies available.'}
                        </p>
                        
                        {s.estimated_benefit_amount && (
                          <span className="inline-block mt-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                            Benefit: {s.estimated_benefit_amount}
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                        {s.relevance_score}% Match
                      </span>
                    </div>

                    {s.match_reasons && s.match_reasons.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {s.match_reasons.slice(0, 2).map((r, i) => (
                          <span key={i} className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
