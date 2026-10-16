import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  PlusCircle
} from 'lucide-react';
import { createScheme, syncOgdData } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SAMPLE_SCHEMES = [
  {
    label: "PM Surya Ghar: Muft Bijli (2026)",
    data: {
      name: "PM Surya Ghar: Muft Bijli Yojana 2026",
      ministry: "Ministry of New and Renewable Energy",
      department: "Rooftop Solar Mission",
      state: "Central",
      category: "Utility & Sanitation",
      beneficiary_type: "Residential Households",
      benefits: "Subsidized rooftop solar systems providing up to 300 units of free electricity every month. Direct subsidy of ₹30,000 for 1 kW, ₹60,000 for 2 kW, and ₹78,000 for 3 kW installations.",
      estimated_benefit_amount: "₹78,000 Direct Subsidy",
      eligibility_text: "Indian citizen household with valid domestic electricity connection, suitable unshaded roof, and no prior rooftop solar subsidy availed.",
      application_process: "Register at pmsuryaghar.gov.in with consumer number, select DISCOM, obtain DISCOM feasibility approval, install through empaneled vendors, and receive DBT subsidy.",
      documents_required: "Aadhaar Card, Recent Electricity Bill, Bank Account Passbook, Proof of Roof Ownership",
      apply_url: "https://pmsuryaghar.gov.in",
      official_url: "https://mnre.gov.in/solar-rooftop",
      eligibility_age_min: 18,
      eligibility_age_max: 85,
      eligibility_gender: "all",
      eligibility_income_max: null,
      eligibility_residence: "both",
      eligibility_disability: false,
      eligibility_bpl: false
    }
  },
  {
    label: "PM Vidyalaxmi Loan (2026)",
    data: {
      name: "PM Vidyalaxmi Scheme (Higher Education Loan)",
      ministry: "Ministry of Education",
      department: "Department of Higher Education",
      state: "Central",
      category: "Education & Learning",
      beneficiary_type: "College Students",
      benefits: "Collateral-free, guarantor-free education loan up to ₹10 Lakh for students admitted to India's top 860 higher education institutions with 3% interest subvention.",
      estimated_benefit_amount: "₹10,00,000 Loan + 3% Interest Subsidy",
      eligibility_text: "Admitted to recognized higher education institution. Family income under ₹8 Lakh for interest subvention.",
      application_process: "Apply online at pmvidyalaxmi.gov.in with student credentials and admission letter.",
      documents_required: "Aadhaar Card, 10th & 12th Marksheets, Admission Offer Letter, Income Certificate",
      apply_url: "https://pmvidyalaxmi.gov.in",
      official_url: "https://education.gov.in",
      eligibility_age_min: 17,
      eligibility_age_max: 35,
      eligibility_gender: "all",
      eligibility_income_max: 800000,
      eligibility_residence: "both",
      eligibility_disability: false,
      eligibility_bpl: false
    }
  },
  {
    label: "Ayushman Vaya Vandana (70+)",
    data: {
      name: "Ayushman Vaya Vandana Yojana (Senior Citizen 70+)",
      ministry: "Ministry of Health and Family Welfare",
      department: "National Health Authority",
      state: "Central",
      category: "Health & Wellness",
      beneficiary_type: "Senior Citizens (70+)",
      benefits: "Universal cashless hospitalization coverage of ₹5,00,000 per family per year for all senior citizens aged 70+ irrespective of income.",
      estimated_benefit_amount: "₹5,00,000 Cashless Health Cover",
      eligibility_text: "Any Indian citizen aged 70 years and above with Aadhaar verification.",
      application_process: "Register on beneficiary.nha.gov.in or Ayushman App using Aadhaar e-KYC.",
      documents_required: "Aadhaar Card, Mobile Number linked with Aadhaar",
      apply_url: "https://beneficiary.nha.gov.in",
      official_url: "https://pmjay.gov.in",
      eligibility_age_min: 70,
      eligibility_age_max: 120,
      eligibility_gender: "all",
      eligibility_income_max: null,
      eligibility_residence: "both",
      eligibility_disability: false,
      eligibility_bpl: false
    }
  },
  {
    label: "PM Matsya Sampada 2.0",
    data: {
      name: "Pradhan Mantri Matsya Sampada Yojana 2.0",
      ministry: "Ministry of Fisheries, Animal Husbandry and Dairying",
      department: "Department of Fisheries",
      state: "Central",
      category: "Agriculture,Rural & Environment",
      beneficiary_type: "Fishers & Aquaculture Farmers",
      benefits: "60% government subsidy for women/SC/ST and 40% for general fishers up to ₹3 Lakh for biofloc units, deep-sea vessels, and refrigerated vans.",
      estimated_benefit_amount: "₹3,00,000 Aquaculture Grant",
      eligibility_text: "Individual fishers, fish farmers, and coastal self-help groups engaged in aquaculture.",
      application_process: "Submit project proposal to District Fisheries Officer or state directorate portal.",
      documents_required: "Aadhaar Card, Fisher Registration Card, Bank Account Details",
      apply_url: "https://pmmsy.dof.gov.in",
      official_url: "https://dof.gov.in",
      eligibility_age_min: 18,
      eligibility_age_max: 65,
      eligibility_gender: "all",
      eligibility_income_max: 400000,
      eligibility_residence: "both",
      eligibility_disability: false,
      eligibility_bpl: false
    }
  },
  {
    label: "Lakhpati Didi 2.0 (2026)",
    data: {
      name: "Lakhpati Didi Rural Empowerment Scheme 2.0",
      ministry: "Ministry of Rural Development",
      department: "Deendayal Antyodaya Yojana - DAY-NRLM",
      state: "Central",
      category: "Women and Child",
      beneficiary_type: "Women Self Help Groups",
      benefits: "Specialized financial training, access to ₹2,00,000 interest-free revolving credit, and market linkages ensuring sustainable annual household income exceeding ₹1,00,000.",
      estimated_benefit_amount: "₹2,00,000 Micro-Credit & Livelihood Grant",
      eligibility_text: "Active female member of registered Self Help Group (SHG) under DAY-NRLM with minimum 1 year of continuous group savings history.",
      application_process: "Submit micro-enterprise business plan through Cluster Level Federation (CLF) to District Rural Development Agency.",
      documents_required: "Aadhaar Card, SHG Passbook, Bank Account Details, Micro-Enterprise Plan",
      apply_url: "https://nrlm.gov.in",
      official_url: "https://rural.gov.in",
      eligibility_age_min: 18,
      eligibility_age_max: 60,
      eligibility_gender: "female",
      eligibility_income_max: 200000,
      eligibility_residence: "rural",
      eligibility_disability: false,
      eligibility_bpl: true
    }
  }
];

