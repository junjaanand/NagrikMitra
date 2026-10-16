import React, { useState } from 'react';
import {
  CheckCircle2,
  ListOrdered,
  FileCheck,
  Award,
  BookOpen,
  AlertCircle,
  ExternalLink,
  Building,
  Globe,
  Calendar,
  Users,
  IndianRupee,
  ShieldCheck,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';

/**
 * Intelligent helper to parse raw application process strings into structured steps,
 * stages, and advisory callouts.
 */
export function parseApplicationProcess(rawText) {
  if (!rawText) return { stages: [], advisories: [] };

  // Normalize HTML line breaks and entities
  const clean = rawText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|ul|ol|li)[^>]*>/gi, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const stages = [];
  const advisories = [];

  let currentStage = {
    title: 'Standard Application Procedure',
    steps: [],
  };

  let autoStepIdx = 1;

  for (const line of lines) {
    // Ignore mode headers like [Online] or [Offline]
    if (/^\[(online|offline|hybrid)\]$/i.test(line)) {
      continue;
    }

    // Detect Advisories or Notes
    if (/^(\*|note:|warning:|important:|timeline:)/i.test(line)) {
      advisories.push(line.replace(/^(\*|note:|warning:|important:)\s*/i, '').trim());
      continue;
    }

    // Detect Stage / Section Headers (e.g. "Registration Process:", "Post-Registration:")
    if (
      (line.endsWith(':') && line.length < 70 && !/^step/i.test(line)) ||
      /^(phase|stage|part)\s+\d+/i.test(line)
    ) {
      if (currentStage.steps.length > 0) {
        stages.push(currentStage);
      }
      currentStage = {
        title: line.replace(/:$/, '').trim(),
        steps: [],
      };
      autoStepIdx = 1;
      continue;
    }

    // Detect Numbered Steps (e.g. "Step 01:", "Step 1:", "1.", "Step-1:")
    const stepMatch = line.match(/^(?:Step\s*[-:]?\s*(\d+)|\b(\d+)\.)\s*[:.-]?\s*(.*)$/i);
    if (stepMatch) {
      const numStr = stepMatch[1] || stepMatch[2];
      const content = stepMatch[3] ? stepMatch[3].trim() : line;
      const stepNum = parseInt(numStr, 10) || autoStepIdx;
      autoStepIdx = stepNum + 1;

      // Extract a short intuitive title if long
      let stepTitle = 'Follow Procedure';
      if (/visit|open|navigate|portal|website/i.test(content)) stepTitle = 'Access Application Portal';
      else if (/login|register|sign\s*up|credentials/i.test(content)) stepTitle = 'User Registration & Login';
      else if (/fill|enter|form|details|mandatory/i.test(content)) stepTitle = 'Complete Application Form';
      else if (/attach|upload|document|photograph|certificate/i.test(content)) stepTitle = 'Upload Required Documents';
      else if (/submit|save|send|deposit/i.test(content)) stepTitle = 'Final Submission';
      else if (/receipt|acknowledgment|tracking|id/i.test(content)) stepTitle = 'Collect Receipt & Tracking ID';
      else if (/approach|panchayat|office|authority/i.test(content)) stepTitle = 'Visit Designated Office';

      currentStage.steps.push({
        stepNumber: stepNum,
        title: stepTitle,
        content,
      });
      continue;
    }

    // Fallback: If it's a substantive line, treat as an active step or note
    if (line.length > 15) {
      currentStage.steps.push({
        stepNumber: autoStepIdx++,
        title: 'Action Item',
        content: line.replace(/^[-*•]\s*/, ''),
      });
    }
  }

  if (currentStage.steps.length > 0) {
    stages.push(currentStage);
  }

  return { stages, advisories };
}

/**
 * Intelligent helper to parse raw eligibility text into discrete criterion cards.
 */
export function parseEligibilityNorms(rawText) {
  if (!rawText) return [];

  const clean = rawText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|ul|ol|li)[^>]*>/gi, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const rawLines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const criteria = [];

  for (const line of rawLines) {
    if (/^or$/i.test(line)) continue;
    // Strip leading bullets like -, *, •, 1., 2., (a), (b)
    const stripped = line.replace(/^([-*•]|\d+[\.)]|(?:\([a-zA-Z0-9]+\)))\s*/, '').trim();
    if (stripped.length > 5) {
      criteria.push(stripped);
    }
  }

  return criteria;
}

