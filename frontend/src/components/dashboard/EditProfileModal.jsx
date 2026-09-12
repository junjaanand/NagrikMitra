import React, { useState, useEffect } from 'react';
import { X, Check, User, MapPin, IndianRupee, Briefcase, Sparkles } from 'lucide-react';
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

export default function EditProfileModal({ isOpen, onClose, onSave }) {
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      age: Number(formData.age),
      annual_income: Number(formData.annual_income),
    };
    updateProfile(cleanData);
    if (onSave) onSave(cleanData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <User className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Update Demographic Profile
              </h2>
              <p className="text-xs text-slate-500">
                Synchronize citizen parameters with the deterministic rule engine.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Age (Years)
              </label>
              <input
                type="number"
                min="1"
                max="110"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* State & Residence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Domicile State / UT
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              <select
                value={formData.residence}
                onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="rural">Rural (गाँव / ग्राम पंचायत)</option>
                <option value="urban">Urban (शहरी / नगर पालिका)</option>
              </select>
            </div>
          </div>

          {/* Caste Category & Occupation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Social Category (Caste)
              </label>
              <select
                value={formData.caste_category}
                onChange={(e) => setFormData({ ...formData, caste_category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Profession
              </label>
              <select
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {OCCUPATIONS.map((occ) => (
                  <option key={occ.value} value={occ.value}>
                    {occ.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Annual Household Income */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Annual Household Income: <strong className="text-emerald-700">₹{Number(formData.annual_income).toLocaleString()}</strong>
              </label>
              <span className="text-[11px] text-slate-400">
                ₹{Number(formData.annual_income) <= 150000 ? 'Low Income' : Number(formData.annual_income) <= 300000 ? 'Moderate' : 'Higher Bracket'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="25000"
              value={formData.annual_income}
              onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Toggles: BPL & Disability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_bpl}
                onChange={(e) => setFormData({ ...formData, is_bpl: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">BPL Card Holder</span>
                <span className="text-[10px] text-slate-500">Antyodaya & food subsidy priority</span>
              </div>
            </label>

            <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={formData.has_disability}
                onChange={(e) => setFormData({ ...formData, has_disability: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">PwD (दिव्यांग)</span>
                <span className="text-[10px] text-slate-500">Benchmark disability benefits</span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Update Criteria</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
