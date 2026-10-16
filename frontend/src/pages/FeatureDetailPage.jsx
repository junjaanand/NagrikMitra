import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  Zap,
  CheckCircle2,
  Layers,
  HelpCircle,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import { FEATURES_DATA } from '../data/featuresData';
import MatcherSimulator from '../components/features/MatcherSimulator';
import VoiceAssistantDemo from '../components/features/VoiceAssistantDemo';
import DocumentScannerDemo from '../components/features/DocumentScannerDemo';
import VisualAnalyticsDemo from '../components/features/VisualAnalyticsDemo';
import SchemeComparisonDemo from '../components/features/SchemeComparisonDemo';
import ReadinessHandoffDemo from '../components/features/ReadinessHandoffDemo';
import useRequireAuth from '../hooks/useRequireAuth';
import AuthModal from '../components/auth/AuthModal';

const ALL_FEATURE_KEYS = [
  'deterministic-matcher',
  'multilingual-voice',
  'document-scanner',
  'visual-analytics',
  'scheme-comparison',
  'document-readiness',
];

export default function FeatureDetailPage({
  featureId,
  onBack,
  onSelectFeature,
  onOpenDashboard,
  onOpenVoiceModal,
  onOpenScanModal,
}) {
  const { withAuth, user } = useRequireAuth();
  const data = FEATURES_DATA[featureId] || FEATURES_DATA['deterministic-matcher'];
  const Icon = data.icon;

  const handleDashboard = () => {
    if (!onOpenDashboard) return;
    withAuth(onOpenDashboard, {
      title: 'Citizen Dashboard Access',
      message: 'Sign in or select an Instant Demo Citizen to access your personalized welfare dashboard.',
    });
  };

  const handleVoiceModal = () => {
    if (!onOpenVoiceModal) return;
    withAuth(onOpenVoiceModal, {
      title: 'AI Voice Assistant Access',
      message: 'Sign in or select an Instant Demo Citizen to test real-time voice speech synthesis and conversational RAG.',
    });
  };

  const handleScanModal = () => {
    if (!onOpenScanModal) return;
    withAuth(onOpenScanModal, {
      title: 'Identity Document Scanner Access',
      message: 'Sign in or select an Instant Demo Citizen to scan Aadhaar, PAN, or Ration cards.',
    });
  };

  const currentIndex = ALL_FEATURE_KEYS.indexOf(data.id);
  const prevKey = ALL_FEATURE_KEYS[(currentIndex - 1 + ALL_FEATURE_KEYS.length) % ALL_FEATURE_KEYS.length];
  const nextKey = ALL_FEATURE_KEYS[(currentIndex + 1) % ALL_FEATURE_KEYS.length];

  const prevFeature = FEATURES_DATA[prevKey];
  const nextFeature = FEATURES_DATA[nextKey];

  // Scroll to top whenever feature changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [featureId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      
      {/* Top Sticky Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Page</span>
          </button>

          {/* Jump Pills across all 6 features */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
            {ALL_FEATURE_KEYS.map((k) => {
              const f = FEATURES_DATA[k];
              const isSelected = f.id === data.id;
              return (
                <button
                  key={k}
                  onClick={() => onSelectFeature(k)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.title.split(' ')[0]} {f.title.split(' ')[1] || ''}
                </button>
              );
            })}
          </div>

          {onOpenDashboard && (
            <button
              onClick={handleDashboard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Open Dashboard</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        
        {/* HERO BANNER */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-4xl space-y-4">
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {data.tag}
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {data.subTag}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {data.title}
              </h1>
              <p className="text-base sm:text-lg text-emerald-400 font-semibold font-devanagari">
                {data.hindi}
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              {data.summary}
            </p>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {data.id === 'multilingual-voice' && onOpenVoiceModal && (
                <button
                  onClick={onOpenVoiceModal}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Launch Voice Assistant
                </button>
              )}

              {data.id === 'document-scanner' && onOpenScanModal && (
                <button
                  onClick={onOpenScanModal}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Launch Camera Scanner
                </button>
              )}

              {onOpenDashboard && (
                <button
                  onClick={onOpenDashboard}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Try in Citizen Dashboard
                </button>
              )}
            </div>

          </div>
        </div>

        {/* SECTION 1: INTERACTIVE LIVE SANDBOX / SIMULATOR */}
        <div>
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Hands-On Demonstration
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Live Interactive Sandbox
            </h2>
          </div>

          {data.interactiveType === 'matcher' && (
            <MatcherSimulator onOpenDashboard={handleDashboard} />
          )}
          {data.interactiveType === 'voice' && (
            <VoiceAssistantDemo onOpenVoiceModal={handleVoiceModal} />
          )}
          {data.interactiveType === 'scanner' && (
            <DocumentScannerDemo onOpenScanModal={handleScanModal} />
          )}
          {data.interactiveType === 'analytics' && (
            <VisualAnalyticsDemo onOpenDashboard={handleDashboard} />
          )}
          {data.interactiveType === 'comparison' && (
            <SchemeComparisonDemo onOpenDashboard={handleDashboard} />
          )}
          {data.interactiveType === 'readiness' && (
            <ReadinessHandoffDemo />
          )}
        </div>

        {/* SECTION 2: PROBLEM VS SOLUTION & BENCHMARKS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Problem vs Solution */}
          <div className="space-y-6">
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wide text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-block">
                The Civic & Technological Problem
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Why Legacy Approaches Fail
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {data.problemStatement}
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-emerald-50/80 border border-emerald-200/80 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block">
                The NagrikMitra Architectural Solution
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Rigorous, Grounded & Inclusive
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {data.solutionOverview}
              </p>
            </div>
          </div>

          {/* Benchmarks Grid */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-1">
                Engineering Benchmarks
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Verified Performance Metrics
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {data.benchmarks.map((b, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {b.label}
                  </span>
                  <span className="text-2xl font-black text-emerald-700 block">
                    {b.value}
                  </span>
                  <span className="text-xs text-slate-500 font-medium block mt-1">
                    {b.note}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Verification Standard
              </span>
              <p className="text-slate-300">
                Tested against the official 4,693 scheme dataset in automated test suites (pytest + React 18 production build).
              </p>
            </div>
          </div>

        </div>

        {/* SECTION 3: TECHNICAL HIGHLIGHTS & ARCHITECTURE STEPS */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Under The Hood
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              Engineering Architecture & Innovation Highlights
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.technicalHighlights.map((tech, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {tech.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Pipeline Steps */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
              Execution Data Pipeline (Step-by-Step Flow)
            </h4>
            <div className="space-y-2">
              {data.architectureSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM NAVIGATION: PREV / NEXT FEATURE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <button
            onClick={() => onSelectFeature(prevFeature.id)}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-400 text-left transition-all hover:shadow-md cursor-pointer group"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              ← Previous Capability
            </span>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {prevFeature.title}
            </h4>
            <span className="text-xs text-slate-500 mt-1 block">
              {prevFeature.hindi}
            </span>
          </button>

          <button
            onClick={() => onSelectFeature(nextFeature.id)}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 text-right transition-all hover:shadow-md cursor-pointer group"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Next Capability →
            </span>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {nextFeature.title}
            </h4>
            <span className="text-xs text-slate-500 mt-1 block">
              {nextFeature.hindi}
            </span>
          </button>
        </div>

      </main>

      {/* Intent-driven Auth Modal for intercepted sandbox actions */}
      <AuthModal />
    </div>
  );
}