/**
 * Intelligent helper to parse benefits text into discrete entitlement items.
 */
export function parseBenefits(rawText) {
  if (!rawText) return [];

  const clean = rawText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|ul|ol|li)[^>]*>/gi, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const rawLines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const items = [];

  for (const line of rawLines) {
    const stripped = line.replace(/^([-*•]|\d+[\.)])\s*/, '').replace(/^\*\*(.*?)\*\*:?/, '$1:').trim();
    if (stripped.length > 4) {
      items.push(stripped);
    }
  }

  return items;
}

/**
 * Categorize documents into intuitive citizen-friendly groupings.
 */
export function categorizeDocuments(docList) {
  const categories = {
    identity: { label: '🪪 Proof of Identity & Domicile', docs: [] },
    financial: { label: '🏦 Financial & Banking Records', docs: [] },
    eligibility: { label: '📜 Category & Social Affiliation', docs: [] },
    academic: { label: '🎓 Educational & Vocational Proofs', docs: [] },
    other: { label: '📑 Supporting Affidavits & Forms', docs: [] },
  };

  for (const doc of docList) {
    const dLower = doc.toLowerCase();
    if (/aadhaar|voter|pan|passport|domicile|residence|ration|birth/i.test(dLower)) {
      categories.identity.docs.push(doc);
    } else if (/bank|passbook|income|cheque|salary|account/i.test(dLower)) {
      categories.financial.docs.push(doc);
    } else if (/caste|bpl|disability|pwd|community|tribal|minority/i.test(dLower)) {
      categories.eligibility.docs.push(doc);
    } else if (/mark|degree|student|college|school|land|7\/12|farm|jamabandi|admission/i.test(dLower)) {
      categories.academic.docs.push(doc);
    } else {
      categories.other.docs.push(doc);
    }
  }

  return Object.values(categories).filter((c) => c.docs.length > 0);
}