export default function AddSchemeModal({ isOpen, onClose, onSchemeAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    ministry: '',
    department: '',
    state: 'Central',
    category: 'Social welfare & Empowerment',
    beneficiary_type: 'Citizens',
    benefits: '',
    estimated_benefit_amount: '',
    eligibility_text: '',
    application_process: '',
    documents_required: 'Aadhaar Card, Bank Passbook, Domicile Certificate',
    apply_url: '',
    official_url: '',
    eligibility_age_min: '',
    eligibility_age_max: '',
    eligibility_gender: 'all',
    eligibility_income_max: '',
    eligibility_residence: 'both',
    eligibility_disability: false,
    eligibility_bpl: false
  });

  const { user, demoLogin } = useAuth();
  const isAdmin = user?.user_metadata?.rbac_role === 'admin' || user?.id?.includes('vle');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingOgd, setIsSyncingOgd] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      ...preset.data,
      eligibility_age_min: preset.data.eligibility_age_min ? String(preset.data.eligibility_age_min) : '',
      eligibility_age_max: preset.data.eligibility_age_max ? String(preset.data.eligibility_age_max) : '',
      eligibility_income_max: preset.data.eligibility_income_max ? String(preset.data.eligibility_income_max) : ''
    });
    setStatusMessage(`Loaded preset: "${preset.label}"`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.benefits.trim()) {
      setErrorMessage("Scheme Name and Benefits Description are mandatory.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const payload = {
        ...formData,
        eligibility_age_min: formData.eligibility_age_min ? parseInt(formData.eligibility_age_min, 10) : null,
        eligibility_age_max: formData.eligibility_age_max ? parseInt(formData.eligibility_age_max, 10) : null,
        eligibility_income_max: formData.eligibility_income_max ? parseInt(formData.eligibility_income_max, 10) : null,
        eligibility_state: formData.state === 'Central' ? '["All"]' : JSON.stringify([formData.state]),
        apply_url: formData.apply_url || 'https://www.myscheme.gov.in',
        official_url: formData.official_url || 'https://www.india.gov.in'
      };

      const result = await createScheme(payload);
      setStatusMessage(`Success! Scheme "${result.name}" ingested and indexed for semantic search.`);
      
      if (onSchemeAdded) {
        onSchemeAdded(result);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || "Failed to register scheme.";
      setErrorMessage(detail);
      setIsSubmitting(false);
    }
  };

  const handleSyncOgd = async () => {
    setIsSyncingOgd(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await syncOgdData();
      setStatusMessage(`OGD Sync Complete! ${res.records_synced} verified gazette schemes synced (${res.new_schemes_added} new).`);
      if (onSchemeAdded) {
        onSchemeAdded();
      }
      setTimeout(() => {
        setIsSyncingOgd(false);
      }, 2500);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || "Failed to synchronize Open Government Data.";
      setErrorMessage(detail);
      setIsSyncingOgd(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Building2 className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Government Scheme Ingestion Portal
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  CSC / Admin VLE
                </span>
              </h2>
              <p className="text-xs text-blue-200/80">
                Register newly gazetted 2025/2026 schemes with atomic dual-write (SQLite + ChromaDB RAG).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* RBAC Operator Status Ribbon */}
        {!isAdmin && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
            <span>
              Operating as <b>{user?.user_metadata?.full_name || 'Citizen'}</b>. Publishing schemes requires CSC VLE or Admin privileges.
            </span>
            <button
              type="button"
              onClick={() => {
                demoLogin('vle');
                setStatusMessage('Switched to Vikram Singh (District CSC VLE / Admin) profile.');
              }}
              className="px-2.5 py-1 rounded-md bg-amber-200 hover:bg-amber-300 font-bold text-[11px] text-amber-900 transition-colors cursor-pointer"
            >
              ⚡ Switch to CSC VLE Role
            </button>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Fill:</span>
            {SAMPLE_SCHEMES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="inline-flex items-center gap-1 text-xs font-medium bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSyncOgd}
            disabled={isSyncingOgd}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOgd ? 'animate-spin' : ''}`} />
            {isSyncingOgd ? 'Syncing Gazette...' : 'Sync OGD (data.gov.in)'}
          </button>
        </div>

        {/* Status / Errors */}
        {statusMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-sm text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheme Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. PM Surya Ghar: Muft Bijli Yojana"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ministry / Authority</label>
              <input
                type="text"
                name="ministry"
                value={formData.ministry}
                onChange={handleInputChange}
                placeholder="e.g. Ministry of New and Renewable Energy"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jurisdiction / State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="Central">Central (National)</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sector / Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="Utility & Sanitation">Utility & Sanitation</option>
                <option value="Education & Learning">Education & Learning</option>
                <option value="Social welfare & Empowerment">Social welfare & Empowerment</option>
                <option value="Agriculture,Rural & Environment">Agriculture & Rural</option>
                <option value="Business & Entrepreneurship">Business & MSME</option>
                <option value="Skills & Employment">Skills & Employment</option>
                <option value="Women and Child">Women & Child</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Banking,Financial Services and Insurance">Banking & Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Benefit Tag / Amount</label>
              <input
                type="text"
                name="estimated_benefit_amount"
                value={formData.estimated_benefit_amount}
                onChange={handleInputChange}
                placeholder="e.g. ₹78,000 Direct Subsidy"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Benefits Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              required
              rows={2}
              placeholder="Outline monetary subsidies, in-kind equipment, interest subvention, or direct cash transfers..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Rule Engine Demographics & Gating</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-0.5">Min Age (Years)</label>
                <input
                  type="number"
                  name="eligibility_age_min"
                  value={formData.eligibility_age_min}
                  onChange={handleInputChange}
                  placeholder="e.g. 18"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-0.5">Max Age (Years)</label>
                <input
                  type="number"
                  name="eligibility_age_max"
                  value={formData.eligibility_age_max}
                  onChange={handleInputChange}
                  placeholder="e.g. 70"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-0.5">Gender Restriction</label>
                <select
                  name="eligibility_gender"
                  value={formData.eligibility_gender}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm bg-white"
                >
                  <option value="all">All Citizens</option>
                  <option value="female">Women Only</option>
                  <option value="male">Men Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-0.5">Max Annual Income (₹)</label>
                <input
                  type="number"
                  name="eligibility_income_max"
                  value={formData.eligibility_income_max}
                  onChange={handleInputChange}
                  placeholder="e.g. 250000"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="eligibility_bpl"
                  checked={formData.eligibility_bpl}
                  onChange={handleInputChange}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 font-medium">BPL / Ration Card Required</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="eligibility_disability"
                  checked={formData.eligibility_disability}
                  onChange={handleInputChange}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 font-medium">Specially Abled (Divyangjan) Only</span>
              </label>

              <div className="inline-flex items-center gap-2">
                <span className="text-xs text-slate-600">Residence:</span>
                <select
                  name="eligibility_residence"
                  value={formData.eligibility_residence}
                  onChange={handleInputChange}
                  className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="both">Both (Urban & Rural)</option>
                  <option value="rural">Rural Gramin Only</option>
                  <option value="urban">Urban Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Application URL</label>
              <input
                type="url"
                name="apply_url"
                value={formData.apply_url}
                onChange={handleInputChange}
                placeholder="https://pmsuryaghar.gov.in"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Ministry Portal</label>
              <input
                type="url"
                name="official_url"
                value={formData.official_url}
                onChange={handleInputChange}
                placeholder="https://mnre.gov.in"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 text-sm"
            >
              <PlusCircle className="w-5 h-5" />
              {isSubmitting ? 'Ingesting Scheme...' : 'Ingest & Index Scheme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
