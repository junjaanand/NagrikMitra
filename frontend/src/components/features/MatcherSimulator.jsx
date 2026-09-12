import React, { useState } from 'react';
import { Target, Zap, Sparkles, CheckCircle2, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { matchEligibility } from '../../api/client';

const QUICK_PROFILES = [
  { name: 'Small Farmer (UP)', age: 42, gender: 'male', state: 'Uttar Pradesh', income: 120000, occupation: 'farmer', bpl: false, pwd: false },
  { name: 'College Student (MH)', age: 20, gender: 'female', state: 'Maharashtra', income: 180000, occupation: 'student', bpl: false, pwd: false },
  { name: 'BPL Rural Artisan (RJ)', age: 35, gender: 'female', state: 'Rajasthan', income: 80000, occupation: 'artisan', bpl: true, pwd: false },
];

export default function MatcherSimulator({ onOpenDashboard }) {
  const [age, setAge] = useState(38);
  const [gender, setGender] = useState('male');
  const [state, setState] = useState('Uttar Pradesh');
  const [income, setIncome] = useState(150000);
  const [bpl, setBpl] = useState(false);
  const [pwd, setPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [latency, setLatency] = useState(null);

  const applyPreset = (p) => {
    setAge(p.age);
    setGender(p.gender);
    setState(p.state);
    setIncome(p.income);
    setBpl(p.bpl);
    setPwd(p.pwd);
  };

  const handleTestMatch = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const payload = {
        age: Number(age),
        gender,
        state,
        residence: 'rural',
        caste_category: 'OBC',
        annual_income: Number(income),
        is_bpl: bpl,
        has_disability: pwd,
        occupation: 'farmer',
      };
      const data = await matchEligibility(payload);
      const end = performance.now();
      setLatency(Math.round(end - start));
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Live Algorithm Simulator
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            Test Deterministic Rule Evaluation in Real-Time
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjust the constraints below to execute a real-time parameterized query across all 4,693 schemes.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Quick Test Profiles:</span>
          {QUICK_PROFILES.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Citizen Age: <strong className="text-emerald-700">{age} Years</strong>
          </label>
          <input
            type="range"
            min="1"
            max="95"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Gender Identity
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                gender === 'male'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              👨 Male
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                gender === 'female'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              👩 Female
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Domicile State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Bihar">Bihar</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Karnataka">Karnataka</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Annual Income: <strong className="text-emerald-700">₹{Number(income).toLocaleString()}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="1000000"
            step="25000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={bpl}
              onChange={(e) => setBpl(e.target.checked)}
              className="rounded text-emerald-600 w-4 h-4"
            />
            <span>BPL Cardholder</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={pwd}
              onChange={(e) => setPwd(e.target.checked)}
              className="rounded text-emerald-600 w-4 h-4"
            />
            <span>PwD (दिव्यांग)</span>
          </label>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleTestMatch}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                <span>Run Engine Evaluation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Results */}
      {result && (
        <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/70 p-5 rounded-2xl border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-900">
                {result.total_matched} Schemes Matched
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                ⚡ {latency} ms Latency
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-300">
                0% Hallucination
              </span>
            </div>

            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Results in Citizen Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {result.matched_schemes.slice(0, 3).map((s) => (
              <div key={s.slug} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                  {s.state}
                </span>
                <h5 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">
                  {s.name}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {s.benefits || 'Financial assistance and direct welfare support.'}
                </p>
                <div className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>100% Deterministic Match</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
