import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, MessageSquare, Bot, ArrowRight, Check } from 'lucide-react';

const SAMPLE_QUERIES = [
  {
    lang: 'Hindi',
    query: 'मैं उत्तर प्रदेश का 42 वर्षीय किसान हूँ, मुझे कौन सी सरकारी सहायता मिलेगी?',
    intent: 'Eligibility Discovery',
    extracted: '{ age: 42, state: "Uttar Pradesh", occupation: "farmer" }',
    responseSnippet:
      'आपके लिए प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) के तहत सालाना ₹6,000 की वित्तीय सहायता तथा किसान क्रेडिट कार्ड (KCC) योजना उपलब्ध है।',
  },
  {
    lang: 'English',
    query: 'What documents are required for the National Overseas Scholarship for SC candidates?',
    intent: 'Document Requirement',
    extracted: '{ category: "SC", scheme_type: "scholarship" }',
    responseSnippet:
      'Required documents: 1) Caste Certificate, 2) Valid Indian Passport, 3) Unconditional Offer Letter from Foreign University, 4) Annual Income Declaration (< ₹8,00,000).',
  },
  {
    lang: 'Hindi',
    query: 'मेरी 19 वर्ष की बेटी कॉलेज में है, उसके लिए कौन सी छात्रवृत्ति है?',
    intent: 'Higher Education Grant',
    extracted: '{ age: 19, gender: "female", occupation: "student" }',
    responseSnippet:
      'प्रगति छात्रवृत्ति योजना (Pragati Scholarship) तथा पोस्ट-मैट्रिक स्कॉलरशिप के अंतर्गत प्रति वर्ष ₹50,000 तक की सहायता राशि देय है।',
  },
];

export default function VoiceAssistantDemo({ onOpenVoiceModal }) {
  const [selectedSample, setSelectedSample] = useState(0);

  const active = SAMPLE_QUERIES[selectedSample];

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60 inline-flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" />
            Interactive Voice & NLU Sandbox
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            Experience Conversational Welfare Guidance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates bilingual voice recognition, slot-filling entity extraction, and grounded RAG synthesis.
          </p>
        </div>

        {onOpenVoiceModal && (
          <button
            onClick={onOpenVoiceModal}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Mic className="w-4 h-4 text-rose-400" />
            <span>Launch Live Voice AI</span>
          </button>
        )}
      </div>

      {/* Query Selector */}
      <div className="py-6 space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          Select Spoken Voice Query Scenario:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSample(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedSample === idx
                  ? 'bg-rose-50/80 border-rose-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className={selectedSample === idx ? 'text-rose-700' : 'text-slate-500'}>
                  {q.lang} Voice Query
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white text-[10px] border border-slate-200 text-slate-600">
                  {q.intent}
                </span>
              </div>
              <p className="text-xs text-slate-800 line-clamp-2 font-medium">
                "{q.query}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Interaction Display */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 space-y-5 border border-slate-800">
        
        {/* User audio input */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/30">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">
              Citizen Spoken Input ({active.lang} • Web Speech API)
            </span>
            <p className="text-sm font-semibold text-slate-100 mt-1">
              "{active.query}"
            </p>
          </div>
        </div>

        {/* NLU Extracted Slots */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Automatic Slot Extraction (NLU Entity Parsing)
          </span>
          <code className="text-xs text-emerald-300 font-mono block">
            {active.extracted}
          </code>
        </div>

        {/* AI Answer */}
        <div className="flex items-start gap-3 pt-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400 font-bold">
                NagrikMitra AI (Groq Llama 3.3 70B + ChromaDB RAG)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                100% Policy Grounded
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {active.responseSnippet}
            </p>
          </div>
        </div>

        {/* Speech Synthesis indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <Volume2 className="w-3.5 h-3.5 text-rose-400" />
          <span>SpeechSynthesis voice read-aloud active for rural non-literate citizens.</span>
        </div>

      </div>

    </div>
  );
}