export default function SchemeGuidelinesView({ scheme, checkedDocs = {}, onToggleDoc }) {
  const [activeTab, setActiveTab] = useState('process'); // 'process' | 'eligibility' | 'benefits' | 'documents' | 'overview' | 'all'

  if (!scheme) return null;

  // Process Parsing
  const { stages, advisories } = parseApplicationProcess(scheme.application_process);
  // Eligibility Parsing
  const criteriaList = parseEligibilityNorms(scheme.eligibility_text);
  // Benefits Parsing
  const benefitsList = parseBenefits(scheme.benefits);

  // Raw Documents List
  const docList = scheme.documents_required
    ? scheme.documents_required
        .split(/[,;\n•]/)
        .map((d) => d.replace(/<[^>]+>/g, '').replace(/^[-*•\d.)]\s*/, '').trim())
        .filter((d) => d.length > 3)
    : ['Aadhaar Card', 'Bank Account Passbook', 'Proof of Residence / Domicile Certificate'];

  const categorizedDocs = categorizeDocuments(docList);
  const completedDocsCount = Object.values(checkedDocs).filter(Boolean).length;
  const readinessPercent = docList.length > 0 ? Math.round((completedDocsCount / docList.length) * 100) : 100;

  // Render URL in step content safely
  const renderStepContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 ml-1 mr-1"
          >
            <span>{part.replace(/^https?:\/\//, '').split('/')[0]}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP QUICK SPECIFICATION SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Application Mode</span>
          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
            {scheme.application_mode === 'offline' ? (
              <span className="text-amber-800 font-extrabold flex items-center gap-1">
                <span>🏢</span> In-Person Office
              </span>
            ) : scheme.application_mode === 'hybrid' ? (
              <span className="text-sky-800 font-extrabold flex items-center gap-1">
                <span>🔄</span> CSC Hybrid / Assisted
              </span>
            ) : (
              <span className="text-emerald-800 font-extrabold flex items-center gap-1">
                <span>🌐</span> 100% Online Portal
              </span>
            )}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Lifecycle Status</span>
          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
            {scheme.lifecycle_status === 'seasonal_window' ? (
              <span className="text-purple-700 font-extrabold flex items-center gap-1">
                <span>🗓️</span> Periodic Window
              </span>
            ) : scheme.lifecycle_status === 'superseded_merged' ? (
              <span className="text-rose-700 font-extrabold flex items-center gap-1">
                <span>⚠️</span> Merged / Superseded
              </span>
            ) : (
              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                <span>✅</span> Open & Active
              </span>
            )}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Jurisdiction</span>
          <span className="font-bold text-slate-800 truncate block mt-0.5" title={scheme.state}>
            {scheme.state === 'Central' ? '🇮🇳 Central Initiative' : `🏛️ ${scheme.state}`}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Benefit Package</span>
          <span className="font-extrabold text-emerald-700 truncate block mt-0.5" title={scheme.estimated_benefit_amount || 'Subsidized Entitlement'}>
            {scheme.estimated_benefit_amount || 'Direct Assistance'}
          </span>
        </div>
      </div>

      {/* 2. STRUCTURED TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'process', label: '🚀 Step-by-Step Procedure', count: stages.reduce((acc, s) => acc + s.steps.length, 0) },
          { id: 'eligibility', label: '📋 Eligibility Norms', count: criteriaList.length },
          { id: 'benefits', label: '💰 Benefits & Assistance', count: benefitsList.length },
          { id: 'documents', label: '📑 Document Checklist', count: docList.length },
          { id: 'overview', label: 'ℹ️ Overview & Nodal Info' },
          { id: 'all', label: '👁️ View Full Dossier' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT: STEP-BY-STEP APPLICATION PROCEDURE */}
      {(activeTab === 'process' || activeTab === 'all') && (
        <section className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              <span>Structured Application Timeline & Procedure</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {stages.reduce((acc, s) => acc + s.steps.length, 0)} Sequential Steps
            </span>
          </div>

          {/* Context Advisory based on Mode */}
          {scheme.application_mode === 'offline' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Building className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Physical Submission Office:</strong>
                <span>Obtain and submit the application form in person at the local <strong>Gram Panchayat, Tehsildar, or District Office</strong>. Always request an official signed acknowledgment receipt.</span>
              </div>
            </div>
          )}

          {scheme.application_mode === 'hybrid' && (
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">CSC Center & Village Kiosk Support:</strong>
                <span>Visit your nearest <strong>Common Service Center (CSC / Digital Seva Kendra)</strong> with your Aadhaar card for biometric verification and assisted online application.</span>
              </div>
            </div>
          )}

          {/* Stepper Stages */}
          {stages.length > 0 ? (
            <div className="space-y-6">
              {stages.map((stage, stageIdx) => (
                <div key={stageIdx} className="space-y-3">
                  {stages.length > 1 && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                        Stage {stageIdx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">{stage.title}</h4>
                    </div>
                  )}

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {stage.steps.map((st, stepIdx) => (
                      <div key={stepIdx} className="relative group">
                        {/* Step Circle Badge */}
                        <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                          {st.stepNumber}
                        </div>

                        {/* Step Card */}
                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                              <span>Step {st.stepNumber}:</span>
                              <span className="text-emerald-700">{st.title}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Stage {stageIdx + 1}.{stepIdx + 1}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {renderStepContent(st.content)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              {renderStepContent(scheme.application_process || 'Consult the official portal or designated department officer for procedure details.')}
            </div>
          )}

          {/* Important Advisories Box */}
          {advisories.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
              <span className="font-extrabold uppercase tracking-wide text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Important Submission Guidelines & Deadlines</span>
              </span>
              <ul className="space-y-1 list-disc list-inside text-amber-800">
                {advisories.map((adv, idx) => (
                  <li key={idx} className="leading-relaxed">{adv}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 4. TAB CONTENT: ELIGIBILITY NORMS */}
      {(activeTab === 'eligibility' || activeTab === 'all') && (
        <section className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory Eligibility Norms & Citizen Matrix</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {criteriaList.length} Verified Criteria
            </span>
          </div>

          {/* Demographic Qualification Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🎂 Age Limit</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {scheme.eligibility_age_min || scheme.eligibility_age_max
                  ? `${scheme.eligibility_age_min || 0} to ${scheme.eligibility_age_max || 'No Cap'} Yrs`
                  : 'Open to All Ages'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⚧ Gender</span>
              <span className="text-xs font-bold text-slate-800 capitalize block mt-0.5">
                {scheme.eligibility_gender === 'female' ? '👩 Women Only' : scheme.eligibility_gender === 'male' ? '👨 Men Only' : '👥 All Genders'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">💰 Income Cap</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {scheme.eligibility_income_max
                  ? `Max ₹${scheme.eligibility_income_max.toLocaleString('en-IN')}/yr`
                  : 'No Income Cap'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🍞 Economic Tier</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {scheme.eligibility_bpl ? '🍞 BPL Card Mandatory' : 'Open to All Tiers'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">♿ Disability / PwD</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {scheme.eligibility_disability ? '♿ PwD Benchmark (≥40%)' : 'General Eligibility'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🏡 Domicile</span>
              <span className="text-xs font-bold text-slate-800 capitalize block mt-0.5">
                {scheme.state === 'Central' ? 'Pan-India Citizen' : `Resident of ${scheme.state}`}
              </span>
            </div>
          </div>

          {/* Criteria Cards */}
          <div className="space-y-2 pt-1">
            {criteriaList.length > 0 ? (
              criteriaList.map((crit, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3 hover:border-emerald-300 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                      Criterion {idx + 1}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {crit}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                {scheme.eligibility_text || 'Citizens matching demographic criteria above are eligible to apply.'}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. TAB CONTENT: BENEFITS & ENTITLEMENTS */}
      {(activeTab === 'benefits' || activeTab === 'all') && (
        <section className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Official Entitlements & Benefit Breakdown</span>
            </h3>
            {scheme.estimated_benefit_amount && (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                {scheme.estimated_benefit_amount}
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
              Headline Entitlement
            </span>
            <div className="text-sm font-bold text-slate-900 leading-relaxed">
              {scheme.estimated_benefit_amount
                ? `Direct Financial Transfer of ${scheme.estimated_benefit_amount}`
                : 'Direct Social Welfare Assistance & Subsidized Enablement'}
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed">
              Disbursed directly into the verified Aadhaar-seeded bank account through the Public Financial Management System (PFMS / DBT).
            </p>
          </div>

          {/* Structured Items */}
          <div className="space-y-2">
            {benefitsList.map((ben, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3 hover:border-emerald-300 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {ben}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. TAB CONTENT: DOCUMENT READINESS CHECKLIST */}
      {(activeTab === 'documents' || activeTab === 'all') && (
        <section className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Prerequisite Documents & Readiness Index</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check off documents you have in hand to estimate application readiness:
              </p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-black ${
                readinessPercent >= 80 ? 'text-emerald-700' : readinessPercent >= 50 ? 'text-amber-700' : 'text-rose-600'
              }`}>
                {readinessPercent}% Ready
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">
                {completedDocsCount} of {docList.length} verified
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${readinessPercent}%`,
                backgroundColor: readinessPercent >= 80 ? '#10b981' : readinessPercent >= 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>

          {/* Grouped Document Categories */}
          <div className="space-y-4 pt-1">
            {categorizedDocs.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  {cat.label}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat.docs.map((doc, docIdx) => {
                    const checked = Boolean(checkedDocs[doc]);
                    return (
                      <div
                        key={docIdx}
                        onClick={() => onToggleDoc && onToggleDoc(doc)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          checked
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="text-xs">{doc}</span>
                        {checked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. TAB CONTENT: OVERVIEW & NODAL INFORMATION */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <section className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Scheme Vision & Nodal Administration</span>
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-3">
            <p className="font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
              {scheme.description || 'Comprehensive government welfare enablement designed to empower qualified beneficiaries with institutional and financial backing.'}
            </p>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
              {scheme.ministry && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sponsoring Ministry</span>
                  <span className="font-semibold text-slate-800">{scheme.ministry}</span>
                </div>
              )}
              {scheme.department && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Implementing Department</span>
                  <span className="font-semibold text-slate-800">{scheme.department}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
