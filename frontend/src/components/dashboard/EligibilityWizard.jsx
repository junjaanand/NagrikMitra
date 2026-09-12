import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  IndianRupee,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { matchEligibility } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';

const INDIAN_STATES = [
  "Central", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];

const OCCUPATIONS = [
  { value: 'farmer', label: 'Farmer / Agriculturist (किसान)' },
  { value: 'student', label: 'Student / Scholar (छात्र/छात्रा)' },
  { value: 'artisan', label: 'Artisan / Weaver / Craftsman (कारीगर/बुनकर)' },
  { value: 'laborer', label: 'Daily Wage / Construction Laborer (श्रमिक)' },
  { value: 'entrepreneur', label: 'Self-Employed / MSME Entrepreneur' },
  { value: 'unemployed', label: 'Job Seeker / Unemployed Youth' },
  { value: 'other', label: 'Other Profession' },
];

export default function EligibilityWizard({ onMatchComplete }) {
  const { profile, updateProfile } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState(profile);

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleExecuteMatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        annual_income: Number(formData.annual_income),
      };
      updateProfile(payload);
      const response = await matchEligibility(payload);
      onMatchComplete(response, payload);
    } catch (err) {
      setError(err.message || 'Failed to evaluate eligibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-lg p-6 sm:p-8">
      
      {/* Wizard Header & Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
              Step {currentStep} of 4
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {currentStep === 1 && 'Personal Demographics'}
              {currentStep === 2 && 'Location & Residence'}
              {currentStep === 3 && 'Economic Status & Caste'}
              {currentStep === 4 && 'Profession & Special Needs'}
            </span>
          </div>

          <span className="text-xs font-bold text-emerald-700">
            {currentStep * 25}% Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full bg-emerald-600 rounded-full"
            initial={{ width: '25%' }}
            animate={{ width: `${currentStep * 25}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Views with Animation */}
      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Personal Demographics */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  <span>Personal Details</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Welfare criteria often have age brackets and gender-specific benefits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    e.g. 18 for youth schemes, 60+ for pensions
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender Identity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => updateField('gender', g)}
                        className={`py-3 text-xs font-bold rounded-xl border transition-all capitalize ${
                          formData.gender === g
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {g === 'male' ? '👨 Male' : g === 'female' ? '👩 Female' : '⚧ Other'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Location & Residence */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>Jurisdiction & Residence Type</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Filters across Central initiatives and state-specific welfare funds.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State or Union Territory of Domicile
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Area of Residence
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('residence', 'rural')}
                      className={`p-3 text-xs font-bold rounded-xl border transition-all text-center ${
                        formData.residence === 'rural'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🏡 Rural (गाँव / ग्राम पंचायत)
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField('residence', 'urban')}
                      className={`p-3 text-xs font-bold rounded-xl border transition-all text-center ${
                        formData.residence === 'urban'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🏢 Urban (शहरी / नगर पालिका)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Economic Status & Caste */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  <span>Social Category & Family Income</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Income limits and reservation categories govern scholarship and subsidy caps.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Caste Category
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['General', 'OBC', 'SC', 'ST'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateField('caste_category', c)}
                        className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                          formData.caste_category === c
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Annual Household Income: <strong className="text-emerald-700">₹{Number(formData.annual_income).toLocaleString()}</strong>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {formData.annual_income <= 150000 ? 'Low Income Bracket' : formData.annual_income <= 300000 ? 'Middle Bracket' : 'Higher Bracket'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="25000"
                    value={formData.annual_income}
                    onChange={(e) => updateField('annual_income', e.target.value)}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹0</span>
                    <span>₹2.5 Lakh</span>
                    <span>₹5.0 Lakh</span>
                    <span>₹10 Lakh+</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_bpl}
                      onChange={(e) => updateField('is_bpl', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Below Poverty Line (BPL) Card Holder
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Unlocks 157+ targeted Antyodaya food, health, and shelter initiatives
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Profession & Special Criteria */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  <span>Profession & Special Inclusion</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Occupational criteria prioritize specific welfare funds and equipment subsidies.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary Profession / Trade
                  </label>
                  <select
                    value={formData.occupation}
                    onChange={(e) => updateField('occupation', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {OCCUPATIONS.map((occ) => (
                      <option key={occ.value} value={occ.value}>
                        {occ.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.has_disability}
                      onChange={(e) => updateField('has_disability', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Person with Benchmark Disability (PwD / दिव्यांग)
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Unlocks 308+ specialized assistive devices, pensions, and transport allowances
                      </span>
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleExecuteMatch}
            className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating 4,693 Schemes in Rule Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Deterministic Match</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
